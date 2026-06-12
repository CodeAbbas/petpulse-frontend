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

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string
  sex: Sex
  date_of_birth: string
  age_years: number
  microchip_number: string
  metrics: {
    current_weight_kg: number
    current_bmi: number
    current_bmr_kcal: number
  }
  owner: { id: string; name: string }
  timestamps: {
    created_at: string
    updated_at: string
  }
}

export interface HealthRecord {
  id: string
  record_type: RecordType
  vitals: {
    weight_kg: number
    height_cm: number | null
    temperature_c: number | null
    heart_rate_bpm: number | null
  }
  computed_metrics: {
    bmi: number
    bmr_kcal: number
  }
  summary: string
  detail: string
  pet: { id: string; name: string }
  recorded_by: { id: string }
  recorded_at: string
  timestamps: {
    created_at: string
    updated_at: string
  }
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
