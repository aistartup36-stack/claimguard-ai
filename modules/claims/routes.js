/**
 * Module 2 — Claim Submission + Retrieval
 * Routes: POST /api/claims, GET /api/claims, GET /api/claims/:id
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const claimsStore = require('../../store/claims');
const settingsStore = require('../../store/settings');
const claudeAnalysis = require('../analysis/claude');
const heuristicAnalysis = require('../analysis/heuristic');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
});

// GET all claims (summary view — no analysis body)
router.get('/claims', (req, res) => {
  const claims = claimsStore.getForUser(req.user.username, req.user.role)
    .map(({ analysis, ...rest }) => rest);
  res.json({ success: true, data: claims });
});

// GET single claim (full, with analysis)
router.get('/claims/:id', (req, res) => {
  const claim = claimsStore.getById(req.params.id);
  if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });
  if (req.user.role !== 'admin' && claim.owner !== req.user.username) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
  res.json({ success: true, data: claim });
});

// POST — submit a new claim
router.post('/claims', upload.array('documents', 5), async (req, res) => {
  try {
    let claimData;
    try {
      claimData = JSON.parse(req.body.claimData || '{}');
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid claimData JSON' });
    }

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
      owner: req.user.username,
      assignedTo: null,
      status: 'analyzing',
      riskLevel: null,
      fraudScore: null,
      analysis: null,
      submittedAt: new Date().toISOString(),
      auditTrail: [{ timestamp: new Date().toISOString(), actor: 'System', action: 'submitted', notes: `${files.length} document(s) attached` }]
    };

    // Run analysis
    try {
      const useAI = !!process.env.ANTHROPIC_API_KEY;
      const result = useAI
        ? await claudeAnalysis.analyze(claimData, req.files || [], settings)
        : heuristicAnalysis.analyze(claimData, req.files || [], settings);

      claim.analysis = result;
      claim.fraudScore = result.fraud_score;
      claim.riskLevel = result.risk_level;

      const { escalationEnabled, lowRiskThreshold } = settings;
      if (result.risk_level === 'low') {
        claim.status = 'low-risk';
      } else if (escalationEnabled) {
        claim.status = 'pending-review';
        claim.auditTrail.push({ timestamp: new Date().toISOString(), actor: 'System', action: 'escalated', notes: `${result.risk_level === 'high' ? 'High' : 'Medium'} risk (score ${result.fraud_score}) — auto-escalated to review queue` });
      } else {
        claim.status = 'low-risk'; // escalation disabled
      }
    } catch (analysisErr) {
      console.error('Analysis error:', analysisErr.message);
      // Fallback to heuristic
      const fallback = heuristicAnalysis.analyze(claimData, [], settings);
      claim.analysis = { ...fallback, summary: `[Analysis error: ${analysisErr.message}]\n\n` + fallback.summary };
      claim.fraudScore = fallback.fraud_score;
      claim.riskLevel = fallback.risk_level;
      claim.status = fallback.risk_level === 'low' ? 'low-risk' : 'pending-review';
    }

    claimsStore.create(claim);
    res.json({ success: true, data: claim });

  } catch (err) {
    console.error('Claim submission error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
