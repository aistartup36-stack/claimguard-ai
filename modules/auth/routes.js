/**
 * ClaimLens AI — Auth Module
 * Multi-user authentication with session cookies.
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const usersStore = require('../../store/users');

// In-memory session store: token → { createdAt, user }
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

function getSessionUser(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.claimlens_session;
  if (!token || !sessions.has(token)) return null;
  const session = sessions.get(token);
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return session.user;
}

// ── Auth Routes ──────────────────────────────────────────────────────────────

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }

  const user = usersStore.verifyPassword(username, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: Date.now(), user });

  res.setHeader('Set-Cookie', `claimlens_session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
  res.json({ success: true, data: user });
});

router.get('/auth/check', (req, res) => {
  const user = getSessionUser(req);
  if (user) {
    return res.json({ success: true, data: { authenticated: true, user } });
  }
  res.json({ success: true, data: { authenticated: false } });
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
  // Skip auth routes themselves
  if (req.path.startsWith('/auth/')) return next();

  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  req.user = user;
  next();
}

module.exports = { router, requireAuth };
