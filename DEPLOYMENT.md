# Multi-App Deployment Guide

This repository supports deploying **3 separate applications** from a single codebase using the `APP_MODE` environment variable.

## Available Modes

| Mode | App Name | Routes | Description |
|------|----------|--------|-------------|
| `en` | AI Startup Evaluator | `/en` | English version only |
| `fa` | ارزیاب هوشمند ایده | `/fa`, `/pricing` | Persian version + idea pricing |
| `park` | دمو صندوق فناوری | `/park-demo`, `/park-demo-en` | VC Investment simulation |
| `all` | Startup Intelligence Suite | All routes | Portal with all apps (default) |

## Deploying on Render

### 1. English Evaluator
Create a new Web Service with:
- **Name**: `startup-evaluator-en`
- **Build Command**: `npm install; npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  APP_MODE=en
  NEXT_PUBLIC_APP_MODE=en
  GROQ_API_KEY=your-groq-api-key
  ```

### 2. Persian Evaluator (ارزیاب فارسی)
Create a new Web Service with:
- **Name**: `startup-evaluator-fa`
- **Build Command**: `npm install; npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  APP_MODE=fa
  NEXT_PUBLIC_APP_MODE=fa
  GROQ_API_KEY=your-groq-api-key
  ```

### 3. Fund Demo (دمو صندوق فناوری)
Create a new Web Service with:
- **Name**: `fund-demo`
- **Build Command**: `npm install; npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  APP_MODE=park
  NEXT_PUBLIC_APP_MODE=park
  GROQ_API_KEY=your-groq-api-key
  ```

## Testing Locally

Test each mode locally by setting the environment variable:

```bash
# English mode
APP_MODE=en npm run dev

# Persian mode
APP_MODE=fa npm run dev

# Park demo mode
APP_MODE=park npm run dev

# All apps (portal)
npm run dev
```

## How It Works

1. **`lib/app-config.ts`**: Defines configurations for each mode
2. **`middleware.ts`**: Blocks unauthorized routes and redirects
3. **`app/page.tsx`**: Redirects to default route based on mode

When `APP_MODE` is set, users can only access routes for that specific app. Unauthorized routes redirect to the app's default page.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_MODE` | No | Set to `en`, `fa`, `park`, or `all` (default: `all`) |
| `NEXT_PUBLIC_APP_MODE` | No | Same as above (for client-side access) |
| `GROQ_API_KEY` | Yes | Groq API key for LLM calls |
| `DATABASE_URL` | Yes | SQLite database path |
