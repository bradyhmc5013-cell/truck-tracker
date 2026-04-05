import { View, Text, StyleSheet } from "react-native";

export default function NewLoad() {
  return (
    <View style={{ flex: 1, padding: 18, paddingTop: 64 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>New Load</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, paddingTop: 64, backgroundColor: "#0B1220" },
  title: { fontSize: 28, fontWeight: "800", color: "white" },
  text: { marginTop: 10, color: "#B7C2D0", fontSize: 15 },
});