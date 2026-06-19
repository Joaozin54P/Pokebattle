import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>POKÉDEX</Text>

      <View style={styles.menu}>
        <NavButton
          title="Início"
          route="/(app)/home"
          active={pathname.includes("home")}
        />

        <NavButton
          title="Pokédex"
          route="/(app)/pokedex"
          active={pathname.includes("pokedex")}
        />

        <NavButton
          title="Time"
          route="/(app)/team"
          active={pathname.includes("team")}
        />

        <NavButton
          title="Batalha"
          route="/(app)/battle"
          active={pathname.includes("battle")}
        />

        <NavButton
          title="Perfil"
          route="/(app)/profile"
          active={pathname.includes("profile")}
        />
      </View>
    </View>
  );
}

function NavButton({
  title,
  route,
  active,
}: {
  title: string;
  route: string;
  active: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        active && styles.activeButton,
      ]}
      onPress={() => router.push(route)}
    >
      <Text
        style={[
          styles.buttonText,
          active && styles.activeText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111",
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: "#FFCB05",
  },

  logo: {
    color: "#FFCB05",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: 3,
  },

  menu: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 10,
  },

  button: {
    backgroundColor: "#222",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  activeButton: {
    backgroundColor: "#FFCB05",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
  },

  activeText: {
    color: "#000",
  },
});