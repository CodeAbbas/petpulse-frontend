'use client'

import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HealthRecord, Pet } from '@/lib/types'

/**
 * FR-09: Veterinarian weight-trajectory dashboard.
 *
 * Plots each patient's weight over time from logged health records. A pet
 * selector switches the series. Reads records already fetched by the
 * dashboard Server Component — no extra round-trip for the default view.
 */
export function WeightTrajectoryChart({
  pets,
  records,
}: {
  pets: Pet[]
  records: HealthRecord[]
}) {
  // Only pets that actually have weighed records are worth charting.
  const petsWithData = useMemo(() => {
    const idsWithWeight = new Set(
      records
        .filter((r) => r.vitals.weight_kg != null)
        .map((r) => r.pet.id),
    )
    return pets.filter((p) => idsWithWeight.has(p.id))
  }, [pets, records])

  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    petsWithData[0]?.id ?? null,
  )

  const series = useMemo(() => {
    if (!selectedPetId) return []
    return records
      .filter(
        (r) => r.pet.id === selectedPetId && r.vitals.weight_kg != null,
      )
      .map((r) => ({
        date: new Date(r.recorded_at).getTime(),
        dateLabel: new Date(r.recorded_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        }),
        weight: r.vitals.weight_kg as number,
        bmi: r.computed_metrics.bmi,
      }))
      .sort((a, b) => a.date - b.date)
  }, [records, selectedPetId])

  if (petsWithData.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="font-medium">No weight data yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Weight trajectories appear once patients have logged weigh-ins.
        </p>
      </div>
    )
  }

  return (
    <div className="glass overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Weight Trajectory
          </h2>
          <p className="text-xs text-muted-foreground">
            Logged weight over time, per patient
          </p>
        </div>

        {/* Pet selector */}
        <div className="flex flex-wrap gap-1.5">
          {petsWithData.map((pet) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => setSelectedPetId(pet.id)}
              className={
                selectedPetId === pet.id
                  ? 'rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground'
                  : 'rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5'
              }
            >
              {pet.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {series.length < 2 ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Only one weigh-in recorded for this patient.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A trend line needs at least two data points.
            </p>
            {series.length === 1 && (
              <p className="mt-3 font-mono text-2xl font-semibold text-primary">
                {series[0].weight.toFixed(1)} kg
              </p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={series}
              margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={44}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(v: number) => `${v}kg`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(9,9,11,0.92)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value, name) => {
                  if (name === 'weight' && typeof value === 'number') {
                    return [`${value.toFixed(1)} kg`, 'Weight']
                  }
                  return [value?.toString() ?? '', String(name)]
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}