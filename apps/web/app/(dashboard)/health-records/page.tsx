import { PageHeader } from '@/components/page-header'
import { HealthRecordsTable } from '@/components/health-records-table'
import { healthRecords, pets } from '@/lib/mock-data'

export default function HealthRecordsPage() {
  return (
    <>
      <PageHeader
        title="Health Records"
        description="Logged vitals with server-computed BMI and BMR."
      />
      <HealthRecordsTable initialRecords={healthRecords} pets={pets} />
    </>
  )
}
