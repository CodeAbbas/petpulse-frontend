import { cookies } from "next/headers";
import { petsApi, type Pet } from "@/lib/api";
import { PatientsTable } from "@/components/patients-table";

export default async function PatientsPage() {
  const cookieStore = await cookies();
  // Read the token dynamically from secure server-side session cookies
  const token = cookieStore.get("petpulse_token")?.value ?? null;

  let pets: Pet[] = [];
  let error: string | null = null;

  try {
    const response = await petsApi.list(token);
    pets = response.data;
  } catch (e) {
    error = "Unable to connect to the PetPulse API engine.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Patients</h1>
        <p className="text-sm text-slate-400">Manage clinic registrations and real-time medical profiles.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      ) : (
        <PatientsTable initialPets={pets} />
      )}
    </div>
  );
}