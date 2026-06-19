import React, { useEffect } from "react";
import { Slot, useRouter, useSegments, useNavigationContainerRef } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TeamProvider } from "@/context/TeamContext";
import { ActivityIndicator, View } from "react-native";

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (loading) return;

    const performNavigationCheck = () => {
      // 1. Juntamos todos os segmentos da URL em uma única string (ex: "(auth)/register" virará "auth/register")
      const fullPath = segments.join("/").toLowerCase();
      
      // 2. Criamos uma checagem inteligente: 
      // Se o caminho estiver completamente vazio, ou contiver a palavra "register", ele entra nas permissões livres.
      const isAuthPage = fullPath === "" || fullPath === "/";
      const isRegisterPage = fullPath.includes("register");

      const isInAuthGroup = isAuthPage || isRegisterPage;

      if (!user && !isInAuthGroup) {
        // Se não está logado e tentou ir para telas privadas (home, battle), joga pro Login
        router.replace("/");
      } else if (user && isInAuthGroup) {
        // Se ele JÁ ESTÁ logado e tenta voltar pro Login ou Register, joga ele direto pra Home do jogo
        router.replace("/home");
      }
    };

    if (!rootNavigationRef?.isReady()) {
      const unsubscribe = rootNavigationRef?.addListener("state", () => {
        if (rootNavigationRef?.isReady()) {
          performNavigationCheck();
          unsubscribe();
        }
      });
      return unsubscribe;
    }

    performNavigationCheck();

  }, [user, loading, segments, rootNavigationRef]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" }}>
        <ActivityIndicator size="large" color="#CC1010" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TeamProvider>
        <InitialLayout />
      </TeamProvider>
    </AuthProvider>
  );
}