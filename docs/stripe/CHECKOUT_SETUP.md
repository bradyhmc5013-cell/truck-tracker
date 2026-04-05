# Stripe Checkout Setup (MVP)

For MVP speed, use **Stripe hosted Checkout**.

## Goal
- User taps Upgrade
- App opens your hosted Checkout URL
- Stripe processes payment
- Webhook updates `profiles.stripe_subscription_status`

## Important note
To properly link Stripe customers to Supabase users, the best practice is:
- Create Checkout Sessions server-side
- Set metadata: `supabase_uid`

For MVP (quickest), you can:
- Use a single Checkout link
- Then manually reconcile customers for first few users

But to scale, you should create sessions dynamically.

## Stripe CLI webhook forwarding
```bash
stripe listen --forward-to localhost:4242/webhook
```

Copy the `whsec_...` secret into `services/billing-webhook/.env`.

## Events handled
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted