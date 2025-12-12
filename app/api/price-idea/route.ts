import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `شما یک سرمایه‌گذار و ارزیاب حرفه‌ای استارتاپ هستید.

# روش قیمت‌گذاری: Comparable Company Analysis

**وظیفه:** ارزش ایده را بر اساس استارتاپ‌های مشابه واقعی که ارزش‌گذاری شده‌اند تخمین بزن.

## مراحل:
1. **شناسایی ۳-۵ استارتاپ مشابه** که ارزش‌گذاری واقعی دارند (ایرانی یا جهانی)
2. **استخراج ارزش آنها** به دلار
3. **تعدیل بر اساس مرحله:** ایده=1%، MVP=5%، محصول=15% از ارزش رشد یافته
4. **تعدیل بر اساس بازار:** ایران=10-30% بازار جهانی
5. **محاسبه نهایی به دلار**
6. **تبدیل به تومان:** دلار × 119,000

## قوانین مهم:
- از دانش خودت درباره ارزش‌گذاری استارتاپ‌های واقعی استفاده کن
- اول قیمت دلاری بده، بعد تومانی
- واقع‌بین باش - استارتاپ‌های ایرانی خیلی کمتر از مشابه جهانی ارزش دارند
- حتماً نام استارتاپ‌های مشابه و ارزش واقعی آنها را ذکر کن

## فرمت JSON:
{
  "estimated_value_usd": "$XXX,XXX",
  "estimated_value_irr": "X میلیارد تومان",
  "valuation_breakdown": {
    "market_size_score": 0-10,
    "innovation_score": 0-10,
    "execution_difficulty": 0-10,
    "revenue_potential_score": 0-10,
    "competitive_advantage_score": 0-10,
    "scalability_score": 0-10
  },
  "comparable_companies": [
    {"name": "نام", "valuation": "ارزش دلاری", "stage": "مرحله", "similarity": "شباهت"}
  ],
  "valuation_methodology": "توضیح کامل: از کدام شرکت‌ها مقایسه کردی، چه ضرایبی زدی، چرا این عدد",
  "revenue_projection": {
    "year_1": "درآمد سال اول",
    "year_3": "درآمد سال سوم", 
    "explanation": "چطور محاسبه کردی"
  },
  "competitor_analysis": {
    "direct_competitors": ["رقیب ۱", "رقیب ۲"],
    "indirect_competitors": ["رقیب غیرمستقیم"],
    "competitive_advantage": "مزیت این ایده",
    "market_share_potential": "پتانسیل سهم بازار"
  },
  "scalability_analysis": {
    "score": 0-10,
    "reasoning": "دلیل",
    "scaling_challenges": "چالش‌ها"
  },
  "reasoning": "تحلیل کامل",
  "comparable_startups": ["استارتاپ ۱ - $X", "استارتاپ ۲ - $X"],
  "risk_adjusted_value": "ارزش با ریسک به تومان",
  "investment_recommendation": "توصیه",
  "valuation_range": {
    "min_usd": "$XXX,XXX",
    "max_usd": "$XXX,XXX",
    "min_irr": "X تومان",
    "max_irr": "X تومان"
  }
}

نرخ تبدیل: 1 دلار = 119,000 تومان
همه متن‌ها فارسی باشد.`;

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

    const completion = await client.chat.completions.create({
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
      'estimated_value_irr',
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
      // Extract numbers from estimated values and create range
      const irrMatch = pricingData.estimated_value_irr.match(/(\d+)/);
      const baseIRR = irrMatch ? parseInt(irrMatch[1]) : 100;
      
      pricingData.valuation_range = {
        min_irr: `${Math.floor(baseIRR * 0.7)} میلیون تومان`,
        max_irr: `${Math.floor(baseIRR * 1.5)} میلیون تومان`,
        min_usd: `$${Math.floor((baseIRR * 0.7) / 60)}K`,
        max_usd: `$${Math.floor((baseIRR * 1.5) / 60)}K`,
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
