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
const aiDetection = require('../analysis/ai-detection');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 6 }, // 5 supporting docs + 1 police report
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'policeReport') {
      // Only PDF for the dedicated police-report slot
      file.mimetype === 'application/pdf'
        ? cb(null, true)
        : cb(new Error(`Police report must be a PDF (got ${file.mimetype})`));
      return;
    }
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
const claimsUpload = upload.fields([
  { name: 'documents', maxCount: 5 },
  { name: 'policeReport', maxCount: 1 }
]);
router.post('/claims', claimsUpload, async (req, res) => {
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
    const docFiles = (req.files?.documents || []);
    const policeReportFile = (req.files?.policeReport || [])[0] || null;
    const allFiles = [...docFiles, ...(policeReportFile ? [policeReportFile] : [])];
    const files = allFiles.map(f => ({ name: f.originalname, type: f.mimetype }));

    const claim = {
      id: claimsStore.nextId(),
      ...claimData,
      claimedAmount: Number(claimData.claimedAmount),
      files,
      policeReportFile: policeReportFile ? { name: policeReportFile.originalname, type: policeReportFile.mimetype } : null,
      owner: req.user.username,
      assignedTo: null,
      status: 'analyzing',
      riskLevel: null,
      fraudScore: null,
      analysis: null,
      aiImageCheck: null,
      crossClaimMatch: null,
      submittedAt: new Date().toISOString(),
      auditTrail: [{
        timestamp: new Date().toISOString(),
        actor: 'System',
        action: 'submitted',
        notes: { key: 'audit.note.submitted', vars: { count: files.length } }
      }]
    };

    // Run AI image detection FIRST so Claude can integrate the verdict into
    // its analysis (rather than independently — and unreliably — judging
    // whether photos are AI-generated). Sightengine is fast (~1–3s/image).
    let aiImageCheck = null;
    try {
      const perImage = await aiDetection.checkAll(docFiles);
      const summary = aiDetection.summarise(perImage);
      if (perImage.length > 0 && summary.verdict !== 'skipped') {
        aiImageCheck = { summary, perImage };
      }
    } catch (detectionErr) {
      console.warn('[ai-detection] unexpected failure:', detectionErr.message);
    }

    // Cross-claim duplicate police-reference check.
    let crossClaimMatch = null;
    if (claimData.policeReport) {
      const existing = claimsStore.findByPoliceReference(claimData.policeReport, claim.id);
      if (existing.length > 0) {
        const m = existing[0];
        crossClaimMatch = {
          claimId: m.id,
          claimantName: m.claimantName,
          submittedAt: m.submittedAt,
          owner: m.owner,
          policeReport: m.policeReport
        };
      }
    }

    // Language preference: claimData.lang wins, otherwise honour Accept-Language, otherwise English.
    const lang = (claimData.lang === 'fr' || claimData.lang === 'en')
      ? claimData.lang
      : ((req.headers['accept-language'] || '').toLowerCase().startsWith('fr') ? 'fr' : 'en');

    try {
      const useAI = !!process.env.ANTHROPIC_API_KEY;
      const result = useAI
        ? await claudeAnalysis.analyze(claimData, docFiles, settings, lang, aiImageCheck, policeReportFile)
        : heuristicAnalysis.analyze(claimData, docFiles, settings);

      claim.analysis = result;
      claim.fraudScore = result.fraud_score;
      claim.riskLevel = result.risk_level;

      // Hard floor: if Sightengine flagged the image as likely/possible AI-generated,
      // guarantee the score reflects that even if Claude under-weighted the signal.
      if (aiImageCheck?.summary?.verdict === 'likely' && claim.fraudScore < 90) {
        claim.fraudScore = 90;
        claim.riskLevel = 'high';
        claim.analysis.fraud_score = 90;
        claim.analysis.risk_level = 'high';
      } else if (aiImageCheck?.summary?.verdict === 'possible' && claim.fraudScore < 60) {
        claim.fraudScore = 60;
        claim.riskLevel = 'medium';
        claim.analysis.fraud_score = 60;
        claim.analysis.risk_level = 'medium';
      }

      // Cross-claim duplicate floor: same police reference on a different claim
      // is a near-certain fraud signal — bump to 75 and add an indicator.
      if (crossClaimMatch) {
        const indicator = {
          category: 'Cross-Claim Duplicate',
          description: `Police reference "${claimData.policeReport}" matches existing claim ${crossClaimMatch.claimId} (${crossClaimMatch.claimantName})`,
          severity: 'high',
          confidence: 90
        };
        claim.analysis.indicators = [indicator, ...(claim.analysis.indicators || [])];
        if (claim.fraudScore < 75) {
          claim.fraudScore = 75;
          claim.riskLevel = 'high';
          claim.analysis.fraud_score = 75;
          claim.analysis.risk_level = 'high';
        }
      }

      const { escalationEnabled } = settings;
      if (claim.riskLevel === 'low') {
        claim.status = 'low-risk';
      } else if (escalationEnabled) {
        claim.status = 'pending-review';
        claim.auditTrail.push({
          timestamp: new Date().toISOString(),
          actor: 'System',
          action: 'escalated',
          notes: { key: 'audit.note.escalated', vars: { level: claim.riskLevel, score: claim.fraudScore } }
        });
      } else {
        claim.status = 'low-risk'; // escalation disabled
      }
    } catch (analysisErr) {
      console.error('Analysis error:', analysisErr.message);
      // Fallback to heuristic — but still respect the AI-image floor
      const fallback = heuristicAnalysis.analyze(claimData, [], settings);
      claim.analysis = { ...fallback, summary: `[Analysis error: ${analysisErr.message}]\n\n` + fallback.summary };
      claim.fraudScore = fallback.fraud_score;
      claim.riskLevel = fallback.risk_level;
      if (aiImageCheck?.summary?.verdict === 'likely' && claim.fraudScore < 90) {
        claim.fraudScore = 90;
        claim.riskLevel = 'high';
        claim.analysis.fraud_score = 90;
        claim.analysis.risk_level = 'high';
      } else if (aiImageCheck?.summary?.verdict === 'possible' && claim.fraudScore < 60) {
        claim.fraudScore = 60;
        claim.riskLevel = 'medium';
        claim.analysis.fraud_score = 60;
        claim.analysis.risk_level = 'medium';
      }
      claim.status = claim.riskLevel === 'low' ? 'low-risk' : 'pending-review';
    }

    // Attach the Sightengine result for the UI panel (already computed above).
    if (aiImageCheck) {
      claim.aiImageCheck = aiImageCheck;
      if (aiImageCheck.summary.verdict === 'likely') {
        claim.auditTrail.push({
          timestamp: new Date().toISOString(),
          actor: 'System',
          action: 'flagged',
          notes: { key: 'audit.note.flaggedAi', vars: { name: aiImageCheck.summary.worstImage, pct: Math.round((aiImageCheck.summary.maxScore || 0) * 100) } }
        });
      }
    }
    if (crossClaimMatch) {
      claim.crossClaimMatch = crossClaimMatch;
      claim.auditTrail.push({
        timestamp: new Date().toISOString(),
        actor: 'System',
        action: 'flagged',
        notes: { key: 'audit.note.flaggedCrossClaim', vars: { ref: claimData.policeReport, otherId: crossClaimMatch.claimId } }
      });
    }

    claimsStore.create(claim);
    res.json({ success: true, data: claim });

  } catch (err) {
    console.error('Claim submission error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
