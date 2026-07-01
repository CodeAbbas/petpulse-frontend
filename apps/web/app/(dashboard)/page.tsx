import { cookies } from 'next/headers'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { WeightTrajectoryChart } from '@/components/weight-trajectory-chart'
import {
  healthRecordsApi,
  petsApi,
  type HealthRecord,
  type Pet,
} from '@/lib/api'
import { formatDate } from '@/lib/format'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('petpulse_token')?.value ?? null

  let pets: Pet[] = []
  let records: HealthRecord[] = []
  let error: string | null = null

  try {
    const [petResponse, recordResponse] = await Promise.all([
      petsApi.list(token),
      healthRecordsApi.list(token),
    ])
    pets = petResponse.data
    records = recordResponse.data
  } catch {
    error = 'Unable to connect to the PetPulse API.'
  }

  // Real stats derived from live data.
  const recordsThisWeek = records.filter((r) => {
    const days = (Date.now() - new Date(r.recorded_at).getTime()) / 86_400_000
    return days <= 7
  }).length

  const bmis = pets
    .map((p) => p.metrics.current_bmi)
    .filter((b): b is number => b != null)
  const avgBmi =
    bmis.length > 0
      ? Math.round((bmis.reduce((a, b) => a + b, 0) / bmis.length) * 10) / 10
      : 0

  const recentRecords = [...records]
    .sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    )
    .slice(0, 5)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Clinic overview and patient weight trajectories."
      />

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      ) : (
        <>
          <section
            aria-label="Key metrics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              icon="patients"
              label="Total Patients"
              value={pets.length}
              hint="Active in clinic"
              tone="primary"
            />
            <StatCard
              icon="records"
              label="Records This Week"
              value={recordsThisWeek}
              hint="Logged in last 7 days"
              tone="secondary"
            />
            <StatCard
              icon="records"
              label="Total Records"
              value={records.length}
              hint="All health records"
              tone="warning"
            />
            <StatCard
              icon="bmi"
              label="Avg BMI"
              value={avgBmi}
              hint="Across all patients"
              tone="success"
            />
          </section>

          {/* FR-09: weight-trajectory dashboard */}
          <section className="mt-6">
            <WeightTrajectoryChart pets={pets} records={records} />
          </section>

          <section className="mt-6">
            <div className="glass">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="font-heading text-lg font-semibold">
                  Recent Health Records
                </h2>
                <span className="text-xs text-muted-foreground">
                  {recentRecords.length} entries
                </span>
              </div>
              {recentRecords.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No health records logged yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Patient</th>
                        <th className="px-5 py-3 text-right font-medium">Weight</th>
                        <th className="px-5 py-3 text-right font-medium">BMI</th>
                        <th className="px-5 py-3 text-right font-medium">BMR</th>
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
                          <td className="px-5 py-3 text-right font-mono">
                            {r.vitals.weight_kg != null
                              ? `${r.vitals.weight_kg.toFixed(1)} kg`
                              : '—'}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                              {r.computed_metrics.bmi != null
                                ? r.computed_metrics.bmi.toFixed(1)
                                : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                              {r.computed_metrics.bmr_kcal != null
                                ? r.computed_metrics.bmr_kcal.toFixed(0)
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </>
  )
}