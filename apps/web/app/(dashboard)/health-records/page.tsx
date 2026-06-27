import { cookies } from "next/headers";
import { healthRecordsApi, petsApi, type HealthRecord, type Pet } from "@/lib/api";
import { HealthRecordsTable } from "@/components/health-records-table";

export default async function HealthRecordsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("petpulse_token")?.value ?? null;

  let records: HealthRecord[] = [];
  let pets: Pet[] = [];
  let error: string | null = null;

  try {
    // Fetch records and pets in parallel; the log form needs the pet list.
    const [recordResponse, petResponse] = await Promise.all([
      healthRecordsApi.list(token),
      petsApi.list(token),
    ]);
    records = recordResponse.data;
    pets = petResponse.data;
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
        <HealthRecordsTable initialRecords={records} pets={pets} />
      )}
    </div>
  );
}