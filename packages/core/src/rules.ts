// 📝 Defines the Rules payload schema and the types expected by resolveAndExecute.
//     - We keep this flexible but explicit so Zod validation is clear.
//     - Evaluation/Context types match what resolve.ts imports.

import { z } from 'zod'

/** Enumerated OS values used across evaluation and conditions */
export const OSEnum = z.enum(['iOS', 'Android', 'Desktop'])
export type OS = z.infer<typeof OSEnum>

/** Target object containing platform-specific and web/fallback URLs */
export const TargetSchema = z.object({
  ios: z.string().url().optional(),
  android: z.string().url().optional(),
  web: z.string().url().optional(),
  fallback: z.string().url().optional(),
})
export type Target = z.infer<typeof TargetSchema>

/** Conditions supported by the rules engine */
export const ConditionsSchema = z.object({
  os: z.array(OSEnum).optional(),           // e.g. ["iOS", "Android"]
  lang: z.array(z.string()).optional(),     // e.g. ["es", "en-US"] (lowercase recommended)
  dateRange: z
    .object({
      start: z.string().datetime().optional(), // ISO date strings
      end: z.string().datetime().optional(),
    })
    .optional(),
  rollout: z.number().min(0).max(100).optional(), // percentage [0..100]
})

/** A single rule with optional conditions and a required target */
export const RuleSchema = z.object({
  if: ConditionsSchema.optional(),
  target: TargetSchema,       // the target to use when this rule matches
  reason: z.string().optional(), // optional explanation for observability
})
export type Rule = z.infer<typeof RuleSchema>

/** Rules document: ordered list of rules + optional default */
export const RulesSchema = z.object({
  rules: z.array(RuleSchema).min(1),    // at least one rule
  default: z
    .object({
      target: TargetSchema,
      reason: z.string().optional(),
    })
    .optional(),
  meta: z
    .object({
      version: z.string().optional(),
      generatedAt: z.string().datetime().optional(),
    })
    .optional(),
})
export type Rules = z.infer<typeof RulesSchema>

/** Context injected by the host environment (browser/app) */
export type Context = {
  os?: OS                     // if absent, detection will be attempted
  lang?: string               // lowercased BCP-47 recommended (e.g., "es" or "en-us")
  now?: Date                  // defaults to new Date()
  rolloutSeed?: number        // number in [0..100], used for rollout checks
}

/** Evaluation result consumed by resolveAndExecute */
export type Evaluation = {
  os: OS
  lang?: string
  nowISO: string
  /** Which rule was matched (index in rules.rules) or -1 if default */
  matchedRuleIndex: number
  /** Chosen reason (from matched rule or default) for logging/telemetry */
  reason?: string
  /** Final target decided by evaluateRules */
  target: Target
}
