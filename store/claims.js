/**
 * Claims Store — JSON file-backed data layer.
 * Swap out read/write methods to connect a real database.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/claims.json');

const SEED_CLAIMS = [
  {
    id: 'CLM-2026-0001', claimType: 'auto', claimantName: 'Robert Harrison',
    policyNumber: 'POL-2024-8821', incidentDate: '2026-03-10', reportDate: '2026-03-11',
    claimedAmount: 4200, incidentLocation: 'I-95 Northbound, Miami, FL',
    incidentDescription: 'Rear-ended at a traffic light by an unknown vehicle. The driver fled the scene before I could get their details.',
    damageDescription: 'Rear bumper cracked and displaced, trunk lid bent, both tail lights shattered, spare tyre compartment damaged.',
    witnesses: 'None — hit and run', policeReport: 'RPT-2026-34521', previousClaims: '0',
    files: [], assignedTo: 'sarah.mitchell@claimlens.com', owner: 'demo1',
    status: 'approved', riskLevel: 'low', fraudScore: 18,
    analysis: {
      indicators: [],
      summary: 'This claim presents with all the hallmarks of a legitimate incident. The police report was filed promptly within 24 hours, and the damage description is entirely consistent with the mechanism described. The claimant has no prior claims history, and the claimed amount is reasonable and proportionate.\n\nThe hit-and-run nature of the incident, while unfortunate, is a common occurrence and does not raise suspicion of itself.',
      key_concerns: [], positive_factors: ['Police report filed within 24 hours', 'Damage consistent with described impact', 'No previous claims history', 'Claimed amount proportionate'],
      recommendation: 'Approve claim. All documentation in order. Process for standard payment.',
      estimated_legitimate_value: 4200
    },
    submittedAt: '2026-03-11T10:30:00Z',
    auditTrail: [
      { timestamp: '2026-03-11T10:30:00Z', actor: 'System', action: 'submitted', notes: '' },
      { timestamp: '2026-03-12T09:15:00Z', actor: 'Sarah Mitchell', action: 'approved', notes: 'All documentation in order. Police report verified.' }
    ]
  },
  {
    id: 'CLM-2026-0002', claimType: 'property', claimantName: 'Patricia Nguyen',
    policyNumber: 'POL-2023-1144', incidentDate: '2026-03-05', reportDate: '2026-03-06',
    claimedAmount: 28500, incidentLocation: '847 Maple Street, Austin, TX',
    incidentDescription: 'A burst pipe in the upstairs bathroom caused flooding throughout the second floor and significant ceiling damage in the first-floor living room.',
    damageDescription: 'Water damage to hardwood floors (approx 400 sq ft), ceiling plaster damage in living room, damaged drywall in bathroom, destroyed bathroom vanity.',
    witnesses: 'Neighbour Jennifer Park assisted in water shutoff', policeReport: 'N/A', previousClaims: '1 (2021 storm damage, $3,200)',
    files: [], assignedTo: 'david.chen@claimlens.com', owner: 'demo1',
    status: 'approved', riskLevel: 'low', fraudScore: 22,
    analysis: {
      indicators: [{ category: 'Missing Documentation', description: 'No plumber assessment at time of submission', severity: 'low', confidence: 45 }],
      summary: 'This claim presents as a legitimate water damage incident. The description is specific and credible, the witness corroborates the event, and the claimed amount is reasonable for the scope described. The single prior claim from 2021 is minor and unrelated.',
      key_concerns: ['No contractor assessment at submission'], positive_factors: ['Witness provided corroboration', 'Reported promptly', 'Prior claim is minor and unrelated'],
      recommendation: 'Approve with standard water damage assessment. Request contractor quotes as part of normal processing.',
      estimated_legitimate_value: 26000
    },
    submittedAt: '2026-03-06T14:22:00Z',
    auditTrail: [
      { timestamp: '2026-03-06T14:22:00Z', actor: 'System', action: 'submitted', notes: '' },
      { timestamp: '2026-03-07T11:00:00Z', actor: 'David Chen', action: 'approved', notes: 'Contractor assessment received post-submission. Legitimate claim.' }
    ]
  },
  {
    id: 'CLM-2026-0003', claimType: 'auto', claimantName: 'Marcus Williams',
    policyNumber: 'POL-2025-3390', incidentDate: '2026-02-01', reportDate: '2026-03-18',
    claimedAmount: 18700, incidentLocation: 'Unspecified parking lot, downtown Chicago, IL',
    incidentDescription: 'Vehicle was vandalised while parked. Came back to find significant damage. Not sure exactly when it happened.',
    damageDescription: 'Multiple dents across hood and roof, two windows smashed, interior damaged, stereo removed, catalytic converter missing.',
    witnesses: 'None', policeReport: 'N/A', previousClaims: '2 (2024 vandalism $8,200; 2023 theft $11,500)',
    files: [], assignedTo: null, owner: 'demo1',
    status: 'pending-review', riskLevel: 'medium', fraudScore: 58,
    analysis: {
      indicators: [
        { category: 'Inconsistent Timeline', description: 'Claim reported 45 days after the stated incident date', severity: 'high', confidence: 91 },
        { category: 'Missing Documentation', description: 'No police report for a claim exceeding $18,700 involving component theft', severity: 'high', confidence: 88 },
        { category: 'Suspicious Description', description: 'Vague description — no specific date, time, or parking location', severity: 'medium', confidence: 72 },
        { category: 'Pattern Match', description: 'Third vandalism/theft claim in three years, escalating values', severity: 'medium', confidence: 78 }
      ],
      summary: 'This claim raises significant concerns warranting human review. The 45-day reporting delay is the most prominent red flag. The absence of a police report for a $18,700 theft involving a catalytic converter further undermines credibility.\n\nThe pattern of three escalating vandalism/theft claims over three years is consistent with a staged claims strategy.',
      key_concerns: ['45-day reporting delay', 'No police report for significant theft', 'Third escalating claim in 3 years'],
      positive_factors: ['Vehicle damage types are plausible'],
      recommendation: 'Request police report, specific incident location and date, and explanation for delay.',
      estimated_legitimate_value: null
    },
    submittedAt: '2026-03-18T16:45:00Z',
    auditTrail: [
      { timestamp: '2026-03-18T16:45:00Z', actor: 'System', action: 'submitted', notes: '' },
      { timestamp: '2026-03-18T16:45:01Z', actor: 'System', action: 'escalated', notes: 'Medium risk — auto-escalated to review queue' }
    ]
  },
  {
    id: 'CLM-2026-0004', claimType: 'property', claimantName: 'Sandra Kowalski',
    policyNumber: 'POL-2025-7723', incidentDate: '2026-03-20', reportDate: '2026-03-21',
    claimedAmount: 145000, incidentLocation: '2214 Riverside Drive, New Orleans, LA',
    incidentDescription: 'House fire started in the kitchen late at night while I was asleep. Fire spread to the living room and upstairs bedrooms.',
    damageDescription: 'Structural fire damage to kitchen and living room. Smoke damage throughout. Complete loss of furniture, electronics, clothing, jewellery collection, and family heirlooms. Estimated $145,000.',
    witnesses: 'Fire department (Station 12)', policeReport: 'Fire Marshal: FMI-2026-0892', previousClaims: '1 (2025 storm damage, $45,000)',
    files: [], assignedTo: 'james.whitfield@claimlens.com', owner: 'demo2',
    status: 'pending-review', riskLevel: 'high', fraudScore: 79,
    analysis: {
      indicators: [
        { category: 'Inflated Estimate', description: 'Contents claim of $145,000 is 2–4x the typical range for this property type', severity: 'high', confidence: 86 },
        { category: 'Pattern Match', description: '$145,000 claim follows a $45,000 claim just 12 months prior', severity: 'high', confidence: 79 },
        { category: 'Suspicious Description', description: 'Family heirlooms and jewellery without pre-incident documentation', severity: 'medium', confidence: 68 },
        { category: 'Missing Documentation', description: 'Fire Marshal investigation still pending — cause not confirmed', severity: 'medium', confidence: 61 }
      ],
      summary: 'This claim requires careful scrutiny. The contents claim of $145,000 is exceptionally high and inconsistent with typical household contents for the property type. A prior $45,000 claim 12 months ago creates a pattern.\n\nThe Fire Marshal investigation should be cross-referenced immediately before any payment is authorised.',
      key_concerns: ['Contents value 2–4x typical range', 'Second large claim in 12 months', 'No pre-incident documentation for high-value items'],
      positive_factors: ['Fire department confirms incident occurred', 'Prompt reporting'],
      recommendation: 'Hold pending Fire Marshal conclusion. Require itemised contents list with receipts. Commission independent assessment.',
      estimated_legitimate_value: 55000
    },
    submittedAt: '2026-03-21T08:15:00Z',
    auditTrail: [
      { timestamp: '2026-03-21T08:15:00Z', actor: 'System', action: 'submitted', notes: '' },
      { timestamp: '2026-03-21T08:15:01Z', actor: 'System', action: 'escalated', notes: 'High risk — auto-escalated to review queue' }
    ]
  },
  {
    id: 'CLM-2026-0005', claimType: 'auto', claimantName: 'Vincent Delacroix',
    policyNumber: 'POL-2024-5541', incidentDate: '2026-03-12', reportDate: '2026-03-13',
    claimedAmount: 87000, incidentLocation: 'Mountain Road, Aspen, CO',
    incidentDescription: 'Vehicle went off a mountain road into a ravine after swerving to avoid a deer. The vehicle is not recoverable.',
    damageDescription: 'Total loss — 2024 Mercedes-AMG G63. Fell approximately 200 feet into a ravine. Cannot be retrieved for inspection.',
    witnesses: 'None', policeReport: 'N/A — remote location', previousClaims: '3 (2025 total loss $72k; 2024 theft $38k; 2023 collision $24k)',
    files: [], assignedTo: 'james.whitfield@claimlens.com', owner: 'demo2',
    status: 'rejected', riskLevel: 'high', fraudScore: 94,
    analysis: {
      indicators: [
        { category: 'Pattern Match', description: 'Fourth major loss in three years, escalating values totalling $221,000', severity: 'high', confidence: 97 },
        { category: 'Missing Documentation', description: 'No police report. Unrecoverable vehicle eliminates independent inspection.', severity: 'high', confidence: 95 },
        { category: 'Suspicious Description', description: '"Swerved to avoid deer" is among the most common staged total loss narratives', severity: 'high', confidence: 89 },
        { category: 'Geographic Inconsistency', description: 'Miami resident on a Colorado mountain road with no travel documentation', severity: 'medium', confidence: 74 }
      ],
      summary: 'This claim is strongly consistent with a staged vehicle total loss scheme. Four escalating claims totalling $221,000 in three years, combined with an unrecoverable vehicle that cannot be inspected and a classic fraud narrative, presents an extraordinarily suspicious picture.\n\nThis claim should be denied and referred to the Special Investigations Unit immediately.',
      key_concerns: ['Four escalating claims totalling $221k', 'Unrecoverable vehicle', 'No police report', 'Classic staged total loss narrative'],
      positive_factors: [],
      recommendation: 'Reject. Refer to Special Investigations Unit. Review all prior claims. Consider NICB referral.',
      estimated_legitimate_value: 0
    },
    submittedAt: '2026-03-13T11:20:00Z',
    auditTrail: [
      { timestamp: '2026-03-13T11:20:00Z', actor: 'System', action: 'submitted', notes: '' },
      { timestamp: '2026-03-13T11:20:01Z', actor: 'System', action: 'escalated', notes: 'High risk — auto-escalated to review queue' },
      { timestamp: '2026-03-15T14:30:00Z', actor: 'James Whitfield', action: 'rejected', notes: 'Referred to SIU. Pattern of fraudulent claims confirmed. Prior claims under review.' }
    ]
  },
  {
    id: 'CLM-2026-0006', claimType: 'property', claimantName: 'Diane Okonkwo',
    policyNumber: 'POL-2025-9912', incidentDate: '2026-03-25', reportDate: '2026-03-26',
    claimedAmount: 12300, incidentLocation: '512 Pine Avenue, Atlanta, GA',
    incidentDescription: 'Returned home from a weekend trip to find the property had been burgled. Multiple items stolen.',
    damageDescription: 'Stolen: laptop, 65" TV, gaming console, camera equipment, diamond necklace, engagement ring upgrade, three designer handbags, approximately $2,000 cash.',
    witnesses: 'None', policeReport: 'RPT-2026-88341', previousClaims: '0',
    files: [], assignedTo: null, owner: 'demo2',
    status: 'pending-review', riskLevel: 'medium', fraudScore: 44,
    analysis: {
      indicators: [
        { category: 'Missing Documentation', description: 'High-value jewellery items without appraisals or purchase receipts', severity: 'medium', confidence: 62 },
        { category: 'Suspicious Description', description: 'Cash claim of $2,000 is unverifiable — a common fraud vector', severity: 'medium', confidence: 71 },
        { category: 'Missing Documentation', description: 'No mention of forced entry — typical burglaries leave break-in evidence', severity: 'low', confidence: 48 }
      ],
      summary: 'This claim has moderate concerns but overall presents as plausible. A police report was promptly filed, which is a strong positive indicator. The primary concerns are the unverifiable cash claim and the absence of jewellery documentation.\n\nBrief additional verification is warranted rather than outright suspicion.',
      key_concerns: ['Unverifiable $2,000 cash claim', 'No forced entry mentioned', 'Jewellery lacks documentation'],
      positive_factors: ['Police report filed promptly', 'No previous claims', 'Electronics verifiable via serial numbers'],
      recommendation: 'Request proof of purchase for electronics, jewellery appraisals, and police report confirmation of entry point. Exclude cash component pending evidence.',
      estimated_legitimate_value: 9500
    },
    submittedAt: '2026-03-26T09:45:00Z',
    auditTrail: [
      { timestamp: '2026-03-26T09:45:00Z', actor: 'System', action: 'submitted', notes: '' },
      { timestamp: '2026-03-26T09:45:01Z', actor: 'System', action: 'escalated', notes: 'Medium risk — auto-escalated to review queue' }
    ]
  }
];

// ── Internal helpers ──────────────────────────────────────────────────────────

function read() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(claims) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(claims, null, 2), 'utf8');
}

function seed() {
  write(SEED_CLAIMS);
  return [...SEED_CLAIMS];
}

// ── Exports ───────────────────────────────────────────────────────────────────

/** Return all claims (array) */
function getAll() {
  return read() || seed();
}

