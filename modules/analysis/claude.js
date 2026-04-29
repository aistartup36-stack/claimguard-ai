/**
 * Module 3 — AI Analysis Engine (Claude Opus)
 * Accepts claim data + file buffers, returns structured fraud analysis.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { compressForClaude } = require('./image-utils');

let _client = null;
function client() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

function daysBetween(d1, d2) {
  return Math.abs(Math.round((new Date(d2) - new Date(d1)) / 86400000));
}

/**
 * Format the Sightengine AI-image-detection result for inclusion in Claude's
 * prompt, so Claude can integrate it instead of independently judging
 * "does this photo look real" — modern AI images often fool human/vision
 * models even when a specialised classifier catches them.
 */
function formatAiImageCheckBlock(aiImageCheck) {
  if (!aiImageCheck || !aiImageCheck.summary || aiImageCheck.summary.verdict === 'skipped') return '';
  const { verdict, maxScore, worstImage } = aiImageCheck.summary;
  const pct = Math.round((maxScore || 0) * 100);

  if (verdict === 'likely') {
    return `\nAI-GENERATION DETECTOR (Sightengine genai model, specialised AI-image classifier — more reliable than visual inspection):\n  VERDICT: LIKELY AI-GENERATED\n  Highest score: ${pct}% on "${worstImage}".\n\nIMPORTANT — TRUST THIS SIGNAL:\n• Modern AI-generated images (Higgsfield, Midjourney, Sora, etc.) routinely fool visual inspection. Do NOT independently conclude the photograph "appears genuine" or shows "no signs of digital manipulation" based on what you see — the classifier is more reliable than visual inspection for this signal.\n• Treat this as a strong fraud indicator. Reflect it explicitly in fraud_score (this alone justifies a high-risk score), in indicators (add a high-severity, high-confidence "AI-Generated Imagery" indicator), in key_concerns, and in recommendation.\n• Do NOT add positive_factors that praise the photograph's authenticity.\n`;
  }
  if (verdict === 'possible') {
    return `\nAI-GENERATION DETECTOR (Sightengine genai model):\n  VERDICT: POSSIBLY AI-GENERATED (${pct}% on "${worstImage}")\nTreat as a moderate fraud signal — include a medium-severity indicator and reflect it in the score. Do NOT add positive_factors claiming the photograph is genuine.\n`;
  }
  // 'unlikely' — pass through as a mild positive
  return `\nAI-GENERATION DETECTOR (Sightengine genai model):\n  VERDICT: UNLIKELY AI-GENERATED (max score across images: ${pct}%) — image authenticity passes the classifier.\n`;
}

/**
 * @param {Object} claimData       — parsed claim form fields
 * @param {Array}  fileBuffers     — [{ buffer: Buffer, mimetype: string, originalname: string }]
 * @param {Object} settings        — { lowRiskThreshold, highRiskThreshold }
 * @param {String} lang            — 'en' | 'fr' (controls the language of free-text output)
 * @param {Object} aiImageCheck    — Sightengine result { summary, perImage } or null
 * @param {Object} policeReportFile — separate police-report PDF (optional)
 * @returns {Object}               — analysis result
 */
