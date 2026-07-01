import { notFound } from 'next/navigation'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface EhrPet {
  name: string
  species: string
  breed: string | null
  sex: string
  age_years: number | null
  microchip_number: string | null
  metrics: {
    current_weight_kg: number | null
    current_bmi: number | null
    current_bmr_kcal: number | null
  }
}

interface EhrRecord {
  id: string
  record_type: string
  summary: string
  detail: string | null
  vitals: {
    weight_kg: number | null
    height_cm: number | null
    temperature_c: number | null
    heart_rate_bpm: number | null
  }
  computed_metrics: {
    bmi: number | null
    bmr_kcal: number | null
  }
  recorded_at: string
}

interface EhrData {
  pet: EhrPet
  health_records: EhrRecord[]
  share: {
    issued_at: string
    expires_at: string
    is_first_access: boolean
  }
}

async function fetchEhr(token: string): Promise<EhrData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/ehr/${token}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const body = (await res.json()) as { data: EhrData }
    return body.data
  } catch {
    return null
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function EhrViewerPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const ehr = await fetchEhr(token)

  if (!ehr) {
    notFound()
  }

  const { pet, health_records, share } = ehr
  const expiresAt = new Date(share.expires_at)
  const isExpiringSoon =
    expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight text-foreground">
              PetPulse
            </h1>
            <p className="text-xs text-muted-foreground">
              Shared Health Record
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              Shared{' '}
              <time dateTime={share.issued_at}>
                {formatDate(share.issued_at)}
              </time>
            </p>
            <p className={isExpiringSoon ? 'text-amber-400' : ''}>
              Expires{' '}
              <time dateTime={share.expires_at}>
                {formatDateTime(share.expires_at)}
              </time>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {/* Patient profile card */}
        <section className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold">Patient Profile</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
                {pet.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{pet.name}</h3>
                <p className="text-sm capitalize text-muted-foreground">
                  {pet.breed ?? pet.species} · {pet.sex}
                  {pet.age_years != null ? ` · ${pet.age_years}y` : ''}
                </p>
                {pet.microchip_number && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    Microchip: {pet.microchip_number}
                  </p>
                )}
              </div>
            </div>

            {/* Current metrics */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MetricCard
                label="Weight"
                value={pet.metrics.current_weight_kg}
                unit="kg"
                decimals={1}
              />
              <MetricCard
                label="BMI"
                value={pet.metrics.current_bmi}
                decimals={2}
              />
              <MetricCard
                label="BMR"
                value={pet.metrics.current_bmr_kcal}
                unit="kcal/d"
                decimals={0}
              />
            </div>
          </div>
        </section>

        {/* Health records timeline */}
        <section className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold">
              Health Records
              <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
                {health_records.length}
              </span>
            </h2>
          </div>

          {health_records.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No health records have been logged for this patient yet.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {health_records.map((record) => (
                <div key={record.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {formatType(record.record_type)}
                      </span>
                      <p className="mt-2 font-medium">{record.summary}</p>
                      {record.detail && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {record.detail}
                        </p>
                      )}
                    </div>
                    <time
                      dateTime={record.recorded_at}
                      className="shrink-0 text-right font-mono text-xs text-muted-foreground"
                    >
                      {formatDate(record.recorded_at)}
                    </time>
                  </div>

                  {/* Vitals + computed metrics */}
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {record.vitals.weight_kg != null && (
                      <span className="text-muted-foreground">
                        Weight:{' '}
                        <strong className="text-foreground">
                          {record.vitals.weight_kg.toFixed(1)} kg
                        </strong>
                      </span>
                    )}
                    {record.vitals.height_cm != null && (
                      <span className="text-muted-foreground">
                        Height:{' '}
                        <strong className="text-foreground">
                          {record.vitals.height_cm} cm
                        </strong>
                      </span>
                    )}
                    {record.vitals.temperature_c != null && (
                      <span className="text-muted-foreground">
                        Temp:{' '}
                        <strong className="text-foreground">
                          {record.vitals.temperature_c.toFixed(1)}°C
                        </strong>
                      </span>
                    )}
                    {record.vitals.heart_rate_bpm != null && (
                      <span className="text-muted-foreground">
                        HR:{' '}
                        <strong className="text-foreground">
                          {record.vitals.heart_rate_bpm} bpm
                        </strong>
                      </span>
                    )}
                  </div>

                  {(record.computed_metrics.bmi != null ||
                    record.computed_metrics.bmr_kcal != null) && (
                    <div className="mt-2 flex gap-4">
                      {record.computed_metrics.bmi != null && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                          BMI {record.computed_metrics.bmi.toFixed(2)}
                        </span>
                      )}
                      {record.computed_metrics.bmr_kcal != null && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                          BMR {record.computed_metrics.bmr_kcal.toFixed(0)} kcal/d
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer notice */}
        <footer className="pb-8 text-center text-xs text-muted-foreground">
          <p>
            This record was shared via a time-limited, signed link. Access is
            audit-logged. Do not forward this URL if the information is
            confidential.
          </p>
          <p className="mt-1 font-medium text-foreground/60">
            PetPulse — Smart Pet Care & Monitoring Ecosystem
          </p>
        </footer>
      </main>
    </div>
  )
}

function MetricCard({
  label,
  value,
  unit,
  decimals = 1,
}: {
  label: string
  value: number | null
  unit?: string
  decimals?: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold text-primary">
        {value != null ? value.toFixed(decimals) : '—'}
      </p>
      {unit && value != null && (
        <p className="text-xs text-muted-foreground">{unit}</p>
      )}
    </div>
  )
}