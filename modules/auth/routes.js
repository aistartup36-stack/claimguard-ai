/**
 * ClaimLens AI — Auth Module
 * Simple password-based authentication with session cookies.
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// In-memory session store: token → { createdAt }
const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach(pair => {
    const [name, ...rest] = pair.trim().split('=');
    cookies[name] = rest.join('=');
  });
  return cookies;
}

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(token);
  }
}

// Clean up expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

function isValidSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.claimlens_session;
  if (!token || !sessions.has(token)) return false;
  const session = sessions.get(token);
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return false;
  }
  return true;
}

// ── Auth Routes ──────────────────────────────────────────────────────────────

router.post('/auth/login', (req, res) => {
  const password = process.env.ACCESS_PASSWORD;
  if (!password) {
    return res.status(500).json({ success: false, error: 'ACCESS_PASSWORD not configured on server' });
  }

  const { password: attempt } = req.body || {};
  if (!attempt || attempt !== password) {
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: Date.now() });

  res.setHeader('Set-Cookie', `claimlens_session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
  res.json({ success: true });
});

router.get('/auth/check', (req, res) => {
  const password = process.env.ACCESS_PASSWORD;
  // If no password is set, auth is disabled — always allow
  if (!password) return res.json({ success: true, data: { authenticated: true, authDisabled: true } });

  res.json({ success: true, data: { authenticated: isValidSession(req) } });
});

router.post('/auth/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.claimlens_session;
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', 'claimlens_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.json({ success: true });
});

// ── Middleware ────────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  // Skip if no password is configured
  if (!process.env.ACCESS_PASSWORD) return next();
  // Skip auth routes themselves
  if (req.path.startsWith('/auth/')) return next();

  if (!isValidSession(req)) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
}

module.exports = { router, requireAuth };
