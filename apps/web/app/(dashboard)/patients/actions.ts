"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  petsMutations,
  isValidationError,
  type CreatePetInput,
  type UpdatePetInput,
} from "@/lib/api";

/**
 * Server Actions for pet mutations.
 *
 * These run on the server, so they can read the httpOnly session cookie
 * (which a Client Component cannot) and call the Laravel API with the
 * bearer token without ever exposing it to the browser. On success they
 * revalidate the patients route so the Server Component re-fetches.
 */

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("petpulse_token")?.value ?? null;
}

export async function createPetAction(input: CreatePetInput): Promise<ActionResult> {
  const token = await getToken();
  try {
    await petsMutations.create(input, token);
    revalidatePath("/patients");
    return { ok: true };
  } catch (e) {
    if (isValidationError(e)) {
      return { ok: false, fieldErrors: e.errors, message: e.message };
    }
    return { ok: false, message: "Could not create the patient. Check the API connection." };
  }
}

export async function updatePetAction(
  id: string,
  input: UpdatePetInput,
): Promise<ActionResult> {
  const token = await getToken();
  try {
    await petsMutations.update(id, input, token);
    revalidatePath("/patients");
    return { ok: true };
  } catch (e) {
    if (isValidationError(e)) {
      return { ok: false, fieldErrors: e.errors, message: e.message };
    }
    return { ok: false, message: "Could not update the patient. Check the API connection." };
  }
}

export async function deletePetAction(id: string): Promise<ActionResult> {
  const token = await getToken();
  try {
    await petsMutations.remove(id, token);
    revalidatePath("/patients");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: "Could not remove the patient. Check the API connection." };
  }
}