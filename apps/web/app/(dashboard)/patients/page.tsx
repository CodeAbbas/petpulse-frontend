import { PageHeader } from '@/components/page-header'
import { PatientsTable } from '@/components/patients-table'
import { pets } from '@/lib/mock-data'

export default function PatientsPage() {
  return (
    <>
      <PageHeader
        title="Patients"
        description="Every pet under clinic care, with current metrics."
      />
      <PatientsTable initialPets={pets} />
    </>
  )
}
