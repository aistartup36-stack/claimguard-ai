/**
 * Users Store — JSON file-backed user accounts with SHA-256 password hashing.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '../data/users.json');

function hash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const SEED_USERS = [
  { username: 'admin',  passwordHash: hash('claimlens2026'), role: 'admin', displayName: 'Admin' },
  { username: 'demo1',  passwordHash: hash('demo2026'),      role: 'user',  displayName: 'Demo User 1' },
  { username: 'demo2',  passwordHash: hash('demo2026'),      role: 'user',  displayName: 'Demo User 2' }
];

function read() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function getAll() {
  const stored = read();
  if (stored) return stored;
  write(SEED_USERS);
  return [...SEED_USERS];
}

function getByUsername(username) {
  return getAll().find(u => u.username === username) || null;
}

/** Returns user object (without hash) if valid, null otherwise */
function verifyPassword(username, password) {
  const user = getByUsername(username);
  if (!user || user.passwordHash !== hash(password)) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { getAll, getByUsername, verifyPassword };
