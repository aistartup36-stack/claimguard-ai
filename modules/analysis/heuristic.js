/**
 * Module 3 — Heuristic Fallback Analysis
 * Used when ANTHROPIC_API_KEY is not set. Rule-based scoring.
 */

function daysBetween(d1, d2) {
  return Math.abs(Math.round((new Date(d2) - new Date(d1)) / 86400000));
}

function analyze(claimData, fileBuffers = [], settings = {}) {
  const { lowRiskThreshold = 30, highRiskThreshold = 65 } = settings;
  const amount = Number(claimData.claimedAmount);
  const delay = daysBetween(claimData.incidentDate, claimData.reportDate);
  const prevClaims = parseInt(claimData.previousClaims) || 0;
  const hasPolice = claimData.policeReport && claimData.policeReport.trim() !== '' && !claimData.policeReport.toLowerCase().includes('n/a');
  const hasWitnesses = claimData.witnesses && !claimData.witnesses.toLowerCase().includes('none');

  let score = 15;
  const indicators = [];

  // Timeline
  if (delay > 30) {
    score += 28;
    indicators.push({ category: 'Inconsistent Timeline', description: `Claim reported ${delay} days after incident — significantly outside the expected reporting window`, severity: 'high', confidence: 85 });
  } else if (delay > 7) {
    score += 10;
    indicators.push({ category: 'Inconsistent Timeline', description: `Claim reported ${delay} days after incident — minor delay`, severity: 'low', confidence: 50 });
  }

  // Police report
  if (!hasPolice && amount > 5000) {
    score += 18;
    indicators.push({ category: 'Missing Documentation', description: 'No police report filed for a claim exceeding \u00A35,000', severity: 'high', confidence: 80 });
  } else if (!hasPolice) {
    score += 6;
    indicators.push({ category: 'Missing Documentation', description: 'No police report on file', severity: 'low', confidence: 40 });
  }

  // Witnesses
  if (!hasWitnesses) score += 5;

  // Prior claims
  if (prevClaims >= 3) {
    score += 28;
    indicators.push({ category: 'Pattern Match', description: `${prevClaims} previous claims — high claim frequency consistent with potential fraud pattern`, severity: 'high', confidence: 82 });
  } else if (prevClaims === 2) {
    score += 15;
    indicators.push({ category: 'Pattern Match', description: `${prevClaims} previous claims on record`, severity: 'medium', confidence: 60 });
  } else if (prevClaims === 1) {
    score += 5;
  }

  // High value without documentation
  if (amount > 75000 && !hasPolice) {
    score += 15;
    indicators.push({ category: 'Inflated Estimate', description: `High claimed amount (\u00A3${amount.toLocaleString('en-GB')}) without supporting documentation`, severity: 'high', confidence: 70 });
  } else if (amount > 30000) {
    score += 5;
  }

  score = Math.min(Math.max(score, 5), 97);
  const riskLevel = score <= lowRiskThreshold ? 'low' : score <= highRiskThreshold ? 'medium' : 'high';

  const positiveFactor = [];
  if (delay <= 1) positiveFactor.push('Reported within 24 hours of incident');
  else if (delay <= 3) positiveFactor.push('Reported promptly within 3 days');
  if (hasPolice) positiveFactor.push('Police report filed');
  if (hasWitnesses) positiveFactor.push('Witnesses provided');
  if (prevClaims === 0) positiveFactor.push('No previous claims history');

  return {
    fraud_score: score,
    risk_level: riskLevel,
    indicators,
    summary: `[DEMO MODE — Add ANTHROPIC_API_KEY to .env for full Claude AI analysis]\n\nThis ${claimData.claimType} claim from ${claimData.claimantName} has been assessed using heuristic rules. Claimed amount: \u00A3${amount.toLocaleString('en-GB')} — reported ${delay} day(s) after the incident. ${indicators.length > 0 ? `${indicators.length} potential concern(s) were identified.` : 'No major red flags were detected by the heuristic engine.'}`,
    key_concerns: indicators.filter(i => i.severity === 'high').map(i => i.description),
    positive_factors: positiveFactor,
    recommendation: riskLevel === 'low'
      ? 'Claim appears routine. Standard processing recommended. Add your ANTHROPIC_API_KEY for full AI analysis.'
      : 'Human review recommended. Add your ANTHROPIC_API_KEY for detailed AI-powered fraud indicators.',
    estimated_legitimate_value: amount
  };
}

module.exports = { analyze };