async function analyze(claimData, fileBuffers = [], settings = {}, lang = 'en', aiImageCheck = null, policeReportFile = null) {
  const { lowRiskThreshold = 30, highRiskThreshold = 65 } = settings;
  const delay = daysBetween(claimData.incidentDate, claimData.reportDate);
  const content = [];

  // Language directive — controls ALL free-text output (summary, descriptions,
  // key_concerns, positive_factors, recommendation, indicator categories + descriptions).
  // Enum fields (risk_level, severity) MUST stay in English because downstream code branches on them.
  const langBlock = lang === 'fr'
    ? `LANGUE DE RÉPONSE : Répondez ENTIÈREMENT EN FRANÇAIS. Tout le texte libre (résumé, descriptions d'indicateurs, catégories, préoccupations clés, facteurs positifs, recommandation) doit être rédigé en français professionnel, adapté au secteur de l'assurance française. IMPORTANT : les valeurs des champs « risk_level » et « severity » DOIVENT rester en anglais (low / medium / high) car elles sont utilisées par le code ; elles seront traduites dans l'interface. Utilisez le symbole £ tel quel pour les montants.\n\n`
    : '';

  // Attach files (images as vision, PDFs as document blocks).
  // Images are first piped through compressForClaude() so phone-camera uploads
  // (often 8–15 MB) don't trip Claude's 5 MB base64 limit.
  for (const original of fileBuffers) {
    const f = original.mimetype && original.mimetype.startsWith('image/')
      ? await compressForClaude(original)
      : original;
    const b64 = f.buffer.toString('base64');
    if (f.mimetype.startsWith('image/')) {
      content.push({ type: 'image', source: { type: 'base64', media_type: f.mimetype, data: b64 } });
    } else if (f.mimetype === 'application/pdf') {
      content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } });
    }
  }

  // Attach the police report PDF (if any) as a final document block.
  if (policeReportFile && policeReportFile.buffer && policeReportFile.mimetype === 'application/pdf') {
    const b64 = policeReportFile.buffer.toString('base64');
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } });
  }

  const totalDocs = fileBuffers.length + (policeReportFile ? 1 : 0);
  const fileNote = totalDocs > 0
    ? `${totalDocs} supporting document(s) are attached. Analyse each for authenticity, consistency with the claim, signs of digital alteration, and additional fraud indicators.`
    : 'No supporting documents were provided with this claim.';

  const aiCheckBlock = formatAiImageCheckBlock(aiImageCheck);

  const policeReportBlock = policeReportFile
    ? `\nPOLICE REPORT DOCUMENT: A police report PDF has been uploaded (filename: ${policeReportFile.originalname}). The claimant has stated the police reference number as "${claimData.policeReport || '(not provided)'}". Verify that the document:\n  (a) references the same incident date (${claimData.incidentDate}) and location (${claimData.incidentLocation}),\n  (b) names the same parties (claimant: ${claimData.claimantName}),\n  (c) describes a narrative consistent with the claim,\n  (d) shows no signs of forgery — font inconsistencies, mismatched headers, suspicious metadata, mismatched force/branding, or generic-template wording.\nIf the document looks fabricated, mismatched, or doesn't match the stated reference number, surface this prominently as a high-severity indicator.\n`
    : (claimData.policeReport && claimData.policeReport.trim() && !['n/a', 'na', 'none', 'pending'].includes(claimData.policeReport.trim().toLowerCase())
        ? `\nPOLICE REPORT: A police reference number ("${claimData.policeReport}") was provided but no supporting document was uploaded. Note this as a low-severity indicator — the reference cannot be independently verified without the document.\n`
        : '');

  content.push({ type: 'text', text: `${langBlock}You are ClaimLens AI, an expert insurance fraud analyst with 20+ years of experience. Analyse this ${claimData.claimType === 'auto' ? 'auto/vehicle' : 'property'} insurance claim for fraud.

CLAIM DETAILS:
• Type: ${claimData.claimType === 'auto' ? 'Auto/Vehicle Insurance' : 'Property Insurance'}
• Claimant: ${claimData.claimantName}
• Policy: ${claimData.policyNumber}
• Incident Date: ${claimData.incidentDate}
• Report Date: ${claimData.reportDate} (${delay} day${delay !== 1 ? 's' : ''} later)
• Claimed Amount: \u00A3${Number(claimData.claimedAmount).toLocaleString('en-GB')}
• Location: ${claimData.incidentLocation}
• Previous Claims: ${claimData.previousClaims || 'None declared'}
• Police Report: ${claimData.policeReport || 'None filed'}
• Witnesses: ${claimData.witnesses || 'None provided'}

INCIDENT:
${claimData.incidentDescription}

DAMAGE:
${claimData.damageDescription}

DOCUMENTS: ${fileNote}
${aiCheckBlock}${policeReportBlock}
Analyse for: delayed/inconsistent timelines, inflated estimates, vague/scripted descriptions, missing documentation, claim history patterns, document anomalies, geographic implausibilities, classic fraud narratives.

Respond with ONLY raw valid JSON (no markdown, no code fences):
{
  "fraud_score": <integer 0-100>,
  "risk_level": "<low|medium|high — MUST be one of these English enums>",
  "indicators": [
    {
      "category": "<short category label — in the response language>",
      "description": "<specific, actionable description>",
      "severity": "<low|medium|high — MUST be one of these English enums>",
      "confidence": <integer 0-100>
    }
  ],
  "summary": "<thorough 2–3 paragraph assessment — explain your reasoning>",
  "key_concerns": ["<concern>"],
  "positive_factors": ["<factor that reduces fraud likelihood>"],
  "recommendation": "<specific next step for the reviewer>",
  "estimated_legitimate_value": <integer or null>
}

Scoring guide:
• 0–${lowRiskThreshold} = Low risk (auto-clear)
• ${lowRiskThreshold + 1}–${highRiskThreshold} = Medium risk (human review)
• ${highRiskThreshold + 1}–100 = High risk (human review, priority)

confidence per indicator: 0 = uncertain, 100 = highly confident this is a genuine fraud signal.` });

  let resp;
  try {
    resp = await client().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content }]
    });
  } catch (apiErr) {
    const msg = apiErr?.error?.message || apiErr?.message || 'Unknown API error';
    throw new Error(`AI service error: ${msg}`);
  }

  // If Claude ran out of room, the JSON will be malformed (truncated mid-array).
  // Surface a clear error rather than a confusing JSON syntax error downstream.
  if (resp.stop_reason === 'max_tokens') {
    console.warn('[claude] response truncated by max_tokens cap');
    throw new Error('AI response was truncated (hit max_tokens). Increase the cap.');
  }

  const raw = (resp.content?.[0]?.text || '').trim();
  if (!raw) throw new Error('AI service returned empty response');

  // Strip optional markdown code fences — Claude occasionally wraps vision
  // responses in ```json ... ``` despite the prompt asking for raw JSON.
  const text = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch {}
    }
    throw new Error('AI returned an unparseable response');
  }
}

module.exports = { analyze };
