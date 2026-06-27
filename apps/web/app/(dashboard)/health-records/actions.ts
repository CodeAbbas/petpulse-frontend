"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  healthRecordsMutations,
  isValidationError,
  type CreateHealthRecordInput,
  type HealthRecord,
} from "@/lib/api";

/**
 * Server Action for logging a health record.
 *
 * Reads the httpOnly session cookie server-side, POSTs to Laravel, and
 * returns the SERVER-COMPUTED record on success. The BMI and BMR in the
 * returned record are calculated by the Laravel BiometricCalculator
 * (FR-03) — the client never computes them. Revalidates the records
 * route so the table re-fetches with the persisted row.
 */

export interface CreateRecordResult {
  ok: boolean;
  record?: HealthRecord;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createHealthRecordAction(
  input: CreateHealthRecordInput,
): Promise<CreateRecordResult> {
  const store = await cookies();
  const token = store.get("petpulse_token")?.value ?? null;

  try {
    const response = await healthRecordsMutations.create(input, token);
    revalidatePath("/health-records");
    // Return the server's record so the form can show the computed metrics.
    return { ok: true, record: response.data };
  } catch (e) {
    if (isValidationError(e)) {
      return { ok: false, fieldErrors: e.errors, message: e.message };
    }
    return {
      ok: false,
      message: "Could not log the record. Check the API connection.",
    };
  }
}