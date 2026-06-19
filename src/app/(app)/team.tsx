import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Modal, FlatList, ActivityIndicator, RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTeam } from "@/context/TeamContext";
import { useAuth } from "@/context/AuthContext";

// ─── Paletas ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: { [key: string]: string } = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
  grass: "#7AC74C", psychic: "#F95587", bug: "#A6B91A", rock: "#B6A136",
  ghost: "#735797", dragon: "#6F35FC", steel: "#B7B7CE", fairy: "#D685AD",
  ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
  ground: "#E2BF65", flying: "#A98FF3", dark: "#705746",
};

const STATS_COLORS: { [key: string]: string } = {
  hp: "#51F542", attack: "#FF3333", defense: "#3399FF",
  "special-attack": "#CC33FF", "special-defense": "#FFCC00", speed: "#00FFFF",
};

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function Team() {
  const { user } = useAuth();
  const {
    team,
    addPokemon,
    removePokemon,
    capturedInventory,
    isLoadingInventory,
    refreshInventory,
  } = useTeam();

  const [pokemonModalVisible, setPokemonModalVisible] = useState(false);
  const [isRefreshing,         setIsRefreshing]        = useState(false);

  // ── Alertas ───────────────────────────────────────────────────────────────
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle,   setAlertTitle]   = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType,    setAlertType]    = useState<"warning" | "success" | "error">("warning");

  const maxLimit = 5;

  const showAlert = (title: string, message: string, type: "warning" | "success" | "error") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleRefreshInventory = async () => {
    setIsRefreshing(true);
    await refreshInventory();
    setIsRefreshing(false);
  };

  const handleAddPokemon = async (pokemon: any) => {
    if (team.length >= maxLimit) {
      showAlert("LIMITE EXCEDIDO", `Seu time já atingiu o limite de ${maxLimit} Pokémon!`, "warning");
      return;
    }

    const fixedId    = Number(pokemon.id || pokemon.index || Math.floor(Math.random() * 10000));
    const mappedTypes = pokemon.tipos || pokemon.types || ["normal"];

    const normalized = {
      ...pokemon,
      id:    fixedId,
      index: String(fixedId),
      name:  pokemon.name,
      image: pokemon.image,
      tipos: mappedTypes,
    };

    await addPokemon(normalized);
    setPokemonModalVisible(false);
  };

  const handleRemovePokemon = async (pokeObj: any) => {
    if (!pokeObj) return;
    if (pokeObj.id)     await removePokemon(Number(pokeObj.id));
    if (pokeObj.index) await removePokemon(Number(pokeObj.index));
  };

  const getAlertHeaderColor = () => {
    if (alertType === "success") return "#51F542";
    if (alertType === "error")   return "#CC1414";
    return "#FFCB05";
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.pokedexContainer}>
      <Text style={styles.hardwareTitle}>
        EQUIPE PRINCIPAL ({team.length}/{maxLimit})
      </Text>

      {/* ── Grid do Time ──────────────────────────────────────────────── */}
      <View style={styles.pokedexDisplayScreen}>
        <ScrollView contentContainerStyle={styles.matrixGrid} showsVerticalScrollIndicator={false}>

          {team.map((poke, index) => {
            const pokeId = poke.id;
            const pokeTypes = poke.tipos || ["normal"];
            const mainType = pokeTypes[0]?.toLowerCase() || "normal";
            const typeColor = TYPE_COLORS[mainType] || "#333";
            
            const stats = poke.stats ? Object.entries(poke.stats).map(([name, strength]) => ({ name, strength })) : [];
            const highestStatObj = stats.length > 0 
              ? stats.reduce((best, st) => (st.strength > best.strength ? st : best), stats[0])
              : null;

            return (
              <View key={`${pokeId}-${index}`} style={[styles.cyberCard, { borderColor: typeColor }]}>
                <View style={styles.cyberCardHeader}>
                  <Text style={[styles.indexText, { color: typeColor }]}>#{String(pokeId).padStart(3, '0')}</Text>
                  <Text style={[styles.typeLabelText, { backgroundColor: typeColor }]}>{mainType.toUpperCase()}</Text>
                </View>
                <Image source={{ uri: poke.image }} style={styles.pokeSpriteImg} />
                <Text style={styles.pokeLabelName}>{poke.name?.toUpperCase()}</Text>
                
                <View style={styles.statsRadarBox}>
                  {highestStatObj && (
                    <View style={styles.powerfulHintBadge}>
                      <Text style={styles.powerfulHintText}>
                        🔥 DESTAQUE: {highestStatObj.name.toUpperCase()} ({highestStatObj.strength})
                      </Text>
                    </View>
                  )}
                  {stats.map((st, idx) => {
                    const statNameLower = st.name.toLowerCase();
                    const statValue = Number(st.strength) || 0;
                    const barColor = STATS_COLORS[statNameLower] || "#BBB";
                    const fillPercent = Math.min((statValue / 160) * 100, 100);
                    
                    return (
                      <View key={idx} style={styles.statContainer}>
                        <View style={styles.statInfoRow}>
                          <Text style={styles.statLabelName}>{st.name.toUpperCase()}</Text>
                          <Text style={[styles.statValueNum, { color: barColor }]}>{statValue}</Text>
                        </View>
                        <View style={styles.barOuterStructure}>
                          <View style={[styles.barInnerFill, { width: `${fillPercent}%`, backgroundColor: barColor }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
                
                <TouchableOpacity style={styles.deleteSpecimenBtn} onPress={() => handleRemovePokemon(poke)}>
                  <Ionicons name="close" size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            );
          })}

          {team.length < maxLimit && (
            <TouchableOpacity style={styles.cyberAddCard} onPress={() => setPokemonModalVisible(true)}>
              <Ionicons name="add" size={32} color="#51F542" />
              <Text style={styles.cyberAddText}>ADICIONAR</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* ── Modal de Seleção de Inventário ────────────────────────────── */}
      <Modal visible={pokemonModalVisible} transparent animationType="slide">
        <View style={styles.pokedexModalOverlay}>
          <View style={styles.hardwareSearchFrame}>
            {isLoadingInventory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#CC1414" />
                <Text style={styles.loadingText}>CARREGANDO INVENTÁRIO...</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={styles.sectionHeaderTitle}>
                    POKÉMON CAPTURADOS ({capturedInventory.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={handleRefreshInventory}
                    disabled={isRefreshing}
                  >
                    {isRefreshing
                      ? <ActivityIndicator size="small" color="#CC1414" />
                      : <Ionicons name="refresh" size={16} color="#CC1414" />
                    }
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={capturedInventory}
                  keyExtractor={(item, index) => String(item.id || (item as any).index || index)}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefreshInventory}
                      colors={["#CC1414"]}
                    />
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchRowItem}
                      onPress={() => handleAddPokemon(item)}
                    >
                      <Image source={{ uri: item.image }} style={styles.searchThumb} />
                      <Text style={styles.searchTextName}>
                        #{String((item as any).index || item.id).padStart(3, "0")} — {item.name?.toUpperCase()}
                      </Text>
                      <Ionicons name="add-circle-outline" size={20} color="#51F542" />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={{ alignItems: "center", marginTop: 30 }}>
                      <Text style={styles.emptySubtext}>Nenhum Pokémon capturado ainda.</Text>
                      <Text style={[styles.emptySubtext, { marginTop: 4 }]}>
                        Vença batalhas para capturar Pokémon!
                      </Text>
                    </View>
                  }
                />
              </View>
            )}
            <TouchableOpacity style={styles.backHardwareBtn} onPress={() => setPokemonModalVisible(false)}>
              <Text style={styles.backHardwareBtnText}>FECHAR CONSOLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Custom Alert ──────────────────────────────────────────────── */}
      <Modal visible={alertVisible} transparent animationType="fade">
        <View style={styles.customAlertOverlay}>
          <View style={[styles.customAlertBox, { borderColor: getAlertHeaderColor() }]}>
            <View style={[styles.customAlertHeader, { backgroundColor: getAlertHeaderColor() }]}>
              <Ionicons
                name={alertType === "success" ? "checkmark-circle" : alertType === "error" ? "lock-closed" : "alert-circle"}
                size={18}
                color={alertType === "warning" ? "#000" : "#FFF"}
              />
              <Text style={[styles.customAlertTitle, { color: alertType === "warning" ? "#000" : "#FFF" }]}>
                {alertTitle}
              </Text>
            </View>
            <View style={styles.customAlertBody}>
              <Text style={styles.customAlertMessage}>{alertMessage}</Text>
              <TouchableOpacity
                style={[styles.customAlertBtn, { backgroundColor: getAlertHeaderColor() }]}
                onPress={() => setAlertVisible(false)}
              >
                <Text style={[styles.customAlertBtnText, { color: alertType === "warning" ? "#000" : "#FFF" }]}>
                  ENTENDIDO
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pokedexContainer:    { flex: 1, backgroundColor: "#CC1414", paddingHorizontal: 15, paddingTop: 20 },
  hardwareTitle:       { color: "#FFCB05", fontFamily: "monospace", fontSize: 13, letterSpacing: 1, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  pokedexDisplayScreen:{ flex: 1, backgroundColor: "#1C2424", borderRadius: 10, borderWidth: 3, borderColor: "#555", padding: 10, marginBottom: 15 },
  matrixGrid:          { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, paddingBottom: 10 },
  cyberCard:           { width: "48%", backgroundColor: "#2A3D3D", borderRadius: 8, padding: 6, borderWidth: 2, position: "relative", marginBottom: 4 },
  cyberCardHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  indexText:           { fontSize: 9, fontFamily: "monospace", fontWeight: "bold" },
  typeLabelText:       { color: "#FFF", fontSize: 7, fontWeight: "bold", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  pokeSpriteImg:       { width: 60, height: 60, resizeMode: "contain", alignSelf: "center" },
  pokeLabelName:       { color: "#51F542", fontFamily: "monospace", fontSize: 11, fontWeight: "bold", textAlign: "center", marginTop: 2, marginBottom: 4 },
  statsRadarBox:       { backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 6, padding: 5, gap: 4 },
  powerfulHintBadge:   { backgroundColor: "rgba(255, 203, 5, 0.15)", paddingVertical: 3, paddingHorizontal: 4, borderRadius: 4, marginBottom: 4, borderWidth: 0.5, borderColor: "#FFCB05", alignItems: "center" },
  powerfulHintText:    { color: "#FFCB05", fontSize: 10, fontFamily: "monospace", fontWeight: "bold", textAlign: "center" },
  statContainer:       { width: "100%" },
  statInfoRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 1 },
  statLabelName:       { color: "#FFF", fontSize: 7, fontFamily: "monospace" },
  statValueNum:        { fontSize: 8, fontFamily: "monospace", fontWeight: "bold" },
  barOuterStructure:   { height: 4, backgroundColor: "#444", borderRadius: 2, width: "100%", overflow: "hidden" },
  barInnerFill:        { height: "100%", borderRadius: 2 },
  deleteSpecimenBtn:   { position: "absolute", top: -5, right: -5, backgroundColor: "#CC1414", width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#000", zIndex: 5 },
  cyberAddCard:        { width: "48%", height: 195, borderRadius: 8, borderWidth: 2, borderColor: "#51F542", borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
  cyberAddText:        { color: "#51F542", fontSize: 9, fontFamily: "monospace", fontWeight: "bold", marginTop: 8 },
  refreshBtn:          { padding: 6 },
  pokedexModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  hardwareSearchFrame: { backgroundColor: "#D9D9D9", width: "92%", height: "85%", borderRadius: 12, padding: 14, borderWidth: 4, borderColor: "#555" },
  sectionHeaderTitle:  { color: "#000", fontSize: 10, fontWeight: "bold", fontFamily: "monospace", marginBottom: 6, backgroundColor: "#FFCB05", paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", borderRadius: 3 },
  emptySubtext:        { color: "#666", fontSize: 10, fontFamily: "monospace", textAlign: "center" },
  searchRowItem:       { flexDirection: "row", alignItems: "center", backgroundColor: "#1C2424", padding: 6, borderRadius: 8, marginBottom: 5, justifyContent: "space-between" },
  searchThumb:         { width: 35, height: 35, resizeMode: "contain" },
  searchTextName:      { color: "#51F542", fontFamily: "monospace", fontWeight: "bold", flex: 1, marginLeft: 10, fontSize: 10 },
  backHardwareBtn:     { backgroundColor: "#CC1414", padding: 10, borderRadius: 6, alignItems: "center", marginTop: 10 },
  backHardwareBtnText: { color: "#FFF", fontWeight: "bold", fontFamily: "monospace", fontSize: 11 },
  loadingContainer:    { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText:         { fontFamily: "monospace", fontSize: 11, color: "#333", fontWeight: "bold" },
  customAlertOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  customAlertBox:      { width: "85%", backgroundColor: "#1C2424", borderRadius: 8, borderWidth: 3, overflow: "hidden" },
  customAlertHeader:   { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 12 },
  customAlertTitle:    { fontFamily: "monospace", fontWeight: "bold", fontSize: 11 },
  customAlertBody:     { padding: 15, alignItems: "center" },
  customAlertMessage:  { color: "#FFF", fontFamily: "monospace", fontSize: 11, textAlign: "center", marginBottom: 15, lineHeight: 16 },
  customAlertBtn:      { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 4, borderWidth: 1, borderColor: "#000" },
  customAlertBtnText:  { fontFamily: "monospace", fontWeight: "bold", fontSize: 10 },
});