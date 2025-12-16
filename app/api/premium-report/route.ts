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

    const systemPrompt = `شما یک مشاور استراتژیک استارتاپ با تخصص در بازار ایران هستید.

وظیفه: ارائه گزارش تفصیلی شامل:
1. قدم‌های قبل از شروع (مجوزها، تحقیقات بازار، امور قانونی، آماده‌سازی)
2. نقشه راه کامل با مراحل دقیق، تیم مورد نیاز، و بودجه‌بندی

فرمت پاسخ JSON:
{
  "pre_launch_steps": [
    "قدم اول با جزئیات کامل",
    "قدم دوم با جزئیات کامل",
    ...
  ],
  "roadmap": [
    {
      "phase": "نام مرحله",
      "duration": "مدت زمان (مثلا: 2-3 ماه)",
      "tasks": ["وظیفه 1", "وظیفه 2", ...],
      "team_needed": ["نقش 1", "نقش 2", ...],
      "budget": "محدوده بودجه (تومان و یورو)"
    },
    ...
  ]
}

قوانین مهم:
- حداقل 8-10 قدم قبل از شروع
- حداقل 5-6 مرحله در نقشه راه
- هر مرحله 4-8 وظیفه مشخص
- تیم‌های واقعی و عملی (مثل: توسعه‌دهنده فرانت‌اند، مدیر محصول، بازاریاب دیجیتال)
- بودجه واقعی بر اساس نرخ‌های ایران
- در نظر گرفتن محدودیت‌های قانونی ایران (مجوزها، تحریم‌ها)
- جزئیات عملیاتی و دقیق
- همه متن‌ها به فارسی

برای قدم‌های قبل از شروع شامل:
- تحقیقات بازار و رقبایابی
- اخذ مجوزهای لازم (اتحادیه، سازمان صنعت، eNamad، وزارت ارشاد در صورت نیاز)
- مشاوره حقوقی و مالیاتی
- تهیه طرح کسب‌وکار (Business Plan)
- آزمون فرضیات اولیه
- تعیین مدل درآمدی
- شناسایی تأمین‌کنندگان و شرکا
- محاسبه سرمایه اولیه

برای نقشه راه شامل مراحل:
- تحقیق و اعتبارسنجی (Validation)
- طراحی و پروتوتایپ
- توسعه MVP
- آزمایش بتا
- راه‌اندازی عمومی
- رشد و مقیاس‌پذیری`;

    const userPrompt = `ایده: ${body.idea}
عنوان: ${body.title || 'ندارد'}
بازار هدف: ${body.targetMarket}
مهارت‌ها: ${body.skills}
بودجه پیش‌بینی: ${body.budgetRange}
بازه زمانی: ${body.timeHorizon}

یک گزارش تفصیلی و عملی برای اجرای این ایده ارائه دهید.`;

    console.log('Generating premium report...');

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

    const premiumData = JSON.parse(responseText);

    // Validate response structure
    if (!premiumData.pre_launch_steps || !Array.isArray(premiumData.pre_launch_steps)) {
      throw new Error('Invalid pre_launch_steps format');
    }

    if (!premiumData.roadmap || !Array.isArray(premiumData.roadmap)) {
      throw new Error('Invalid roadmap format');
    }

    console.log('Premium report generated successfully');

    return NextResponse.json(premiumData);
  } catch (error) {
    console.error('Premium report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate premium report' },
      { status: 500 }
    );
  }
}
