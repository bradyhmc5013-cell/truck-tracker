{
  "name": "truck-tracker-workspace",
  "private": true,
  "workspaces": [
    "apps/mobile",
    "services/billing-webhook"
  ],
  "scripts": {
    "mobile": "yarn workspace @truck-tracker/mobile start",
    "mobile:android": "yarn workspace @truck-tracker/mobile android",
    "webhook:dev": "yarn workspace @truck-tracker/billing-webhook dev"
  }
}