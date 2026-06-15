import { cookies } from "next/headers";
import { healthRecordsApi, type HealthRecord } from "@/lib/api";
import { HealthRecordsTable } from "@/components/health-records-table";

export default async function HealthRecordsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("petpulse_token")?.value ?? null;

  let records: HealthRecord[] = [];
  let error: string | null = null;

  try {
    const response = await healthRecordsApi.list(token);
    records = response.data;
  } catch (e) {
    error = "Unable to connect to the PetPulse vitals log engine.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Health Records</h1>
        <p className="text-sm text-slate-400">Server-side biometric computation history and vital trajectories.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      ) : (
        // Pass real records directly down to your v0 table view
        <HealthRecordsTable initialRecords={records} />
      )}
    </div>
  );
}