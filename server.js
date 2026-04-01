/**
 * ClaimLens AI — Server Entry Point
 * Thin orchestrator: loads config, mounts module routers, starts server.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// ── Auth ──────────────────────────────────────────────────────────────────────
const { router: authRouter, requireAuth } = require('./modules/auth/routes');
app.use('/api', authRouter);
app.use('/api', requireAuth);

// ── Mount Modules ─────────────────────────────────────────────────────────────
app.use('/api', require('./modules/dashboard/routes'));   // Module 1 — Dashboard
app.use('/api', require('./modules/claims/routes'));      // Module 2 — Claim Submission
//            analysis is called internally by claims module (Module 3)
app.use('/api', require('./modules/queue/routes'));       // Module 4 — Review Queue
app.use('/api', require('./modules/reports/routes'));     // Module 5 — History & Reports
app.use('/api', require('./modules/settings/routes'));    // Module 6 — Settings

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ success: false, error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║         ClaimLens AI   v2.0  —  Running        ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\n  URL:    http://localhost:${PORT}`);
  console.log(`  AI:     ${hasKey ? '✅ Claude Opus connected' : '⚠️  Demo mode (no ANTHROPIC_API_KEY)'}`);
  console.log('  Auth:   🔒 Multi-user authentication enabled');
  console.log('\n  Modules: Dashboard · Claims · Analysis · Queue · Reports · Settings\n');
  if (!hasKey) console.log('  → Copy .env.example to .env and add ANTHROPIC_API_KEY\n');
});
