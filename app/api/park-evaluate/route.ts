import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';
import { checkUsageLimit, recordUsage } from '@/lib/usage-check';

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

// Rule-based evaluation function (no AI required)
function getRuleBasedEvaluation(body: ParkEvaluationRequest) {
  // Parse numeric values
  const teamSize = parseInt(body.teamSize) || 0;
  const technicalTeam = parseInt(body.technicalTeam) || 0;
  const currentRevenue = parseInt(body.currentRevenue?.replace(/[^0-9]/g, '')) || 0;
  const monthlyUsers = parseInt(body.monthlyUsers?.replace(/[^0-9]/g, '')) || 0;
  const fundingRequest = parseInt(body.fundingRequest?.replace(/[^0-9]/g, '')) || 0;

  // Calculate scores based on rules
  let teamScore = 3;
  if (teamSize >= 3) teamScore += 2;
  if (teamSize >= 5) teamScore += 2;
  if (technicalTeam >= 2) teamScore += 2;
  if (technicalTeam / teamSize >= 0.5) teamScore += 1;
  teamScore = Math.min(10, teamScore);

  let productScore = 3;
  if (body.productStage === 'MVP' || body.productStage === 'mvp') productScore += 2;
  if (body.productStage === 'محصول با کاربر' || body.productStage === 'Product') productScore += 4;
  if (body.productStage === 'محصول با درآمد' || body.productStage === 'Revenue') productScore += 5;
  if (body.ipStatus === 'ثبت شده' || body.ipStatus === 'Registered') productScore += 2;
  productScore = Math.min(10, productScore);

  let marketScore = 4;
  if (body.marketSize === 'بزرگ' || body.marketSize?.toLowerCase()?.includes('billion')) marketScore += 3;
  if (body.marketSize === 'متوسط' || body.marketSize?.toLowerCase()?.includes('million')) marketScore += 2;
  if (monthlyUsers >= 100) marketScore += 1;
  if (monthlyUsers >= 1000) marketScore += 2;
  marketScore = Math.min(10, marketScore);

  let financialScore = 3;
  if (currentRevenue > 0) financialScore += 3;
  if (currentRevenue >= 10000000) financialScore += 2; // 10 million Tomans
  if (currentRevenue >= 100000000) financialScore += 2; // 100 million Tomans
  financialScore = Math.min(10, financialScore);

  let kpiScore = 3;
  if (monthlyUsers >= 100) kpiScore += 2;
  if (monthlyUsers >= 1000) kpiScore += 2;
  if (body.traction && body.traction !== 'ندارد') kpiScore += 2;
  if (body.ltv && body.cac) {
    const ltv = parseInt(body.ltv.replace(/[^0-9]/g, '')) || 0;
    const cac = parseInt(body.cac.replace(/[^0-9]/g, '')) || 1;
    if (ltv / cac >= 3) kpiScore += 1;
  }
  kpiScore = Math.min(10, kpiScore);

  // Overall score (weighted average)
  const overallScore = Math.round(
    (teamScore * 0.2 + productScore * 0.25 + marketScore * 0.2 + financialScore * 0.2 + kpiScore * 0.15) * 10
  ) / 10;

  // Decision based on overall score
  let decision: 'Approved' | 'Conditional' | 'Rejected';
  let riskLevel: 'Low' | 'Medium' | 'High';

  if (overallScore >= 7) {
    decision = 'Approved';
    riskLevel = 'Low';
  } else if (overallScore >= 5) {
    decision = 'Conditional';
    riskLevel = 'Medium';
  } else {
    decision = 'Rejected';
    riskLevel = 'High';
  }

  // Generate counterfactuals based on weak points
  const counterfactuals = [];

  if (teamScore < 7) {
    counterfactuals.push({
      action: 'افزایش تعداد اعضای فنی تیم به حداقل ۳ نفر',
      impact: 'تیم فنی قوی‌تر اعتماد سرمایه‌گذاران را جلب می‌کند و امکان توسعه سریع‌تر محصول را فراهم می‌کند.',
      probability_increase: '25% بیشتر',
      score_improvement: `از ${teamScore} به ${Math.min(10, teamScore + 2)}`
    });
  }

  if (productScore < 7) {
    counterfactuals.push({
      action: 'ثبت مالکیت فکری (IP) و رساندن محصول به مرحله MVP با کاربر واقعی',
      impact: 'محصول با IP ثبت شده ریسک کپی‌برداری را کاهش می‌دهد و ارزش شرکت را افزایش می‌دهد.',
      probability_increase: '30% بیشتر',
      score_improvement: `از ${productScore} به ${Math.min(10, productScore + 3)}`
    });
  }

  if (financialScore < 6) {
    counterfactuals.push({
      action: 'ایجاد درآمد ماهانه حداقل ۱۰ میلیون تومان',
      impact: 'درآمدزایی اثبات می‌کند که مدل کسب‌وکار کار می‌کند و تقاضا برای محصول وجود دارد.',
      probability_increase: '40% بیشتر',
      score_improvement: `از ${financialScore} به ${Math.min(10, financialScore + 3)}`
    });
  }

  if (kpiScore < 6) {
    counterfactuals.push({
      action: 'رساندن کاربران ماهانه فعال به ۱۰۰۰ نفر و بهبود نسبت LTV/CAC به ۳ یا بالاتر',
      impact: 'KPIهای قوی نشان‌دهنده تناسب محصول-بازار و کارایی بازاریابی است.',
      probability_increase: '35% بیشتر',
      score_improvement: `از ${kpiScore} به ${Math.min(10, kpiScore + 2)}`
    });
  }

  // Generate recommendations
  const recommendations = [];
  if (teamScore < 7) recommendations.push('تقویت تیم فنی با استخدام نیروهای متخصص');
  if (productScore < 7) recommendations.push('ثبت مالکیت فکری و تکمیل MVP');
  if (marketScore < 7) recommendations.push('تحقیق بازار دقیق‌تر و تعیین اندازه بازار');
  if (financialScore < 7) recommendations.push('تمرکز بر ایجاد درآمد پایدار');
  if (kpiScore < 7) recommendations.push('بهبود KPIهای کلیدی و tracking دقیق');
  if (recommendations.length === 0) {
    recommendations.push('ادامه مسیر فعلی با تمرکز بر رشد');
  }

  // Generate justification
  let justification = `ارزیابی ${body.companyName} بر اساس قوانین و معیارهای صندوق انجام شد. `;
  if (decision === 'Approved') {
    justification += `امتیاز کلی ${overallScore} از ۱۰ نشان‌دهنده آمادگی مناسب برای دریافت تسهیلات است. `;
  } else if (decision === 'Conditional') {
    justification += `امتیاز کلی ${overallScore} از ۱۰ نشان‌دهنده نیاز به بهبود در برخی حوزه‌هاست. `;
  } else {
    justification += `امتیاز کلی ${overallScore} از ۱۰ نشان‌دهنده عدم آمادگی کافی برای دریافت تسهیلات است. `;
  }
  justification += `قوی‌ترین حوزه: ${getStrongestArea(teamScore, productScore, marketScore, financialScore, kpiScore)}. `;
  justification += `ضعیف‌ترین حوزه: ${getWeakestArea(teamScore, productScore, marketScore, financialScore, kpiScore)}.`;

  return {
    decision,
    overall_score: overallScore,
    risk_level: riskLevel,
    justification,
    team_score: teamScore,
    product_score: productScore,
    market_score: marketScore,
    financial_score: financialScore,
    kpi_score: kpiScore,
    counterfactuals: counterfactuals.slice(0, 3), // Max 3 counterfactuals
    recommendations,
    is_rule_based: true, // Flag to indicate this is rule-based evaluation
    message: '⚠️ این ارزیابی بر اساس قوانین و بدون هوش مصنوعی انجام شده است (سهمیه روزانه تمام شده).'
  };
}

