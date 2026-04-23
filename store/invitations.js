/**
 * Invitations Store — JSON file-backed.
 * Each invitation is a one-shot token that lets a claimant submit a claim
 * from a public URL without an account.
 *
 * Shape:
 *   {
 *     token:         "a1b2c3…"         (32-char hex, URL-safe),
 *     createdAt:     ISO string,
 *     expiresAt:     ISO string (30 days after creation),
 *     createdBy:     broker username (owner),
 *     claimantName:  prefilled on the form,
 *     policyNumber:  prefilled on the form,
 *     claimType:     'auto' | 'property' (prefilled default),
 *     status:        'pending' | 'submitted' | 'expired',
 *     submittedClaimId: CLM-… once used
 *   }
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '../data/invitations.json');
const TTL_DAYS = 30;

function read() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(invitations) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(invitations, null, 2), 'utf8');
}

function generateToken() {
  return crypto.randomBytes(16).toString('hex'); // 32 chars
}

function isExpired(inv) {
  return new Date(inv.expiresAt).getTime() < Date.now();
}

/** Create a new invitation. Returns the stored row. */
function create({ createdBy, claimantName, policyNumber, claimType }) {
  const now = new Date();
  const expires = new Date(now.getTime() + TTL_DAYS * 24 * 60 * 60 * 1000);
  const inv = {
    token: generateToken(),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    createdBy,
    claimantName: (claimantName || '').trim(),
    policyNumber: (policyNumber || '').trim(),
    claimType: ['auto', 'property'].includes(claimType) ? claimType : 'auto',
    status: 'pending',
    submittedClaimId: null
  };
  const all = read();
  all.push(inv);
  write(all);
  return inv;
}

/** Look up an invitation by its token. Returns null if unknown. */
function getByToken(token) {
  return read().find(i => i.token === token) || null;
}

/** Resolve a token for the public form. Returns { ok, reason?, invitation? }. */
function resolveForPublicUse(token) {
  const inv = getByToken(token);
  if (!inv) return { ok: false, reason: 'not-found' };
  if (inv.status === 'submitted') return { ok: false, reason: 'already-used' };
  if (isExpired(inv)) return { ok: false, reason: 'expired' };
  return { ok: true, invitation: inv };
}

/** Mark an invitation as used once the claim is submitted. */
function markSubmitted(token, claimId) {
  const all = read();
  const idx = all.findIndex(i => i.token === token);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status: 'submitted', submittedClaimId: claimId };
  write(all);
  return all[idx];
}

/** List invitations visible to a broker (admin sees all). */
function listForUser(username, role) {
  const all = read().map(inv => ({
    ...inv,
    status: inv.status === 'pending' && isExpired(inv) ? 'expired' : inv.status
  }));
  return role === 'admin' ? all : all.filter(i => i.createdBy === username);
}

module.exports = { create, getByToken, resolveForPublicUse, markSubmitted, listForUser };
