import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';
import { checkUsageLimit, recordUsage } from '@/lib/usage-check';

export async function POST(request: NextRequest) {
  try {
    // Check usage limit
    const usageCheck = await checkUsageLimit();
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.error },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { idea, stage, hasPrototype, hasCustomers, teamSize, monthlyRevenue, targetMarket } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'لطفاً ایده خود را وارد کنید' },
        { status: 400 }
      );
    }

    const groq = getGroqClient();

    // STEP 1: Evaluate the idea first
    console.log('Step 1: Evaluating idea...');

    const evaluationPrompt = `You are a professional startup evaluator. Analyze this startup idea and give it a score out of 100.

Startup Idea: ${idea}

Details:
- Stage: ${stage}
- Has Prototype: ${hasPrototype}
- Has Customers: ${hasCustomers}
- Team Size: ${teamSize}
- Monthly Revenue: ${monthlyRevenue}
- Target Market: ${targetMarket}

Provide a detailed evaluation in JSON format:

{
  "overall_score": 0-100,
  "is_viable": true/false,
  "evaluation_summary": "Summary in Persian explaining the score",
  "strengths": ["Strength 1 in Persian", "Strength 2"],
  "weaknesses": ["Weakness 1 in Persian", "Weakness 2"],
  "recommendation": "Should this idea be priced? Explain in Persian"
}

CRITICAL: 
- Score below 60 = NOT viable for pricing
- Score 60-75 = Moderate potential
- Score 75+ = Strong potential
- Be honest and critical

Return ONLY valid JSON.`;

    const evalCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: evaluationPrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const evalContent = evalCompletion.choices[0]?.message?.content || '';
    let cleanedEvalContent = evalContent.trim();
    if (cleanedEvalContent.startsWith('```json')) {
      cleanedEvalContent = cleanedEvalContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedEvalContent.startsWith('```')) {
      cleanedEvalContent = cleanedEvalContent.replace(/```\n?/g, '');
    }

    const evaluation = JSON.parse(cleanedEvalContent);

    console.log(`Evaluation score: ${evaluation.overall_score}`);

    // If score is too low, return evaluation only (no pricing)
    if (evaluation.overall_score < 60) {
      await recordUsage();
      return NextResponse.json({
        not_ready_for_pricing: true,
        evaluation,
        message: 'این ایده هنوز آماده قیمت‌گذاری نیست. لطفاً ابتدا ایده خود را بهبود دهید.'
      });
    }

    // STEP 2: If viable, proceed with pricing
    console.log('Step 2: Idea is viable, proceeding with pricing...');

    const pricingPrompt = `You are a professional startup valuation expert with deep knowledge of global startup markets.

# IMPORTANT DISCLAIMER
**Since accurate Iranian startup benchmark data is NOT available, this valuation is based on GLOBAL MARKET STANDARDS and comparable international startups.**

# Context
This startup idea has been evaluated and scored ${evaluation.overall_score}/100, which indicates it has potential for valuation.

# Startup Details
Idea: ${idea}
Stage: ${stage}
Has Prototype: ${hasPrototype}
Has Customers: ${hasCustomers}
Team Size: ${teamSize}
Monthly Revenue: ${monthlyRevenue}
Target Market: ${targetMarket}

# Your Task
Provide a realistic global market valuation in USD.

## Steps:
1. **Identify 3-5 similar global startups** with real valuations
2. **Extract their valuations** in USD
3. **Adjust for stage:** Idea=1-3%, Prototype=5-10%, MVP=10-20%, Product=20-40% of mature valuation
4. **Adjust for market size and traction**
5. **Calculate final USD valuation**

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

CRITICAL: 
- ALL monetary values MUST be in USD
- Be realistic and conservative
- Use actual comparable startup valuations
- All text in Persian, all monetary values in USD

Return ONLY valid JSON.`;

    const pricingCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: pricingPrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 3000,
    });

    const pricingContent = pricingCompletion.choices[0]?.message?.content || '';
    let cleanedPricingContent = pricingContent.trim();
    if (cleanedPricingContent.startsWith('```json')) {
      cleanedPricingContent = cleanedPricingContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedPricingContent.startsWith('```')) {
      cleanedPricingContent = cleanedPricingContent.replace(/```\n?/g, '');
    }

    const pricingData = JSON.parse(cleanedPricingContent);

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
      const usdValue = pricingData.estimated_value_usd;
      let baseUSD = 500000;

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

    // Add evaluation info to the response
    pricingData.evaluation_score = evaluation.overall_score;
    pricingData.evaluation_summary = evaluation.evaluation_summary;

    console.log('Pricing completed successfully');

    // Record usage
    await recordUsage();

    return NextResponse.json(pricingData);
  } catch (error) {
    console.error('Pricing error:', error);
    return NextResponse.json(
      { error: 'خطا در قیمت‌گذاری. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
