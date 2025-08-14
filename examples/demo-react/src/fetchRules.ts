import fallbackRules from './rules/campaign.json';

export async function fetchRules() {
  const base = (import.meta.env.BASE_URL || '/');
  const normBase = base.endsWith('/') ? base : base + '/';
  const url = `${normBase}rules/campaign.json`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load rules: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[SmartQR] Falling back to bundled rules:', err);
    // El fallback viene empaquetado con la app, sin fetch → sin 404
    return fallbackRules as unknown;
  }
}
