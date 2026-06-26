import type {
  Alert,
  CurrentUser,
  HealthRecord,
  Pet,
  RecordType,
} from './types'

export const currentUser: CurrentUser = {
  id: 'user-2f9c-4a1b-vet-0001',
  name: 'Dr. Sarah Mitchell',
  role: 'vet',
}

const OWNER_SARAH = { id: 'owner-7c1a-4f22-9e0b-001', name: 'Sarah Mitchell' }
const OWNER_JAMES = { id: 'owner-9d4e-4b81-a2c5-002', name: 'James Okafor' }
const OWNER_PRIYA = { id: 'owner-1b6f-4c93-8d10-003', name: 'Priya Nair' }
const OWNER_DIEGO = { id: 'owner-3e8a-4d52-b7f4-004', name: 'Diego Ramos' }

export const pets: Pet[] = [
  {
    id: 'a7f3e1d2-0000-4000-8000-000000000000',
    name: 'Luna',
    species: 'dog',
    breed: 'Labrador Retriever',
    sex: 'female',
    date_of_birth: '2021-09-12',
    age_years: 4,
    microchip_number: '985112004567832',
    metrics: {
      current_weight_kg: 28.6,
      current_bmi: 24.5,
      current_bmr_kcal: 664.0,
    },
    owner: OWNER_SARAH,
    timestamps: {
      created_at: '2026-04-18T00:00:00+00:00',
      updated_at: '2026-04-18T00:00:00+00:00',
    },
  },
  {
    id: 'b8e4f2c3-1111-4000-8000-000000000001',
    name: 'Milo',
    species: 'cat',
    breed: 'Maine Coon',
    sex: 'male',
    date_of_birth: '2020-03-04',
    age_years: 6,
    microchip_number: '985112009981245',
    metrics: {
      current_weight_kg: 7.2,
      current_bmi: 19.8,
      current_bmr_kcal: 233.4,
    },
    owner: OWNER_JAMES,
    timestamps: {
      created_at: '2026-02-02T00:00:00+00:00',
      updated_at: '2026-05-21T00:00:00+00:00',
    },
  },
  {
    id: 'c9f5a3d4-2222-4000-8000-000000000002',
    name: 'Bella',
    species: 'dog',
    breed: 'Border Collie',
    sex: 'female',
    date_of_birth: '2019-11-30',
    age_years: 6,
    microchip_number: '985112002233117',
    metrics: {
      current_weight_kg: 18.4,
      current_bmi: 21.1,
      current_bmr_kcal: 475.6,
    },
    owner: OWNER_PRIYA,
    timestamps: {
      created_at: '2026-01-15T00:00:00+00:00',
      updated_at: '2026-06-01T00:00:00+00:00',
    },
  },
  {
    id: 'd0a6b4e5-3333-4000-8000-000000000003',
    name: 'Oscar',
    species: 'cat',
    breed: 'British Shorthair',
    sex: 'male',
    date_of_birth: '2022-06-21',
    age_years: 3,
    microchip_number: '985112007744920',
    metrics: {
      current_weight_kg: 5.9,
      current_bmi: 17.4,
      current_bmr_kcal: 201.8,
    },
    owner: OWNER_DIEGO,
    timestamps: {
      created_at: '2026-03-10T00:00:00+00:00',
      updated_at: '2026-05-28T00:00:00+00:00',
    },
  },
  {
    id: 'e1b7c5f6-4444-4000-8000-000000000004',
    name: 'Rocky',
    species: 'dog',
    breed: 'German Shepherd',
    sex: 'male',
    date_of_birth: '2018-08-05',
    age_years: 7,
    microchip_number: '985112001188563',
    metrics: {
      current_weight_kg: 36.2,
      current_bmi: 26.8,
      current_bmr_kcal: 793.1,
    },
    owner: OWNER_SARAH,
    timestamps: {
      created_at: '2026-02-19T00:00:00+00:00',
      updated_at: '2026-06-05T00:00:00+00:00',
    },
  },
  {
    id: 'f2c8d6a7-5555-4000-8000-000000000005',
    name: 'Cleo',
    species: 'cat',
    breed: 'Siamese',
    sex: 'female',
    date_of_birth: '2023-01-17',
    age_years: 3,
    microchip_number: '985112006622408',
    metrics: {
      current_weight_kg: 4.3,
      current_bmi: 16.2,
      current_bmr_kcal: 158.9,
    },
    owner: OWNER_PRIYA,
    timestamps: {
      created_at: '2026-04-02T00:00:00+00:00',
      updated_at: '2026-06-09T00:00:00+00:00',
    },
  },
]

