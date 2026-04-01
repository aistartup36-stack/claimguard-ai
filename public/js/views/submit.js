/* ── Module 2 — Submit Claim View ─────────────────────────────────────────── */

window.SubmitView = {
  _files: [],

  render() {
    this._files = [];
    document.getElementById('content-area').innerHTML = `
      <div style="max-width:800px">
        <div class="demo-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Claude AI analysis is enabled when <strong>ANTHROPIC_API_KEY</strong> is set in .env. Without it, heuristic analysis is used.
        </div>
        <div class="card">
          <div class="card-header"><h3>New Claim Submission</h3><span style="font-size:12px;color:#64748B">All fields marked * are required</span></div>
          <div class="card-body">
            <form id="claim-form" onsubmit="SubmitView.submit(event)">

              <!-- Claim Type -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">Claim Type</div>
                <div class="form-section-desc">Select the category of insurance claim.</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <label onclick="SubmitView.selectType('auto')" style="cursor:pointer">
                    <input type="radio" name="claimType" value="auto" style="display:none" checked>
                    <div class="type-card active" id="type-auto">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-bottom:8px"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      <div style="font-weight:600;color:#0A1628">Auto / Vehicle</div>
                      <div style="font-size:12px;color:#64748B;margin-top:2px">Car, truck, motorcycle</div>
                    </div>
                  </label>
                  <label onclick="SubmitView.selectType('property')" style="cursor:pointer">
                    <input type="radio" name="claimType" value="property" style="display:none">
                    <div class="type-card" id="type-property">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-bottom:8px"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <div style="font-weight:600;color:#0A1628">Property</div>
                      <div style="font-size:12px;color:#64748B;margin-top:2px">Home, contents, commercial</div>
                    </div>
                  </label>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Claimant -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">Claimant Details</div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">Full Name <span class="req">*</span></label><input class="form-input" name="claimantName" required placeholder="Legal name of claimant"></div>
                  <div class="form-group"><label class="form-label">Policy Number <span class="req">*</span></label><input class="form-input" name="policyNumber" required placeholder="e.g. POL-2024-1234"></div>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Incident -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">Incident Details</div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">Date of Incident <span class="req">*</span></label><input class="form-input" type="date" name="incidentDate" required></div>
                  <div class="form-group"><label class="form-label">Date Reported <span class="req">*</span></label><input class="form-input" type="date" name="reportDate" required></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Postcode Lookup</label>
                  <div class="postcode-lookup">
                    <input class="form-input postcode-input" id="postcode-input" placeholder="e.g. SW1A 1AA" maxlength="10" autocomplete="postal-code">
                    <button type="button" class="btn btn-primary postcode-btn" id="postcode-btn" onclick="SubmitView.lookupPostcode()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Find Address
                    </button>
                  </div>
                  <div id="postcode-results" style="display:none"></div>
                  <div id="postcode-error" style="display:none" class="postcode-error"></div>
                </div>
                <div class="form-group"><label class="form-label">Incident Location <span class="req">*</span></label><input class="form-input" name="incidentLocation" id="incident-location" required placeholder="Full address or location description"></div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">Claimed Amount (\u00A3) <span class="req">*</span></label><input class="form-input" type="number" name="claimedAmount" required min="1" step="0.01" placeholder="0.00"></div>
                  <div class="form-group"><label class="form-label">Police Report Number</label><input class="form-input" name="policeReport" placeholder="e.g. RPT-2026-12345 or N/A"></div>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Descriptions -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">Descriptions</div>
                <div class="form-group"><label class="form-label">Incident Description <span class="req">*</span></label><textarea class="form-textarea" name="incidentDescription" required style="min-height:110px" placeholder="Describe exactly what happened — include sequence of events, time, weather, any other relevant context."></textarea></div>
                <div class="form-group"><label class="form-label">Damage Description <span class="req">*</span></label><textarea class="form-textarea" name="damageDescription" required style="min-height:90px" placeholder="List all damaged or lost items. Include make, model, and serial numbers where applicable."></textarea></div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">Witnesses</label><input class="form-input" name="witnesses" placeholder="Names and contact details, or 'None'"></div>
                  <div class="form-group"><label class="form-label">Previous Claims</label><input class="form-input" name="previousClaims" placeholder="e.g. 2 (2023 theft, 2024 collision) or None"></div>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Documents -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">Supporting Documents</div>
                <div class="form-section-desc">Attach photos, receipts, or PDF reports. AI will analyse documents for additional fraud indicators. Up to 5 files, 20MB each.</div>
                <div class="file-upload-area" id="upload-zone"
                  onclick="document.getElementById('file-input').click()"
                  ondragover="SubmitView.dragOver(event)"
                  ondragleave="SubmitView.dragLeave()"
                  ondrop="SubmitView.drop(event)">
                  <div style="width:44px;height:44px;margin:0 auto 14px;color:#94A3B8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                  </div>
                  <h4>Drop files here or click to browse</h4>
                  <p>JPEG, PNG, WebP, PDF · Max 5 files · 20MB each</p>
                </div>
                <input type="file" id="file-input" style="display:none" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" multiple onchange="SubmitView.addFiles(event)">
                <div id="file-tags" class="file-tags-container"></div>
              </div>

              <div style="display:flex;gap:12px;justify-content:flex-end">
                <button type="button" class="btn btn-secondary" onclick="App.navigate('dashboard')">Cancel</button>
                <button type="submit" class="btn btn-primary btn-lg" id="submit-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Analyse Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>`;

    // Set today as report date
    document.querySelector('[name="reportDate"]').value = new Date().toISOString().split('T')[0];
    // Allow Enter key in postcode field to trigger lookup
    document.getElementById('postcode-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); SubmitView.lookupPostcode(); }
    });
  },

  selectType(type) {
    ['auto','property'].forEach(t => {
      document.getElementById(`type-${t}`).classList.toggle('active', t === type);
      document.querySelector(`input[value="${t}"]`).checked = (t === type);
    });
  },

  addFiles(e) { Array.from(e.target.files).forEach(f => this._addFile(f)); },
  dragOver(e) { e.preventDefault(); document.getElementById('upload-zone').classList.add('drag-over'); },
  dragLeave() { document.getElementById('upload-zone').classList.remove('drag-over'); },
  drop(e) {
    e.preventDefault();
    document.getElementById('upload-zone').classList.remove('drag-over');
    Array.from(e.dataTransfer.files).forEach(f => this._addFile(f));
  },

  _addFile(file) {
    if (this._files.length >= 5) { Toast.show('Maximum 5 files allowed', 'error'); return; }
    if (this._files.find(f => f.name === file.name)) return;
    this._files.push(file);
    this._renderFileTags();
  },
  _removeFile(name) {
    this._files = this._files.filter(f => f.name !== name);
    this._renderFileTags();
  },
  _renderFileTags() {
    document.getElementById('file-tags').innerHTML = this._files.map(f => `
      <span class="file-tag">
        ${f.type === 'application/pdf' ? '📄' : '🖼'} ${f.name}
        <button onclick="SubmitView._removeFile('${f.name}')" title="Remove">✕</button>
      </span>`).join('');
  },

  async lookupPostcode() {
    const input = document.getElementById('postcode-input');
    const resultsEl = document.getElementById('postcode-results');
    const errorEl = document.getElementById('postcode-error');
    const postcode = input.value.trim();

    errorEl.style.display = 'none';
    resultsEl.style.display = 'none';

    if (!postcode) { errorEl.textContent = 'Please enter a postcode'; errorEl.style.display = 'block'; return; }

    const btn = document.getElementById('postcode-btn');
    btn.disabled = true;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg> Searching\u2026';

    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
      const data = await res.json();

      if (data.status !== 200 || !data.result) {
        errorEl.textContent = 'Postcode not found, please enter address manually';
        errorEl.style.display = 'block';
        return;
      }

      const r = data.result;
      const addresses = [];
      const ward = r.admin_ward || '';
      const district = r.admin_district || '';
      const county = r.admin_county || '';
      const region = r.region || '';
      const pc = r.postcode || postcode;

      // Build a few realistic address variants from the postcode data
      const area = [ward, district].filter(Boolean).join(', ');
      const full = [district, county || region].filter(Boolean).join(', ');

      addresses.push({ label: `${area}, ${pc}`, value: `${area}, ${pc}` });
      if (county && county !== district) {
        addresses.push({ label: `${ward}, ${full}, ${pc}`, value: `${ward}, ${full}, ${pc}` });
      }
      addresses.push({ label: `${r.parish || ward}, ${district}, ${pc}`, value: `${r.parish || ward}, ${district}, ${pc}` });

      // Deduplicate
      const seen = new Set();
      const unique = addresses.filter(a => { if (seen.has(a.value)) return false; seen.add(a.value); return true; });

      resultsEl.innerHTML = `<div class="postcode-dropdown">
        <div class="postcode-dropdown-header">${unique.length} result${unique.length !== 1 ? 's' : ''} for <strong>${pc}</strong></div>
        ${unique.map(a => `<div class="postcode-option" onclick="SubmitView.selectAddress('${a.value.replace(/'/g, "\\'")}')">${a.label}</div>`).join('')}
        <div class="postcode-option postcode-option-manual" onclick="SubmitView.dismissPostcode()">Enter address manually</div>
      </div>`;
      resultsEl.style.display = 'block';
    } catch {
      errorEl.textContent = 'Could not reach postcode service, please enter address manually';
      errorEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Find Address';
    }
  },

  selectAddress(address) {
    const locationInput = document.getElementById('incident-location');
    if (locationInput) locationInput.value = address;
    document.getElementById('postcode-results').style.display = 'none';
  },

  dismissPostcode() {
    document.getElementById('postcode-results').style.display = 'none';
    const locationInput = document.getElementById('incident-location');
    if (locationInput) locationInput.focus();
  },

  async submit(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData();
    const claimData = {
      claimType: form.querySelector('[name="claimType"]:checked')?.value || 'auto',
      claimantName: form.claimantName.value.trim(),
      policyNumber: form.policyNumber.value.trim(),
      incidentDate: form.incidentDate.value,
      reportDate: form.reportDate.value,
      claimedAmount: form.claimedAmount.value,
      incidentLocation: form.incidentLocation.value.trim(),
      incidentDescription: form.incidentDescription.value.trim(),
      damageDescription: form.damageDescription.value.trim(),
      witnesses: form.witnesses.value.trim(),
      policeReport: form.policeReport.value.trim(),
      previousClaims: form.previousClaims.value.trim()
    };
    fd.append('claimData', JSON.stringify(claimData));
    this._files.forEach(f => fd.append('documents', f));

    App.showLoading();
    try {
      const claim = await API.submitClaim(fd);
      App.hideLoading();
      App.state.lastResult = claim;
      App.navigate('result');
    } catch(err) {
      App.hideLoading();
      Toast.show(`Submission failed: ${err.message}`, 'error');
    }
  }
};
