import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
function ActionButton({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Truck Tracker</Text>
      <Text style={styles.subtitle}>What do you want to do?</Text>

    <View style={styles.grid}>
      <ActionButton
        title="Start Shift"
        subtitle="Start a timer for today"
        onPress={() => router.push("/(tabs)/start-shift")}
      />
    <ActionButton
        title="New Load"
        subtitle="Create a new load entry"
        onPress={() => router.push("/(tabs)/new-load")}
      />
    <ActionButton
        title="Invoices"
        subtitle="View/export invoices"
        onPress={() => router.push("/(tabs)/invoices")}
    />
</View>

      <Text style={styles.footer}>
        Tip: We’ll wire these to real screens next.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 18,
    backgroundColor: "#0B1220",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#B7C2D0",
  },
  grid: {
    marginTop: 18,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#111C33",
    borderWidth: 1,
    borderColor: "#1E2A45",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#A9B6C8",
  },
  footer: {
    marginTop: 22,
    color: "#7F8AA0",
    fontSize: 12,
  },
});