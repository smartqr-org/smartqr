import React, { useCallback, useMemo, useState } from 'react'
import { SmartQRCode, useSmartQR } from '@smartqr/react'

type Preset =
  | 'demo'
  | 'ab-test'
  | 'campaign'
  | 'mobile-priority'
  | 'lang-matrix'

const bundledRules = import.meta.glob('./rules/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

function getBundledRules(id: string): unknown {
  const key = `./rules/${id}.json`
  return bundledRules[key]
}

async function loadRulesFromPublic(id: string): Promise<unknown> {
  const base = import.meta.env.BASE_URL ?? '/'
  const normBase = base.endsWith('/') ? base : base + '/'
  const url = `${normBase}rules/${id}.json`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed to load rules: ${res.status} at ${url}`)
    return await res.json()
  } catch (err) {
    console.warn('[SmartQR] Falling back to bundled rules for', id, err)
    const local = getBundledRules(id)
    if (!local) {
      throw new Error(
        `[SmartQR] No rules found for "${id}". Ensure /public/rules/${id}.json exists (and optionally src/rules/${id}.json for fallback).`
      )
    }
    return local
  }
}

export default function App() {
  const [preset, setPreset] = useState<Preset>('demo')
  const [autoLaunch, setAutoLaunch] = useState(false)

  const onResolved = useCallback((info: unknown) => {
    console.log('[SmartQR][component onResolved]', info)
  }, [])

  const { status, result, launch } = useSmartQR({
    id: preset,
    loadRules: loadRulesFromPublic,
    timeoutMs: 1200,
    preferWebOnDesktop: true,
    navigation: 'assign',
    autoLaunch,
    onBefore(info) {
      console.log('[SmartQR][before]', info)
    },
    onAfter(info) {
      console.log('[SmartQR][after]', info)
    },
    onError(err) {
      console.error('[SmartQR][error]', err)
    },
  })

  const presetHint = useMemo(() => {
    switch (preset) {
      case 'demo':
        return 'iOS → deeplink; ES language → es.example.com; default → example.com'
      case 'ab-test':
        return 'ES language override; 30% rollout → landing-new; else control'
      case 'campaign':
        return 'Date window → campaign page; otherwise mobile deep link; desktop → web'
      case 'mobile-priority':
        return 'Prefer deep links on iOS/Android with web fallback; desktop → web'
      case 'lang-matrix':
        return 'Route by language to localized sites; default → example.com'
      default:
        return ''
    }
  }, [preset])

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, lineHeight: 1.35 }}>
      <h1 style={{ marginTop: 0 }}>SmartQR Demo</h1>

      <section style={{ display: 'grid', gap: 12, maxWidth: 720, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Rules preset:</span>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as Preset)}
            style={{ padding: '6px 8px' }}
          >
            <option value="demo">demo.json</option>
            <option value="ab-test">ab-test.json</option>
            <option value="campaign">campaign.json</option>
            <option value="mobile-priority">mobile-priority.json</option>
            <option value="lang-matrix">lang-matrix.json</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={autoLaunch}
            onChange={(e) => setAutoLaunch(e.target.checked)}
          />
          <span>Auto launch on mount</span>
        </label>

        <small style={{ opacity: 0.75 }}>
          Hint: {presetHint}
        </small>
      </section>

      <section style={{ marginBottom: 16 }}>
        <p>
          Status: <strong>{status}</strong>
        </p>
        <pre
          style={{
            background: '#0b1020',
            color: '#9be9a8',
            padding: 12,
            borderRadius: 8,
            maxWidth: 720,
            overflowX: 'auto',
            fontSize: 12,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>

      <section style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SmartQRCode
          value="https://example.com"
          options={{ size: 256, darkColor: '#000' }}
          onResolved={onResolved}
        />

        <div style={{ display: 'grid', gap: 8 }}>
          <button onClick={() => launch()} style={{ padding: '8px 12px' }}>
            Resolve &amp; Execute
          </button>
          <small style={{ opacity: 0.75 }}>
            Click the QR or use the button to trigger the resolver.
          </small>
        </div>
      </section>
    </main>
  )
}
