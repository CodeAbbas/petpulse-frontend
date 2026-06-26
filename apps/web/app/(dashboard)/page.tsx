import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import {
  alerts,
  dashboardStats,
  healthRecords,
  recordTypeLabels,
} from '@/lib/mock-data'
import { formatDate, severityStyles } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const recentRecords = healthRecords.slice(0, 5)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Clinic overview for today, 12 Jun 2026."
      />

      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          icon="patients"
          label="Total Patients"
          value={dashboardStats.totalPatients}
          hint="Active in clinic"
          tone="primary"
        />
        <StatCard
          icon="records"
          label="Records This Week"
          value={dashboardStats.recordsThisWeek}
          hint="Logged in last 7 days"
          tone="secondary"
        />
        <StatCard
          icon="alerts"
          label="Active Alerts"
          value={dashboardStats.activeAlerts}
          hint="Needs attention"
          tone="warning"
        />
        <StatCard
          icon="bmi"
          label="Avg BMI"
          value={dashboardStats.avgBmi}
          hint="Across all patients"
          tone="success"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-heading text-lg font-semibold">
              Recent Health Records
            </h2>
            <span className="text-xs text-muted-foreground">
              {recentRecords.length} entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 text-right font-medium">Weight</th>
                  <th className="px-5 py-3 text-right font-medium">BMI</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted-foreground">
                      {formatDate(r.recorded_at)}
                    </td>
                    <td className="px-5 py-3 font-medium">{r.pet.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {recordTypeLabels[r.record_type]}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        {r.computed_metrics.bmi != null ? r.computed_metrics.bmi.toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        {r.computed_metrics.bmi != null ? r.computed_metrics.bmi.toFixed(1) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-heading text-lg font-semibold">Alerts</h2>
            <span className="text-xs text-muted-foreground">
              {alerts.length} total
            </span>
          </div>
          <ul className="divide-y divide-white/5">
            {alerts.map((a) => {
              const s = severityStyles[a.severity]
              return (
                <li key={a.id} className="flex gap-3 px-5 py-3.5">
                  <span
                    className={cn('mt-1.5 size-2 shrink-0 rounded-full', s.dot)}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase',
                          s.border,
                          s.bg,
                          s.text,
                        )}
                      >
                        {a.severity}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
