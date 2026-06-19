import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Importando o seu hook personalizado de autenticação
import { useAuth } from '../../context/AuthContext'; 

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth(); 

  const nomeTreinador = user || 'TREINADOR';

  const handleLogout = async () => {
    await signOut();
    router.replace('/'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar clara combinando com o topo vermelho da Pokédex */}
      <StatusBar style="light" /> 
      
      {/* DESTAQUE SUPERIOR DA POKÉDEX: Câmera azul piscante clássica */}
      <View style={styles.pokedexTopBar}>
        <View style={styles.mainCameraCircle}>
          <View style={styles.mainCameraInner} />
        </View>
        <View style={styles.miniLedRow}>
          <View style={[styles.miniLed, { backgroundColor: '#FF2D55' }]} />
          <View style={[styles.miniLed, { backgroundColor: '#FFCC00' }]} />
          <View style={[styles.miniLed, { backgroundColor: '#4CD964' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* TELA LCD DIGITAL (Simula a tela cinza-esverdeada do Game Boy / Explorer) */}
        <View style={styles.lcdScreen}>
          <View style={styles.lcdHeader}>
            <Text style={styles.lcdGreeting}>INFO TREINADOR:</Text>
            <Text style={styles.lcdUsername}>{nomeTreinador.toUpperCase()}</Text>
          </View>
          
          <View style={styles.lcdDivider} />
          
          <View style={styles.statsRow}>
            <View style={styles.lcdStatBox}>
              <Text style={styles.lcdStatLabel}>LV</Text>
              <Text style={styles.lcdStatValue}>01</Text>
            </View>
            <View style={styles.lcdStatBox}>
              <Text style={styles.lcdStatLabel}>WINS</Text>
              <Text style={styles.lcdStatValue}>00</Text>
            </View>
            <View style={styles.lcdStatBox}>
              <Text style={styles.lcdStatLabel}>LOSE</Text>
              <Text style={styles.lcdStatValue}>00</Text>
            </View>
          </View>
        </View>

        {/* MOLDURA DO D-PAD E SEÇÃO DE COMANDOS */}
        <Text style={styles.sectionTitle}>▶ SELECT OPTION</Text>
        
        <View style={styles.grid}>
          {/* Card Pokédex - Vermelho Clássico */}
          <TouchableOpacity 
            style={[styles.menuCard, { backgroundColor: '#CC0000' }]} 
            onPress={() => router.push('/pokedex')}
          >
            <View style={styles.cardIconBox}>
              <Ionicons name="list" size={24} color="#CC0000" />
            </View>
            <Text style={styles.cardTitle}>POKÉDEX</Text>
            <Text style={styles.cardDescription}>Acessar banco de dados de Kanto.</Text>
          </TouchableOpacity>

          {/* Card Meu Time - Azul Profundo */}
          <TouchableOpacity 
            style={[styles.menuCard, { backgroundColor: '#1A237E' }]} 
            onPress={() => router.push('/team')}
          >
            <View style={styles.cardIconBox}>
              <Ionicons name="briefcase" size={24} color="#1A237E" />
            </View>
            <Text style={styles.cardTitle}>MEU TIME</Text>
            <Text style={styles.cardDescription}>Verificar Pokémons ativos na equipe.</Text>
          </TouchableOpacity>

          {/* Card Iniciar Batalha - Amarelo/Laranja de Combate */}
          <TouchableOpacity 
            style={[styles.menuCard, { backgroundColor: '#E65100' }]} 
            onPress={() => router.push('/battle')} 
          >
            <View style={styles.cardIconBox}>
              <Ionicons name="flash" size={24} color="#E65100" />
            </View>
            <Text style={styles.cardTitle}>BATALHA</Text>
            <Text style={styles.cardDescription}>Desafiar inteligência do ginásio.</Text>
          </TouchableOpacity>

          {/* Card Sair - Cinza Chumbo de Desligamento */}
          <TouchableOpacity 
            style={[styles.menuCard, { backgroundColor: '#37474F' }]} 
            onPress={handleLogout}
          >
            <View style={styles.cardIconBox}>
              <Ionicons name="power" size={24} color="#37474F" />
            </View>
            <Text style={styles.cardTitle}>POWER OFF</Text>
            <Text style={styles.cardDescription}>Desconectar e desligar Pokédex.</Text>
          </TouchableOpacity>
        </View>

        {/* DETALHE PLÁSTICO INFERIOR DO PORTÁTIL */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000', // Vermelho escuro/vinho de fundo simulando o plástico da Pokédex
  },
  pokedexTopBar: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#530000',
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
    flexDirection: 'row',
    marginLeft: 15,
    gap: 8,
  },
  miniLed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#333',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  lcdScreen: {
    backgroundColor: '#C2CBB6', // Cor clássica de tela LCD monocromática/retrô
    borderRadius: 8,
    borderWidth: 5,
    borderColor: '#4A4A4A',
    padding: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0, // Sem desfoque para dar efeito pixel/hardcore
    elevation: 4,
  },
  lcdHeader: {
    marginBottom: 4,
  },
  lcdGreeting: {
    fontSize: 12,
    color: '#404A35',
    fontWeight: 'bold',
  },
  lcdUsername: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A2410',
    letterSpacing: 1,
  },
  lcdDivider: {
    height: 2,
    backgroundColor: '#404A35',
    marginVertical: 10,
    opacity: 0.4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lcdStatBox: {
    alignItems: 'flex-start',
  },
  lcdStatLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#404A35',
  },
  lcdStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2410',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFCC00', // Letras em amarelo clássico no plástico do console
    marginBottom: 16,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    height: 135,
    justifyContent: 'space-between',
    borderWidth: 3,
    borderColor: '#222', // Bordas bem marcadas simulando botões físicos
    borderBottomWidth: 6, // Efeito 3D de botão mecânico
  },
  cardIconBox: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  },
  pokedexFooterDecoration: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
    transform: [{ rotate: '30deg' }], // Inclinação charmosa dos alto-falantes do Game Boy
  },
  brandText: {
    color: '#CC0000',
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.7,
  },
});