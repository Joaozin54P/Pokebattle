import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useTeam } from "@/context/TeamContext"; 
import Button from "@/components/button";

const SHOWDOWN_TRAINERS = [
  { id: "red", name: "Red", url: "https://play.pokemonshowdown.com/sprites/trainers/red.png" },
  { id: "blue", name: "Blue", url: "https://play.pokemonshowdown.com/sprites/trainers/blue.png" },
  { id: "green", name: "Green", url: "https://play.pokemonshowdown.com/sprites/trainers/green.png" },
];

const TYPE_COLORS: { [key: string]: string } = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C", grass: "#7AC74C", 
  psychic: "#F95587", bug: "#A6B91A", rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", 
  steel: "#B7B7CE", fairy: "#D685AD", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
  ground: "#E2BF65", flying: "#A98FF3", dark: "#705746"
};

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth(); 
  const { team } = useTeam(); // Consumindo apenas a equipe principal fixa

  const [selectedAvatar, setSelectedAvatar] = useState(SHOWDOWN_TRAINERS[0]);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/'); 
  };

  const currentTeam = team || [];

  return (
    <View style={styles.pokedexContainer}>
      {/* DESTAQUE SUPERIOR DA POKÉDEX */}
      <View style={styles.pokedexHardwareHeader}>
        <View style={styles.mainCameraCircle}>
          <View style={styles.mainCameraInner} />
        </View>
        <View style={styles.miniLedRow}>
          <View style={[styles.hardwareLed, { backgroundColor: '#FF2D55' }]} />
          <View style={[styles.hardwareLed, { backgroundColor: '#FFCC00' }]} />
          <View style={[styles.hardwareLed, { backgroundColor: '#4CD964' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* TELA LCD DIGITAL RETRÔ */}
        <View style={styles.screenFrame}>
          <View style={styles.screenInnerBorder}>
            <View style={styles.avatarCenterContainer}>
              <TouchableOpacity style={styles.avatarPokedexGlass} onPress={() => setAvatarModalVisible(true)}>
                <Image source={{ uri: selectedAvatar.url }} style={styles.trainerSprite} />
              </TouchableOpacity>
            </View>

            <Text style={styles.pokedexNameDisplay}>
              {user ? user.toUpperCase() : "TREINADOR CONECTADO"}
            </Text>
            
            <Text style={styles.pokedexSerialText}>SISTEMA OPERACIONAL POKÉDEX v2.6</Text>
          </View>
        </View>

        {/* CONTAINER DO TIME — VISOR LCD SECUNDÁRIO */}
        <View style={styles.pokedexCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="layers-outline" size={16} color="#404A35" />
            <Text style={styles.cardTitle}>
              VISUALIZANDO: EQUIPE PRINCIPAL ({currentTeam.length}/6)
            </Text>
          </View>
          
          <View style={styles.profileTeamRow}>
            {currentTeam.map((poke) => {
              const mainType = poke.tipos && poke.tipos[0] ? poke.tipos[0].toLowerCase() : "normal";
              return (
                <View key={poke.id} style={[styles.profilePokeMiniCard, { borderColor: TYPE_COLORS[mainType] || "#4A4A4A" }]}>
                  <Image source={{ uri: poke.image }} style={styles.profileMiniSprite} />
                  <Text style={styles.profileMiniName} numberOfLines={1}>{poke.name.toUpperCase()}</Text>
                </View>
              );
            })}
            
            {currentTeam.length === 0 && (
              <Text style={styles.emptyTeamText}>Nenhum Pokémon salvo na sua equipe.</Text>
            )}
          </View>
        </View>

        {/* BOTÃO DESLOGAR */}
        <View style={{ marginTop: 25 }}>
          <Button title="DESLOGAR DO SISTEMA" onPress={handleLogout} />
        </View>

        {/* DETALHE PLÁSTICO INFERIOR */}
        <View style={styles.pokedexFooterDecoration}>
          <View style={styles.speakerGrill}>
            <View style={styles.speakerLine} />
            <View style={styles.speakerLine} />
            <View style={styles.speakerLine} />
            <View style={styles.speakerLine} />
          </View>
          <Text style={styles.brandText}>MODELO GBA-2026</Text>
        </View>

      </ScrollView>

      {/* POPUP DE SELEÇÃO DE AVATAR */}
      <Modal visible={avatarModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pokedexDatabaseBox}>
            <Text style={styles.databaseTitle}>BANCO DE DADOS: AVATARES</Text>
            <FlatList
              data={SHOWDOWN_TRAINERS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dbRow, selectedAvatar.id === item.id && styles.dbRowActive]}
                  onPress={() => {
                    setSelectedAvatar(item);
                    setAvatarModalVisible(false);
                  }}
                >
                  <Image source={{ uri: item.url }} style={styles.dbImg} />
                  <Text style={styles.dbTrainerName}>{item.name.toUpperCase()}</Text>
                  {selectedAvatar.id === item.id && <Ionicons name="checkmark-circle" size={20} color="#1A2410" />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeHardwareBtn} onPress={() => setAvatarModalVisible(false)}>
              <Text style={styles.closeHardwareBtnText}>FECHAR BANCO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pokedexContainer: { 
    flex: 1, 
    backgroundColor: '#8B0000', 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  pokedexHardwareHeader: { 
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#530000',
    marginBottom: 20,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  mainCameraCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
  },
  mainCameraInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A2E8',
    borderWidth: 2,
    borderColor: '#005A87',
  },
  miniLedRow: { 
    flexDirection: "row", 
    gap: 8, 
    marginLeft: 15 
  },
  hardwareLed: { 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    borderWidth: 2, 
    borderColor: '#333' 
  },
  screenFrame: { 
    backgroundColor: '#4A4A4A', 
    borderRadius: 12, 
    padding: 12, 
    borderWidth: 4, 
    borderColor: '#222',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
  },
  screenInnerBorder: { 
    backgroundColor: '#C2CBB6', 
    borderRadius: 6, 
    padding: 16, 
    alignItems: "center" 
  },
  avatarCenterContainer: { 
    width: "100%", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  avatarPokedexGlass: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#A9B49C', 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 3, 
    borderColor: '#404A35' 
  },
  trainerSprite: { 
    width: 85, 
    height: 85, 
    resizeMode: "contain" 
  },
  pokedexNameDisplay: { 
    color: '#1A2410', 
    fontSize: 24, 
    fontFamily: "monospace", 
    fontWeight: "900", 
    marginTop: 12, 
    textAlign: "center" 
  },
  pokedexSerialText: { 
    color: '#404A35', 
    fontSize: 10, 
    fontFamily: "monospace", 
    marginTop: 6, 
    fontWeight: "bold",
    opacity: 0.8
  },
  pokedexCard: { 
    backgroundColor: '#C2CBB6', 
    borderRadius: 8, 
    padding: 14, 
    borderWidth: 4, 
    borderColor: '#4A4A4A' 
  },
  cardHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(64, 74, 53, 0.3)',
    paddingBottom: 6
  },
  cardTitle: { 
    color: '#404A35', 
    fontSize: 11, 
    fontWeight: "900", 
    fontFamily: "monospace" 
  },
  profileTeamRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8, 
    justifyContent: "flex-start" 
  },
  profilePokeMiniCard: { 
    width: "31%", 
    backgroundColor: '#A9B49C', 
    borderRadius: 6, 
    padding: 6, 
    alignItems: "center", 
    borderWidth: 2,
    borderColor: '#404A35'
  },
  profileMiniSprite: { 
    width: 45, 
    height: 45, 
    resizeMode: "contain" 
  },
  profileMiniName: { 
    color: '#1A2410', 
    fontSize: 9, 
    fontFamily: "monospace", 
    fontWeight: "900", 
    marginTop: 4 
  },
  emptyTeamText: { 
    color: '#404A35', 
    fontSize: 11, 
    fontFamily: "monospace", 
    width: "100%", 
    textAlign: "center", 
    marginVertical: 10,
    fontWeight: 'bold'
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.85)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  pokedexDatabaseBox: { 
    backgroundColor: '#C2CBB6', 
    width: "85%", 
    maxHeight: "70%", 
    borderRadius: 8, 
    padding: 16, 
    borderWidth: 5, 
    borderColor: '#4A4A4A' 
  },
  databaseTitle: { 
    color: '#1A2410', 
    fontSize: 14, 
    fontWeight: "900", 
    fontFamily: 'monospace',
    textAlign: "center", 
    marginBottom: 15 
  },
  dbRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: '#A9B49C', 
    padding: 10, 
    borderRadius: 6, 
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  dbRowActive: { 
    borderColor: "#1A2410", 
  },
  dbImg: { 
    width: 45, 
    height: 45, 
    resizeMode: "contain" 
  },
  dbTrainerName: { 
    color: '#1A2410', 
    fontWeight: "900", 
    fontFamily: 'monospace',
    flex: 1, 
    marginLeft: 15, 
    fontSize: 14 
  },
  closeHardwareBtn: { 
    backgroundColor: "#37474F", 
    padding: 12, 
    borderRadius: 6, 
    alignItems: "center", 
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#222'
  },
  closeHardwareBtnText: { 
    color: "#FFF", 
    fontWeight: "900",
    fontFamily: 'monospace'
  },
  pokedexFooterDecoration: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 5,
  },
  speakerGrill: {
    flexDirection: 'row',
    gap: 4,
  },
  speakerLine: {
    width: 6,
    height: 24,
    backgroundColor: '#530000',
    borderRadius: 3,
    transform: [{ rotate: '30deg' }],
  },
  brandText: {
    color: '#CC0000',
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.7,
  },
});