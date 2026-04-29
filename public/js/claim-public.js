/* ── ClaimLens AI — Public Claimant Submission ──────────────────────────────
   Runs on /claim/:token. Validates the token, shows the prefilled form,
   submits to /api/public/claims/:token, shows thank-you screen.           */

(function () {
  const T = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
  const token = window.location.pathname.split('/claim/')[1] || '';
  const files = [];
  let policeReportFile = null;

  // Mount language switcher
  document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('lang-switcher');
    if (host && window.i18n) window.i18n.mountSwitcher(host, { variant: 'light' });
    init();
  });

  function show(id) {
    ['loading-state', 'error-state', 'form-state', 'success-state']
      .forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle('hidden', s !== id);
      });
  }

  function showError(reason) {
    const msgEl = document.getElementById('error-msg');
    const map = {
      'not-found':     'public.error.notFound',
      'expired':       'public.error.expired',
      'already-used':  'public.error.alreadyUsed'
    };
    if (msgEl) msgEl.textContent = T(map[reason] || 'public.error.generic');
    show('error-state');
  }

  async function init() {
    if (!token) { showError('not-found'); return; }
    try {
      const res = await fetch(`/api/public/invitations/${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!data.success) { showError(data.error || 'generic'); return; }

      document.getElementById('pf-name').textContent = data.data.claimantName;
      document.getElementById('pf-policy').textContent = data.data.policyNumber;
      selectType(data.data.claimType || 'auto');

      // Default report date to today
      const today = new Date().toISOString().split('T')[0];
      const rd = document.querySelector('[name="reportDate"]');
      if (rd) rd.value = today;

      show('form-state');
      document.getElementById('claim-form').addEventListener('submit', onSubmit);
    } catch {
      showError('generic');
    }
  }

  // Type selection — mirror the internal submit view
  window.selectType = function (type) {
    ['auto', 'property'].forEach(t => {
      const card = document.getElementById(`type-${t}`);
      if (card) card.classList.toggle('active', t === type);
      const radio = document.querySelector(`input[name="claimType"][value="${t}"]`);
      if (radio) radio.checked = (t === type);
    });
  };

  // File upload helpers
  window.addFiles = (e) => { Array.from(e.target.files).forEach(addFile); };
  window.dragOver = (e) => { e.preventDefault(); document.getElementById('upload-zone').classList.add('drag-over'); };
  window.dragLeave = () => document.getElementById('upload-zone').classList.remove('drag-over');
  window.drop = (e) => {
    e.preventDefault();
    document.getElementById('upload-zone').classList.remove('drag-over');
    Array.from(e.dataTransfer.files).forEach(addFile);
  };
  window.removeFile = (name) => {
    const i = files.findIndex(f => f.name === name);
    if (i !== -1) files.splice(i, 1);
    renderTags();
  };

  function addFile(file) {
    if (files.length >= 5) { flashError(T('submit.files.max')); return; }
    if (files.find(f => f.name === file.name)) return;
    files.push(file);
    renderTags();
  }

  // Police report (PDF only) — separate slot
  window.setPoliceReport = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handlePoliceReportFile(f);
  };
  window.policeDragOver = (e) => { e.preventDefault(); document.getElementById('police-report-zone').classList.add('drag-over'); };
  window.policeDragLeave = () => document.getElementById('police-report-zone').classList.remove('drag-over');
  window.policeDrop = (e) => {
    e.preventDefault();
    document.getElementById('police-report-zone').classList.remove('drag-over');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handlePoliceReportFile(f);
  };
  window.removePoliceReport = () => {
    policeReportFile = null;
    renderPoliceReportTag();
    refreshPoliceReportWarning();
  };
  function handlePoliceReportFile(file) {
    if (file.type !== 'application/pdf') { flashError(T('submit.policeReport.pdfOnly')); return; }
    policeReportFile = file;
    renderPoliceReportTag();
    refreshPoliceReportWarning();
  }
  function renderPoliceReportTag() {
    const el = document.getElementById('police-report-tag');
    if (!el) return;
    if (!policeReportFile) { el.innerHTML = ''; return; }
    el.innerHTML = `<span class="file-tag">📄 ${policeReportFile.name}<button type="button" onclick="removePoliceReport()" title="Remove">✕</button></span>`;
  }
  function refreshPoliceReportWarning() {
    const warn = document.getElementById('police-report-warning');
    if (!warn) return;
    const refField = document.querySelector('[name="policeReport"]');
    const ref = refField ? refField.value.trim().toLowerCase() : '';
    const hasRef = ref && !['', 'n/a', 'na', 'none', 'pending'].includes(ref);
    if (hasRef && !policeReportFile) {
      warn.textContent = T('submit.policeReport.warning');
      warn.style.display = 'block';
    } else {
      warn.style.display = 'none';
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const refField = document.querySelector('[name="policeReport"]');
    if (refField) {
      refField.addEventListener('input', refreshPoliceReportWarning);
      refField.addEventListener('blur',  refreshPoliceReportWarning);
    }
  });
  function renderTags() {
    const tags = document.getElementById('file-tags');
    tags.innerHTML = files.map(f => `
      <span class="file-tag">
        ${f.type === 'application/pdf' ? '📄' : '🖼'} ${f.name}
        <button type="button" onclick="removeFile('${f.name.replace(/'/g, "\\'")}')" title="Remove">✕</button>
      </span>`).join('');
  }

  function flashError(msg) {
    const err = document.getElementById('form-error');
    if (!err) return;
    err.textContent = msg;
    err.style.display = 'block';
    setTimeout(() => { err.style.display = 'none'; }, 4000);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = `<span>${T('public.form.submitting')}</span>`;

    const fd = new FormData();
    const claimData = {
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
    files.forEach(f => fd.append('documents', f));
    if (policeReportFile) fd.append('policeReport', policeReportFile);

    try {
      const res = await fetch(`/api/public/claims/${encodeURIComponent(token)}`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!data.success) {
        flashError(data.error || T('public.form.submitError'));
        btn.disabled = false;
        btn.innerHTML = `<span>${T('public.form.submit')}</span>`;
        return;
      }
      document.getElementById('ref-number').textContent = data.data.id;
      show('success-state');
    } catch {
      flashError(T('public.form.submitError'));
      btn.disabled = false;
      btn.innerHTML = `<span>${T('public.form.submit')}</span>`;
    }
  }
})();
