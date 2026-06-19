import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

// ─── Constantes ──────────────────────────────────────────────────────────────

const BASE_URL = "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon";

// ─── Tipagem ─────────────────────────────────────────────────────────────────

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  tipos: string[];
  stats: PokemonStats;
}

interface TeamContextType {
  team: Pokemon[];
  isLoadingTeam: boolean;
  capturedInventory: Pokemon[];
  isLoadingInventory: boolean;
  capturePokemon: (pokemon: Pokemon) => Promise<boolean>;
  removePokemon: (pokemonId: number) => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Lê o array de abilities da API e transforma em objeto de stats
function parseAbilities(abilities: any[]): PokemonStats {
  const result: PokemonStats = {
    hp: 50, attack: 50, defense: 50,
    specialAttack: 50, specialDefense: 50, speed: 50,
  };
  if (!Array.isArray(abilities)) return result;

  for (const ab of abilities) {
    const name: string = (ab.name || "").toLowerCase();
    const val: number  = Number(ab.strength) || 0;
    if (name === "hp")               result.hp             = val;
    else if (name === "attack")      result.attack         = val;
    else if (name === "defense")     result.defense        = val;
    else if (name === "special-attack")   result.specialAttack  = val;
    else if (name === "special-defense")  result.specialDefense = val;
    else if (name === "speed")       result.speed          = val;
  }
  return result;
}

// Mapeia um item da API (time ou capture) para o tipo Pokemon interno
// A API usa "index" como ID (string), "types" para tipos e "abilities" para stats
function mapApiItem(item: any): Pokemon | null {
  // Campo de ID: a API retorna "index" como string (ex: "41")
  const idRaw = item.index ?? item.id ?? item.pokemonId ?? null;
  const id = idRaw !== null ? Number(idRaw) : NaN;

  if (!id || isNaN(id)) {
    console.warn("[TeamContext] Item ignorado — sem ID válido:", JSON.stringify(item));
    return null;
  }

  const name: string = item.name || item.pokemonName || "Desconhecido";

  const image: string =
    item.image ||
    item.sprite ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  // A API retorna "types" (array de strings), mas o app usa "tipos" internamente
  const tipos: string[] = Array.isArray(item.types)
    ? item.types
    : Array.isArray(item.tipos)
    ? item.tipos
    : ["normal"];

  // Stats já vêm prontos no campo "abilities"
  const stats = parseAbilities(item.abilities || []);

  return { id, name, image, tipos, stats };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();

  const [team, setTeam]                   = useState<Pokemon[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  const [capturedInventory, setCapturedInventory]         = useState<Pokemon[]>([]);
  const [isLoadingInventory, setIsLoadingInventory]       = useState(false);

  // ── GET /pokemon/v1/team ─────────────────────────────────────────────────
  // A API retorna: { id, userId, team: [...], capture: [...] }
  // Aproveitamos o mesmo endpoint para carregar os dois de uma vez.
  const fetchTeamFromApi = useCallback(async (currentUserId: string) => {
    setIsLoadingTeam(true);
    setIsLoadingInventory(true);
    try {
      console.log("[API] Buscando time para userId:", currentUserId);
      const response = await fetch(
        `${BASE_URL}/pokemon/v1/team?user-id=${currentUserId}`
      );

      if (!response.ok) {
        console.warn("[API] Erro ao buscar time, status:", response.status);
        setTeam([]);
        setCapturedInventory([]);
        return;
      }

      const data = await response.json();
      console.log("[API] Resposta do /team:", JSON.stringify(data, null, 2));

      // Time ativo
      const rawTeam = Array.isArray(data.team) ? data.team : [];
      const mappedTeam = rawTeam
        .map(mapApiItem)
        .filter((p): p is Pokemon => p !== null)
        .slice(0, 5);
      setTeam(mappedTeam);

      // Capturas (vem junto na mesma resposta)
      const rawCapture = Array.isArray(data.capture) ? data.capture : [];
      const mappedCapture = rawCapture
        .map(mapApiItem)
        .filter((p): p is Pokemon => p !== null);
      setCapturedInventory(mappedCapture);

    } catch (err) {
      console.error("[API] Erro de rede:", err);
      setTeam([]);
      setCapturedInventory([]);
    } finally {
      setIsLoadingTeam(false);
      setIsLoadingInventory(false);
    }
  }, []);

  // ── Efeito principal ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setTeam([]);
      setCapturedInventory([]);
      return;
    }
    fetchTeamFromApi(userId);
  }, [userId, fetchTeamFromApi]);

  // ── refreshTeam / refreshInventory ───────────────────────────────────────
  const refreshTeam = useCallback(async () => {
    if (!userId) return;
    await fetchTeamFromApi(userId);
  }, [userId, fetchTeamFromApi]);

  const refreshInventory = useCallback(async () => {
    if (!userId) return;
    await fetchTeamFromApi(userId); // mesmo endpoint retorna os dois
  }, [userId, fetchTeamFromApi]);

  // ── capturePokemon ────────────────────────────────────────────────────────
  const capturePokemon = useCallback(async (pokemon: Pokemon): Promise<boolean> => {
    if (!userId) return false;
    try {
      const response = await fetch(`${BASE_URL}/pokemon/v1/captured`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "user-id": userId,
          "pokemon-id": pokemon.id.toString(),
        }),
      });
      if (!response.ok) return false;

      setCapturedInventory((current) => {
        if (current.some((p) => p.id === pokemon.id)) return current;
        return [...current, pokemon];
      });
      return true;
    } catch {
      return false;
    }
  }, [userId]);

  // ── removePokemon ─────────────────────────────────────────────────────────
  const removePokemon = useCallback(async (pokemonId: number) => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${BASE_URL}/pokemon/v1/captured?user-id=${userId}&pokemon-id=${pokemonId}`,
        { method: "DELETE" }
      );
      if (!response.ok) return;
      setTeam((current) => current.filter((p) => p.id !== pokemonId));
      setCapturedInventory((current) => current.filter((p) => p.id !== pokemonId));
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  return (
    <TeamContext.Provider
      value={{
        team,
        isLoadingTeam,
        capturedInventory,
        isLoadingInventory,
        capturePokemon,
        removePokemon,
        refreshInventory,
        refreshTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeam deve ser usado dentro de um TeamProvider");
  return context;
}