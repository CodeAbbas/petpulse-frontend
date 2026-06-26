import type { RecordType, Severity } from './types'

/** Format an ISO-8601 string as "18 Apr 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Format an ISO-8601 string as "18 Apr 2026, 10:00". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Truncate a long id to a compact mono-friendly form. */
export function truncateId(id: string, head = 8): string {
  if (id.length <= head + 2) return id
  return `${id.slice(0, head)}…`
}

/** Compute BMI: weight (kg) / height (m)^2 — server-equivalent helper. */
export function computeBmi(weightKg: number, heightCm: number): number {
  if (!heightCm) return 0
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 100) / 100
}

/** Rough resting metabolic estimate (kcal/day). */
export function computeBmr(weightKg: number): number {
  return Math.round(70 * Math.pow(weightKg, 0.75) * 100) / 100
}

export const severityStyles: Record<
  Severity,
  { dot: string; text: string; border: string; bg: string }
> = {
  critical: {
    dot: 'bg-critical',
    text: 'text-critical',
    border: 'border-critical/30',
    bg: 'bg-critical/10',
  },
  warning: {
    dot: 'bg-warning',
    text: 'text-warning',
    border: 'border-warning/30',
    bg: 'bg-warning/10',
  },
  info: {
    dot: 'bg-primary',
    text: 'text-primary',
    border: 'border-primary/30',
    bg: 'bg-primary/10',
  },
}

export const recordTypeTone: Record<RecordType, string> = {
  weight: 'text-primary border-primary/30 bg-primary/10',
  vaccination: 'text-success border-success/30 bg-success/10',
  examination: 'text-secondary border-secondary/30 bg-secondary/10',
  lab_work: 'text-warning border-warning/30 bg-warning/10',
  dental: 'text-primary border-primary/30 bg-primary/10',
  surgery: 'text-critical border-critical/30 bg-critical/10',
  medication: 'text-secondary border-secondary/30 bg-secondary/10',
  other: 'text-muted-foreground border-white/15 bg-white/5',
}
