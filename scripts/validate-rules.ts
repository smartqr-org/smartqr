import { readFileSync } from 'node:fs'
import { globSync } from 'glob'
import { RulesSchema } from '@smartqr/core' // <-- relies on core exporting the Zod schema
import * as path from 'node:path'

type Result = { file: string; ok: true } | { file: string; ok: false; error: string }

// CLI arg or default glob
const pattern = process.argv[2] ?? 'examples/demo-react/public/rules/*.json'

// Collect all candidate files
const files = globSync(pattern, { nodir: true })

if (files.length === 0) {
  console.error(`[validate-rules] No files matched pattern: ${pattern}`)
  process.exit(1)
}

const results: Result[] = []

for (const file of files) {
  try {
    const abs = path.resolve(file)
    const raw = readFileSync(abs, 'utf8')
    const json = JSON.parse(raw)
    const parsed = RulesSchema.safeParse(json)

    if (!parsed.success) {
      results.push({
        file,
        ok: false,
        error: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
      })
    } else {
      results.push({ file, ok: true })
    }
  } catch (err: any) {
    results.push({ file, ok: false, error: err?.message ?? String(err) })
  }
}

const failed = results.filter(r => !r.ok)
for (const r of results) {
  if (r.ok) {
    console.log(`✅ ${r.file}`)
  } else {
    console.error(`❌ ${r.file}\n   ${r.error}`)
  }
}

if (failed.length > 0) {
  console.error(`\n[validate-rules] ${failed.length} file(s) failed validation.`)
  process.exit(1)
}

console.log(`\n[validate-rules] All ${results.length} file(s) passed.`)
