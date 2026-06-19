import { useState } from "react";
import { View, Text, StyleSheet, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import Card from "../../components/card";
import Input from "../../components/input";
import Button from "../../components/button";
import PasswordToggle from "../../components/passwordToggle";
import CustomAlert from "../../components/customAlert";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [secure, setSecure] = useState(true); // Controla ambos os campos de senha

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

  // FUNÇÃO DE CADASTRO NA API
  async function handleRegister() {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert("error", "Erro", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("error", "Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        showAlert("success", "Sucesso!", "Conta criada com sucesso.");
      } else {
        showAlert("error", "Erro", "Não foi possível criar a conta. Tente outro usuário.");
      }
    } catch (error) {
      showAlert("error", "Erro", "Falha de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground source={{ uri: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=2070&auto=format&fit=crop" }} style={styles.background} blurRadius={3}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.badge}>TREINADOR • 2026</Text>
            <Text style={styles.logo}>POKÉMON</Text>
            <Text style={styles.subtitle}>Crie sua conta de treinador</Text>
          </View>

          <View style={styles.formWrapper}>
            <Card>
              <Text style={styles.cardTitle}>Cadastro</Text>
              
              <Input placeholder="Usuário" value={username} onChangeText={setUsername} />
              
              {/* Campos de senha agrupados */}
              <View style={styles.passwordContainer}>
                <Input placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry={secure} />
                <Input placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={secure} />
              </View>

              <PasswordToggle secure={secure} setSecure={setSecure} />

              {loading ? (
                <ActivityIndicator color="#FFCB05" style={{marginVertical: 10}} />
              ) : (
                <Button title="CRIAR CONTA" onPress={handleRegister} />
              )}

              <View style={{ height: 12 }} />
              <Button title="VOLTAR PARA LOGIN" onPress={() => router.back()} />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert visible={alertVisible} type={alertType} title={alertTitle} message={alertMessage} onConfirm={() => {
        setAlertVisible(false);
        if (alertType === "success") router.replace("/");
      }} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: { flexGrow: 1, backgroundColor: "rgba(0,0,0,0.82)", justifyContent: "center", alignItems: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 24 },
  badge: { color: "#FFCB05", fontSize: 11, fontWeight: "bold", letterSpacing: 3, marginBottom: 8 },
  logo: { color: "#FFF", fontSize: 44, fontWeight: "900", letterSpacing: 4 },
  subtitle: { color: "#D1D5DB", marginTop: 6, fontSize: 14 },
  formWrapper: { width: "100%", maxWidth: 400 },
  cardTitle: { color: "#FFF", fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  passwordContainer: { width: "100%" } // Ajuste para organizar inputs de senha
});