/** Return a single claim by ID, or null */
function getById(id) {
  return getAll().find(c => c.id === id) || null;
}

/** Persist a new claim. Returns the saved claim. */
function create(claim) {
  const all = getAll();
  all.push(claim);
  write(all);
  return claim;
}

/** Apply partial updates to a claim. Returns updated claim or null. */
function update(id, updates) {
  const all = getAll();
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  write(all);
  return all[idx];
}

/** Return claims owned by a specific user (admin gets all) */
function getForUser(username, role) {
  const all = getAll();
  if (role === 'admin') return all;
  return all.filter(c => c.owner === username);
}

/** Filter claims by optional query params: status, riskLevel, claimType, search, startDate, endDate */
function filter({ status, riskLevel, claimType, search, startDate, endDate } = {}) {
  let claims = getAll();
  if (status)    claims = claims.filter(c => c.status === status);
  if (riskLevel) claims = claims.filter(c => c.riskLevel === riskLevel);
  if (claimType) claims = claims.filter(c => c.claimType === claimType);
  if (search) {
    const q = search.toLowerCase();
    claims = claims.filter(c =>
      c.claimantName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.policyNumber.toLowerCase().includes(q) ||
      c.incidentLocation.toLowerCase().includes(q)
    );
  }
  if (startDate) claims = claims.filter(c => new Date(c.submittedAt) >= new Date(startDate));
  if (endDate)   claims = claims.filter(c => new Date(c.submittedAt) <= new Date(endDate));
  return claims;
}

/** Generate next sequential ID */
function nextId() {
  const all = getAll();
  return `CLM-2026-${String(all.length + 1).padStart(4, '0')}`;
}

module.exports = { getAll, getById, create, update, filter, getForUser, nextId };
