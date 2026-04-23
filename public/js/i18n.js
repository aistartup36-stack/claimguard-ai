/* ── ClaimLens AI — i18n (EN / FR) ────────────────────────────────────────── */
/* Lightweight runtime. Tag HTML with data-i18n="key" (or
   data-i18n-placeholder / data-i18n-title / data-i18n-html) and the
   runtime will swap text when the user toggles languages. In JS, use
   i18n.t('key', { var: 'x' }) to resolve strings dynamically.          */

window.i18n = (() => {
  const STORAGE_KEY = 'claimlens.lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED = ['en', 'fr'];

  const dict = {
    en: {
      // ─── Landing / marketing ────────────────────────────────────────────
      'meta.title':          'ClaimLens AI — Stop Insurance Fraud Before It Costs You',
      'meta.description':    'AI-powered claims analysis that detects fraudulent insurance claims in seconds, not days. Built for UK insurance brokers.',

      'nav.howItWorks':      'How It Works',
      'nav.features':        'Features',
      'nav.login':           'Login',

      'hero.badge':          'Powered by Claude AI',
      'hero.title.line1':    'Stop Insurance Fraud',
      'hero.title.line2':    'Before It Costs You',
      'hero.subtitle':       'AI-powered claims analysis that detects fraudulent claims in seconds, not days. Built for UK insurance brokers.',
      'hero.cta.demo':       'Request a Demo',
      'hero.cta.how':        'See How It Works',

      'how.label':           'How It Works',
      'how.title':           'Three steps to fraud-free claims',
      'how.desc':            'ClaimLens AI integrates into your existing workflow. No complex setup, no training required.',
      'how.step1.title':     'Submit a Claim',
      'how.step1.body':      'Upload claim documents and enter the details. Supports auto, property, and all major claim types with attached evidence.',
      'how.step2.title':     'AI Analysis',
      'how.step2.body':      'Claude AI analyses the claim for fraud indicators instantly — checking timelines, amounts, descriptions, documents, and historical patterns.',
      'how.step3.title':     'Human Review',
      'how.step3.body':      'High and medium risk claims are automatically escalated to your team with a detailed risk assessment and recommended actions.',

      'stats.label':         'The Problem',
      'stats.title':         'Insurance fraud costs the industry billions every year',
      'stats.1.label':       'Lost to insurance fraud in the UK every year',
      'stats.2.label':       'Of all claims contain elements of fraud',
      'stats.3.label':       'Reduction in manual review time with ClaimLens AI',
      'stats.4.value':       'Seconds',
      'stats.4.label':       'Not days to analyse each claim for fraud indicators',

      'features.label':      'Features',
      'features.title':      'Everything you need to fight fraud',
      'features.desc':       'Built specifically for insurance professionals who need accurate, auditable fraud detection.',
      'features.1.title':    'Fraud Risk Scoring',
      'features.1.body':     'Every claim scored 0–100 and classified as Low, Medium, or High risk with full confidence indicators.',
      'features.2.title':    'Automatic Escalation',
      'features.2.body':     'Medium and high risk claims are automatically escalated to your human review queue with priority flagging.',
      'features.3.title':    'Full Audit Trail',
      'features.3.body':     'Every decision logged with timestamps, actors, and notes. Complete compliance-ready audit trail for every claim.',
      'features.4.title':    'Auto & Property Claims',
      'features.4.body':     'Purpose-built analysis for both auto/vehicle and property insurance claims with type-specific fraud patterns.',
      'features.5.title':    'Indicator Breakdown',
      'features.5.body':     'Detailed fraud indicators with categories, severity levels, and confidence scores so reviewers know exactly what to investigate.',
      'features.6.title':    'Export Reports',
      'features.6.body':     'Export claims data as CSV or generate printable PDF reports for management, compliance, and regulatory submissions.',

      'cta.title':           'Ready to stop fraud in its tracks?',
      'cta.desc':            'See ClaimLens AI in action with a live demo account.',
      'cta.button':          'Login to Demo',

      'footer.copyright':    'ClaimLens AI © 2026. All rights reserved.',
      'footer.contact':      'Contact:',

      // ─── Login ──────────────────────────────────────────────────────────
      'login.tagline':       'AI-Powered Claims Intelligence',
      'login.label':         'Sign in to your account',
      'login.username':      'Username',
      'login.password':      'Password',
      'login.submit':        'Sign In',
      'login.submitting':    'Signing in…',
      'login.error.invalid': 'Invalid username or password.',
      'login.error.server':  'Unable to reach server. Please try again.',
      'login.footer':        'Protected by ClaimLens AI v2.0',

      // ─── App shell ──────────────────────────────────────────────────────
      'app.section.main':    'Main',
      'app.section.review':  'Review',
      'app.section.reports': 'Reports',
      'app.section.system':  'System',
      'app.nav.dashboard':   'Dashboard',
      'app.nav.submit':      'Submit Claim',
      'app.nav.queue':       'Review Queue',
      'app.nav.history':     'Claims History',
      'app.nav.settings':    'Settings',
      'app.sidebar.status':  'System Operational',
      'app.sidebar.signout': 'Sign out',
      'app.role.admin':      'Administrator',
      'app.role.user':       'User',
      'app.headerBtn.newClaim': 'New Claim',
      'app.loading':         'Loading ClaimLens AI…',
      'app.language':        'Language',

      // Page titles / subtitles
      'page.dashboard.title':    'Dashboard',
      'page.dashboard.subtitle': 'Insurance fraud detection overview',
      'page.submit.title':       'Submit Claim',
      'page.submit.subtitle':    'Upload a new claim for AI fraud analysis',
      'page.queue.title':        'Review Queue',
      'page.queue.subtitle':     'Claims escalated for human review',
      'page.history.title':      'Claims History',
      'page.history.subtitle':   'Search, filter, and export all processed claims',
      'page.settings.title':     'Settings',
      'page.settings.subtitle':  'Configure fraud detection and manage reviewers',
      'page.detail.title':       'Claim Detail',
      'page.detail.subtitle':    'Full claim information and AI analysis',
      'page.result.title':       'Analysis Complete',
      'page.result.subtitle':    'AI fraud assessment results',

      // Loading overlay
      'loading.title':       'Analysing Claim',
      'loading.desc':        'ClaimLens AI is examining this claim for fraud indicators…',
      'loading.step1':       'Processing documents',
      'loading.step2':       'Extracting claim details',
      'loading.step3':       'Cross-referencing patterns',
      'loading.step4':       'Generating risk assessment',
      'loading.step5':       'Finalising report',

      // ─── Badges / status ────────────────────────────────────────────────
      'risk.low':            'Low',
      'risk.medium':         'Medium',
      'risk.high':           'High',
      'status.approved':        'Approved',
      'status.rejected':        'Rejected',
      'status.pending-review':  'Pending Review',
      'status.analyzing':       'Analysing',
      'status.info-requested':  'Info Requested',
      'status.low-risk':        'Low Risk',
      'badge.confidence':       '{n}% confidence',

      // ─── Dashboard view ─────────────────────────────────────────────────
      'dash.generic.loading': 'Loading...',
      'dash.stat.total':      'Total Claims Processed',
      'dash.stat.fraud':      'Fraud Cases Detected',
      'dash.stat.detection':  '{n}% detection rate',
      'dash.stat.saved':      'Money Saved',
      'dash.stat.pending':    'Pending Human Review',
      'dash.stat.attention':  'Requires attention',
      'dash.recent.title':    'Recent Claims',
      'dash.recent.viewAll':  'View All →',
      'dash.recent.empty':    'No claims yet.',
      'dash.col.id':          'Claim ID',
      'dash.col.claimant':    'Claimant',
      'dash.col.type':        'Type',
      'dash.col.amount':      'Amount',
      'dash.col.risk':        'Risk',
      'dash.col.status':      'Status',
      'dash.risk.title':      'Risk Breakdown',
      'dash.risk.totalValue': 'Total value processed',
      'dash.risk.inQueue':    'In review queue',
      'dash.risk.viewQueue':  'View Queue ({n})',
      'dash.activity.title':  'Recent Activity',
      'dash.activity.empty':  'No activity yet.',

      // ─── Queue view ─────────────────────────────────────────────────────
      'queue.loading':       'Loading queue...',
      'queue.empty.title':   'Queue is Clear',
      'queue.empty.body':    'No claims are currently awaiting human review.',
      'queue.summary':       '{n} claims awaiting review · Sorted by fraud score',
      'queue.summary.one':   '1 claim awaiting review · Sorted by fraud score',
      'queue.filter.high':   '{n} High',
      'queue.filter.medium': '{n} Medium',
      'queue.card.fraudScore': 'FRAUD SCORE',
      'queue.meta.claimed':  'Claimed',
      'queue.meta.incident': 'Incident',
      'queue.meta.status':   'Status',
      'queue.meta.assign':   'Assign to',
      'queue.assign.unassigned': 'Unassigned',
      'queue.btn.review':    'Review →',
      'queue.toast.assigned': 'Assigned to {name}',
      'queue.toast.unassigned': 'Unassigned',
      'queue.toast.assignFail': 'Assignment failed: {msg}',

      // ─── History view ───────────────────────────────────────────────────
      'history.title':       'Claims History',
      'history.export.csv':  'CSV',
      'history.export.pdf':  'PDF',
      'history.search':      'Search name, ID, policy…',
      'history.filter.allRisk':   'All Risk Levels',
      'history.filter.allStatus': 'All Statuses',
      'history.filter.allTypes':  'All Types',
      'history.type.auto':   'Auto',
      'history.type.property': 'Property',
      'history.date.from':   'From date',
      'history.date.to':     'To date',
      'history.clear':       'Clear',
      'history.empty.title': 'No claims found',
      'history.empty.body':  'Try adjusting your filters.',
      'history.col.id':      'Claim ID',
      'history.col.claimant':'Claimant',
      'history.col.type':    'Type',
      'history.col.policy':  'Policy',
      'history.col.amount':  'Amount',
      'history.col.incident':'Incident Date',
      'history.col.flags':   'Flags',
      'history.col.risk':    'Risk',
      'history.col.status':  'Status',
      'history.col.submitted':'Submitted',

      // ─── Submit view ────────────────────────────────────────────────────
      'submit.demoNotice':   'Claude AI analysis is enabled when ANTHROPIC_API_KEY is set in .env. Without it, heuristic analysis is used.',
      'submit.card.title':   'New Claim Submission',
      'submit.required':     'All fields marked * are required',
      'submit.section.type':       'Claim Type',
      'submit.section.typeDesc':   'Select the category of insurance claim.',
      'submit.type.auto':          'Auto / Vehicle',
      'submit.type.autoDesc':      'Car, truck, motorcycle',
      'submit.type.property':      'Property',
      'submit.type.propertyDesc':  'Home, contents, commercial',
      'submit.section.claimant':   'Claimant Details',
      'submit.field.name':         'Full Name',
      'submit.field.namePh':       'Legal name of claimant',
      'submit.field.policy':       'Policy Number',
      'submit.field.policyPh':     'e.g. POL-2024-1234',
      'submit.section.incident':   'Incident Details',
      'submit.field.incidentDate': 'Date of Incident',
      'submit.field.reportDate':   'Date Reported',
      'submit.field.postcode':     'Postcode Lookup',
      'submit.field.postcodePh':   'e.g. SW1A 1AA',
      'submit.field.findAddress':  'Find Address',
      'submit.field.searching':    'Searching…',
      'submit.field.location':     'Incident Location',
      'submit.field.locationPh':   'Full address or location description',
      'submit.field.amount':       'Claimed Amount (£)',
      'submit.field.police':       'Police Report Number',
      'submit.field.policePh':     'e.g. RPT-2026-12345 or N/A',
      'submit.section.desc':       'Descriptions',
      'submit.field.incidentDesc': 'Incident Description',
      'submit.field.incidentDescPh':'Describe exactly what happened — include sequence of events, time, weather, any other relevant context.',
      'submit.field.damageDesc':   'Damage Description',
      'submit.field.damageDescPh': 'List all damaged or lost items. Include make, model, and serial numbers where applicable.',
      'submit.field.witnesses':    'Witnesses',
      'submit.field.witnessesPh':  "Names and contact details, or 'None'",
      'submit.field.prior':        'Previous Claims',
      'submit.field.priorPh':      'e.g. 2 (2023 theft, 2024 collision) or None',
      'submit.section.docs':       'Supporting Documents',
      'submit.section.docsDesc':   'Attach photos, receipts, or PDF reports. AI will analyse documents for additional fraud indicators. Up to 5 files, 20MB each.',
      'submit.dropzone.title':     'Drop files here or click to browse',
      'submit.dropzone.body':      'JPEG, PNG, WebP, PDF · Max 5 files · 20MB each',
      'submit.btn.cancel':         'Cancel',
      'submit.btn.submit':         'Analyse Claim',
      'submit.pc.enter':           'Please enter a postcode',
      'submit.pc.notFound':        'Postcode not found, please enter address manually',
      'submit.pc.error':           'Could not reach postcode service, please enter address manually',
      'submit.pc.results':         '{n} results for',
      'submit.pc.result':          '1 result for',
      'submit.pc.manual':          'Enter address manually',
      'submit.files.max':          'Maximum 5 files allowed',
      'submit.toast.fail':         'Submission failed: {msg}',

      // ─── Result / Detail views ──────────────────────────────────────────
      'result.back':         'Back to Dashboard',
      'result.back.generic': 'Back',
      'result.esc.high':     '🔴 High Risk — Priority Escalation',
      'result.esc.medium':   '🟡 Medium Risk — Escalated for Review',
      'result.esc.text':     'This claim has been added to the Human Review Queue. A reviewer will assess the AI findings and take appropriate action.',
      'result.esc.low':      '✅ Low Risk — Cleared for Processing',
      'result.esc.lowText':  'AI analysis found no significant fraud indicators. This claim can proceed through standard processing.',
      'result.claimId':      'Claim ID',
      'result.type':         'Type',
      'result.claimed':      'Claimed',
      'result.estLegit':     'Est. Legitimate',
      'result.summary':      'AI Assessment Summary',
      'result.keyConcerns':  'Key Concerns',
      'result.positive':     'Positive Factors',
      'result.indicators':   'Fraud Indicators',
      'result.indicators.found': '({n} found)',
      'result.severity':     '{level} severity',
      'result.recommendation':'Recommendation',
      'result.btn.another':  'Submit Another Claim',
      'result.btn.queue':    'Go to Review Queue →',

      'detail.info.title':   'Claim Information',
      'detail.info.type':    'Type',
      'detail.info.policy':  'Policy Number',
      'detail.info.amount':  'Claimed Amount',
      'detail.info.estLegit':'Est. Legitimate',
      'detail.info.incidentDate':'Incident Date',
      'detail.info.reportDate': 'Report Date',
      'detail.info.location':'Location',
      'detail.info.police':  'Police Report',
      'detail.info.witnesses':'Witnesses',
      'detail.info.prior':   'Prior Claims',
      'detail.info.assigned':'Assigned To',
      'detail.info.docs':    'Documents',
      'detail.info.noPolice':'None filed',
      'detail.info.noWitness':'None',
      'detail.info.noPrior': 'None declared',
      'detail.noAnalysis':   'No analysis available',
      'detail.submitted':    'Submitted {when}',
      'detail.incident':     'Incident Description',
      'detail.damage':       'Damage Description',
      'detail.ai.title':     'AI Fraud Analysis',
      'detail.indicators':   'Fraud Indicators ({n})',
      'detail.audit.title':  'Audit Trail',
      'detail.review.title': 'Human Review Decision',
      'detail.review.body':  'Review the AI analysis above and make your determination. All decisions are logged in the audit trail.',
      'detail.review.name':  'Your name',
      'detail.review.assign':'Assign to reviewer (optional)',
      'detail.review.notes': 'Add review notes, reasoning, or instructions for the claimant…',
      'detail.review.approve':'Approve Claim',
      'detail.review.reject':'Reject (Fraud)',
      'detail.review.info':  'Request Info',
      'detail.decision.title':'Review Decision',
      'detail.decision.by':  'Reviewed by {who} on {when}',
      'detail.toast.approved':'Claim approved ✓',
      'detail.toast.rejected':'Claim rejected — fraud confirmed',
      'detail.toast.info':    'More information requested',
      'detail.toast.failLoad':'Could not load claim: {msg}',
      'detail.toast.failReview':'Review failed: {msg}',

      // ─── Settings view ──────────────────────────────────────────────────
      'settings.status.title':      'System Status',
      'settings.status.connected':  'Claude AI Connected',
      'settings.status.demo':       'Demo Mode — Claude AI Not Connected',
      'settings.status.connectedDesc': 'ANTHROPIC_API_KEY is configured. Full AI analysis with Claude Opus is active.',
      'settings.status.demoDesc':   'Add ANTHROPIC_API_KEY to your .env file to enable full AI-powered fraud analysis.',
      'settings.thresholds.title':  'Fraud Detection Thresholds',
      'settings.thresholds.desc':   'Adjust the score boundaries that determine claim risk classification. Claims scoring above the High Threshold are automatically escalated with priority.',
      'settings.thresholds.low':    'Low Risk Threshold (0 – {n})',
      'settings.thresholds.lowDesc':'Claims scoring 0–{n} are classified as Low Risk and auto-cleared.',
      'settings.thresholds.high':   'High Risk Threshold ({n} – 100)',
      'settings.thresholds.highDesc':'Claims scoring {n}–100 are classified as High Risk (priority review).',
      'settings.sensitivity':       'Detection Sensitivity',
      'settings.sensitivity.low':   'Low — Fewer flags, less noise',
      'settings.sensitivity.medium':'Medium — Balanced (recommended)',
      'settings.sensitivity.high':  'High — More flags, broader detection',
      'settings.autoEscalate':      'Auto-escalate medium and high risk claims to review queue',
      'settings.saveThresholds':    'Save Threshold Settings',
      'settings.reviewers.title':   'Reviewer Accounts',
      'settings.reviewers.count':   '{n} reviewers',
      'settings.reviewers.count.one':'1 reviewer',
      'settings.reviewers.desc':    'Reviewers can be assigned to cases in the review queue. Add email addresses below.',
      'settings.reviewers.empty':   'No reviewers added yet.',
      'settings.reviewers.add':     'Add Reviewer',
      'settings.reviewers.remove':  'Remove',
      'settings.reviewers.placeholder': 'reviewer@company.com',
      'settings.about.title':       'About ClaimLens AI',
      'settings.about.version':     'Version',
      'settings.about.versionVal':  '2.0.0 — Modular Architecture',
      'settings.about.model':       'AI Model',
      'settings.about.modelVal':    'Claude Opus 4.6 (Anthropic)',
      'settings.about.storage':     'Storage',
      'settings.about.storageVal':  'Local JSON (data/claims.json)',
      'settings.about.modules':     'Modules',
      'settings.about.modulesVal':  'Dashboard · Claims · Analysis · Queue · Reports · Settings',
      'settings.toast.saved':       'Settings saved successfully',
      'settings.toast.saveFail':    'Save failed: {msg}',
      'settings.toast.email':       'Enter a valid email address',
      'settings.toast.added':       '{email} added as reviewer',
      'settings.toast.removed':     '{email} removed',
      'settings.toast.fail':        'Failed: {msg}',

      'generic.loading':     'Loading...',
      'generic.error':       'Error: {msg}'
    },

    fr: {
      // ─── Page d'accueil / marketing ─────────────────────────────────────
      'meta.title':          'ClaimLens AI — Détectez la fraude à l\'assurance avant qu\'elle ne vous coûte cher',
      'meta.description':    'Analyse de sinistres alimentée par IA qui détecte les fraudes à l\'assurance en quelques secondes, pas en plusieurs jours. Conçu pour les courtiers en assurance.',

      'nav.howItWorks':      'Fonctionnement',
      'nav.features':        'Fonctionnalités',
      'nav.login':           'Connexion',

      'hero.badge':          'Propulsé par Claude AI',
      'hero.title.line1':    'Stoppez la fraude à l\'assurance',
      'hero.title.line2':    'avant qu\'elle ne vous coûte cher',
      'hero.subtitle':       'Analyse de sinistres alimentée par IA qui détecte les sinistres frauduleux en quelques secondes, pas en plusieurs jours. Conçu pour les courtiers en assurance.',
      'hero.cta.demo':       'Demander une démo',
      'hero.cta.how':        'Voir comment ça marche',

      'how.label':           'Fonctionnement',
      'how.title':           'Trois étapes pour des sinistres sans fraude',
      'how.desc':            'ClaimLens AI s\'intègre à votre flux de travail existant. Pas de configuration complexe, aucune formation requise.',
      'how.step1.title':     'Soumettez un sinistre',
      'how.step1.body':      'Téléchargez les documents et saisissez les détails du sinistre. Prend en charge les sinistres auto, habitation et tous les types majeurs avec pièces justificatives.',
      'how.step2.title':     'Analyse par IA',
      'how.step2.body':      'Claude AI analyse instantanément le sinistre pour détecter les indicateurs de fraude — vérification des délais, montants, descriptions, documents et antécédents.',
      'how.step3.title':     'Examen humain',
      'how.step3.body':      'Les sinistres à risque élevé ou moyen sont automatiquement escaladés à votre équipe avec une évaluation détaillée et des actions recommandées.',

      'stats.label':         'Le problème',
      'stats.title':         'La fraude à l\'assurance coûte des milliards au secteur chaque année',
      'stats.1.label':       'Perdus chaque année à cause de la fraude à l\'assurance au Royaume-Uni',
      'stats.2.label':       'Des sinistres contiennent des éléments frauduleux',
      'stats.3.label':       'De réduction du temps d\'examen manuel avec ClaimLens AI',
      'stats.4.value':       'Secondes',
      'stats.4.label':       'Et non des jours pour analyser chaque sinistre',

      'features.label':      'Fonctionnalités',
      'features.title':      'Tout ce qu\'il faut pour lutter contre la fraude',
      'features.desc':       'Conçu spécifiquement pour les professionnels de l\'assurance qui ont besoin d\'une détection de fraude précise et auditable.',
      'features.1.title':    'Scoring de risque de fraude',
      'features.1.body':     'Chaque sinistre est noté de 0 à 100 et classé Faible, Moyen ou Élevé avec des indicateurs de confiance complets.',
      'features.2.title':    'Escalade automatique',
      'features.2.body':     'Les sinistres à risque moyen et élevé sont automatiquement escaladés vers votre file d\'examen humain avec signalement prioritaire.',
      'features.3.title':    'Piste d\'audit complète',
      'features.3.body':     'Chaque décision est enregistrée avec horodatage, auteurs et notes. Piste d\'audit complète prête pour la conformité.',
      'features.4.title':    'Sinistres auto et habitation',
      'features.4.body':     'Analyse dédiée pour les sinistres auto/véhicule et habitation avec des schémas de fraude spécifiques au type.',
      'features.5.title':    'Détail des indicateurs',
      'features.5.body':     'Indicateurs de fraude détaillés avec catégories, niveaux de gravité et scores de confiance pour que les examinateurs sachent quoi investiguer.',
      'features.6.title':    'Export de rapports',
      'features.6.body':     'Exportez les données au format CSV ou générez des rapports PDF imprimables pour la direction, la conformité et les régulateurs.',

      'cta.title':           'Prêt à stopper la fraude net ?',
      'cta.desc':            'Voyez ClaimLens AI en action avec un compte de démo en direct.',
      'cta.button':          'Se connecter à la démo',

      'footer.copyright':    'ClaimLens AI © 2026. Tous droits réservés.',
      'footer.contact':      'Contact :',

      // ─── Connexion ──────────────────────────────────────────────────────
      'login.tagline':       'Intelligence de sinistres alimentée par IA',
      'login.label':         'Connectez-vous à votre compte',
      'login.username':      'Nom d\'utilisateur',
      'login.password':      'Mot de passe',
      'login.submit':        'Se connecter',
      'login.submitting':    'Connexion en cours…',
      'login.error.invalid': 'Nom d\'utilisateur ou mot de passe incorrect.',
      'login.error.server':  'Impossible de joindre le serveur. Veuillez réessayer.',
      'login.footer':        'Protégé par ClaimLens AI v2.0',

      // ─── Coque de l'application ─────────────────────────────────────────
      'app.section.main':    'Principal',
      'app.section.review':  'Examen',
      'app.section.reports': 'Rapports',
      'app.section.system':  'Système',
      'app.nav.dashboard':   'Tableau de bord',
      'app.nav.submit':      'Soumettre un sinistre',
      'app.nav.queue':       'File d\'examen',
      'app.nav.history':     'Historique des sinistres',
      'app.nav.settings':    'Paramètres',
      'app.sidebar.status':  'Système opérationnel',
      'app.sidebar.signout': 'Se déconnecter',
      'app.role.admin':      'Administrateur',
      'app.role.user':       'Utilisateur',
      'app.headerBtn.newClaim':'Nouveau sinistre',
      'app.loading':         'Chargement de ClaimLens AI…',
      'app.language':        'Langue',

      // Titres / sous-titres de page
      'page.dashboard.title':    'Tableau de bord',
      'page.dashboard.subtitle': 'Vue d\'ensemble de la détection de fraude',
      'page.submit.title':       'Soumettre un sinistre',
      'page.submit.subtitle':    'Téléchargez un nouveau sinistre pour analyse de fraude par IA',
      'page.queue.title':        'File d\'examen',
      'page.queue.subtitle':     'Sinistres escaladés pour examen humain',
      'page.history.title':      'Historique des sinistres',
      'page.history.subtitle':   'Recherchez, filtrez et exportez tous les sinistres traités',
      'page.settings.title':     'Paramètres',
      'page.settings.subtitle':  'Configurez la détection de fraude et gérez les examinateurs',
      'page.detail.title':       'Détail du sinistre',
      'page.detail.subtitle':    'Informations complètes et analyse IA',
      'page.result.title':       'Analyse terminée',
      'page.result.subtitle':    'Résultats d\'évaluation de fraude par IA',

      // Surcouche de chargement
      'loading.title':       'Analyse du sinistre',
      'loading.desc':        'ClaimLens AI examine ce sinistre à la recherche d\'indicateurs de fraude…',
      'loading.step1':       'Traitement des documents',
      'loading.step2':       'Extraction des détails du sinistre',
      'loading.step3':       'Recoupement des schémas',
      'loading.step4':       'Génération de l\'évaluation de risque',
      'loading.step5':       'Finalisation du rapport',

      // ─── Badges / statuts ───────────────────────────────────────────────
      'risk.low':            'Faible',
      'risk.medium':         'Moyen',
      'risk.high':           'Élevé',
      'status.approved':        'Approuvé',
      'status.rejected':        'Rejeté',
      'status.pending-review':  'Examen en attente',
      'status.analyzing':       'Analyse',
      'status.info-requested':  'Infos demandées',
      'status.low-risk':        'Risque faible',
      'badge.confidence':       '{n}% de confiance',

      // ─── Tableau de bord ────────────────────────────────────────────────
      'dash.generic.loading': 'Chargement…',
      'dash.stat.total':      'Sinistres traités au total',
      'dash.stat.fraud':      'Cas de fraude détectés',
      'dash.stat.detection':  '{n}% de taux de détection',
      'dash.stat.saved':      'Argent économisé',
      'dash.stat.pending':    'En attente d\'examen humain',
      'dash.stat.attention':  'Nécessite votre attention',
      'dash.recent.title':    'Sinistres récents',
      'dash.recent.viewAll':  'Tout voir →',
      'dash.recent.empty':    'Aucun sinistre pour l\'instant.',
      'dash.col.id':          'ID sinistre',
      'dash.col.claimant':    'Demandeur',
      'dash.col.type':        'Type',
      'dash.col.amount':      'Montant',
      'dash.col.risk':        'Risque',
      'dash.col.status':      'Statut',
      'dash.risk.title':      'Répartition des risques',
      'dash.risk.totalValue': 'Valeur totale traitée',
      'dash.risk.inQueue':    'Dans la file d\'examen',
      'dash.risk.viewQueue':  'Voir la file ({n})',
      'dash.activity.title':  'Activité récente',
      'dash.activity.empty':  'Aucune activité pour l\'instant.',

      // ─── File d'examen ──────────────────────────────────────────────────
      'queue.loading':       'Chargement de la file…',
      'queue.empty.title':   'File vide',
      'queue.empty.body':    'Aucun sinistre n\'attend actuellement un examen humain.',
      'queue.summary':       '{n} sinistres en attente d\'examen · Triés par score de fraude',
      'queue.summary.one':   '1 sinistre en attente d\'examen · Trié par score de fraude',
      'queue.filter.high':   '{n} Élevé',
      'queue.filter.medium': '{n} Moyen',
      'queue.card.fraudScore': 'SCORE DE FRAUDE',
      'queue.meta.claimed':  'Demandé',
      'queue.meta.incident': 'Incident',
      'queue.meta.status':   'Statut',
      'queue.meta.assign':   'Assigner à',
      'queue.assign.unassigned': 'Non assigné',
      'queue.btn.review':    'Examiner →',
      'queue.toast.assigned': 'Assigné à {name}',
      'queue.toast.unassigned': 'Désassigné',
      'queue.toast.assignFail': 'Échec de l\'assignation : {msg}',

      // ─── Historique ─────────────────────────────────────────────────────
      'history.title':       'Historique des sinistres',
      'history.export.csv':  'CSV',
      'history.export.pdf':  'PDF',
      'history.search':      'Rechercher nom, ID, police…',
      'history.filter.allRisk':   'Tous les niveaux de risque',
      'history.filter.allStatus': 'Tous les statuts',
      'history.filter.allTypes':  'Tous les types',
      'history.type.auto':   'Auto',
      'history.type.property': 'Habitation',
      'history.date.from':   'Date de début',
      'history.date.to':     'Date de fin',
      'history.clear':       'Effacer',
      'history.empty.title': 'Aucun sinistre trouvé',
      'history.empty.body':  'Essayez d\'ajuster vos filtres.',
      'history.col.id':      'ID sinistre',
      'history.col.claimant':'Demandeur',
      'history.col.type':    'Type',
      'history.col.policy':  'Police',
      'history.col.amount':  'Montant',
      'history.col.incident':'Date d\'incident',
      'history.col.flags':   'Signalements',
      'history.col.risk':    'Risque',
      'history.col.status':  'Statut',
      'history.col.submitted':'Soumis',

      // ─── Soumission ─────────────────────────────────────────────────────
      'submit.demoNotice':   'L\'analyse par Claude AI est activée lorsque ANTHROPIC_API_KEY est définie dans .env. Sinon, une analyse heuristique est utilisée.',
      'submit.card.title':   'Nouvelle soumission de sinistre',
      'submit.required':     'Tous les champs marqués d\'un * sont requis',
      'submit.section.type':       'Type de sinistre',
      'submit.section.typeDesc':   'Sélectionnez la catégorie de sinistre d\'assurance.',
      'submit.type.auto':          'Auto / véhicule',
      'submit.type.autoDesc':      'Voiture, camion, moto',
      'submit.type.property':      'Habitation',
      'submit.type.propertyDesc':  'Maison, contenu, commercial',
      'submit.section.claimant':   'Informations sur le demandeur',
      'submit.field.name':         'Nom complet',
      'submit.field.namePh':       'Nom légal du demandeur',
      'submit.field.policy':       'Numéro de police',
      'submit.field.policyPh':     'ex. POL-2024-1234',
      'submit.section.incident':   'Détails de l\'incident',
      'submit.field.incidentDate': 'Date de l\'incident',
      'submit.field.reportDate':   'Date de déclaration',
      'submit.field.postcode':     'Recherche par code postal',
      'submit.field.postcodePh':   'ex. SW1A 1AA',
      'submit.field.findAddress':  'Trouver l\'adresse',
      'submit.field.searching':    'Recherche…',
      'submit.field.location':     'Lieu de l\'incident',
      'submit.field.locationPh':   'Adresse complète ou description du lieu',
      'submit.field.amount':       'Montant réclamé (£)',
      'submit.field.police':       'Numéro de rapport de police',
      'submit.field.policePh':     'ex. RPT-2026-12345 ou N/A',
      'submit.section.desc':       'Descriptions',
      'submit.field.incidentDesc': 'Description de l\'incident',
      'submit.field.incidentDescPh':'Décrivez ce qui s\'est exactement passé — séquence des événements, heure, météo, autre contexte pertinent.',
      'submit.field.damageDesc':   'Description des dommages',
      'submit.field.damageDescPh': 'Listez tous les biens endommagés ou perdus. Incluez marque, modèle et numéros de série si applicable.',
      'submit.field.witnesses':    'Témoins',
      'submit.field.witnessesPh':  'Noms et coordonnées, ou « Aucun »',
      'submit.field.prior':        'Sinistres antérieurs',
      'submit.field.priorPh':      'ex. 2 (vol 2023, collision 2024) ou Aucun',
      'submit.section.docs':       'Documents justificatifs',
      'submit.section.docsDesc':   'Joignez photos, reçus ou rapports PDF. L\'IA analysera les documents pour des indicateurs de fraude supplémentaires. Jusqu\'à 5 fichiers, 20 Mo chacun.',
      'submit.dropzone.title':     'Déposez les fichiers ici ou cliquez pour parcourir',
      'submit.dropzone.body':      'JPEG, PNG, WebP, PDF · 5 fichiers max · 20 Mo chacun',
      'submit.btn.cancel':         'Annuler',
      'submit.btn.submit':         'Analyser le sinistre',
      'submit.pc.enter':           'Veuillez saisir un code postal',
      'submit.pc.notFound':        'Code postal introuvable, veuillez saisir l\'adresse manuellement',
      'submit.pc.error':           'Service de code postal inaccessible, veuillez saisir l\'adresse manuellement',
      'submit.pc.results':         '{n} résultats pour',
      'submit.pc.result':          '1 résultat pour',
      'submit.pc.manual':          'Saisir l\'adresse manuellement',
      'submit.files.max':          'Maximum 5 fichiers autorisés',
      'submit.toast.fail':         'Échec de la soumission : {msg}',

      // ─── Résultat / détail ──────────────────────────────────────────────
      'result.back':         'Retour au tableau de bord',
      'result.back.generic': 'Retour',
      'result.esc.high':     '🔴 Risque élevé — Escalade prioritaire',
      'result.esc.medium':   '🟡 Risque moyen — Escaladé pour examen',
      'result.esc.text':     'Ce sinistre a été ajouté à la file d\'examen humain. Un examinateur évaluera les conclusions de l\'IA et prendra les mesures appropriées.',
      'result.esc.low':      '✅ Risque faible — Validé pour traitement',
      'result.esc.lowText':  'L\'analyse par IA n\'a trouvé aucun indicateur de fraude significatif. Ce sinistre peut suivre le traitement standard.',
      'result.claimId':      'ID sinistre',
      'result.type':         'Type',
      'result.claimed':      'Réclamé',
      'result.estLegit':     'Légitime estimé',
      'result.summary':      'Synthèse de l\'évaluation IA',
      'result.keyConcerns':  'Préoccupations clés',
      'result.positive':     'Facteurs positifs',
      'result.indicators':   'Indicateurs de fraude',
      'result.indicators.found': '({n} trouvés)',
      'result.severity':     'gravité {level}',
      'result.recommendation':'Recommandation',
      'result.btn.another':  'Soumettre un autre sinistre',
      'result.btn.queue':    'Aller à la file d\'examen →',

      'detail.info.title':   'Informations sur le sinistre',
      'detail.info.type':    'Type',
      'detail.info.policy':  'Numéro de police',
      'detail.info.amount':  'Montant réclamé',
      'detail.info.estLegit':'Légitime estimé',
      'detail.info.incidentDate':'Date de l\'incident',
      'detail.info.reportDate': 'Date de déclaration',
      'detail.info.location':'Lieu',
      'detail.info.police':  'Rapport de police',
      'detail.info.witnesses':'Témoins',
      'detail.info.prior':   'Sinistres antérieurs',
      'detail.info.assigned':'Assigné à',
      'detail.info.docs':    'Documents',
      'detail.info.noPolice':'Aucun déposé',
      'detail.info.noWitness':'Aucun',
      'detail.info.noPrior': 'Aucun déclaré',
      'detail.noAnalysis':   'Aucune analyse disponible',
      'detail.submitted':    'Soumis {when}',
      'detail.incident':     'Description de l\'incident',
      'detail.damage':       'Description des dommages',
      'detail.ai.title':     'Analyse de fraude par IA',
      'detail.indicators':   'Indicateurs de fraude ({n})',
      'detail.audit.title':  'Piste d\'audit',
      'detail.review.title': 'Décision d\'examen humain',
      'detail.review.body':  'Examinez l\'analyse IA ci-dessus et prenez votre décision. Toutes les décisions sont consignées dans la piste d\'audit.',
      'detail.review.name':  'Votre nom',
      'detail.review.assign':'Assigner à un examinateur (optionnel)',
      'detail.review.notes': 'Ajoutez notes d\'examen, justifications ou instructions pour le demandeur…',
      'detail.review.approve':'Approuver le sinistre',
      'detail.review.reject':'Rejeter (fraude)',
      'detail.review.info':  'Demander des infos',
      'detail.decision.title':'Décision d\'examen',
      'detail.decision.by':  'Examiné par {who} le {when}',
      'detail.toast.approved':'Sinistre approuvé ✓',
      'detail.toast.rejected':'Sinistre rejeté — fraude confirmée',
      'detail.toast.info':    'Informations complémentaires demandées',
      'detail.toast.failLoad':'Impossible de charger le sinistre : {msg}',
      'detail.toast.failReview':'Échec de l\'examen : {msg}',

      // ─── Paramètres ─────────────────────────────────────────────────────
      'settings.status.title':      'État du système',
      'settings.status.connected':  'Claude AI connecté',
      'settings.status.demo':       'Mode démo — Claude AI non connecté',
      'settings.status.connectedDesc': 'ANTHROPIC_API_KEY est configurée. L\'analyse complète par Claude Opus est active.',
      'settings.status.demoDesc':   'Ajoutez ANTHROPIC_API_KEY à votre fichier .env pour activer l\'analyse de fraude complète par IA.',
      'settings.thresholds.title':  'Seuils de détection de fraude',
      'settings.thresholds.desc':   'Ajustez les bornes de score qui déterminent la classification de risque. Les sinistres au-dessus du seuil élevé sont automatiquement escaladés en priorité.',
      'settings.thresholds.low':    'Seuil de risque faible (0 – {n})',
      'settings.thresholds.lowDesc':'Les sinistres notés 0–{n} sont classés Risque faible et validés automatiquement.',
      'settings.thresholds.high':   'Seuil de risque élevé ({n} – 100)',
      'settings.thresholds.highDesc':'Les sinistres notés {n}–100 sont classés Risque élevé (examen prioritaire).',
      'settings.sensitivity':       'Sensibilité de détection',
      'settings.sensitivity.low':   'Faible — moins de signalements, moins de bruit',
      'settings.sensitivity.medium':'Moyenne — équilibrée (recommandé)',
      'settings.sensitivity.high':  'Élevée — plus de signalements, détection large',
      'settings.autoEscalate':      'Escalader automatiquement les sinistres à risque moyen et élevé vers la file d\'examen',
      'settings.saveThresholds':    'Enregistrer les seuils',
      'settings.reviewers.title':   'Comptes examinateurs',
      'settings.reviewers.count':   '{n} examinateurs',
      'settings.reviewers.count.one':'1 examinateur',
      'settings.reviewers.desc':    'Les examinateurs peuvent être assignés aux dossiers dans la file d\'examen. Ajoutez des adresses e-mail ci-dessous.',
      'settings.reviewers.empty':   'Aucun examinateur ajouté.',
      'settings.reviewers.add':     'Ajouter un examinateur',
      'settings.reviewers.remove':  'Retirer',
      'settings.reviewers.placeholder': 'examinateur@entreprise.com',
      'settings.about.title':       'À propos de ClaimLens AI',
      'settings.about.version':     'Version',
      'settings.about.versionVal':  '2.0.0 — Architecture modulaire',
      'settings.about.model':       'Modèle IA',
      'settings.about.modelVal':    'Claude Opus 4.6 (Anthropic)',
      'settings.about.storage':     'Stockage',
      'settings.about.storageVal':  'JSON local (data/claims.json)',
      'settings.about.modules':     'Modules',
      'settings.about.modulesVal':  'Tableau de bord · Sinistres · Analyse · File · Rapports · Paramètres',
      'settings.toast.saved':       'Paramètres enregistrés',
      'settings.toast.saveFail':    'Échec de l\'enregistrement : {msg}',
      'settings.toast.email':       'Saisissez une adresse e-mail valide',
      'settings.toast.added':       '{email} ajouté comme examinateur',
      'settings.toast.removed':     '{email} retiré',
      'settings.toast.fail':        'Échec : {msg}',

      'generic.loading':     'Chargement…',
      'generic.error':       'Erreur : {msg}'
    }
  };

  let current = DEFAULT_LANG;
  const listeners = new Set();

  function loadSaved() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) return saved;
    } catch {}
    // Fall back to browser language if French is preferred
    const nav = (navigator.language || 'en').slice(0,2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : DEFAULT_LANG;
  }

  function interp(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
  }

  function t(key, vars) {
    const table = dict[current] || dict[DEFAULT_LANG];
    const val = table[key] != null ? table[key] : (dict[DEFAULT_LANG][key] != null ? dict[DEFAULT_LANG][key] : key);
    return interp(val, vars);
  }

  function apply(root) {
    const scope = root || document;
    // text content
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    // innerHTML (use sparingly — only where we trust the dict)
    scope.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    // attributes
    scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    scope.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });
    // <html lang>
    if (document.documentElement) document.documentElement.lang = current;
    // <title> if it has data-i18n-doc-title
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) document.title = t(titleKey);
    // Reflect active state on switcher buttons
    scope.querySelectorAll('[data-lang-btn]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-lang-btn') === current);
      el.setAttribute('aria-pressed', el.getAttribute('data-lang-btn') === current ? 'true' : 'false');
    });
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    if (lang === current) return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    apply();
    listeners.forEach(fn => { try { fn(lang); } catch {} });
  }

  function getLang() { return current; }

  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  /** Render a compact EN | FR toggle into the given element. */
  function mountSwitcher(el, opts = {}) {
    if (!el) return;
    const variant = opts.variant || 'light'; // 'light' for dark backgrounds, 'dark' for light bgs
    el.classList.add('lang-switcher', `lang-switcher-${variant}`);
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Language');
    el.innerHTML = `
      <button type="button" class="lang-btn" data-lang-btn="en" aria-pressed="${current==='en'}">EN</button>
      <span class="lang-sep" aria-hidden="true">|</span>
      <button type="button" class="lang-btn" data-lang-btn="fr" aria-pressed="${current==='fr'}">FR</button>
    `;
    el.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang-btn')));
    });
    // reflect current
    el.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === current);
    });
  }

  // Initialise
  current = loadSaved();
  document.addEventListener('DOMContentLoaded', () => apply());

  return { t, setLang, getLang, onChange, apply, mountSwitcher, SUPPORTED };
})();
