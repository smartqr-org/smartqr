export async function loadRulesFromPublic(name) {
    const base = import.meta.env?.BASE_URL ?? '/';
    const url = `${base.replace(/\/+$/, '/')}rules/${name}.json`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`Failed to load rules: HTTP ${res.status} at ${url}`);
    }
    return res.json();
}
