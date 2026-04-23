/**
 * AI Image Detection — calls Sightengine's `genai` model to flag images that
 * appear to be AI-generated (DALL-E, Midjourney, Stable Diffusion, etc.).
 *
 * Requires two env vars:
 *   SIGHTENGINE_USER   — API user id
 *   SIGHTENGINE_SECRET — API secret
 *
 * If either is missing, detection is silently skipped so the app still works.
 *
 * Returns (per-image):
 *   { name, score, verdict, checked }
 *     score:   0..1 probability the image was AI-generated
 *     verdict: 'likely' | 'possible' | 'unlikely' | 'skipped' | 'error'
 *     checked: true if we got a real score from the API
 */

const ENDPOINT = 'https://api.sightengine.com/1.0/check.json';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]);

function verdictFor(score) {
  if (score >= 0.7) return 'likely';
  if (score >= 0.4) return 'possible';
  return 'unlikely';
}

function isConfigured() {
  return !!(process.env.SIGHTENGINE_USER && process.env.SIGHTENGINE_SECRET);
}

/**
 * Check a single image buffer. Returns the per-image result object.
 * Never throws — failure modes are captured in `verdict: 'error'`.
 */
async function checkOne(file) {
  const base = { name: file.originalname, score: null, verdict: 'skipped', checked: false };

  if (!isConfigured()) return base;
  if (!IMAGE_MIME_TYPES.has(file.mimetype)) return base; // PDFs etc. — skip

  try {
    const form = new FormData();
    form.append('media', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    form.append('models', 'genai');
    form.append('api_user', process.env.SIGHTENGINE_USER);
    form.append('api_secret', process.env.SIGHTENGINE_SECRET);

    const res = await fetch(ENDPOINT, { method: 'POST', body: form });
    const data = await res.json();

    if (data.status !== 'success' || !data.type || typeof data.type.ai_generated !== 'number') {
      console.warn('[ai-detection] unexpected response for', file.originalname, data);
      return { ...base, verdict: 'error' };
    }

    const score = data.type.ai_generated;
    return {
      name: file.originalname,
      score: Math.round(score * 100) / 100,
      verdict: verdictFor(score),
      checked: true
    };
  } catch (err) {
    console.warn('[ai-detection] request failed for', file.originalname, err.message);
    return { ...base, verdict: 'error' };
  }
}

/**
 * Check every image in the upload batch. Runs requests in parallel.
 * Returns an array (empty if no images were uploaded).
 */
async function checkAll(files) {
  const images = (files || []).filter(f => IMAGE_MIME_TYPES.has(f.mimetype));
  if (images.length === 0) return [];
  return Promise.all(images.map(checkOne));
}

/**
 * Reduce an array of per-image results to a single overall verdict:
 *   'likely'   → at least one image flagged as AI-generated
 *   'possible' → at least one image looks possibly AI
 *   'unlikely' → all images look natural
 *   'skipped'  → no checks ran (not configured, or no images)
 */
function summarise(results) {
  if (!results || results.length === 0) return { verdict: 'skipped', maxScore: null };
  const real = results.filter(r => r.checked);
  if (real.length === 0) return { verdict: 'skipped', maxScore: null };

  let worst = real[0];
  for (const r of real) if ((r.score || 0) > (worst.score || 0)) worst = r;

  return { verdict: worst.verdict, maxScore: worst.score, worstImage: worst.name };
}

module.exports = { checkAll, summarise, isConfigured };
