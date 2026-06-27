// Single source of truth for PetPulse domain shapes. These mirror the
// Laravel API resources (PetResource, HealthRecordResource) exactly,
// including server-nullable fields. lib/api.ts imports these; it does not
// redefine them.

export type Role = 'vet' | 'admin'

export type Species = 'dog' | 'cat'
export type Sex = 'male' | 'female' | 'unknown'

export type RecordType =
  | 'weight'
  | 'vaccination'
  | 'examination'
  | 'lab_work'
  | 'dental'
  | 'surgery'
  | 'medication'
  | 'other'

export interface PetMetrics {
  current_weight_kg: number | null
  current_bmi: number | null
  current_bmr_kcal: number | null
}

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string | null
  sex: Sex
  date_of_birth: string | null
  age_years: number | null
  microchip_number: string | null
  metrics: PetMetrics
  owner: { id: string }
  timestamps: {
    created_at: string
    updated_at: string
  }
}

export interface HealthRecord {
  id: string
  record_type: RecordType
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
  summary: string
  detail: string | null
  pet: { id: string; name: string | null }
  recorded_by: { id: string | null }
  recorded_at: string
}

export type Severity = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  severity: Severity
  title: string
  description: string
  pet: { id: string; name: string }
  created_at: string
}

export interface CurrentUser {
  id: string
  name: string
  role: Role
}