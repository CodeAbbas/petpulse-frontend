'use client'

import { useMemo, useState } from 'react'
import { Plus, Eye, Pencil, Trash2, PawPrint, AlertTriangle, Loader2 } from 'lucide-react'
import { SlideOver } from '@/components/slide-over'
import { Field, SelectInput, TextInput } from '@/components/form-fields'
import { formatDate, truncateId } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Pet, Sex, Species } from '@/lib/types'

interface PetForm {
  name: string
  species: Species
  breed: string
  sex: Sex
  date_of_birth: string
  microchip_number: string
}

const emptyForm: PetForm = {
  name: '',
  species: 'dog',
  breed: '',
  sex: 'unknown',
  date_of_birth: '',
  microchip_number: '',
}

function ageFromDob(dob: string): number {
  if (!dob) return 0
  const diff = Date.now() - new Date(dob).getTime()
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)))
}

export function PatientsTable({ initialPets }: { initialPets: Pet[] }) {
  const [pets, setPets] = useState<Pet[]>(initialPets)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<PetForm>(emptyForm)

  const editing = useMemo(
    () => pets.find((p) => p.id === editingId) ?? null,
    [pets, editingId],
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(pet: Pet) {
    setEditingId(pet.id)
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      sex: pet.sex,
      date_of_birth: pet.date_of_birth,
      microchip_number: pet.microchip_number,
    })
    setOpen(true)
  }

  function confirmRemove() {
    if (deletingPet) {
      setPets((prev) => prev.filter((p) => p.id !== deletingPet.id))
      setDeletingPet(null)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate network latency for UI testing (remove when Laravel backend is connected)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const age = ageFromDob(form.date_of_birth)
    if (editing) {
      setPets((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                ...form,
                age_years: age,
                timestamps: {
                  ...p.timestamps,
                  updated_at: new Date().toISOString(),
                },
              }
            : p,
        ),
      )
    } else {
      const now = new Date().toISOString()
      const newPet: Pet = {
        id: crypto.randomUUID(),
        ...form,
        age_years: age,
        metrics: {
          current_weight_kg: 0,
          current_bmi: 0,
          current_bmr_kcal: 0,
        },
        owner: { id: crypto.randomUUID(), name: 'Unassigned' },
        timestamps: { created_at: now, updated_at: now },
      }
      setPets((prev) => [newPet, ...prev])
    }
    
    setIsSubmitting(false)
    setOpen(false)
  }

  return (
    <>
      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">
            All Patients
            <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
              {pets.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden="true" />
            New Patient
          </button>
        </div>

        {pets.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Species</th>
                  <th className="px-5 py-3 font-medium">Breed</th>
                  <th className="px-5 py-3 font-medium">Sex</th>
                  <th className="px-5 py-3 text-right font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Owner ID</th>
                  <th className="px-5 py-3 text-right font-medium">Weight</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr
                    key={pet.id}
                    className="border-t border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-5 py-3 font-medium">{pet.name}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {pet.species}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {pet.breed}
                    </td>
                    <td className="px-5 py-3 capitalize text-muted-foreground">
                      {pet.sex}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {pet.age_years}y
                    </td>
                    <td
                      className="px-5 py-3 font-mono text-xs text-muted-foreground"
                      title={pet.owner.id}
                    >
                      {truncateId(pet.owner.id, 10)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {pet.metrics.current_weight_kg
                        ? `${pet.metrics.current_weight_kg.toFixed(1)}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton label={`View ${pet.name}`}>
                          <Eye className="size-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Edit ${pet.name}`}
                          onClick={() => openEdit(pet)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Delete ${pet.name}`}
                          danger
                          onClick={() => setDeletingPet(pet)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deletingPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Remove Patient</h3>
            </div>
            
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to remove <strong className="font-medium text-foreground">{deletingPet.name}</strong>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingPet(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="rounded-xl bg-red-500/80 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <SlideOver
        open={open}
        onClose={() => !isSubmitting && setOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'New Patient'}
        description={
          editing
            ? `Last updated ${formatDate(editing.timestamps.updated_at)}`
            : 'BMI and BMR are computed by the server from logged records.'
        }
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="patient-form"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Patient'}
            </button>
          </div>
        }
      >
        <form id="patient-form" onSubmit={submit} className="space-y-4">
          <Field label="Name" htmlFor="name">
            <TextInput
              id="name"
              required
              disabled={isSubmitting}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Luna"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Species" htmlFor="species">
              <SelectInput
                id="species"
                disabled={isSubmitting}
                value={form.species}
                onChange={(e) =>
                  setForm({ ...form, species: e.target.value as Species })
                }
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </SelectInput>
            </Field>
            <Field label="Sex" htmlFor="sex">
              <SelectInput
                id="sex"
                disabled={isSubmitting}
                value={form.sex}
                onChange={(e) =>
                  setForm({ ...form, sex: e.target.value as Sex })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Breed" htmlFor="breed">
            <TextInput
              id="breed"
              required
              disabled={isSubmitting}
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              placeholder="Labrador Retriever"
            />
          </Field>

          <Field label="Date of Birth" htmlFor="dob">
            <TextInput
              id="dob"
              type="date"
              required
              disabled={isSubmitting}
              value={form.date_of_birth}
              onChange={(e) =>
                setForm({ ...form, date_of_birth: e.target.value })
              }
            />
          </Field>

          <Field
            label="Microchip Number"
            htmlFor="microchip"
            hint="15-digit ISO microchip identifier."
          >
            <TextInput
              id="microchip"
              inputMode="numeric"
              disabled={isSubmitting}
              value={form.microchip_number}
              onChange={(e) =>
                setForm({ ...form, microchip_number: e.target.value })
              }
              placeholder="985112004567832"
            />
          </Field>
        </form>
      </SlideOver>
    </>
  )
}

function IconButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5',
        danger ? 'hover:text-critical text-red-400' : 'hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground">
        <PawPrint className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium">No patients yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Add your first patient to start tracking health records.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden="true" />
        New Patient
      </button>
    </div>
  )
}