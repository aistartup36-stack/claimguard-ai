/**
 * Module 7 — Claim Invitations
 *
 * Protected routes (broker-facing):
 *   POST  /api/invitations           create a new link
 *   GET   /api/invitations           list my invitations
 *
 * Public routes (claimant-facing, exempt from requireAuth):
 *   GET   /api/public/invitations/:token    verify + prefill data
 *   POST  /api/public/claims/:token         submit a claim via the token
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();

const invitationsStore = require('../../store/invitations');
const claimsStore = require('../../store/claims');
const settingsStore = require('../../store/settings');
const claudeAnalysis = require('../analysis/claude');
const heuristicAnalysis = require('../analysis/heuristic');
const aiDetection = require('../analysis/ai-detection');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
});

// ── Broker endpoints ───────────────────────────────────────────────────────

router.post('/invitations', (req, res) => {
  const { claimantName, policyNumber, claimType } = req.body || {};
  if (!claimantName || !policyNumber) {
    return res.status(400).json({ success: false, error: 'claimantName and policyNumber are required' });
  }
  const inv = invitationsStore.create({
    createdBy: req.user.username,
    claimantName,
    policyNumber,
    claimType
  });
  res.json({ success: true, data: inv });
});

router.get('/invitations', (req, res) => {
  const list = invitationsStore.listForUser(req.user.username, req.user.role);
  res.json({ success: true, data: list });
});

// ── Public endpoints (auth middleware skips /public/) ──────────────────────

router.get('/public/invitations/:token', (req, res) => {
  const { ok, reason, invitation } = invitationsStore.resolveForPublicUse(req.params.token);
  if (!ok) return res.status(404).json({ success: false, error: reason });

  // Only expose the minimum the form needs — don't leak broker identity.
  res.json({
    success: true,
    data: {
      claimantName: invitation.claimantName,
      policyNumber: invitation.policyNumber,
      claimType: invitation.claimType,
      expiresAt: invitation.expiresAt
    }
  });
});

router.post('/public/claims/:token', upload.array('documents', 5), async (req, res) => {
  try {
    const { ok, reason, invitation } = invitationsStore.resolveForPublicUse(req.params.token);
    if (!ok) return res.status(404).json({ success: false, error: reason });

    let claimData;
    try {
      claimData = JSON.parse(req.body.claimData || '{}');
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid claimData JSON' });
    }

    // Force the prefilled fields to match the invitation (don't let public users
    // change name/policy/type — those came from the broker).
    claimData.claimantName = invitation.claimantName;
    claimData.policyNumber = invitation.policyNumber;
    claimData.claimType = invitation.claimType;

    const required = ['claimantName', 'claimType', 'policyNumber', 'incidentDate', 'reportDate', 'claimedAmount', 'incidentLocation', 'incidentDescription', 'damageDescription'];
    for (const f of required) {
      if (!claimData[f]) return res.status(400).json({ success: false, error: `Missing required field: ${f}` });
    }

    const settings = settingsStore.get();
    const files = (req.files || []).map(f => ({ name: f.originalname, type: f.mimetype }));

    const claim = {
      id: claimsStore.nextId(),
      ...claimData,
      claimedAmount: Number(claimData.claimedAmount),
      files,
      owner: invitation.createdBy,             // claim belongs to the broker who sent the link
      assignedTo: null,
      status: 'analyzing',
      riskLevel: null,
      fraudScore: null,
      analysis: null,
      aiImageCheck: null,
      source: 'claimant-link',                  // useful metadata
      invitationToken: invitation.token,
      submittedAt: new Date().toISOString(),
      auditTrail: [{
        timestamp: new Date().toISOString(),
        actor: 'Claimant',
        action: 'submitted',
        notes: { key: 'audit.note.submittedPublic', vars: { count: files.length } }
      }]
    };

    const aiCheckPromise = aiDetection.checkAll(req.files || []);

    // Language preference: claimData.lang wins, otherwise honour Accept-Language, otherwise English.
    const lang = (claimData.lang === 'fr' || claimData.lang === 'en')
      ? claimData.lang
      : ((req.headers['accept-language'] || '').toLowerCase().startsWith('fr') ? 'fr' : 'en');

    try {
      const useAI = !!process.env.ANTHROPIC_API_KEY;
      const result = useAI
        ? await claudeAnalysis.analyze(claimData, req.files || [], settings, lang)
        : heuristicAnalysis.analyze(claimData, req.files || [], settings);

      claim.analysis = result;
      claim.fraudScore = result.fraud_score;
      claim.riskLevel = result.risk_level;

      const { escalationEnabled } = settings;
      if (result.risk_level === 'low') {
        claim.status = 'low-risk';
      } else if (escalationEnabled) {
        claim.status = 'pending-review';
        claim.auditTrail.push({
          timestamp: new Date().toISOString(),
          actor: 'System',
          action: 'escalated',
          notes: { key: 'audit.note.escalated', vars: { level: result.risk_level, score: result.fraud_score } }
        });
      } else {
        claim.status = 'low-risk';
      }
    } catch (analysisErr) {
      console.error('Analysis error (public):', analysisErr.message);
      const fallback = heuristicAnalysis.analyze(claimData, [], settings);
      claim.analysis = { ...fallback, summary: `[Analysis error: ${analysisErr.message}]\n\n` + fallback.summary };
      claim.fraudScore = fallback.fraud_score;
      claim.riskLevel = fallback.risk_level;
      claim.status = fallback.risk_level === 'low' ? 'low-risk' : 'pending-review';
    }

    try {
      const perImage = await aiCheckPromise;
      const summary = aiDetection.summarise(perImage);
      if (perImage.length > 0 && summary.verdict !== 'skipped') {
        claim.aiImageCheck = { summary, perImage };
        if (summary.verdict === 'likely') {
          claim.auditTrail.push({
            timestamp: new Date().toISOString(),
            actor: 'System',
            action: 'flagged',
            notes: { key: 'audit.note.flaggedAi', vars: { name: summary.worstImage, pct: Math.round((summary.maxScore || 0) * 100) } }
          });
        }
      }
    } catch (e) {
      console.warn('[ai-detection public] unexpected failure:', e.message);
    }

    claimsStore.create(claim);
    invitationsStore.markSubmitted(invitation.token, claim.id);

    // Return ONLY the reference — don't leak analysis to the claimant.
    res.json({ success: true, data: { id: claim.id, submittedAt: claim.submittedAt } });

  } catch (err) {
    console.error('Public claim submission error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
