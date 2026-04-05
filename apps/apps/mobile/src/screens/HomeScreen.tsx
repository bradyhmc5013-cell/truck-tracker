import React from "react";
import { View, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { supabase } from "../lib/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Button title="Create Load" onPress={() => navigation.navigate("CreateLoad")} />
      <Button title="Upgrade" onPress={() => navigation.navigate("Upgrade")} />
      <Button title="Logout" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}