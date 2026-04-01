/**
 * Module 1 — Dashboard
 * Routes: GET /api/stats, GET /api/activity
 */

const express = require('express');
const router = express.Router();
const claimsStore = require('../../store/claims');

router.get('/stats', (req, res) => {
  const claims = claimsStore.getForUser(req.user.username, req.user.role);
  const total = claims.length;
  const fraudDetected = claims.filter(c => c.riskLevel === 'high' || c.riskLevel === 'medium').length;
  const moneySaved = claims.filter(c => c.riskLevel === 'high' && (c.status === 'pending-review' || c.status === 'rejected')).reduce((s, c) => s + c.claimedAmount, 0);
  const pendingReview = claims.filter(c => c.status === 'pending-review' || c.status === 'info-requested').length;
  const totalValue = claims.reduce((s, c) => s + c.claimedAmount, 0);
  const low = claims.filter(c => c.riskLevel === 'low').length;
  const medium = claims.filter(c => c.riskLevel === 'medium').length;
  const high = claims.filter(c => c.riskLevel === 'high').length;
  res.json({ success: true, data: { total, fraudDetected, moneySaved, pendingReview, totalValue, riskBreakdown: { low, medium, high } } });
});

router.get('/activity', (req, res) => {
  const claims = claimsStore.getForUser(req.user.username, req.user.role);
  // Flatten all audit trail entries, attach claim context, sort by timestamp desc
  const events = [];
  for (const claim of claims) {
    for (const entry of (claim.auditTrail || [])) {
      events.push({ ...entry, claimId: claim.id, claimantName: claim.claimantName, claimType: claim.claimType, claimedAmount: claim.claimedAmount });
    }
  }
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ success: true, data: events.slice(0, 12) });
});

module.exports = router;
