import React, { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { AddPetScreen } from "../screens/AddPetScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PetsScreen } from "../screens/PetsScreen";

/**
 * The owner application shell.
 *
 * Auth gate first: spinner while hydrating, LoginScreen when logged out.
 * Once authenticated, a minimal zero-dependency screen-state router
 * switches between the pets list and the add-pet form. A refreshKey is
 * bumped on successful creation so PetsScreen re-mounts and re-fetches.
 */
type AuthedScreen = "pets" | "addPet";

export function AppTabs() {
  const { isAuthenticated, isLoading } = useAuth();
  const [screen, setScreen] = useState<AuthedScreen>("pets");
  const [refreshKey, setRefreshKey] = useState(0);

  const goToAddPet = useCallback(() => setScreen("addPet"), []);
  const goToPets = useCallback(() => setScreen("pets"), []);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setScreen("pets");
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0ea5e9" size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (screen === "addPet") {
    return <AddPetScreen onCreated={handleCreated} onCancel={goToPets} />;
  }

  return <PetsScreen key={refreshKey} onAddPet={goToAddPet} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#04060e",
    alignItems: "center",
    justifyContent: "center",
  },
});