function getStrongestArea(team: number, product: number, market: number, financial: number, kpi: number): string {
  const scores = { 'تیم': team, 'محصول': product, 'بازار': market, 'مالی': financial, 'KPI': kpi };
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function getWeakestArea(team: number, product: number, market: number, financial: number, kpi: number): string {
  const scores = { 'تیم': team, 'محصول': product, 'بازار': market, 'مالی': financial, 'KPI': kpi };
  return Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];
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

    // Check usage limit
    const usageCheck = await checkUsageLimit();

    // If quota exhausted, return rule-based evaluation
    if (!usageCheck.allowed) {
      console.log('Quota exhausted, returning rule-based evaluation');
      const ruleBasedResult = getRuleBasedEvaluation(body);
      return NextResponse.json(ruleBasedResult);
    }

    if (!process.env.GROQ_API_KEY) {
      // Fallback to rule-based if no API key
      const ruleBasedResult = getRuleBasedEvaluation(body);
      return NextResponse.json(ruleBasedResult);
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

    try {
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

      // Record usage only for successful AI calls
      await recordUsage();

      return NextResponse.json({
        ...evaluation,
        is_rule_based: false
      });
    } catch (aiError) {
      // If AI fails, fallback to rule-based
      console.error('AI evaluation failed, falling back to rule-based:', aiError);
      const ruleBasedResult = getRuleBasedEvaluation(body);
      return NextResponse.json({
        ...ruleBasedResult,
        message: '⚠️ ارزیابی هوش مصنوعی با خطا مواجه شد. ارزیابی قاعده‌محور ارائه شده است.'
      });
    }
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
