import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Pokemon } from "../../@type/pokemon";
import { getPokemon } from "../../integration/pokemonIntegration";
import { styles } from "./style";

const POKEMON_TYPES = [
  "ALL", "GRASS", "FIRE", "WATER", "BUG", "NORMAL", "POISON", "ELECTRIC", "GROUND", "FAIRY", "FIGHTING", "PSYCHIC", "ROCK", "GHOST", "DRAGON", "ICE"
];

function getStatColor(statName: string) {
  switch (statName?.toLowerCase()) {
    case "hp": return "#FF4B4B";
    case "attack": case "atk": return "#FF851B";
    case "defense": case "def": return "#2ECC70";
    case "special-attack": case "sp.atk": return "#FF3B30";
    case "special-defense": case "sp.def": return "#007AFF";
    case "speed": case "spd": return "#FFCC00";
    default: return "#94A3B8";
  }
}

function getTypeColor(type: string) {
  switch (type?.toLowerCase()) {
    case "fire": return "#FFA500";
    case "water": return "#58A5FF";
    case "grass": return "#5CDB95";
    case "electric": return "#FAE042";
    case "poison": return "#A463FF";
    case "bug": return "#A6B91A";
    case "normal": return "#A8A77A";
    case "ground": return "#E2BF65";
    case "flying": return "#A98FF3";
    case "fighting": return "#C22E28";
    case "psychic": return "#F95587";
    case "rock": return "#B6A136";
    case "ghost": return "#735797";
    case "dragon": return "#6F35FC";
    case "fairy": return "#D685AD";
    case "ice": return "#96D9D6";
    default: return "#64748B";
  }
}

