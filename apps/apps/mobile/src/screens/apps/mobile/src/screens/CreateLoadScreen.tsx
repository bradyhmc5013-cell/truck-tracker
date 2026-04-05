import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export function CreateLoadScreen({ navigation }: any) {
  const [pickupName, setPickupName] = useState("Pickup");
  const [pickupCity, setPickupCity] = useState("City");
  const [deliveryName, setDeliveryName] = useState("Delivery");
  const [deliveryCity, setDeliveryCity] = useState("City");

  async function create() {
    // NOTE: for v1 we omit truck selection; you’ll add trucks screen next.
    // This inserts load with a placeholder truck. You must create a truck row first in real use.
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) return;

    // find first truck
    const { data: trucks } = await supabase.from("trucks").select("id").limit(1);
    const truckId = trucks?.[0]?.id;
    if (!truckId) {
      Alert.alert("Setup needed", "Create a truck in Supabase first (temporary v1).");
      return;
    }

    const { data: load, error } = await supabase
      .from("loads")
      .insert({
        profile_id: uid,
        truck_id: truckId,
        pickup_name: pickupName,
        pickup_city: pickupCity,
        delivery_name: deliveryName,
        delivery_city: deliveryCity
      })
      .select("id")
      .single();

    if (error) return Alert.alert("Error", error.message);

    // create pickup+delivery stop_events
    await supabase.from("stop_events").insert([
      { load_id: load.id, stop_type: "pickup" },
      { load_id: load.id, stop_type: "delivery" }
    ]);

    navigation.navigate("Timer", { loadId: load.id });
  }

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text>Pickup Name</Text>
      <TextInput value={pickupName} onChangeText={setPickupName} style={{ borderWidth: 1, padding: 10 }} />
      <Text>Pickup City</Text>
      <TextInput value={pickupCity} onChangeText={setPickupCity} style={{ borderWidth: 1, padding: 10 }} />
      <Text>Delivery Name</Text>
      <TextInput value={deliveryName} onChangeText={setDeliveryName} style={{ borderWidth: 1, padding: 10 }} />
      <Text>Delivery City</Text>
      <TextInput value={deliveryCity} onChangeText={setDeliveryCity} style={{ borderWidth: 1, padding: 10 }} />
      <Button title="Create Load" onPress={create} />
    </View>
  );
}