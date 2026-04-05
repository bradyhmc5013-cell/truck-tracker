import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Success", "Check your email if confirmation is enabled.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Error", error.message);
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 10 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10 }} />
      <Button title="Sign In" onPress={signIn} />
      <Button title="Sign Up" onPress={signUp} />
    </View>
  );
}