import { z } from 'zod'

export const RulesSchema = z.object({
  version: z.number().default(1),
  default: z.object({
    web: z.string().url().optional(),
    ios: z.string().optional(),
    android: z.string().optional(),
    fallback: z.string().optional()
  }),
  routes: z.array(z.object({
    when: z.object({
      os: z.array(z.enum(['iOS','Android','Desktop'])).optional(),
      lang: z.array(z.string()).optional(),
      dateRange: z.tuple([z.string(), z.string()]).optional(), // YYYY-MM-DD
      rollout: z.object({ percentage: z.number().min(0).max(100), seed: z.string() }).optional()
    }).partial(),
    web: z.string().optional(),
    ios: z.string().optional(),
    android: z.string().optional(),
    fallback: z.string().optional()
  })).default([])
})

export type Rules = z.infer<typeof RulesSchema>
export type Context = { userId?: string; now?: number; lang?: string }
export type Target = { web?: string; ios?: string; android?: string; fallback?: string }
export type Evaluation = {
  os: 'iOS'|'Android'|'Desktop'
  lang: string
  target: Target
  reason: 'rule'|'default'
}
