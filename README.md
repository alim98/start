# AI Startup Idea Evaluator (Iran-focused)

A brutally honest AI-powered startup idea evaluation tool focused on the Iranian market with global insights.

## Features

- **Single-page evaluation flow**: Describe your idea, get instant analysis
- **Iran-specific insights**: Market potential, sanctions risks, local payment solutions
- **Global perspective**: International market analysis and differentiation
- **Technical feasibility**: Realistic budget ranges and complexity assessment
- **Risk analysis**: Concrete dealbreakers and regulatory challenges
- **Email capture**: Collect leads for future premium reports

## Tech Stack

- **Frontend**: Next.js 16 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **LLM**: Groq (Llama 3.3 70B) - faster & cheaper than OpenAI
- **Data Storage**: JSON file (MVP), ready to migrate to PostgreSQL/SQLite

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Groq API key:
   ```
   GROQ_API_KEY=gsk_...
   ```
   
   Get your free API key from: https://console.groq.com/keys

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app
  /api
    /evaluate        # Main LLM evaluation endpoint
    /capture-email   # Email capture for leads
  page.tsx           # Main form & results page
/components
  EmailCaptureModal.tsx  # Email collection modal
/data                # Local JSON storage (gitignored)
```

## Evaluation Criteria

The AI evaluates ideas based on:

1. **Market Potential (Iran)**: Population, purchasing power, existing solutions
2. **Market Potential (Global)**: Competition, differentiation, scalability
3. **Technical Feasibility**: Complexity, required skills, infrastructure needs
4. **Regulatory Risks**: Sanctions (Stripe/AWS access), payment gateways, government interference
5. **Budget Reality**: MVP cost estimates in EUR and IRR
6. **Competitive Analysis**: Similar startups, moats, differentiation

## Monetization Roadmap

### Phase 1 (Current - MVP)
- Free evaluations with basic summary
- Email capture for lead generation
- Manual "contact on Telegram" for detailed reports

### Phase 2 (After validation)
- Gate detailed 3-page reports behind paywall
- Integrate Iran payment gateway (Zarinpal or IDPay)
- Generate PDF reports with roadmaps & breakdowns

### Phase 3 (Scale)
- Pricing packages (evaluate 3 ideas for price of 2)
- Add consultation calls
- Iran-specific benchmarking data

## Iran-Specific Features

The system considers:
- **Sanctions**: API access restrictions (Stripe, AWS, international services)
- **Payment Solutions**: Local gateways like Zarinpal, IDPay
- **Infrastructure**: Hosting limitations, VPN usage patterns
- **Marketing**: Telegram-first approach for Iranian market
- **Currency**: Budget estimates in both EUR and IRR (~60,000 IRR/EUR)

## Deployment

### Vercel (Recommended)

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Deploy to Vercel:
   - Connect your GitHub repo at [vercel.com](https://vercel.com)
   - Add environment variable: `GROQ_API_KEY`
   - Deploy

### Alternative (VPS)

```bash
npm run build
npm run start
```

Run behind nginx or use PM2 for process management.

## Data Storage

Currently using simple JSON file storage at `/data/emails.json`.

To migrate to database:

1. Install Prisma or pg:
   ```bash
   npm install @prisma/client
   npx prisma init
   ```

2. Update `/app/api/capture-email/route.ts` to use database instead of file

3. Create schema:
   ```prisma
   model EmailCapture {
     id        Int      @id @default(autoincrement())
     email     String
     idea      String
     verdict   String?
     timestamp DateTime @default(now())
   }
   ```

## Next Steps

- [ ] Test with real users and gather feedback
- [ ] Refine LLM prompts based on output quality
- [ ] Add analytics (PostHog, Plausible, or simple logging)
- [ ] Integrate payment gateway (after seeing demand)
- [ ] Build detailed report generation
- [ ] Add Persian/Farsi language support
- [ ] Create admin dashboard to view captured emails

## License

MIT

## Notes

This is an MVP built for speed. The goal is to validate demand before adding complexity:
- Start with free usage to build audience
- Capture emails for future monetization
- Iterate on prompts to improve evaluation quality
- Add payment only after seeing real traction

Remember: **Traffic first, then payment integration.**

