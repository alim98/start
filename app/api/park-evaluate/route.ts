import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

interface ParkEvaluationRequest {
  companyName: string;
  teamSize: string;
  technicalTeam: string;
  productStage: string;
  marketSize: string;
  currentRevenue: string;
  monthlyUsers: string;
  cac: string;
  ltv: string;
  burnRate: string;
  ipStatus: string;
  traction: string;
  fundingRequest: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ParkEvaluationRequest = await request.json();

    if (!body.companyName || !body.fundingRequest) {
      return NextResponse.json(
        { error: 'نام شرکت و مبلغ درخواستی الزامی است' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `شما یک سیستم ارزیابی هوشمند برای صندوق پژوهش و فناوریهستید که درخواست‌های استارتاپ‌ها را برای دریافت بودجه/تسهیلات/سرمایه ارزیابی می‌کنید.

وظیفه شما:
1. ارزیابی جامع درخواست بر اساس معیارهای: تیم، محصول، بازار، مالی، KPIها
2. تصمیم‌گیری: آیا این شرکت باید بودجه بگیرد یا نه؟
3. ارائه پیشنهادات Counterfactual: اگر بودجه نگرفت، چه تغییراتی باید بدهد تا بگیرد؟

معیارهای ارزیابی:
- تیم: اندازه، تخصص فنی، تجربه
- محصول: مرحله توسعه، نوآوری، IP
- بازار: اندازه بازار، رقابت، پتانسیل رشد
- مالی: درآمد، burn rate، مدل درآمدی
- KPI: کاربران، CAC, LTV، traction

پیشنهادات Counterfactual باید:
- مشخص و قابل اجرا باشند
- تأثیر کمی داشته باشند (مثلاً "اگر CAC را 20% کاهش دهید")
- احتمال افزایش تأیید را نشان دهند
- بهبود امتیاز را نشان دهند

فقط به صورت JSON معتبر پاسخ دهید:
{
  "decision": "Approved" | "Conditional" | "Rejected",
  "overall_score": عدد بین 0 تا 10,
  "risk_level": "Low" | "Medium" | "High",
  "justification": "توضیح 3-4 جمله‌ای تصمیم به فارسی",
  "team_score": عدد بین 0 تا 10,
  "product_score": عدد بین 0 تا 10,
  "market_score": عدد بین 0 تا 10,
  "financial_score": عدد بین 0 تا 10,
  "kpi_score": عدد بین 0 تا 10,
  "counterfactuals": [
    {
      "action": "اقدام مشخص (مثلاً: اگر CAC را 20% کاهش دهید)",
      "impact": "تأثیر این تغییر (2-3 جمله)",
      "probability_increase": "افزایش احتمال تأیید (مثلاً: 35% بیشتر)",
      "score_improvement": "بهبود امتیاز (مثلاً: از 4 به 7)"
    }
  ],
  "recommendations": ["لیست", "توصیه‌های", "کلی", "به فارسی"]
}

همه پاسخ‌ها به فارسی باشند به جز decision و risk_level که می‌توانند انگلیسی باشند.`;

    const userPrompt = `این درخواست را ارزیابی کنید:

**نام شرکت:** ${body.companyName}
**تعداد اعضای تیم:** ${body.teamSize || 'نامشخص'}
**اعضای فنی:** ${body.technicalTeam || '0'}
**مرحله محصول:** ${body.productStage}
**اندازه بازار:** ${body.marketSize || 'نامشخص'}
**درآمد ماهانه:** ${body.currentRevenue || '0'}
**کاربران ماهانه:** ${body.monthlyUsers || '0'}
**CAC:** ${body.cac || 'نامشخص'}
**LTV:** ${body.ltv || 'نامشخص'}
**Burn Rate:** ${body.burnRate || 'نامشخص'}
**وضعیت IP:** ${body.ipStatus}
**Traction:** ${body.traction || 'ندارد'}
**مبلغ درخواستی:** ${body.fundingRequest}

ارزیابی کامل با پیشنهادات Counterfactual ارائه دهید.`;

    const completion = await client.chat.completions.create({
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

    const evaluation = JSON.parse(responseText);

    const requiredKeys = [
      'decision',
      'overall_score',
      'risk_level',
      'justification',
      'team_score',
      'product_score',
      'market_score',
      'financial_score',
      'kpi_score',
      'counterfactuals',
      'recommendations',
    ];

    for (const key of requiredKeys) {
      if (!(key in evaluation)) {
        throw new Error(`Missing required key: ${key}`);
      }
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Park evaluation error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to evaluate application. Please try again.' },
      { status: 500 }
    );
  }
}

