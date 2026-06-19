import { useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

import Card from "../../components/card";
import Input from "../../components/input";
import Button from "../../components/button";
import PasswordToggle from "../../components/passwordToggle";
import CustomAlert from "../../components/customAlert";

export default function LoginIndex() {
  const { signIn } = useAuth();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false); // Adicionado para feedback visual

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  function showAlert(type: "success" | "error", title: string, message: string) {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  }

  // FUNÇÃO CORRIGIDA: Agora ela chama a API direto
  async function handleLogin() {
    if (!user || !password) {
      showAlert("error", "Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      // Chama sua API através do contexto
      await signIn(user, password);
      // Se deu certo, o contexto deve cuidar da navegação
    } catch (error) {
      // Se o servidor retornar erro 401, o catch captura aqui
      showAlert("error", "Acesso negado", "Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=2070&auto=format&fit=crop" }}
      style={styles.background}
      blurRadius={3}
    >
      <View style={styles.loginOverlay}>
        <View style={styles.header}>
          <Text style={styles.badge}>POKÉDEX • 2026</Text>
          <Text style={styles.logo}>POKÉMON</Text>
          <Text style={styles.subtitle}>Sistema de Consulta Pokémon</Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Entrar no Sistema</Text>
          <Text style={styles.cardSubtitle}>Faça login para visualizar a listagem de Pokémons.</Text>

          <Input placeholder="Usuário" value={user} onChangeText={setUser} />
          <Input placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry={secure} />

          <PasswordToggle secure={secure} setSecure={setSecure} />

          {loading ? (
            <ActivityIndicator color="#FFCB05" />
          ) : (
            <Button title="ACESSAR SISTEMA" onPress={handleLogin} />
          )}

          <TouchableOpacity onPress={() => router.push("/register")} style={styles.registerLink}>
            <Text style={styles.registerLinkText}>Não tem conta? Cadastre-se aqui!</Text>
          </TouchableOpacity>
        </Card>

        <CustomAlert
          visible={alertVisible}
          type={alertType}
          title={alertTitle}
          message={alertMessage}
          onConfirm={() => setAlertVisible(false)}
        />
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  loginOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.80)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  badge: {
    color: "#FFCB05",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: "center",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 4,
    textAlign: "center",
  },

  subtitle: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 1.5,
    textAlign: "center",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },

  cardSubtitle: {
    color: "#AFAFAF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  registerLink: {
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 8,
  },

  registerLinkText: {
    color: "#FFCB05",
    fontWeight: "bold",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});