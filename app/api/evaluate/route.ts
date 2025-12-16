import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';
import { checkUsageLimit, recordUsage } from '@/lib/usage-check';
import { prisma } from '@/lib/idea-database';

interface EvaluationRequest {
  title: string;
  description: string;
  targetMarket: string;
  skills: string;
  budgetRange: string;
  timeHorizon: string;
}

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

    const body: EvaluationRequest = await request.json();

    console.log('Received evaluation request:', {
      title: body.title,
      descriptionLength: body.description?.length,
      targetMarket: body.targetMarket,
    });

    if (!body.description || body.description.trim().length < 10) {
      console.log('Validation failed: description too short');
      return NextResponse.json(
        { error: 'Description is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Build the system prompt with Iran-specific context
    const systemPrompt = `شما یک مشاور خبره استارتاپ هستید که در بازارهای فناوری ایران و جهان تخصص دارید.

شما دانش عمیقی در زمینه‌های زیر دارید:
- پویایی‌های بازار ایران، زیرساخت‌ها و رفتار مصرف‌کننده
- تحریم‌ها، محدودیت‌های قانونی و راه‌حل‌ها (درگاه‌های پرداخت، هاستینگ، APIها)
- اکوسیستم فناوری ایران: بازاریابی تلگرام‌محور، راه‌حل‌های پرداخت محلی (زرین‌پال، آیدی‌پی)، استفاده از VPN
- فرصت‌های بازار جهانی و تقاطع آنها با توانایی‌های ایران
- امکان‌سنجی فنی برای توسعه‌دهندگان انفرادی در مقابل تیمی
- محدوده‌های بودجه واقعی برای MVPها و محصولات مرحله اولیه

ایده‌های استارتاپ را با صداقت کامل ارزیابی کنید. بدون تشویق جعلی. اگر ایده‌ای مشتق‌شده، ضعیف یا با موانع غیرقابل حل مواجه است، مستقیماً بگویید.

فقط به صورت JSON معتبر پاسخ دهید با این کلیدهای دقیق:
{
  "verdict": "Garbage" | "Maybe" | "Promising",
  "market_iran": "تحلیل 2-3 جمله‌ای از پتانسیل بازار ایران به فارسی",
  "market_global": "تحلیل 2-3 جمله‌ای از پتانسیل بازار جهانی به فارسی",
  "feasibility": "2-3 جمله درباره پیچیدگی فنی و نیازمندی‌های تیمی به فارسی",
  "budget_range_eur": "محدوده تخمینی بودجه MVP به یورو (مثلاً '<€1k', '€1k-5k', '€5k-20k', '>€20k')",
  "budget_range_IRR": "معادل تقریبی به تومان ایران (از نرخ تقریبی 60,000 تومان به ازای هر یورو استفاده کنید)",
  "regulatory_risk": "2-3 جمله درباره ریسک‌های خاص ایران: تحریم‌ها، دسترسی به API، پردازش پرداخت، دخالت دولت - به فارسی",
  "risks": ["آرایه", "از", "3-5", "مورد", "خاص", "موانع اصلی", "یا", "ریسک‌های عمده", "به فارسی"],
  "justification": "2-3 جمله توضیح حکم نهایی به فارسی",
  "score_breakdown": {
     "market": 75,
     "technical": 60,
     "differentiation": 40,
     "viability": 55
  },
  "score": 65,
  "potentialAcquirers": [
    {
      "name": "نام شرکت (مثلاً اسنپ، دیجی‌کالا)",
      "reason": "دلیل اینکه چرا این شرکت خریدار این استارتاپ خواهد بود (یک جمله فارسی)"
    },
    {
      "name": "نام شرکت",
      "reason": "دلیل (یک جمله فارسی)"
    },
    {
      "name": "نام شرکت",
      "reason": "دلیل (یک جمله فارسی)"
    }
  ],
  "similarStartups": [
    {
      "name": "نام استارتاپ مشابه موفق",
      "tagline": "یک خط توضیح درباره آن استارتاپ",
      "category": "دسته‌بندی (مثلاً فین‌تک، ایکامرس)",
      "revenueModel": "مدل درآمدی (مثلاً SaaS، کمیسیون)",
      "funding": "میزان سرمایه جذب شده (اختیاری)",
      "website": "آدرس وب‌سایت (اختیاری)"
    }
  ],
  "detectedCategory": "دسته‌بندی تشخیص داده شده ایده (مثلاً فین‌تک، ایکامرس، سلامت)"
}

معیارهای کلیدی ارزیابی:
1. پتانسیل بازار در ایران (جمعیت، قدرت خرید، راه‌حل‌های موجود)
2. پتانسیل بازار جهانی (رقابت، تمایز، مقیاس‌پذیری)
3. امکان‌سنجی فنی (پیچیدگی، مهارت‌های مورد نیاز، زیرساخت)
4. موانع خاص ایران (تحریم‌های API مانند Stripe/AWS، درگاه‌های پرداخت، هاستینگ)
5. بررسی واقعیت بودجه (هزینه MVP، زمان لازم)
6. چشم‌انداز رقابتی (راه‌حل‌های موجود، موانع ورود، تمایز)

مشخص باشید. به استارتاپ‌های مشابه که وجود دارند اشاره کنید. تمایز ضعیف را مشخص کنید. موانع قانونی خاص را شناسایی کنید. چاپلوسی نکنید.

همه پاسخ‌ها باید به فارسی باشند به جز فیلد verdict که می‌تواند انگلیسی باشد.`;

    const userPrompt = `این ایده استارتاپ را ارزیابی کنید:

**عنوان:** ${body.title || 'بدون عنوان'}
**توضیحات:** ${body.description}
**بازار هدف:** ${body.targetMarket}
**مهارت‌های بنیان‌گذار:** ${body.skills}
**انتظار بودجه:** ${body.budgetRange}
**بازه زمانی:** ${body.timeHorizon}

یک ارزیابی بی‌رحمانه و واقع‌گرایانه مطابق با فرمت JSON مشخص شده ارائه دهید. همه پاسخ‌ها به فارسی باشند.`;

    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    console.log('Groq response received, parsing JSON...');
    const evaluation = JSON.parse(responseText);

    // Validate the response structure
    const requiredKeys = [
      'verdict',
      'market_iran',
      'market_global',
      'feasibility',
      'budget_range_eur',
      'budget_range_IRR',
      'regulatory_risk',
      'risks',
      'justification',
      'score_breakdown',
      'score',
      'potentialAcquirers'
    ];



    for (const key of requiredKeys) {
      if (!(key in evaluation)) {
        throw new Error(`Missing required key: ${key}`);
      }
    }

    console.log('Evaluation successful, returning result');

    // Save to Database (if available)
    if (prisma) {
      try {
        await prisma.userSubmission.create({
          data: {
            title: body.title || 'بدون عنوان',
            description: body.description,
            industry: body.skills,
            targetMarket: body.targetMarket,
            language: 'fa',
            score: evaluation.score || 50,
            verdict: evaluation.verdict,
            analysisJson: JSON.stringify(evaluation)
          }
        });
      } catch (err) {
        console.error('Failed to save Persian submission:', err);
      }
    }

    // Record usage
    await recordUsage();

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Evaluation error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to evaluate idea. Please try again.' },
      { status: 500 }
    );
  }
}
