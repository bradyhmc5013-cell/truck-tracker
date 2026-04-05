import React, { useState } from "react";
import { View, Text, TextInput, Button, Share, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { centsToUsd } from "../lib/money";

export function InvoiceSummaryScreen({ route }: any) {
  const { loadId } = route.params;
  const [invoiceNumber, setInvoiceNumber] = useState("");

  async function generateAndShare() {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) return;

    const { data: load, error: loadErr } = await supabase
      .from("loads")
      .select("broker_name, broker_email, load_ref, pickup_name, pickup_city, delivery_name, delivery_city")
      .eq("id", loadId)
      .maybeSingle();

    if (loadErr || !load) return Alert.alert("Error", loadErr?.message ?? "Load missing");

    const { data: stops } = await supabase
      .from("stop_events")
      .select("stop_type, arrived_at, departed_at")
      .eq("load_id", loadId);

    // v1: $0 (hook up detention calc later)
    const pickupDet = 0;
    const deliveryDet = 0;
    const tonu = 0;
    const total = pickupDet + deliveryDet + tonu;

    // create invoice row (1 per load)
    const { error: invErr } = await supabase.from("invoices").upsert({
      profile_id: uid,
      load_id: loadId,
      invoice_number: invoiceNumber,
      pickup_detention_cents: pickupDet,
      delivery_detention_cents: deliveryDet,
      tonu_cents: tonu,
      total_cents: total
    }, { onConflict: "load_id" });

    if (invErr) return Alert.alert("Error", invErr.message);

    const pickup = stops?.find((s) => s.stop_type === "pickup");
    const delivery = stops?.find((s) => s.stop_type === "delivery");

    const text =
`INVOICE SUMMARY (Truck_Tracker)

Invoice #: ${invoiceNumber}
Load Ref: ${load.load_ref ?? "—"}

Pickup: ${load.pickup_name}, ${load.pickup_city}
  Arrived: ${pickup?.arrived_at ?? "—"}
  Departed: ${pickup?.departed_at ?? "—"}

Delivery: ${load.delivery_name}, ${load.delivery_city}
  Arrived: ${delivery?.arrived_at ?? "—"}
  Departed: ${delivery?.departed_at ?? "—"}

Charges:
  Pickup Detention: $${centsToUsd(pickupDet)}
  Delivery Detention: $${centsToUsd(deliveryDet)}
  TONU: $${centsToUsd(tonu)}
TOTAL DUE: $${centsToUsd(total)}

Broker: ${load.broker_name ?? "—"}
Email: ${load.broker_email ?? "—"}`;

    await Share.share({ message: text });
  }

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text>Invoice Number (required)</Text>
      <TextInput value={invoiceNumber} onChangeText={setInvoiceNumber} style={{ borderWidth: 1, padding: 10 }} />
      <Button title="Share Invoice Summary" onPress={generateAndShare} />
    </View>
  );
}