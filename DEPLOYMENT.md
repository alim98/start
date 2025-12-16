# Multi-App Deployment Guide

This repository supports deploying **3 separate applications** from a single codebase using the `APP_MODE` environment variable.

## Available Modes

| Mode | App Name | Routes | Description |
|------|----------|--------|-------------|
| `en` | AI Startup Evaluator | `/en` | English version only |
| `fa` | ارزیاب هوشمند ایده | `/fa`, `/pricing` | Persian version + idea pricing |
| `park` | دمو صندوق فناوری | `/park-demo`, `/park-demo-en` | VC Investment simulation |
| `all` | Startup Intelligence Suite | All routes | Portal with all apps (default) |

## Authentication System

The system includes built-in authentication with:
- **Pre-defined users** in `lib/users.ts`
- **App-specific access control** (users can only access their allowed apps)
- **Daily usage limits** (prevents abuse)

### Enabling Authentication

Set `REQUIRE_AUTH=true` to enable login requirement:

```
REQUIRE_AUTH=true
```

### Pre-defined Users

Edit `lib/users.ts` to add/modify users:

| Username | Password | Access | Daily Limit |
|----------|----------|--------|-------------|
| `admin` | `admin123` | All apps | 100 |
| `demo_en` | `demo2024` | English only | 10 |
| `demo_fa` | `demo2024` | Persian only | 10 |
| `vc_user` | `vc2024` | Park demo | 20 |
| `pro_user` | `pro2024` | EN + FA | 50 |

**⚠️ Change these passwords before production!**

---

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
  REQUIRE_AUTH=true
  GROQ_API_KEY=your-groq-api-key
  DATABASE_URL=file:./prisma/dev.db
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
  REQUIRE_AUTH=true
  GROQ_API_KEY=your-groq-api-key
  DATABASE_URL=file:./prisma/dev.db
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
  REQUIRE_AUTH=true
  GROQ_API_KEY=your-groq-api-key
  DATABASE_URL=file:./prisma/dev.db
  ```

---

## Testing Locally

Test each mode locally by setting the environment variables:

```bash
# English mode with auth
APP_MODE=en REQUIRE_AUTH=true npm run dev

# Persian mode with auth
APP_MODE=fa REQUIRE_AUTH=true npm run dev

# Park demo mode with auth
APP_MODE=park REQUIRE_AUTH=true npm run dev

# All apps without auth (development)
npm run dev
```

---

## How It Works

1. **`lib/app-config.ts`**: Defines configurations for each mode
2. **`lib/users.ts`**: Pre-defined user list with access control
3. **`lib/auth.ts`**: Session management and usage tracking
4. **`lib/usage-check.ts`**: API-level usage limit enforcement
5. **`middleware.ts`**: Blocks unauthorized routes and requires login
6. **`app/page.tsx`**: Redirects to default route based on mode

### Flow:
1. User visits the app
2. If `REQUIRE_AUTH=true`, middleware redirects to `/login`
3. User logs in with username/password
4. System checks if user has access to this app mode
5. Each API call checks and decrements daily usage limit
6. When limit is reached, user sees error message

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_MODE` | No | Set to `en`, `fa`, `park`, or `all` (default: `all`) |
| `NEXT_PUBLIC_APP_MODE` | No | Same as above (for client-side) |
| `REQUIRE_AUTH` | No | Set to `true` to require login (default: `false`) |
| `GROQ_API_KEY` | Yes | Groq API key for LLM calls |
| `DATABASE_URL` | Yes | SQLite database path |

---

## Future Improvements

- [ ] Move users to database instead of config file
- [ ] Add password hashing (bcrypt)
- [ ] Add user registration
- [ ] Use Redis for usage tracking (for multi-instance deployments)
- [ ] Add JWT tokens instead of base64 sessions
