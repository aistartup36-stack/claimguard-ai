/**
 * Module 6 — Settings & Configuration
 * Routes: GET /api/settings, PUT /api/settings
 *         POST /api/settings/reviewers, DELETE /api/settings/reviewers/:email
 */

const express = require('express');
const router = express.Router();
const settingsStore = require('../../store/settings');

router.get('/settings', (req, res) => {
  res.json({ success: true, data: settingsStore.get() });
});

router.put('/settings', (req, res) => {
  const { lowRiskThreshold, highRiskThreshold, escalationEnabled, sensitivity } = req.body;
  const updates = {};

  if (lowRiskThreshold !== undefined) {
    const n = parseInt(lowRiskThreshold);
    if (isNaN(n) || n < 0 || n > 99) return res.status(400).json({ success: false, error: 'lowRiskThreshold must be 0–99' });
    updates.lowRiskThreshold = n;
  }
  if (highRiskThreshold !== undefined) {
    const n = parseInt(highRiskThreshold);
    if (isNaN(n) || n < 1 || n > 100) return res.status(400).json({ success: false, error: 'highRiskThreshold must be 1–100' });
    updates.highRiskThreshold = n;
  }
  if (escalationEnabled !== undefined) updates.escalationEnabled = !!escalationEnabled;
  if (sensitivity !== undefined) {
    if (!['low', 'medium', 'high'].includes(sensitivity)) return res.status(400).json({ success: false, error: 'sensitivity must be low|medium|high' });
    updates.sensitivity = sensitivity;
  }

  res.json({ success: true, data: settingsStore.update(updates) });
});

router.post('/settings/reviewers', (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'Valid email required' });

  const settings = settingsStore.get();
  if (settings.reviewers.includes(email)) return res.status(400).json({ success: false, error: 'Reviewer already exists' });

  const updated = settingsStore.update({ reviewers: [...settings.reviewers, email] });
  res.json({ success: true, data: updated });
});

router.delete('/settings/reviewers/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const settings = settingsStore.get();
  const updated = settingsStore.update({ reviewers: settings.reviewers.filter(r => r !== email) });
  res.json({ success: true, data: updated });
});

module.exports = router;
