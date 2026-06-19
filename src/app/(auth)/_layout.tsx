import { Stack, Redirect } from "expo-router";
import {
  ActivityIndicator,
  View,
  Text,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0A0A",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFCB05",
            fontSize: 32,
            fontWeight: "900",
            letterSpacing: 4,
            marginBottom: 20,
          }}
        >
          POKÉMON
        </Text>

        <ActivityIndicator
          size="large"
          color="#FFCB05"
        />

        <Text
          style={{
            color: "#D1D5DB",
            marginTop: 20,
            fontSize: 14,
            letterSpacing: 2,
          }}
        >
          Carregando Pokédex...
        </Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#0A0A0A",
        },
      }}
    />
  );
}