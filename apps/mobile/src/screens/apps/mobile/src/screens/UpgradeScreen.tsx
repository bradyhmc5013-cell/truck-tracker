import React from "react";
import { View, Button, Alert } from "react-native";
import * as Linking from "expo-linking";
import { config } from "../lib/config";

export function UpgradeScreen() {
  async function openCheckout() {
    if (!config.stripeCheckoutUrl) {
      Alert.alert("Missing", "Set EXPO_PUBLIC_STRIPE_CHECKOUT_URL in .env");
      return;
    }
    await Linking.openURL(config.stripeCheckoutUrl);
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Button title="Upgrade (Stripe Checkout)" onPress={openCheckout} />
    </View>
  );
}