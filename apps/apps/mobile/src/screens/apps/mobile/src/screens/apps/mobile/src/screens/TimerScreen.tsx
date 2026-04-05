import React from "react";
import { View, Button, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export function TimerScreen({ route, navigation }: any) {
  const { loadId } = route.params;

  async function setTime(stopType: "pickup" | "delivery", field: "arrived_at" | "departed_at") {
    const now = new Date().toISOString();
    const { data: stop, error } = await supabase
      .from("stop_events")
      .select("id")
      .eq("load_id", loadId)
      .eq("stop_type", stopType)
      .maybeSingle();

    if (error || !stop) return Alert.alert("Error", error?.message ?? "Stop missing");

    const { error: updErr } = await supabase
      .from("stop_events")
      .update({ [field]: now })
      .eq("id", stop.id);

    if (updErr) Alert.alert("Error", updErr.message);
  }

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Button title="Pickup Arrived" onPress={() => setTime("pickup", "arrived_at")} />
      <Button title="Pickup Departed" onPress={() => setTime("pickup", "departed_at")} />
      <Button title="Delivery Arrived" onPress={() => setTime("delivery", "arrived_at")} />
      <Button title="Delivery Departed" onPress={() => setTime("delivery", "departed_at")} />
      <Button title="Invoice Summary" onPress={() => navigation.navigate("InvoiceSummary", { loadId })} />
    </View>
  );
}