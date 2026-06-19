import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Tipagem do Contexto ────────────────────────────────────────────────────

interface AuthContextData {
  isAuthenticated: boolean;
  user: string | null;       // Permanece como string simples (username) para .toUpperCase()
  userId: string | null;     // UUID dinâmico retornado pela API a cada login
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Constantes de Chave ────────────────────────────────────────────────────

const STORAGE_KEY_USER   = "@Auth:user";
const STORAGE_KEY_USERID = "@Auth:userId";

// ─── Contexto ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextData | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user,   setUser]   = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão persistida ao iniciar o app
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser   = await AsyncStorage.getItem(STORAGE_KEY_USER);
        const storedUserId = await AsyncStorage.getItem(STORAGE_KEY_USERID);

        if (storedUser && storedUserId) {
          setUser(storedUser);
          setUserId(storedUserId);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // ── signIn ────────────────────────────────────────────────────────────────
  // Chama POST /auth/v1/login, captura o userId (UUID dinâmico) e persiste
  // tanto o username quanto o UUID no AsyncStorage.
  async function signIn(username: string, password: string) {
    const response = await fetch(
      "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    if (!response.ok) {
      throw new Error("Usuário ou senha inválidos");
    }

    // A API retorna um objeto cujo campo identificador é o userId (UUID)
    const data = await response.json();

    // O campo pode vir como "userId" ou "user_id" — ajuste se necessário
    const receivedUserId: string = data.userId ?? data.user_id ?? data.id;

    if (!receivedUserId) {
      throw new Error("A API não retornou um userId válido.");
    }

    // Persiste os dois valores de forma atômica
    await AsyncStorage.multiSet([
      [STORAGE_KEY_USER,   username],
      [STORAGE_KEY_USERID, receivedUserId],
    ]);

    // Atualiza o estado em memória
    setUser(username);
    setUserId(receivedUserId);
    setIsAuthenticated(true);
  }

  // ── signOut ───────────────────────────────────────────────────────────────
  // Zera o estado em memória ANTES de escrever no storage para garantir que
  // os contextos dependentes (TeamContext) reajam imediatamente e limpem seus
  // estados, evitando qualquer vazamento de cache entre contas.
  async function signOut() {
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);

    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_USER, STORAGE_KEY_USERID]);
    } catch (error) {
      console.error("Erro ao remover dados de autenticação:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userId, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}