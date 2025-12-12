# Startup Ideas Database - Quick Start Guide

## Setup Complete ✅

Your database and scraping system is ready! Here's what's been set up:

### Database
- **Type**: SQLite (file: `prisma/dev.db`)
- **Schema**: `StartupIdea` model with 20+ fields
- **Status**: Migrated and ready

### Product Hunt Scraper
- **File**: `scripts/scrapers/product-hunt-scraper.ts`
- **API**: Official GraphQL API
- **Features**: Auto-extraction of tech stack, category, revenue model

---

## How to Use

### 1. Get Product Hunt API Key

1. Go to: https://www.producthunt.com/v2/oauth/applications
2. Create a new application
3. Copy your API token
4. Add to `.env.local`:
   ```bash
   PRODUCT_HUNT_API_KEY=your_api_key_here
   ```

### 2. Run the Scraper

```bash
# Test with 10 products
npx ts-node scripts/scrapers/product-hunt-scraper.ts 10

# Scrape 100 products (default)
npx ts-node scripts/scrapers/product-hunt-scraper.ts

# Scrape 300 products
npx ts-node scripts/scrapers/product-hunt-scraper.ts 300
```

### 3. Check Database Stats

```bash
npx ts-node scripts/db-stats.ts
```

### 4. Query Ideas via API

```bash
# Get random ideas
curl http://localhost:3000/api/ideas?action=random&count=5

# Search ideas
curl http://localhost:3000/api/ideas?q=ai

# Filter by category
curl http://localhost:3000/api/ideas?category=SaaS&limit=10

# Get stats
curl http://localhost:3000/api/ideas?action=stats
```

---

## API Endpoints

### `GET /api/ideas`

**Query Parameters:**
- `action=random` - Get random ideas
  - `count` - Number of random ideas (default: 5)
- `action=stats` - Get database statistics
- `q` - Search query
- `category` - Filter by category
- `industry` - Filter by industry
- `revenueModel` - Filter by revenue model
- `limit` - Max results (default: 10)

**Examples:**
```bash
/api/ideas?action=random&count=3
/api/ideas?q=productivity
/api/ideas?category=SaaS&limit=20
/api/ideas?industry=Fintech
```

### `GET /api/ideas/[id]`

Get a single idea by ID.

---

## Next Steps

### Option 1: Start with Product Hunt (Recommended)
```bash
# 1. Get API key and add to .env.local
# 2. Run test scrape
npx ts-node scripts/scrapers/product-hunt-scraper.ts 50

# 3. Check results
npx ts-node scripts/db-stats.ts
```

### Option 2: Add More Sources

Create scrapers for:
- **G2/Capterra**: See `implementation_plan.md` for details
- **Micro-Acquisition sites**: MicroAcquire, Acquire.com, Flippa

### Option 3: Integrate with Evaluator

Enhance `/api/evaluate-en` to:
1. Fetch similar ideas from database
2. Compare user's idea against real examples
3. Provide competitive context

---

## Troubleshooting

**Error: PRODUCT_HUNT_API_KEY not found**
- Add your API key to `.env.local`

**Error: Prisma Client not generated**
```bash
npx prisma generate
```

**Error: Database not found**
```bash
npx prisma migrate dev
```

---

## File Structure

```
/Users/ali/Documents/ideas/one/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── dev.db                 # SQLite database
│   └── migrations/            # Migration history
├── scripts/
│   ├── scrapers/
│   │   └── product-hunt-scraper.ts
│   └── db-stats.ts
├── lib/
│   └── idea-database.ts       # Database client
├── app/api/ideas/
│   ├── route.ts               # Main API
│   └── [id]/route.ts          # Single idea API
└── .env.local                 # Environment variables
```

---

## Cost & Rate Limits

- **Product Hunt API**: Free, 500 requests/hour
- **Database**: Free (SQLite)
- **Estimated time**: ~5 minutes for 100 products

---

Ready to scrape! 🚀
