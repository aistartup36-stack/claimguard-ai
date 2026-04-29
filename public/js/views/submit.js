/* ── Module 2 — Submit Claim View ─────────────────────────────────────────── */

window.SubmitView = {
  _files: [],
  _policeReportFile: null,

  render() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    this._files = [];
    this._policeReportFile = null;
    document.getElementById('content-area').innerHTML = `
      <div style="max-width:800px">
        <div class="card">
          <div class="card-header"><h3>${T('submit.card.title')}</h3><span style="font-size:12px;color:#64748B">${T('submit.required')}</span></div>
          <div class="card-body">
            <form id="claim-form" onsubmit="SubmitView.submit(event)">

              <!-- Claim Type -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">${T('submit.section.type')}</div>
                <div class="form-section-desc">${T('submit.section.typeDesc')}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <label onclick="SubmitView.selectType('auto')" style="cursor:pointer">
                    <input type="radio" name="claimType" value="auto" style="display:none" checked>
                    <div class="type-card active" id="type-auto">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-bottom:8px"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      <div style="font-weight:600;color:#0A1628">${T('submit.type.auto')}</div>
                      <div style="font-size:12px;color:#64748B;margin-top:2px">${T('submit.type.autoDesc')}</div>
                    </div>
                  </label>
                  <label onclick="SubmitView.selectType('property')" style="cursor:pointer">
                    <input type="radio" name="claimType" value="property" style="display:none">
                    <div class="type-card" id="type-property">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-bottom:8px"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <div style="font-weight:600;color:#0A1628">${T('submit.type.property')}</div>
                      <div style="font-size:12px;color:#64748B;margin-top:2px">${T('submit.type.propertyDesc')}</div>
                    </div>
                  </label>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Claimant -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">${T('submit.section.claimant')}</div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">${T('submit.field.name')} <span class="req">*</span></label><input class="form-input" name="claimantName" required placeholder="${T('submit.field.namePh')}"></div>
                  <div class="form-group"><label class="form-label">${T('submit.field.policy')} <span class="req">*</span></label><input class="form-input" name="policyNumber" required placeholder="${T('submit.field.policyPh')}"></div>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Incident -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">${T('submit.section.incident')}</div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">${T('submit.field.incidentDate')} <span class="req">*</span></label><input class="form-input" type="date" name="incidentDate" required></div>
                  <div class="form-group"><label class="form-label">${T('submit.field.reportDate')} <span class="req">*</span></label><input class="form-input" type="date" name="reportDate" required></div>
                </div>
                <div class="form-group">
                  <label class="form-label">${T('submit.field.postcode')}</label>
                  <div class="postcode-lookup">
                    <input class="form-input postcode-input" id="postcode-input" placeholder="${T('submit.field.postcodePh')}" maxlength="10" autocomplete="postal-code">
                    <button type="button" class="btn btn-primary postcode-btn" id="postcode-btn" onclick="SubmitView.lookupPostcode()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      ${T('submit.field.findAddress')}
                    </button>
                  </div>
                  <div id="postcode-results" style="display:none"></div>
                  <div id="postcode-error" style="display:none" class="postcode-error"></div>
                </div>
                <div class="form-group"><label class="form-label">${T('submit.field.location')} <span class="req">*</span></label><input class="form-input" name="incidentLocation" id="incident-location" required placeholder="${T('submit.field.locationPh')}"></div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">${T('submit.field.amount')} <span class="req">*</span></label><input class="form-input" type="number" name="claimedAmount" required min="1" step="0.01" placeholder="0.00"></div>
                  <div class="form-group"><label class="form-label">${T('submit.field.police')}</label><input class="form-input" name="policeReport" placeholder="${T('submit.field.policePh')}"></div>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Descriptions -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">${T('submit.section.desc')}</div>
                <div class="form-group"><label class="form-label">${T('submit.field.incidentDesc')} <span class="req">*</span></label><textarea class="form-textarea" name="incidentDescription" required style="min-height:110px" placeholder="${T('submit.field.incidentDescPh')}"></textarea></div>
                <div class="form-group"><label class="form-label">${T('submit.field.damageDesc')} <span class="req">*</span></label><textarea class="form-textarea" name="damageDescription" required style="min-height:90px" placeholder="${T('submit.field.damageDescPh')}"></textarea></div>
                <div class="form-grid-2">
                  <div class="form-group"><label class="form-label">${T('submit.field.witnesses')}</label><input class="form-input" name="witnesses" placeholder="${T('submit.field.witnessesPh')}"></div>
                  <div class="form-group"><label class="form-label">${T('submit.field.prior')}</label><input class="form-input" name="previousClaims" placeholder="${T('submit.field.priorPh')}"></div>
                </div>
              </div>
              <div class="divider"></div>

              <!-- Police Report PDF (separate, named slot) -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">${T('submit.section.policeReport')}</div>
                <div class="form-section-desc">${T('submit.section.policeReportDesc')}</div>
                <div class="file-upload-area" id="police-report-zone"
                  onclick="document.getElementById('police-report-input').click()"
                  ondragover="SubmitView.policeDragOver(event)"
                  ondragleave="SubmitView.policeDragLeave()"
                  ondrop="SubmitView.policeDrop(event)">
                  <div style="width:36px;height:36px;margin:0 auto 10px;color:#94A3B8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <h4>${T('submit.policeReport.title')}</h4>
                  <p>${T('submit.policeReport.body')}</p>
                </div>
                <input type="file" id="police-report-input" style="display:none" accept=".pdf" onchange="SubmitView.setPoliceReport(event)">
                <div id="police-report-tag" class="file-tags-container"></div>
                <div id="police-report-warning" style="display:none;margin-top:8px;padding:10px 12px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;font-size:12px;color:#92400E"></div>
              </div>
              <div class="divider"></div>

              <!-- Documents -->
              <div style="margin-bottom:24px">
                <div class="form-section-title">${T('submit.section.docs')}</div>
                <div class="form-section-desc">${T('submit.section.docsDesc')}</div>
                <div class="file-upload-area" id="upload-zone"
                  onclick="document.getElementById('file-input').click()"
                  ondragover="SubmitView.dragOver(event)"
                  ondragleave="SubmitView.dragLeave()"
                  ondrop="SubmitView.drop(event)">
                  <div style="width:44px;height:44px;margin:0 auto 14px;color:#94A3B8">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                  </div>
                  <h4>${T('submit.dropzone.title')}</h4>
                  <p>${T('submit.dropzone.body')}</p>
                </div>
                <input type="file" id="file-input" style="display:none" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" multiple onchange="SubmitView.addFiles(event)">
                <div id="file-tags" class="file-tags-container"></div>
              </div>

              <div style="display:flex;gap:12px;justify-content:flex-end">
                <button type="button" class="btn btn-secondary" onclick="App.navigate('dashboard')">${T('submit.btn.cancel')}</button>
                <button type="submit" class="btn btn-primary btn-lg" id="submit-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  ${T('submit.btn.submit')}
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
    // Surface a soft warning if a police reference is typed but no PDF is attached
    const policeRefField = document.querySelector('[name="policeReport"]');
    if (policeRefField) {
      policeRefField.addEventListener('input', () => SubmitView._refreshPoliceReportWarning());
      policeRefField.addEventListener('blur',  () => SubmitView._refreshPoliceReportWarning());
    }
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

  // Police report (PDF only) — separate, single-file slot
  setPoliceReport(e) {
    const f = e.target.files && e.target.files[0];
    if (f) this._setPoliceReportFile(f);
  },
  policeDragOver(e) { e.preventDefault(); document.getElementById('police-report-zone').classList.add('drag-over'); },
  policeDragLeave() { document.getElementById('police-report-zone').classList.remove('drag-over'); },
  policeDrop(e) {
    e.preventDefault();
    document.getElementById('police-report-zone').classList.remove('drag-over');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) this._setPoliceReportFile(f);
  },
  _setPoliceReportFile(file) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    if (file.type !== 'application/pdf') { Toast.show(T('submit.policeReport.pdfOnly'), 'error'); return; }
    this._policeReportFile = file;
    this._renderPoliceReportTag();
    this._refreshPoliceReportWarning();
  },
  _removePoliceReport() {
    this._policeReportFile = null;
    this._renderPoliceReportTag();
    this._refreshPoliceReportWarning();
  },
  _renderPoliceReportTag() {
    const tag = document.getElementById('police-report-tag');
    if (!tag) return;
    if (!this._policeReportFile) { tag.innerHTML = ''; return; }
    tag.innerHTML = `<span class="file-tag">📄 ${this._policeReportFile.name}<button onclick="SubmitView._removePoliceReport()" title="Remove">✕</button></span>`;
  },
  _refreshPoliceReportWarning() {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const warn = document.getElementById('police-report-warning');
    if (!warn) return;
    const refField = document.querySelector('[name="policeReport"]');
    const ref = refField ? refField.value.trim().toLowerCase() : '';
    const hasRef = ref && !['', 'n/a', 'na', 'none', 'pending'].includes(ref);
    if (hasRef && !this._policeReportFile) {
      warn.textContent = T('submit.policeReport.warning');
      warn.style.display = 'block';
    } else {
      warn.style.display = 'none';
    }
  },

  _addFile(file) {
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    if (this._files.length >= 5) { Toast.show(T('submit.files.max'), 'error'); return; }
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
    const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
    const input = document.getElementById('postcode-input');
    const resultsEl = document.getElementById('postcode-results');
    const errorEl = document.getElementById('postcode-error');
    const raw = input.value.trim();

    errorEl.style.display = 'none';
    resultsEl.style.display = 'none';

    if (!raw) { errorEl.textContent = T('submit.pc.enter'); errorEl.style.display = 'block'; return; }

    const btn = document.getElementById('postcode-btn');
    btn.disabled = true;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg> ${T('submit.field.searching')}`;

    // Detect format: 5 digits → French BAN, otherwise → UK postcodes.io
    const compact = raw.replace(/\s+/g, '');
    const isFrench = /^\d{5}$/.test(compact);

    try {
      if (isFrench) {
        await this._lookupFrenchPostcode(compact, resultsEl, errorEl, T);
      } else {
        await this._lookupUkPostcode(raw, resultsEl, errorEl, T);
      }
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> ${T('submit.field.findAddress')}`;
    }
  },

  async _lookupFrenchPostcode(postcode, resultsEl, errorEl, T) {
    try {
      // Official French BAN API — returns multiple municipalities for a postcode.
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(postcode)}&type=municipality&limit=10`);
      const data = await res.json();
      const features = (data && data.features) || [];

      if (features.length === 0) {
        errorEl.textContent = T('submit.pc.notFound');
        errorEl.style.display = 'block';
        return;
      }

      const addresses = features.map(f => {
        const p = f.properties || {};
        const city = p.city || p.name || '';
        const ctx = p.context || '';   // e.g. "75, Paris, Île-de-France"
        const pc = p.postcode || postcode;
        const label = [city, pc, ctx].filter(Boolean).join(', ');
        return { label, value: label };
      });

      // Deduplicate
      const seen = new Set();
      const unique = addresses.filter(a => { if (seen.has(a.value)) return false; seen.add(a.value); return true; });

      const header = unique.length === 1 ? T('submit.pc.result') : T('submit.pc.results', { n: unique.length });
      resultsEl.innerHTML = `<div class="postcode-dropdown">
        <div class="postcode-dropdown-header">${header} <strong>${postcode}</strong></div>
        ${unique.map(a => `<div class="postcode-option" onclick="SubmitView.selectAddress('${a.value.replace(/'/g, "\\'")}')">${a.label}</div>`).join('')}
        <div class="postcode-option postcode-option-manual" onclick="SubmitView.dismissPostcode()">${T('submit.pc.manual')}</div>
      </div>`;
      resultsEl.style.display = 'block';
    } catch {
      errorEl.textContent = T('submit.pc.error');
      errorEl.style.display = 'block';
    }
  },

  async _lookupUkPostcode(postcode, resultsEl, errorEl, T) {
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
      const data = await res.json();

      if (data.status !== 200 || !data.result) {
        errorEl.textContent = T('submit.pc.notFound');
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

      const header = unique.length === 1 ? T('submit.pc.result') : T('submit.pc.results', { n: unique.length });
      resultsEl.innerHTML = `<div class="postcode-dropdown">
        <div class="postcode-dropdown-header">${header} <strong>${pc}</strong></div>
        ${unique.map(a => `<div class="postcode-option" onclick="SubmitView.selectAddress('${a.value.replace(/'/g, "\\'")}')">${a.label}</div>`).join('')}
        <div class="postcode-option postcode-option-manual" onclick="SubmitView.dismissPostcode()">${T('submit.pc.manual')}</div>
      </div>`;
      resultsEl.style.display = 'block';
    } catch {
      errorEl.textContent = T('submit.pc.error');
      errorEl.style.display = 'block';
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
      previousClaims: form.previousClaims.value.trim(),
      lang: (window.i18n ? window.i18n.getLang() : 'en')
    };
    fd.append('claimData', JSON.stringify(claimData));
    this._files.forEach(f => fd.append('documents', f));
    if (this._policeReportFile) fd.append('policeReport', this._policeReportFile);

    App.showLoading();
    try {
      const claim = await API.submitClaim(fd);
      App.hideLoading();
      App.state.lastResult = claim;
      App.navigate('result');
    } catch(err) {
      App.hideLoading();
      const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
      Toast.show(T('submit.toast.fail', { msg: err.message }), 'error');
    }
  }
};
