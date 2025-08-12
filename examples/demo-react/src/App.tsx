import React from 'react'
import { useSmartQR } from '@smartqr/react'

async function loadRulesFromPublic(id: string): Promise<unknown> {
  // Note: In a real app you'd likely call an API; for demo we fetch a static JSON file.
  const res = await fetch('/rules/demo.json', { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load rules: ${res.status}`)
  return await res.json()
}

export default function App() {
  const { status, result, launch } = useSmartQR({
    id: 'demo',
    loadRules: loadRulesFromPublic,
    timeoutMs: 1200,
    preferWebOnDesktop: true,
    navigation: 'assign',
    autoLaunch: false,
    onBefore(info) {
      // Log before navigation (for dev)
      console.log('[SmartQR][before]', info)
    },
    onAfter(info) {
      // Log after navigation (for dev)
      console.log('[SmartQR][after]', info)
    },
    onError(err) {
      console.error('[SmartQR][error]', err)
    },
  })

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>SmartQR Demo</h1>
      <p>Status: <strong>{status}</strong></p>
      <pre
        style={{
          background: '#111',
          color: '#0f0',
          padding: 12,
          borderRadius: 8,
          maxWidth: 680,
          overflowX: 'auto',
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
      <button onClick={() => launch()} style={{ padding: '8px 12px' }}>
        Resolve &amp; Execute
      </button>
    </main>
  )
}
