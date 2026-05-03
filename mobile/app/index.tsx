import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>nudg</Text>
      <Text style={styles.tagline}>Your agent meets theirs.{"\n"}If they click, you get a date.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/interview")}>
        <Text style={styles.buttonText}>Build My Agent</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  logo: {
    fontSize: 52,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  buttonText: {
    color: "#0A0A0A",
    fontSize: 16,
    fontWeight: "600",
  },
});
