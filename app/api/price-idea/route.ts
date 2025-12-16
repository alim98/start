import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';
import { checkUsageLimit, recordUsage } from '@/lib/usage-check';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }


    const systemPrompt = `You are a professional startup valuation expert with deep knowledge of global startup markets.

# IMPORTANT DISCLAIMER
**Since accurate Iranian startup benchmark data is NOT available, this valuation is based on GLOBAL MARKET STANDARDS and comparable international startups.**

# Valuation Method: Comparable Company Analysis + Market Multiples

## Your Task:
Provide a realistic global market valuation in USD for the startup idea.

## Steps:
1. **Identify 3-5 similar global startups** with real valuations
2. **Extract their valuations** in USD
3. **Adjust for stage:** Idea=1-3%, Prototype=5-10%, MVP=10-20%, Product=20-40% of mature valuation
4. **Adjust for market size and traction**
5. **Calculate final USD valuation**

## Critical Rules:
- ALL monetary values MUST be in USD (e.g., "$500,000", "$2M", "$50K")
- Be realistic and conservative
- Use actual comparable startup valuations
- Explain methodology clearly
- Include disclaimer about global market pricing

## JSON Format (ALL TEXT IN PERSIAN except monetary values in USD):
{
  "estimated_value_usd": "$XXX,XXX",
  "disclaimer": "⚠️ توجه: به دلیل عدم وجود بنچمارک دقیق استارتاپ‌های ایرانی، این ارزش‌گذاری بر اساس استانداردهای بازار جهانی و استارتاپ‌های مشابه بین‌المللی محاسبه شده است.",
  "valuation_breakdown": {
    "market_size_score": 0-10,
    "innovation_score": 0-10,
    "execution_difficulty": 0-10,
    "revenue_potential_score": 0-10,
    "competitive_advantage_score": 0-10,
    "scalability_score": 0-10
  },
  "revenue_projection": {
    "year_1": "$XX,XXX",
    "year_3": "$XXX,XXX",
    "explanation": "توضیح به فارسی"
  },
  "competitor_analysis": {
    "direct_competitors": ["رقیب ۱", "رقیب ۲"],
    "indirect_competitors": ["رقیب غیرمستقیم"],
    "competitive_advantage": "مزیت رقابتی به فارسی",
    "market_share_potential": "پتانسیل سهم بازار"
  },
  "scalability_analysis": {
    "score": 0-10,
    "reasoning": "دلیل به فارسی",
    "scaling_challenges": "چالش‌های رشد"
  },
  "reasoning": "تحلیل کامل به فارسی - توضیح دهید چرا این ارزش‌گذاری منطقی است",
  "comparable_startups": ["Startup 1 ($2M)", "Startup 2 ($5M)"],
  "risk_adjusted_value": "$XXX,XXX",
  "investment_recommendation": "توصیه سرمایه‌گذاری به فارسی",
  "valuation_range": {
    "min_usd": "$XXX,XXX",
    "max_usd": "$XXX,XXX"
  }
}

All text in Persian, all monetary values in USD.`;


    const userPrompt = `ایده: ${body.idea}

مشخصات:
- مرحله: ${body.stage}
- پروتوتایپ: ${body.hasPrototype}
- مشتری: ${body.hasCustomers}
- تعداد تیم: ${body.teamSize}
- درآمد ماهانه: ${body.monthlyRevenue}
- بازار هدف: ${body.targetMarket}

یک ارزش‌گذاری کامل و واقع‌گرایانه برای این ایده ارائه دهید.`;

    console.log('Pricing idea...');

    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    const pricingData = JSON.parse(responseText);

    // Validate response
    const required = [
      'estimated_value_usd',
      'valuation_breakdown',
      'reasoning',
      'comparable_startups',
      'risk_adjusted_value',
      'investment_recommendation',
    ];

    for (const key of required) {
      if (!(key in pricingData)) {
        throw new Error(`Missing required key: ${key}`);
      }
    }

    // Add valuation_range if not present
    if (!pricingData.valuation_range) {
      // Extract number from USD value (e.g., "$500,000" or "$2M")
      const usdValue = pricingData.estimated_value_usd;
      let baseUSD = 500000; // default

      if (usdValue.includes('M')) {
        const match = usdValue.match(/([\d.]+)M/);
        if (match) baseUSD = parseFloat(match[1]) * 1000000;
      } else if (usdValue.includes('K')) {
        const match = usdValue.match(/([\d.]+)K/);
        if (match) baseUSD = parseFloat(match[1]) * 1000;
      } else {
        const match = usdValue.match(/([\d,]+)/);
        if (match) baseUSD = parseInt(match[1].replace(/,/g, ''));
      }

      pricingData.valuation_range = {
        min_usd: `$${Math.floor(baseUSD * 0.7).toLocaleString()}`,
        max_usd: `$${Math.floor(baseUSD * 1.5).toLocaleString()}`,
      };
    }

    console.log('Pricing completed');

    return NextResponse.json(pricingData);
  } catch (error: any) {
    console.error('Pricing error:', error);

    // Check if it's a rate limit error (multiple ways to detect)
    const isRateLimit =
      error?.status === 429 ||
      error?.code === 'rate_limit_exceeded' ||
      (error?.message && error.message.includes('Rate limit')) ||
      (error?.message && error.message.includes('429'));

    if (isRateLimit) {
      // Extract wait time from error message
      let waitMinutes = 'چند';
      const timeMatch = error?.message?.match(/try again in (\d+)m/i);
      if (timeMatch) {
        waitMinutes = timeMatch[1];
      }

      // Extract usage info from error message
      let usageInfo = '';
      const usedMatch = error?.message?.match(/Used (\d+)/);
      const limitMatch = error?.message?.match(/Limit (\d+)/);
      if (usedMatch && limitMatch) {
        const used = parseInt(usedMatch[1]);
        const limit = parseInt(limitMatch[1]);
        const percentage = Math.round((used / limit) * 100);
        usageInfo = `\n\n📊 استفاده شده: ${used.toLocaleString('fa-IR')} از ${limit.toLocaleString('fa-IR')} توکن (${percentage}%)`;
      }

      return NextResponse.json(
        {
          error: `⏳ محدودیت استفاده رایگان!\n\nمیزان استفاده رایگان روزانه شما به پایان رسیده است.${usageInfo}\n\n⏰ لطفاً ${waitMinutes} دقیقه دیگر صبر کنید و مجدداً تلاش کنید.\n\n💡 راهکار: می‌توانید یک API Key جدید از console.groq.com دریافت کنید.`
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در قیمت‌گذاری. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
