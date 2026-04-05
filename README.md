# truck-tracker
detention calculation
# Truck_Tracker (Android-first MVP)

This repo contains:
- **Expo mobile app** (TypeScript): `apps/mobile`
- **Stripe webhook service** (Node/Express, TypeScript): `services/billing-webhook`
- **Supabase SQL** (schema + RLS): `supabase/sql`

## Prereqs
- Node 18+ (or 20+)
- Yarn (classic or berry is fine; examples assume classic)
- Expo Go (Android)
- Supabase project created
- Stripe account created

---

## 1) Supabase setup

1. Create a Supabase project
2. In Supabase SQL editor, run:
   - `supabase/sql/001_schema.sql`
   - `supabase/sql/002_rls.sql`

3. In Supabase Auth:
   - enable Email/Password

4. Create two Storage buckets (PRIVATE):
   - `load-attachments`
   - `invoice-pdfs`

> PDF generation automation is planned. For now, the app generates an invoice summary you can copy/share.

---

## 2) Mobile app (Expo)

```bash
cd apps/mobile
cp .env.example .env
yarn
yarn android
```

Fill `apps/mobile/.env` with your Supabase credentials.

---

## 3) Stripe (hosted Checkout + webhook)

The mobile app will send users to Stripe Checkout (hosted page).  
The webhook service listens for Stripe events and updates the user's subscription status in Supabase.

### Run webhook locally
```bash
cd services/billing-webhook
cp .env.example .env
yarn
yarn dev
```

Then use Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:4242/webhook
```

See `docs/stripe/CHECKOUT_SETUP.md`.

---

## MVP Feature Notes
- P/D only (pickup & delivery)
- user-entered invoice number
- gating/paywall screen stub included