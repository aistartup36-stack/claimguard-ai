/**
 * Module 5 — Claims History & Reporting
 * Routes: GET /api/reports/claims (searchable/filterable)
 *         GET /api/reports/export/csv
 *         GET /api/reports/export/pdf
 */

const express = require('express');
const router = express.Router();
const claimsStore = require('../../store/claims');

// Searchable, filterable claims list
router.get('/reports/claims', (req, res) => {
  const { status, riskLevel, claimType, search, startDate, endDate, sort = 'submittedAt', order = 'desc' } = req.query;
  let claims = claimsStore.filter({ status, riskLevel, claimType, search, startDate, endDate });
  if (req.user.role !== 'admin') claims = claims.filter(c => c.owner === req.user.username);

  // Sort
  claims.sort((a, b) => {
    let va = a[sort], vb = b[sort];
    if (sort === 'claimedAmount' || sort === 'fraudScore') { va = Number(va) || 0; vb = Number(vb) || 0; }
    else { va = va || ''; vb = vb || ''; }
    if (va < vb) return order === 'asc' ? -1 : 1;
    if (va > vb) return order === 'asc' ? 1 : -1;
    return 0;
  });

  // Strip heavy analysis body for list view
  const results = claims.map(({ analysis, ...c }) => ({
    ...c,
    indicatorCount: (analysis?.indicators || []).length,
    hasAnalysis: !!analysis
  }));

  res.json({ success: true, data: results, total: results.length });
});

// Export as CSV
router.get('/reports/export/csv', (req, res) => {
  const { status, riskLevel, claimType, search, startDate, endDate } = req.query;
  let claims = claimsStore.filter({ status, riskLevel, claimType, search, startDate, endDate });
  if (req.user.role !== 'admin') claims = claims.filter(c => c.owner === req.user.username);

  const headers = ['Claim ID', 'Claimant Name', 'Claim Type', 'Policy Number', 'Claimed Amount', 'Incident Date', 'Report Date', 'Risk Level', 'Fraud Score', 'Status', 'Submitted At', 'Reviewed By', 'Indicators'];
  const rows = claims.map(c => [
    c.id,
    `"${c.claimantName}"`,
    c.claimType,
    c.policyNumber,
    c.claimedAmount,
    c.incidentDate,
    c.reportDate,
    c.riskLevel || '',
    c.fraudScore || '',
    c.status,
    c.submittedAt ? new Date(c.submittedAt).toISOString().split('T')[0] : '',
    `"${c.reviewedBy || ''}"`,
    (c.analysis?.indicators || []).length
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `claimlens-export-${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// Export as printable HTML (browser prints to PDF)
router.get('/reports/export/pdf', (req, res) => {
  const { status, riskLevel, claimType, search, startDate, endDate } = req.query;
  let claims = claimsStore.filter({ status, riskLevel, claimType, search, startDate, endDate });
  if (req.user.role !== 'admin') claims = claims.filter(c => c.owner === req.user.username);
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const statusLabels = { approved: 'Approved', rejected: 'Rejected', 'pending-review': 'Pending Review', 'low-risk': 'Low Risk', 'info-requested': 'Info Requested', analyzing: 'Analysing' };
  const rows = claims.map(c => `
    <tr>
      <td style="font-family:monospace;font-size:11px">${c.id}</td>
      <td>${c.claimantName}</td>
      <td style="text-transform:capitalize">${c.claimType}</td>
      <td>\u00A3${Number(c.claimedAmount).toLocaleString('en-GB')}</td>
      <td>${c.riskLevel || '—'}</td>
      <td>${c.fraudScore != null ? c.fraudScore + '/100' : '—'}</td>
      <td>${statusLabels[c.status] || c.status}</td>
      <td style="font-size:11px">${c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-GB') : '—'}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ClaimLens AI — Claims Report</title>
  <style>
    body{font-family:system-ui,Arial,sans-serif;font-size:13px;color:#1E293B;margin:32px;line-height:1.5}
    h1{font-size:22px;color:#0A1628;margin-bottom:4px}
    .meta{color:#64748B;font-size:12px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#0A1628;color:white;padding:10px 12px;text-align:left;font-weight:600}
    td{padding:9px 12px;border-bottom:1px solid #E2E8F0}
    tr:nth-child(even) td{background:#F8FAFC}
    .footer{margin-top:24px;font-size:11px;color:#94A3B8;text-align:center}
    @media print{body{margin:16px}}
  </style></head><body>
  <h1>🛡 ClaimLens AI — Claims Report</h1>
  <div class="meta">Generated: ${date} &nbsp;|&nbsp; ${claims.length} claim(s)</div>
  <table>
    <thead><tr><th>Claim ID</th><th>Claimant</th><th>Type</th><th>Amount</th><th>Risk</th><th>Score</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">ClaimLens AI v2.0 — Confidential — ${date}</div>
  <script>window.onload=function(){window.print()}</script>
  </body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
