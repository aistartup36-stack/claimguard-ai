/**
 * Module 3 — AI Analysis Engine (Claude Opus)
 * Accepts claim data + file buffers, returns structured fraud analysis.
 */

const Anthropic = require('@anthropic-ai/sdk');

let _client = null;
function client() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

function daysBetween(d1, d2) {
  return Math.abs(Math.round((new Date(d2) - new Date(d1)) / 86400000));
}

/**
 * @param {Object} claimData   — parsed claim form fields
 * @param {Array}  fileBuffers — [{ buffer: Buffer, mimetype: string, originalname: string }]
 * @param {Object} settings    — { lowRiskThreshold, highRiskThreshold }
 * @returns {Object}           — analysis result
 */
async function analyze(claimData, fileBuffers = [], settings = {}) {
  const { lowRiskThreshold = 30, highRiskThreshold = 65 } = settings;
  const delay = daysBetween(claimData.incidentDate, claimData.reportDate);
  const content = [];

  // Attach files (images as vision, PDFs as document blocks)
  for (const f of fileBuffers) {
    const b64 = f.buffer.toString('base64');
    if (f.mimetype.startsWith('image/')) {
      content.push({ type: 'image', source: { type: 'base64', media_type: f.mimetype, data: b64 } });
    } else if (f.mimetype === 'application/pdf') {
      content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } });
    }
  }

  const fileNote = fileBuffers.length > 0
    ? `${fileBuffers.length} supporting document(s) are attached. Analyse each for authenticity, consistency with the claim, signs of digital alteration, and additional fraud indicators.`
    : 'No supporting documents were provided with this claim.';

  content.push({ type: 'text', text: `You are ClaimLens AI, an expert insurance fraud analyst with 20+ years of experience. Analyse this ${claimData.claimType === 'auto' ? 'auto/vehicle' : 'property'} insurance claim for fraud.

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

Analyse for: delayed/inconsistent timelines, inflated estimates, vague/scripted descriptions, missing documentation, claim history patterns, document anomalies, geographic implausibilities, classic fraud narratives.

Respond with ONLY raw valid JSON (no markdown, no code fences):
{
  "fraud_score": <integer 0-100>,
  "risk_level": "<low|medium|high>",
  "indicators": [
    {
      "category": "<Inconsistent Timeline|Inflated Estimate|Missing Documentation|Suspicious Description|Pattern Match|Document Anomaly|Geographic Inconsistency|Other>",
      "description": "<specific, actionable description>",
      "severity": "<low|medium|high>",
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
      max_tokens: 2048,
      messages: [{ role: 'user', content }]
    });
  } catch (apiErr) {
    const msg = apiErr?.error?.message || apiErr?.message || 'Unknown API error';
    throw new Error(`Claude API error: ${msg}`);
  }

  const text = (resp.content?.[0]?.text || '').trim();
  if (!text) throw new Error('Claude API returned empty response');
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('AI returned an unparseable response');
  }
}

module.exports = { analyze };
