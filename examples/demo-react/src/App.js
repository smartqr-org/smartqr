import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { SmartQRCode, useSmartQR } from '@smartqr/react';
const bundledRules = import.meta.glob('./rules/*.json', {
    eager: true,
    import: 'default',
});
function getBundledRules(id) {
    const key = `./rules/${id}.json`;
    return bundledRules[key];
}
async function loadRulesFromPublic(id) {
    const base = import.meta.env?.BASE_URL ?? '/';
    const normBase = base.endsWith('/') ? base : base + '/';
    const url = `${normBase}rules/${id}.json`;
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok)
            throw new Error(`Failed to load rules: ${res.status} at ${url}`);
        return await res.json();
    }
    catch (err) {
        console.warn('[SmartQR] Falling back to bundled rules for', id, err);
        const local = getBundledRules(id);
        if (!local) {
            throw new Error(`[SmartQR] No rules found for "${id}". Ensure /public/rules/${id}.json exists (and optionally src/rules/${id}.json for fallback).`);
        }
        return local;
    }
}
export default function App() {
    const [preset, setPreset] = useState('demo');
    const [autoLaunch, setAutoLaunch] = useState(false);
    const onResolved = useCallback((info) => {
        console.log('[SmartQR][component onResolved]', info);
    }, []);
    const { status, result, launch } = useSmartQR({
        id: preset,
        loadRules: loadRulesFromPublic,
        timeoutMs: 1200,
        preferWebOnDesktop: true,
        navigation: 'assign',
        autoLaunch,
        onBefore(info) {
            console.log('[SmartQR][before]', info);
        },
        onAfter(info) {
            console.log('[SmartQR][after]', info);
        },
        onError(err) {
            console.error('[SmartQR][error]', err);
        },
    });
    const presetHint = useMemo(() => {
        switch (preset) {
            case 'demo':
                return 'iOS → deeplink; ES language → es.example.com; default → example.com';
            case 'ab-test':
                return 'ES language override; 30% rollout → landing-new; else control';
            case 'campaign':
                return 'Date window → campaign page; otherwise mobile deep link; desktop → web';
            case 'mobile-priority':
                return 'Prefer deep links on iOS/Android with web fallback; desktop → web';
            case 'lang-matrix':
                return 'Route by language to localized sites; default → example.com';
            default:
                return '';
        }
    }, [preset]);
    return (_jsxs("main", { style: { fontFamily: 'system-ui, sans-serif', padding: 24, lineHeight: 1.35 }, children: [_jsx("h1", { style: { marginTop: 0 }, children: "SmartQR Demo" }), _jsxs("section", { style: { display: 'grid', gap: 12, maxWidth: 720, marginBottom: 16 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { children: "Rules preset:" }), _jsxs("select", { value: preset, onChange: (e) => setPreset(e.target.value), style: { padding: '6px 8px' }, children: [_jsx("option", { value: "demo", children: "demo.json" }), _jsx("option", { value: "ab-test", children: "ab-test.json" }), _jsx("option", { value: "campaign", children: "campaign.json" }), _jsx("option", { value: "mobile-priority", children: "mobile-priority.json" }), _jsx("option", { value: "lang-matrix", children: "lang-matrix.json" })] })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: autoLaunch, onChange: (e) => setAutoLaunch(e.target.checked) }), _jsx("span", { children: "Auto launch on mount" })] }), _jsxs("small", { style: { opacity: 0.75 }, children: ["Hint: ", presetHint] })] }), _jsxs("section", { style: { marginBottom: 16 }, children: [_jsxs("p", { children: ["Status: ", _jsx("strong", { children: status })] }), _jsx("pre", { style: {
                            background: '#0b1020',
                            color: '#9be9a8',
                            padding: 12,
                            borderRadius: 8,
                            maxWidth: 720,
                            overflowX: 'auto',
                            fontSize: 12,
                        }, children: JSON.stringify(result, null, 2) })] }), _jsxs("section", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx(SmartQRCode, { value: "https://example.com", options: { size: 256, darkColor: '#000' }, onResolved: onResolved }), _jsxs("div", { style: { display: 'grid', gap: 8 }, children: [_jsx("button", { onClick: () => launch(), style: { padding: '8px 12px' }, children: "Resolve & Execute" }), _jsx("small", { style: { opacity: 0.75 }, children: "Click the QR or use the button to trigger the resolver." })] })] })] }));
}