export default function PokemonList() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  
  const [activePokemon, setActivePokemon] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const rotateAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    async function carregarPokedexKanto() {
      const dados = await getPokemon(151);
      const ordenados = dados.sort((a, b) => parseInt(a.index) - parseInt(b.index));
      
      setPokemons(ordenados);
      setFilteredPokemons(ordenados);

      ordenados.forEach((p) => {
        if (!rotateAnims[p.index]) {
          rotateAnims[p.index] = new Animated.Value(0);
        }
      });
      setLoading(false);
    }
    carregarPokedexKanto();
  }, []);

  useEffect(() => {
    const resultado = pokemons.filter((pokemon) => {
      const matchesText = pokemon.nome.toLowerCase().includes(searchText.toLowerCase()) || pokemon.index.includes(searchText);
      const matchesType = selectedType === "ALL" || pokemon.tipos.some(t => t.toUpperCase() === selectedType);
      return matchesText && matchesType;
    });
    setFilteredPokemons(resultado);
  }, [searchText, selectedType, pokemons]);

  const handlePressIn = (index: string) => {
    Animated.timing(rotateAnims[index], { toValue: 180, duration: 250, useNativeDriver: true }).start();
  };

  const handlePressOut = (index: string) => {
    Animated.timing(rotateAnims[index], { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CC0000" />
        <Text style={styles.loadingText}>Sincronizando Banco de Dados de Kanto...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#E2E8F0" }}>
      {/* BARRA DE PESQUISA */}
      <View style={styles.searchSection}>
        <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Pokémon por nome ou nº..."
          placeholderTextColor="#94A3B8"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTRO DE TIPOS */}
      <View style={styles.typeFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterScroll}>
          {POKEMON_TYPES.map((type) => {
            const isSelected = selectedType === type;
            const typeColor = type === "ALL" ? "#475569" : getTypeColor(type);
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.typeFilterButton,
                  { backgroundColor: isSelected ? typeColor : "#FFFFFF", borderColor: typeColor }
                ]}
              >
                <Text style={[styles.typeFilterText, { color: isSelected ? "#FFFFFF" : typeColor }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* GRID PRINCIPAL */}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredPokemons.map((pokemon) => {
            const rotateY = rotateAnims[pokemon.index]?.interpolate({
              inputRange: [0, 180],
              outputRange: ["0deg", "180deg"],
            }) || "0deg";

            return (
              <Animated.View key={pokemon.index} style={[styles.cardWrapper, { transform: [{ rotateY }] }]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPressIn={() => handlePressIn(pokemon.index)}
                  onPressOut={() => handlePressOut(pokemon.index)}
                  onPress={() => {
                    setActivePokemon(pokemon);
                    setModalVisible(true);
                  }}
                  style={styles.card}
                >
                  <Text style={styles.number}>#{pokemon.index.padStart(3, "0")}</Text>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: pokemon.imagem }} style={styles.image} />
                  </View>
                  <Text style={styles.name}>{pokemon.nome}</Text>
                  <View style={styles.typeContainer}>
                    {pokemon.tipos.slice(0, 1).map((tipo) => (
                      <Text key={tipo} style={[styles.typeBadge, { backgroundColor: getTypeColor(tipo) }]}>
                        {tipo}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* MODAL DO CONSOLE DE DETALHES VERMELHO POKÉDEX */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.gbaConsoleContainer}>
            
            {/* TELA INTERNA */}
            <View style={styles.gbaScreenBorder}>
              <View style={styles.gbaLcdHeader}>
                <Text style={styles.gbaHeaderText}>POKÉMON DATA</Text>
                {/* BOTÃO X */}
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.gbaCloseCross}>
                  <Ionicons name="close" size={18} color="#FFCC00" />
                </TouchableOpacity>
              </View>

              {activePokemon && (
                <ScrollView style={styles.gbaMainDisplay} showsVerticalScrollIndicator={false}>
                  
                  {/* DADOS SUPERIORES: Imagem Otimizada Gigante */}
                  <View style={styles.gbaTopRow}>
                    <View style={styles.gbaSpriteBox}>
                      <Image source={{ uri: activePokemon.imagem }} style={styles.gbaImage} />
                    </View>

                    <View style={styles.gbaProfileData}>
                      <Text style={styles.gbaIndexText}>№. {activePokemon.index.padStart(3, "0")}</Text>
                      <Text style={styles.gbaPokemonName}>{activePokemon.nome.toUpperCase()}</Text>
                      
                      <Text style={styles.gbaLabelMini}>HT / WT</Text>
                      <Text style={styles.gbaValueMini}>0.7m / 6.9kg</Text>
                      
                      <Text style={styles.gbaLabelMini}>TYPE</Text>
                      <View style={styles.gbaTypeRow}>
                        {activePokemon.tipos.map((tipo) => (
                          <Text key={tipo} style={[styles.gbaTypeLabel, { backgroundColor: getTypeColor(tipo) }]}>
                            {tipo.toUpperCase()}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* BASE STATS */}
                  <View style={styles.gbaStatsContainer}>
                    <Text style={styles.gbaStatsTitle}>BASE STATS</Text>
                    {activePokemon.poderes.map((poder) => (
                      <View key={poder.nome} style={styles.gbaStatRow}>
                        <Text style={styles.gbaStatNameLabel}>
                          {poder.nome.replace("special-", "S.").toUpperCase()}
                        </Text>
                        <Text style={styles.gbaStatValueNum}>{poder.forca}</Text>
                        <View style={styles.gbaBarWrapper}>
                          <View
                            style={[
                              styles.gbaBarFill,
                              {
                                width: `${Math.min((poder.forca / 150) * 100, 100)}%`,
                                backgroundColor: getStatColor(poder.nome),
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* ATAQUES (MOVES) */}
                  <View style={styles.gbaMovesContainer}>
                    <Text style={styles.gbaMovesTitle}>KNOWN MOVES</Text>
                    <View style={styles.gbaMovesGrid}>
                      {(activePokemon.ataques || ["Tackle", "Growl", "Quick Attack", activePokemon.tipos[0] === "fire" ? "Ember" : activePokemon.tipos[0] === "water" ? "Water Gun" : "Vine Whip"]).map((move: string, i: number) => (
                        <View key={i} style={styles.gbaMoveCard}>
                          <Ionicons name="flash-sharp" size={9} color="#CC0000" />
                          <Text style={styles.gbaMoveText}>{move.toUpperCase()}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                </ScrollView>
              )}
            </View>

            {/* BOTÃO B PARA FECHAR */}
            <View style={styles.gbaControllerFooter}>
              <TouchableOpacity activeOpacity={0.6} onPress={() => setModalVisible(false)} style={styles.gbaBButtonAction}>
                <Text style={styles.gbaButtonHint}>◀ PRESS B TO CLOSE</Text>
              </TouchableOpacity>
              <View style={styles.gbaLogoContainer}>
                <Text style={styles.gbaLogoText}>POKÉDEX</Text>
                <Text style={styles.gbaLogoSub}>MINI</Text>
              </View>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}