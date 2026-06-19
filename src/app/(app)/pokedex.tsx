import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PokemonList from "@/components/pokemonList";

export default function Pokedex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar clara combinando com o plástico vermelho da Pokédex */}
      <StatusBar style="light" />

      {/* TOP BAR INTERNA DA POKÉDEX (Estilo FireRed / Explorer) */}
      <View style={styles.pokedexHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.pokedexTitle}>POKÉDEX INDEX</Text>
          <Text style={styles.pokedexSubtitle}>KANTO REGION • VERSION 1.0</Text>
        </View>
        <View style={styles.greenLed} />
      </View>

      {/* TELA DE EXIBIÇÃO DIGITAL (Moldura interna onde roda a lista de Pokémons) */}
      <View style={styles.screenFrame}>
        <View style={styles.innerLcdScreen}>
          
          {/* BARRA DE STATUS DA TELA LCD */}
          <View style={styles.lcdStatusBar}>
            <Text style={styles.lcdStatusText}>◀ LIST MODE</Text>
            <Text style={styles.lcdStatusText}>GEN I</Text>
          </View>

          {/* CONTEÚDO PRINCIPAL: A sua lista de Pokémons estilizada entra aqui */}
          <View style={styles.content}>
            <PokemonList />
          </View>

        </View>
      </View>

      {/* DECORAÇÃO INFERIOR - BOTÕES DE CONTROLE DA POKÉDEX */}
      <View style={styles.pokedexFooter}>
        <View style={styles.blackButtonContainer}>
          <View style={styles.pillButton} />
          <View style={styles.pillButton} />
        </View>
        <Text style={styles.serialNumber}>№ 001 - 151</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8B0000", // Vermelho escuro base do plástico externo da Pokédex
  },
  pokedexHeader: {
    backgroundColor: "#CC0000", // Vermelho vibrante clássico
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 4,
    borderBottomColor: "#530000",
  },
  backButton: {
    backgroundColor: "#530000",
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pokedexTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  pokedexSubtitle: {
    color: "#FFCC00", // Amarelo clássico
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  greenLed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CD964", // LED verde aceso indicando sistema ON
    borderWidth: 1.5,
    borderColor: "#222",
    shadowColor: "#4CD964",
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  screenFrame: {
    flex: 1,
    backgroundColor: "#4A4A4A", // Plástico cinza escuro protetor ao redor da tela
    padding: 12,
    marginHorizontal: 10,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#222",
  },
  innerLcdScreen: {
    flex: 1,
    backgroundColor: "#E2E8F0", // Fundo cinza/azul claro digital idêntico ao do Pokemon Explorer
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1A1A1A",
    overflow: "hidden", // Garante que a lista não saia das bordas arredondadas da tela
  },
  lcdStatusBar: {
    backgroundColor: "#CBD5E1", // Faixa cinza ligeiramente mais escura no topo da tela LCD
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: "#94A3B8",
  },
  lcdStatusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  pokedexFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    backgroundColor: "#CC0000",
    borderTopWidth: 4,
    borderTopColor: "#530000",
  },
  blackButtonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  pillButton: {
    width: 35,
    height: 10,
    backgroundColor: "#222222", // Botões ovais pretos "Select/Start" do portátil
    borderRadius: 5,
    transform: [{ rotate: "-20deg" }],
  },
  serialNumber: {
    color: "#530000",
    fontSize: 11,
    fontWeight: "900",
  },
});