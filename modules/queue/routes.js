/**
 * Module 4 — Human Review Queue
 * Routes: GET /api/queue, PUT /api/claims/:id/review, PUT /api/claims/:id/assign
 */

const express = require('express');
const router = express.Router();
const claimsStore = require('../../store/claims');

router.get('/queue', (req, res) => {
  const queue = claimsStore.getForUser(req.user.username, req.user.role)
    .filter(c => c.status === 'pending-review' || c.status === 'info-requested')
    .sort((a, b) => (b.fraudScore || 0) - (a.fraudScore || 0));
  res.json({ success: true, data: queue });
});

router.put('/claims/:id/review', (req, res) => {
  const claim = claimsStore.getById(req.params.id);
  if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });
  if (req.user.role !== 'admin' && claim.owner !== req.user.username) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const { action, reviewerName, notes } = req.body;
  if (!['approve', 'reject', 'request-info'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Invalid action. Use: approve, reject, request-info' });
  }

  const statusMap = { approve: 'approved', reject: 'rejected', 'request-info': 'info-requested' };
  const auditEntry = {
    timestamp: new Date().toISOString(),
    actor: reviewerName || 'Reviewer',
    action,
    notes: notes || ''
  };

  const updated = claimsStore.update(req.params.id, {
    status: statusMap[action],
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerName || 'Reviewer',
    reviewNotes: notes || '',
    auditTrail: [...(claim.auditTrail || []), auditEntry]
  });

  res.json({ success: true, data: updated });
});

router.put('/claims/:id/assign', (req, res) => {
  const claim = claimsStore.getById(req.params.id);
  if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });
  if (req.user.role !== 'admin' && claim.owner !== req.user.username) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const { assignedTo } = req.body;
  const auditEntry = {
    timestamp: new Date().toISOString(),
    actor: 'System',
    action: 'assigned',
    notes: assignedTo ? `Assigned to ${assignedTo}` : 'Unassigned'
  };

  const updated = claimsStore.update(req.params.id, {
    assignedTo: assignedTo || null,
    auditTrail: [...(claim.auditTrail || []), auditEntry]
  });

  res.json({ success: true, data: updated });
});

module.exports = router;
