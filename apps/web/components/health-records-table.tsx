'use client'

import { useState } from 'react'
import { Plus, FileClock, Sparkles, CheckCircle2 } from 'lucide-react'
import { SlideOver } from '@/components/slide-over'
import { Field, SelectInput, TextArea, TextInput } from '@/components/form-fields'
import {
  computeBmi,
  computeBmr,
  formatDate,
  recordTypeTone,
  truncateId,
} from '@/lib/format'
import { recordTypeLabels } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { HealthRecord, Pet, RecordType } from '@/lib/types'

interface RecordForm {
  pet_id: string
  record_type: RecordType
  weight_kg: string
  height_cm: string
  temperature_c: string
  heart_rate_bpm: string
  summary: string
  notes: string
}

function emptyForm(defaultPetId: string): RecordForm {
  return {
    pet_id: defaultPetId,
    record_type: 'weight',
    weight_kg: '',
    height_cm: '',
    temperature_c: '',
    heart_rate_bpm: '',
    summary: '',
    notes: '',
  }
}

const RECORD_TYPES: RecordType[] = [
  'weight',
  'vaccination',
  'examination',
  'lab_work',
  'dental',
  'surgery',
  'medication',
  'other',
]

export function HealthRecordsTable({
  initialRecords,
  pets,
}: {
  initialRecords: HealthRecord[]
  pets: Pet[]
}) {
  const [records, setRecords] = useState<HealthRecord[]>(initialRecords)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<RecordForm>(emptyForm(pets[0]?.id ?? ''))
  const [computed, setComputed] = useState<{
    bmi: number
    bmr_kcal: number
    name: string
  } | null>(null)

  function openCreate() {
    setForm(emptyForm(pets[0]?.id ?? ''))
    setComputed(null)
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const pet = pets.find((p) => p.id === form.pet_id)
    if (!pet) return

    const weight = parseFloat(form.weight_kg) || 0
    const height = parseFloat(form.height_cm) || 0
    const bmi = computeBmi(weight, height)
    const bmr = computeBmr(weight)
    const now = new Date().toISOString()

    const record: HealthRecord = {
      id: crypto.randomUUID(),
      record_type: form.record_type,
      vitals: {
        weight_kg: weight,
        height_cm: height || null,
        temperature_c: form.temperature_c
          ? parseFloat(form.temperature_c)
          : null,
        heart_rate_bpm: form.heart_rate_bpm
          ? parseInt(form.heart_rate_bpm, 10)
          : null,
      },
      computed_metrics: { bmi, bmr_kcal: bmr },
      summary: form.summary,
      detail: form.notes,
      pet: { id: pet.id, name: pet.name },
      recorded_by: { id: 'user-2f9c-4a1b-vet-0001' },
      recorded_at: now,
      timestamps: { created_at: now, updated_at: now },
    }

    setRecords((prev) => [record, ...prev])
    setComputed({ bmi, bmr_kcal: bmr, name: pet.name })
  }

  return (
    <>
      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">
            Health Records
            <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
              {records.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden="true" />
            Log Record
          </button>
        </div>

        {records.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 text-right font-medium">Weight</th>
                  <th className="bg-primary/5 px-4 py-3 text-right font-medium text-primary">
                    BMI
                  </th>
                  <th className="bg-primary/5 px-4 py-3 text-right font-medium text-primary">
                    BMR
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Temp</th>
                  <th className="px-4 py-3 text-right font-medium">HR</th>
                  <th className="px-4 py-3 font-medium">Recorder</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatDate(r.recorded_at)}
                    </td>
                    <td className="px-4 py-3 font-medium">{r.pet.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-md border px-2 py-0.5 text-xs',
                          recordTypeTone[r.record_type],
                        )}
                      >
                        {recordTypeLabels[r.record_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {r.vitals.weight_kg.toFixed(1)}
                    </td>
                    <td className="bg-primary/5 px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-primary">
                        {r.computed_metrics.bmi.toFixed(2)}
                        <Sparkles className="size-3" aria-label="auto-computed" />
                      </span>
                    </td>
                    <td className="bg-primary/5 px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-primary">
                        {r.computed_metrics.bmr_kcal.toFixed(0)}
                        <Sparkles className="size-3" aria-label="auto-computed" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {r.vitals.temperature_c != null
                        ? `${r.vitals.temperature_c.toFixed(1)}°`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {r.vitals.heart_rate_bpm ?? '—'}
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-xs text-muted-foreground"
                      title={r.recorded_by.id}
                    >
                      {truncateId(r.recorded_by.id, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title="Log Health Record"
        description="BMI and BMR are derived automatically from vitals."
        footer={
          computed ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Done
            </button>
          ) : (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="record-form"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Save Record
              </button>
            </div>
          )
        }
      >
        {computed ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center rounded-2xl border border-success/30 bg-success/10 px-6 py-6 text-center">
              <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
              <p className="mt-2 font-medium">Record saved for {computed.name}</p>
              <p className="text-sm text-muted-foreground">
                Server computed the following metrics:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  BMI
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold text-primary">
                  {computed.bmi.toFixed(2)}
                </p>
              </div>
              <div className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  BMR
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold text-primary">
                  {computed.bmr_kcal.toFixed(0)}
                  <span className="ml-1 text-xs text-muted-foreground">
                    kcal/d
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form id="record-form" onSubmit={submit} className="space-y-4">
            <Field label="Patient" htmlFor="pet_id">
              <SelectInput
                id="pet_id"
                required
                value={form.pet_id}
                onChange={(e) => setForm({ ...form, pet_id: e.target.value })}
              >
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.breed}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Record Type" htmlFor="record_type">
              <SelectInput
                id="record_type"
                value={form.record_type}
                onChange={(e) =>
                  setForm({ ...form, record_type: e.target.value as RecordType })
                }
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {recordTypeLabels[t]}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Weight (kg)" htmlFor="weight_kg">
                <TextInput
                  id="weight_kg"
                  type="number"
                  step="0.1"
                  required
                  value={form.weight_kg}
                  onChange={(e) =>
                    setForm({ ...form, weight_kg: e.target.value })
                  }
                  placeholder="30.0"
                />
              </Field>
              <Field label="Height (cm)" htmlFor="height_cm" hint="Optional">
                <TextInput
                  id="height_cm"
                  type="number"
                  step="0.1"
                  value={form.height_cm}
                  onChange={(e) =>
                    setForm({ ...form, height_cm: e.target.value })
                  }
                  placeholder="60.0"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Temperature (°C)"
                htmlFor="temperature_c"
                hint="Optional"
              >
                <TextInput
                  id="temperature_c"
                  type="number"
                  step="0.1"
                  value={form.temperature_c}
                  onChange={(e) =>
                    setForm({ ...form, temperature_c: e.target.value })
                  }
                  placeholder="38.5"
                />
              </Field>
              <Field
                label="Heart Rate (bpm)"
                htmlFor="heart_rate_bpm"
                hint="Optional"
              >
                <TextInput
                  id="heart_rate_bpm"
                  type="number"
                  value={form.heart_rate_bpm}
                  onChange={(e) =>
                    setForm({ ...form, heart_rate_bpm: e.target.value })
                  }
                  placeholder="90"
                />
              </Field>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                BMI and BMR are computed server-side from these vitals.
              </p>
            </div>

            <Field label="Summary" htmlFor="summary">
              <TextInput
                id="summary"
                required
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Routine weigh-in"
              />
            </Field>

            <Field label="Notes" htmlFor="notes">
              <TextArea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional clinical detail…"
              />
            </Field>
          </form>
        )}
      </SlideOver>
    </>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground">
        <FileClock className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium">No health records yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Log your first record to capture vitals and computed metrics.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden="true" />
        Log Record
      </button>
    </div>
  )
}
