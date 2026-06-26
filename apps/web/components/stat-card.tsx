import { Users, FileClock, BellRing, Activity, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  patients: Users,
  records: FileClock,
  alerts: BellRing,
  bmi: Activity,
}

export function StatCard({
  icon,
  label,
  value,
  unit,
  hint,
  tone = 'primary',
}: {
  icon: keyof typeof ICONS
  label: string
  value: string | number
  unit?: string
  hint?: string
  tone?: 'primary' | 'secondary' | 'warning' | 'success'
}) {
  const Icon = ICONS[icon]
  const toneClasses: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    success: 'text-success bg-success/10 border-success/20',
  }

  return (
    <div className="glass p-5">
      <div className="flex items-start justify-between">
        <span
          className={`flex size-10 items-center justify-center rounded-xl border ${toneClasses[tone]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-3xl font-semibold tracking-tight">
        {value}
        {unit ? (
          <span className="ml-1 text-base text-muted-foreground">{unit}</span>
        ) : null}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