export const healthRecords: HealthRecord[] = [
  {
    id: 'record-9a1f-4c20-001',
    record_type: 'weight',
    vitals: {
      weight_kg: 30.0,
      height_cm: 60.0,
      temperature_c: 38.5,
      heart_rate_bpm: 90,
    },
    computed_metrics: { bmi: 83.33, bmr_kcal: 897.19 },
    summary: 'Routine weigh-in',
    detail: 'No concerns noted.',
    pet: { id: 'a7f3e1d2-0000-4000-8000-000000000000', name: 'Luna' },
    recorded_by: { id: 'user-2f9c-4a1b-vet-0001' },
    recorded_at: '2026-06-08T00:00:00+00:00',
    timestamps: {
      created_at: '2026-06-08T10:00:00+00:00',
      updated_at: '2026-06-08T10:00:00+00:00',
    },
  },
  {
    id: 'record-7b3e-4d51-002',
    record_type: 'vaccination',
    vitals: {
      weight_kg: 7.2,
      height_cm: 28.0,
      temperature_c: 38.9,
      heart_rate_bpm: 140,
    },
    computed_metrics: { bmi: 19.8, bmr_kcal: 233.4 },
    summary: 'Annual rabies booster',
    detail: 'Administered FVRCP and rabies. No adverse reaction observed.',
    pet: { id: 'b8e4f2c3-1111-4000-8000-000000000001', name: 'Milo' },
    recorded_by: { id: 'user-2f9c-4a1b-vet-0001' },
    recorded_at: '2026-06-07T00:00:00+00:00',
    timestamps: {
      created_at: '2026-06-07T14:30:00+00:00',
      updated_at: '2026-06-07T14:30:00+00:00',
    },
  },
  {
    id: 'record-5c6a-4e82-003',
    record_type: 'examination',
    vitals: {
      weight_kg: 18.4,
      height_cm: 52.0,
      temperature_c: 38.3,
      heart_rate_bpm: 95,
    },
    computed_metrics: { bmi: 21.1, bmr_kcal: 475.6 },
    summary: 'Limp assessment, left forelimb',
    detail: 'Mild soft-tissue strain suspected. Rest advised for 10 days.',
    pet: { id: 'c9f5a3d4-2222-4000-8000-000000000002', name: 'Bella' },
    recorded_by: { id: 'user-2f9c-4a1b-vet-0001' },
    recorded_at: '2026-06-06T00:00:00+00:00',
    timestamps: {
      created_at: '2026-06-06T09:15:00+00:00',
      updated_at: '2026-06-06T09:15:00+00:00',
    },
  },
  {
    id: 'record-3d8b-4f13-004',
    record_type: 'dental',
    vitals: {
      weight_kg: 5.9,
      height_cm: 25.0,
      temperature_c: 38.6,
      heart_rate_bpm: 155,
    },
    computed_metrics: { bmi: 17.4, bmr_kcal: 201.8 },
    summary: 'Dental scaling and polish',
    detail: 'Moderate tartar removed. Gingivitis grade 1.',
    pet: { id: 'd0a6b4e5-3333-4000-8000-000000000003', name: 'Oscar' },
    recorded_by: { id: 'user-2f9c-4a1b-vet-0001' },
    recorded_at: '2026-06-05T00:00:00+00:00',
    timestamps: {
      created_at: '2026-06-05T11:45:00+00:00',
      updated_at: '2026-06-05T11:45:00+00:00',
    },
  },
  {
    id: 'record-1e9c-4a44-005',
    record_type: 'lab_work',
    vitals: {
      weight_kg: 36.2,
      height_cm: 64.0,
      temperature_c: 39.1,
      heart_rate_bpm: 88,
    },
    computed_metrics: { bmi: 26.8, bmr_kcal: 793.1 },
    summary: 'Senior blood panel',
    detail: 'Slightly elevated ALT. Recheck in 4 weeks.',
    pet: { id: 'e1b7c5f6-4444-4000-8000-000000000004', name: 'Rocky' },
    recorded_by: { id: 'user-2f9c-4a1b-vet-0001' },
    recorded_at: '2026-06-04T00:00:00+00:00',
    timestamps: {
      created_at: '2026-06-04T16:20:00+00:00',
      updated_at: '2026-06-04T16:20:00+00:00',
    },
  },
  {
    id: 'record-0f0d-4b75-006',
    record_type: 'weight',
    vitals: {
      weight_kg: 4.3,
      height_cm: 22.0,
      temperature_c: 38.4,
      heart_rate_bpm: 165,
    },
    computed_metrics: { bmi: 16.2, bmr_kcal: 158.9 },
    summary: 'Weight check, underweight watch',
    detail: 'Maintaining stable weight. Continue current diet.',
    pet: { id: 'f2c8d6a7-5555-4000-8000-000000000005', name: 'Cleo' },
    recorded_by: { id: 'user-2f9c-4a1b-vet-0001' },
    recorded_at: '2026-06-03T00:00:00+00:00',
    timestamps: {
      created_at: '2026-06-03T08:50:00+00:00',
      updated_at: '2026-06-03T08:50:00+00:00',
    },
  },
]

