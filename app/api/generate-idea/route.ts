import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

interface GenerateIdeaRequest {
  mode: 'creative' | 'random';
  baseIdea?: string;
  targetMarket: string;
  skills?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateIdeaRequest = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (body.mode === 'creative') {
      // Generate a more creative version of the existing idea
      systemPrompt = `شما یک مشاور خلاق استارتاپ هستید که در ایجاد نسخه‌های بهبود یافته و خلاقانه‌تر از ایده‌های موجود تخصص دارید.

وظیفه شما: دریافت یک ایده استارتاپ و ایجاد نسخه‌ای خلاقانه‌تر، منحصربه‌فردتر و عملی‌تر از آن.

پاسخ باید در فرمت JSON زیر باشد:
{
  "title": "عنوان جدید و جذاب به فارسی",
  "description": "توضیحات کامل ایده بهبود یافته به فارسی (200-300 کلمه). باید شامل: مشکل اصلی، راه‌حل خلاقانه، کاربران هدف، تمایز کلیدی، و چرایی منحصربه‌فرد بودن آن باشد."
}

قوانین:
- ایده جدید باید مرتبط با ایده اصلی باشد اما خلاقانه‌تر و عملی‌تر
- تمرکز بر بازار ${body.targetMarket}
- افزودن ویژگی‌های منحصربه‌فرد که رقبا ندارند
- در نظر گرفتن زیرساخت و محدودیت‌های ایران
- استفاده از فناوری‌های نوین اما عملی
- همه متن‌ها باید به فارسی باشند`;

      userPrompt = `ایده اصلی:
${body.baseIdea}

بازار هدف: ${body.targetMarket}

یک نسخه خلاقانه‌تر و منحصربه‌فردتر از این ایده بساز که در بازار ${body.targetMarket} موفق‌تر خواهد بود.`;

    } else {
      // Generate a completely random idea
      const iranMarkets = [
        'آموزش آنلاین',
        'خدمات مالی دیجیتال',
        'فروشگاه‌های آنلاین',
        'خدمات درمانی از راه دور',
        'توریسم و گردشگری',
        'املاک و مستغلات',
        'حمل و نقل هوشمند',
        'کشاورزی دیجیتال',
        'سرگرمی و رسانه',
        'خدمات خانگی',
        'ورزش و سلامت',
        'مد و فشن',
        'صنایع دستی و هنر',
        'تکنولوژی و نرم‌افزار',
        'غذا و رستوران',
      ];

      const skillsContext = body.skills === 'Tech' 
        ? 'با تمرکز بر راه‌حل‌های فناوری و نرم‌افزاری'
        : body.skills === 'Biz'
        ? 'با تمرکز بر مدل‌های کسب‌وکار و بازاریابی'
        : 'که برای افراد بدون مهارت فنی قابل اجرا باشد';

      systemPrompt = `شما یک مولد ایده خلاق استارتاپ برای بازار ایران هستید.

وظیفه: ساخت یک ایده استارتاپ کاملا جدید و خلاقانه.

پاسخ باید در فرمت JSON زیر باشد:
{
  "title": "عنوان جذاب و حرفه‌ای به فارسی",
  "description": "توضیحات کامل ایده به فارسی (200-300 کلمه). شامل: مشکل واقعی، راه‌حل نوآورانه، کاربران هدف، مدل درآمدزایی، و تمایز نسبت به رقبا."
}

قوانین:
- ایده باید واقعی، عملی و قابل اجرا در ایران باشد
- در نظر گرفتن محدودیت‌های تحریم، زیرساخت و فرهنگ ایران
- تمرکز بر مشکلات واقعی مردم ایران
- استفاده از فناوری‌های موجود و در دسترس
- مدل کسب‌وکار روشن و عملی
- همه متن‌ها باید به فارسی باشند`;

      userPrompt = `یک ایده استارتاپ خلاقانه و عملی برای بازار ${body.targetMarket} بساز ${skillsContext}.

زمینه‌های پیشنهادی: ${iranMarkets.join('، ')}

ایده باید منحصربه‌فرد، عملی و برای ایران مناسب باشد.`;
    }

    console.log('Generating idea with mode:', body.mode);

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9, // Higher temperature for more creative ideas
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    const ideaData = JSON.parse(responseText);

    if (!ideaData.title || !ideaData.description) {
      throw new Error('Invalid response format');
    }

    console.log('Generated idea:', ideaData.title);

    return NextResponse.json(ideaData);
  } catch (error) {
    console.error('Idea generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate idea' },
      { status: 500 }
    );
  }
}
