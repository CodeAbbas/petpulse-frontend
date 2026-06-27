'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Pencil, Trash2, PawPrint, AlertTriangle, Loader2 } from 'lucide-react'
import { SlideOver } from '@/components/slide-over'
import { Field, SelectInput, TextInput } from '@/components/form-fields'
import { formatDate, truncateId } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Pet, Sex, Species } from '@/lib/types'
import {
  createPetAction,
  updatePetAction,
  deletePetAction,
} from '@/app/(dashboard)/patients/actions'

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

export function PatientsTable({ initialPets }: { initialPets: Pet[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<PetForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [, startTransition] = useTransition()

  // Pets come from the server (initialPets). After a mutation we call
  // router.refresh(), which re-runs the Server Component fetch and feeds
  // fresh initialPets back in — so we render directly from the prop.
  const pets = initialPets

  const editing = useMemo(
    () => pets.find((p) => p.id === editingId) ?? null,
    [pets, editingId],
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setFieldErrors({})
    setOpen(true)
  }

  function openEdit(pet: Pet) {
    setEditingId(pet.id)
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? '',
      sex: pet.sex,
      date_of_birth: pet.date_of_birth ?? '',
      microchip_number: pet.microchip_number ?? '',
    })
    setFormError(null)
    setFieldErrors({})
    setOpen(true)
  }

  async function confirmRemove() {
    if (!deletingPet) return
    const result = await deletePetAction(deletingPet.id)
    if (result.ok) {
      setDeletingPet(null)
      startTransition(() => router.refresh())
    } else {
      setFormError(result.message ?? 'Could not remove the patient.')
      setDeletingPet(null)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    setFieldErrors({})

    // Build a payload matching Laravel's StorePetRequest. Empty optional
    // fields are omitted so 'nullable' rules aren't tripped by empty strings.
    const payload = {
      name: form.name.trim(),
      species: form.species,
      ...(form.breed.trim() ? { breed: form.breed.trim() } : {}),
      sex: form.sex,
      ...(form.date_of_birth ? { date_of_birth: form.date_of_birth } : {}),
      ...(form.microchip_number.trim()
        ? { microchip_number: form.microchip_number.trim() }
        : {}),
    }

    const result = editing
      ? await updatePetAction(editing.id, payload)
      : await createPetAction(payload)

    setIsSubmitting(false)

    if (result.ok) {
      setOpen(false)
      startTransition(() => router.refresh())
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      setFormError(result.message ?? 'Submission failed.')
    }
  }

  function fieldError(name: string): string | undefined {
    return fieldErrors[name]?.[0]
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
                      {pet.breed ?? '—'}
                    </td>
                    <td className="px-5 py-3 capitalize text-muted-foreground">
                      {pet.sex}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {pet.age_years ?? '—'}y
                    </td>
                    <td
                      className="px-5 py-3 font-mono text-xs text-muted-foreground"
                      title={pet.owner.id}
                    >
                      {truncateId(pet.owner.id, 10)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {pet.metrics.current_weight_kg != null
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
              Are you sure you want to remove{' '}
              <strong className="font-medium text-foreground">{deletingPet.name}</strong>?
              This action cannot be undone.
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
          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {formError}
            </div>
          )}

          <Field label="Name" htmlFor="name" hint={fieldError('name')}>
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
            <Field label="Species" htmlFor="species" hint={fieldError('species')}>
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
            <Field label="Sex" htmlFor="sex" hint={fieldError('sex')}>
              <SelectInput
                id="sex"
                disabled={isSubmitting}
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Breed" htmlFor="breed" hint={fieldError('breed')}>
            <TextInput
              id="breed"
              disabled={isSubmitting}
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              placeholder="Labrador Retriever"
            />
          </Field>

          <Field label="Date of Birth" htmlFor="dob" hint={fieldError('date_of_birth')}>
            <TextInput
              id="dob"
              type="date"
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
            hint={fieldError('microchip_number') ?? '15-digit ISO microchip identifier.'}
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