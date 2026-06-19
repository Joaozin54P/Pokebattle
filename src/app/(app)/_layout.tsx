import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        // 1. ISSO AQUI SOME COM A NAVBAR DE CIMA! 🌟
        headerShown: false, 
        
        // Estilização da barra de baixo (VBar/Bottom Bar)
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FFCC03', // Amarelo Pokémon para o item ativo
        tabBarInactiveTintColor: '#8F8F8F', // Cinza para o inativo
        tabBarStyle: {
          backgroundColor: '#121212', // Fundo escuro combinando com seu app
          borderTopWidth: 0,
          elevation: 5,
          shadowOpacity: 0.2,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
      }}
    >
      {/* Tela Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* Tela Pokedex */}
      <Tabs.Screen
        name="pokedex"
        options={{
          title: 'Pokédex',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "book" : "book-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* Tela Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* Tela Batalha */}
      <Tabs.Screen
        name="battle"
        options={{
          title: 'Batalha',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
            name={focused ? "flash" : "flash-outline"} 
            size={size} 
            color={color} 
          />
          ),
        }}
      />

      {/* Se tiver a tela de Team (oculta da barra se não quiser, ou adiciona aqui) */}
      <Tabs.Screen
        name="team"
        options={{
          href: null, // Isso esconde o botão da barra inferior se você não quiser ele lá diretamente
        }}
      />
    </Tabs>
  );
}