/**
 * Settings Store — JSON file-backed configuration layer.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/settings.json');

const DEFAULTS = {
  lowRiskThreshold: 30,     // Scores 0–30 = Low risk (auto-clear)
  highRiskThreshold: 65,    // Scores 66–100 = High risk (escalate)
  escalationEnabled: true,
  sensitivity: 'medium',    // 'low' | 'medium' | 'high' (multiplier for heuristic)
  reviewers: [
    'sarah.mitchell@claimguard.com',
    'david.chen@claimguard.com',
    'james.whitfield@claimguard.com'
  ],
  apiKeyConfigured: false
};

function read() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(settings) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), 'utf8');
}

function get() {
  const stored = read();
  const settings = { ...DEFAULTS, ...stored };
  settings.apiKeyConfigured = !!process.env.ANTHROPIC_API_KEY;
  return settings;
}

function update(updates) {
  const current = get();
  const next = { ...current, ...updates };
  // Never persist apiKeyConfigured — it's derived from env
  delete next.apiKeyConfigured;
  write(next);
  return get();
}

module.exports = { get, update };
