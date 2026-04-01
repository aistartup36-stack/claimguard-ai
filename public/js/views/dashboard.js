/* ── Module 1 — Dashboard View ────────────────────────────────────────────── */

window.DashboardView = {
  async render() {
    const area = document.getElementById('content-area');
    area.innerHTML = `<div style="color:#94A3B8;padding:40px;text-align:center">Loading...</div>`;
    try {
      const [stats, activity, claims] = await Promise.all([API.getStats(), API.getActivity(), API.getClaims()]);
      App.updateQueueBadge(stats.pendingReview);
      const { low = 0, medium = 0, high = 0 } = stats.riskBreakdown || {};
      const total = (low + medium + high) || 1;
      const recent = [...claims].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 8);

      area.innerHTML = `
        <div class="stats-grid">
          ${this._statCard('blue', Utils.svgIcon('doc'), stats.total, 'Total Claims Processed', '')}
          ${this._statCard('red', Utils.svgIcon('warn'), stats.fraudDetected, 'Fraud Cases Detected', `${stats.total > 0 ? ((stats.fraudDetected/stats.total)*100).toFixed(0) : 0}% detection rate`)}
          ${this._statCard('green', Utils.svgIcon('dollar'), null, 'Money Saved', Utils.fmt$(stats.moneySaved), true)}
          ${this._statCard('amber', Utils.svgIcon('clock'), stats.pendingReview, 'Pending Human Review', stats.pendingReview > 0 ? '<span style="color:#F59E0B">Requires attention</span>' : '')}
        </div>

        <div style="display:grid;grid-template-columns:1fr 320px;gap:24px;margin-bottom:24px">
          <div class="card">
            <div class="card-header"><h3>Recent Claims</h3><button class="btn btn-sm btn-ghost" onclick="App.navigate('history')">View All →</button></div>
            ${recent.length === 0 ? `<div class="empty-state"><p>No claims yet.</p></div>` : `
            <table class="data-table"><thead><tr>
              <th>Claim ID</th><th>Claimant</th><th>Type</th><th>Amount</th><th>Risk</th><th>Status</th>
            </tr></thead><tbody>
              ${recent.map(c => `<tr onclick="App.viewClaim('${c.id}')">
                <td style="font-family:monospace;font-weight:600;color:#0A1628;font-size:12px">${c.id}</td>
                <td style="font-weight:500">${c.claimantName}</td>
                <td style="text-transform:capitalize">${c.claimType}</td>
                <td>${Utils.fmt$(c.claimedAmount)}</td>
                <td>${c.riskLevel ? Badges.risk(c.riskLevel) : '—'}</td>
                <td>${Badges.status(c.status)}</td>
              </tr>`).join('')}
            </tbody></table>`}
          </div>

          <div style="display:flex;flex-direction:column;gap:20px">
            <div class="card">
              <div class="card-header"><h3>Risk Breakdown</h3></div>
              <div class="card-body">
                <div class="risk-chart">
                  ${[['low','#10B981',low],['medium','#F59E0B',medium],['high','#EF4444',high]].map(([level,col,n]) => `
                    <div class="risk-bar-row">
                      <div class="risk-bar-label" style="color:${col}">${level.toUpperCase()}</div>
                      <div class="risk-bar-track"><div class="risk-bar-fill ${level}" style="width:${(n/total*100).toFixed(0)}%"></div></div>
                      <div class="risk-bar-count">${n}</div>
                    </div>`).join('')}
                </div>
                <div class="divider"></div>
                <div style="font-size:13px;color:#64748B;line-height:2">
                  <div style="display:flex;justify-content:space-between"><span>Total value processed</span><span style="font-weight:600;color:#0A1628">${Utils.fmt$(stats.totalValue)}</span></div>
                  <div style="display:flex;justify-content:space-between"><span>In review queue</span><span style="font-weight:600;color:#0A1628">${stats.pendingReview}</span></div>
                </div>
                ${stats.pendingReview > 0 ? `<button class="btn btn-warning btn-sm" style="margin-top:14px;width:100%" onclick="App.navigate('queue')">View Queue (${stats.pendingReview})</button>` : ''}
              </div>
            </div>

            <div class="card">
              <div class="card-header"><h3>Recent Activity</h3></div>
              <div class="card-body" style="padding-top:12px;padding-bottom:12px">
                ${activity.length === 0 ? `<p style="color:#94A3B8;font-size:13px">No activity yet.</p>` :
                  activity.slice(0,6).map(e => `
                    <div style="display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #F1F5F9;cursor:pointer" onclick="App.viewClaim('${e.claimId}')">
                      <div style="width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0;background:${e.action==='approved'?'#10B981':e.action==='rejected'?'#EF4444':e.action==='escalated'?'#F59E0B':'#60A5FA'}"></div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:12px;font-weight:600;color:#0A1628;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.claimantName} <span style="color:#94A3B8;font-weight:400">${e.claimId}</span></div>
                        <div style="font-size:11px;color:#64748B;text-transform:capitalize">${e.action}</div>
                      </div>
                      <div style="font-size:11px;color:#94A3B8;flex-shrink:0">${Utils.fmtDate(e.timestamp)}</div>
                    </div>`).join('')}
              </div>
            </div>
          </div>
        </div>`;

      // Animate counters
      document.querySelectorAll('[data-count]').forEach(el => Utils.animateCounter(el, parseInt(el.dataset.count)));
    } catch(e) {
      area.innerHTML = `<div style="color:#EF4444;padding:20px">Error: ${e.message}</div>`;
    }
  },

  _statCard(color, icon, count, label, sub, isMoney = false) {
    return `<div class="stat-card">
      <div class="stat-icon ${color}" style="width:42px;height:42px">${icon}</div>
      <div class="stat-value">${isMoney ? '' : ''}<span data-count="${count || 0}">0</span></div>
      <div class="stat-label">${label}</div>
      ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
    </div>`;
  }
};