export const alerts: Alert[] = [
  {
    id: 'alert-c1-001',
    severity: 'critical',
    title: 'High body temperature',
    description: 'Rocky recorded 39.1°C during senior blood panel.',
    pet: { id: 'e1b7c5f6-4444-4000-8000-000000000004', name: 'Rocky' },
    created_at: '2026-06-04T16:25:00+00:00',
  },
  {
    id: 'alert-w1-002',
    severity: 'warning',
    title: 'BMI above target range',
    description: 'Rocky BMI 26.8 trending above breed reference.',
    pet: { id: 'e1b7c5f6-4444-4000-8000-000000000004', name: 'Rocky' },
    created_at: '2026-06-04T16:26:00+00:00',
  },
  {
    id: 'alert-w2-003',
    severity: 'warning',
    title: 'Underweight watch',
    description: 'Cleo BMI 16.2 below recommended minimum.',
    pet: { id: 'f2c8d6a7-5555-4000-8000-000000000005', name: 'Cleo' },
    created_at: '2026-06-03T09:00:00+00:00',
  },
  {
    id: 'alert-i1-004',
    severity: 'info',
    title: 'Vaccination due soon',
    description: 'Bella core vaccination booster due in 14 days.',
    pet: { id: 'c9f5a3d4-2222-4000-8000-000000000002', name: 'Bella' },
    created_at: '2026-06-02T10:30:00+00:00',
  },
  {
    id: 'alert-i2-005',
    severity: 'info',
    title: 'Follow-up scheduled',
    description: 'Bella left forelimb recheck booked for 16 Jun.',
    pet: { id: 'c9f5a3d4-2222-4000-8000-000000000002', name: 'Bella' },
    created_at: '2026-06-06T09:20:00+00:00',
  },
]

export const recordTypeLabels: Record<RecordType, string> = {
  weight: 'Weight',
  vaccination: 'Vaccination',
  examination: 'Examination',
  lab_work: 'Lab Work',
  dental: 'Dental',
  surgery: 'Surgery',
  medication: 'Medication',
  other: 'Other',
}

export const dashboardStats = {
  totalPatients: pets.length,
  recordsThisWeek: healthRecords.length,
  activeAlerts: alerts.filter((a) => a.severity !== 'info').length,
  avgBmi:
    Math.round(
      (pets.reduce((sum, p) => sum + p.metrics.current_bmi, 0) / pets.length) *
        10,
    ) / 10,
}
