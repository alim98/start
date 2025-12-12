# Quick Start Guide

## 🚀 Get Running in 3 Steps

### 1. Add Your Groq API Key

Edit `.env.local` and add your Groq API key:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

Get your API key from: https://console.groq.com/keys

**Why Groq?** Faster inference (3-10x) and cheaper than OpenAI!

### 2. Start the Dev Server

```bash
npm run dev
```

### 3. Open Your Browser

Navigate to: http://localhost:3000

That's it! You should see the startup evaluator form.

## ✅ Test It Out

Try evaluating a test idea:

**Example Idea:**
> A Telegram bot that helps Iranians find and compare VPN services based on price, speed, and reliability. Users can subscribe to get daily deals and security tips.

**Expected Output:**
- Verdict: Maybe or Promising
- Iran Market: High (Telegram-first, real need)
- Global Market: Limited (very Iran-specific)
- Budget: < €1k (simple bot)
- Risks: Government blocking, VPN provider reliability, payment collection

## 📝 How It Works

1. User fills out the form with their startup idea
2. Frontend sends request to `/api/evaluate`
3. Backend calls OpenAI GPT-4o-mini with Iran-specific system prompt
4. LLM returns structured JSON with verdict + analysis
5. Frontend displays results in nice cards
6. After 2 seconds, email capture modal appears
7. Email is saved to `/data/emails.json`

## 🔧 Troubleshooting

### "Groq API key not configured"
- Make sure `.env.local` exists and has `GROQ_API_KEY=gsk_...`
- Restart the dev server after adding the key

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### TypeScript errors
```bash
npm run build
```
This will show any type errors.

## 📊 View Captured Emails

Emails are stored in `/data/emails.json` (created after first email capture).

```bash
cat data/emails.json
```

## 🚢 Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "AI Startup Evaluator MVP"
git remote add origin https://github.com/yourusername/startup-evaluator.git
git push -u origin main
```

2. Go to https://vercel.com and import your repo

3. Add environment variable:
   - Key: `GROQ_API_KEY`
   - Value: Your Groq API key

4. Deploy!

## 💡 Next Actions

After testing locally:

1. **Refine the prompt**: Test with various ideas and tweak the system prompt in `/app/api/evaluate/route.ts` for better results

2. **Add analytics**: Install Plausible or PostHog to track usage

3. **Get feedback**: Share with 5-10 people and see what they say

4. **Iterate**: Based on feedback, improve the evaluation quality

5. **Only then**: Add payment gateway if people actually want detailed reports

## 🎯 Remember

This is an MVP. Don't add features until you validate demand:
- ✅ Free usage first
- ✅ Collect emails 
- ✅ Test prompt quality
- ❌ Don't build payment until you have users asking for it
- ❌ Don't build admin dashboard until you have > 100 emails
- ❌ Don't add Persian language until users request it

**Ship → Learn → Iterate**
