import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// IMPORTANT: Stripe needs the raw body to validate signatures.
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // You will map Stripe customer -> Supabase profile via stripe_customer_id.
    // Best practice: set customer metadata { supabase_uid: <uuid> } at checkout creation time.
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = String(sub.customer);
        const status = sub.status; // trialing|active|past_due|canceled|unpaid|etc.

        await supabaseAdmin
          .from("profiles")
          .update({ stripe_subscription_status: status })
          .eq("stripe_customer_id", customerId);

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = String(session.customer);

        // If you set session.metadata.supabase_uid or customer metadata, use it here.
        const supabaseUid = session.metadata?.supabase_uid;

        if (supabaseUid) {
          await supabaseAdmin
            .from("profiles")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_status: "active"
            })
            .eq("id", supabaseUid);
        }
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (e: any) {
    res.status(500).send(e?.message ?? "Webhook handler error");
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 4242, () => {
  console.log(`billing-webhook listening on :${process.env.PORT || 4242}`);
});