import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { petsApi } from "../lib/api";

type Species = "dog" | "cat";
type Sex = "male" | "female" | "unknown";

interface AddPetScreenProps {
  /** Called after a successful create so the parent can refresh + navigate back. */
  onCreated: () => void;
  /** Called when the user cancels without creating. */
  onCancel: () => void;
}

/**
 * Pet creation form for the owner app.
 *
 * Collects name, species (required by the API), breed, and date of birth.
 * Age is shown as a live computed read-out from the DOB but is NOT
 * submitted — the backend stores date_of_birth and derives age_years
 * server-side, matching the immutable schema. Submitting a raw age would
 * be rejected (no such column) and omitting species would 422.
 */
export function AddPetScreen({ onCreated, onCancel }: AddPetScreenProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD, entered as text for zero-dep
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Live age read-out derived from the DOB. Display only; never submitted.
  const computedAge = useMemo(() => {
    const parsed = parseDob(dob);
    if (!parsed) return null;
    const now = new Date();
    let age = now.getFullYear() - parsed.getFullYear();
    const m = now.getMonth() - parsed.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < parsed.getDate())) {
      age -= 1;
    }
    return age >= 0 ? age : null;
  }, [dob]);

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (name.trim().length < 1) {
      errs.name = "Name is required.";
    } else if (name.trim().length > 80) {
      errs.name = "Name must be 80 characters or fewer.";
    }

    if (dob.trim().length > 0) {
      const parsed = parseDob(dob);
      if (!parsed) {
        errs.dob = "Use the format YYYY-MM-DD.";
      } else if (parsed > new Date()) {
        errs.dob = "Date of birth cannot be in the future.";
      }
    }

    if (breed.trim().length > 100) {
      errs.breed = "Breed must be 100 characters or fewer.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    setError(null);
    if (!validate()) {
      return;
    }

    setBusy(true);
    try {
      await petsApi.create({
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        date_of_birth: dob.trim() || undefined,
      });
      onCreated();
    } catch (e) {
      // Surface backend validation if present; otherwise a generic message.
      const message = extractApiError(e);
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={onCancel} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>New pet</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.panel}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, fieldErrors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="Luna"
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
            {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}
          </View>

          {/* Species */}
          <View style={styles.field}>
            <Text style={styles.label}>Species *</Text>
            <View style={styles.chipRow}>
              {(["dog", "cat"] as Species[]).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSpecies(s)}
                  style={[styles.chip, species === s && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, species === s && styles.chipTextActive]}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Breed */}
          <View style={styles.field}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={[styles.input, fieldErrors.breed && styles.inputError]}
              value={breed}
              onChangeText={setBreed}
              placeholder="Labrador Retriever"
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
            {fieldErrors.breed && (
              <Text style={styles.fieldError}>{fieldErrors.breed}</Text>
            )}
          </View>

          {/* Date of birth */}
          <View style={styles.field}>
            <Text style={styles.label}>Date of birth</Text>
            <TextInput
              style={[styles.input, fieldErrors.dob && styles.inputError]}
              value={dob}
              onChangeText={setDob}
              placeholder="2021-09-12"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
            {fieldErrors.dob ? (
              <Text style={styles.fieldError}>{fieldErrors.dob}</Text>
            ) : computedAge !== null ? (
              <Text style={styles.hint}>≈ {computedAge} year{computedAge === 1 ? "" : "s"} old</Text>
            ) : (
              <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
            )}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={[styles.button, busy && styles.buttonDisabled]}
          >
            {busy ? (
              <ActivityIndicator color="#04060e" />
            ) : (
              <Text style={styles.buttonText}>Create pet</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Parse a strict YYYY-MM-DD string into a Date, or null if malformed. */
function parseDob(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }
  const [y, m, d] = trimmed.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // Reject impossible dates (e.g. 2021-02-31 rolling over).
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

/** Pull a human-readable message out of an Axios error, with fallbacks. */
function extractApiError(e: unknown): string {
  if (typeof e === "object" && e !== null && "response" in e) {
    const resp = (e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    if (resp?.data?.errors) {
      const first = Object.values(resp.data.errors)[0]?.[0];
      if (first) return first;
    }
    if (resp?.data?.message) return resp.data.message;
  }
  return "Could not create the pet. Please check your connection and try again.";
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#04060e" },
  content: { padding: 20, gap: 20, paddingBottom: 60 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancel: { color: "#94a3b8", fontSize: 15 },
  title: { color: "#f1f5f9", fontSize: 18, fontWeight: "700" },
  panel: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  field: { gap: 6 },
  label: {
    color: "#cbd5e1",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#f1f5f9",
    fontSize: 15,
  },
  inputError: { borderColor: "rgba(239,68,68,0.55)" },
  fieldError: { color: "#ef4444", fontSize: 12 },
  hint: { color: "#64748b", fontSize: 12 },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  chipActive: { backgroundColor: "rgba(14,165,233,0.15)", borderColor: "#0ea5e9" },
  chipText: { color: "#94a3b8", fontSize: 14, textTransform: "capitalize" },
  chipTextActive: { color: "#0ea5e9", fontWeight: "600" },
  error: { color: "#ef4444", fontSize: 13 },
  button: {
    backgroundColor: "#0ea5e9",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#04060e", fontSize: 15, fontWeight: "700" },
});