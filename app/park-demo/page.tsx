'use client';

import { useState, useEffect, useRef } from 'react';
import EmailCaptureModal from '@/components/EmailCaptureModal';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { evaluateWithFundMetrics, FundMetricsResult } from '@/lib/fund-metrics';

interface CounterfactualSuggestion {
  action: string;
  impact: string;
  probability_increase: string;
  score_improvement: string;
}

interface EvaluationResult {
  decision: 'Approved' | 'Conditional' | 'Rejected';
  overall_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  justification: string;
  team_score: number;
  product_score: number;
  market_score: number;
  financial_score: number;
  kpi_score: number;
  counterfactuals: CounterfactualSuggestion[];
  recommendations: string[];
}

const LOADING_MESSAGES = [
  'در حال اتصال به سامانه جامع صندوق...',
  'بررسی سوابق و اعتبارسنجی تیم...',
  'تحلیل داده‌های مالی و بازار...',
  'محاسبه ریسک سرمایه‌گذاری...',
  'تولید سناریوهای بهبود ...',
  'تدوین گزارش نهایی...',
];

export default function ParkDemo() {
  const [formData, setFormData] = useState({
    // اطلاعات شرکت
    companyName: '',
    companyType: 'private',
    yearsInMarket: '',
    teamSize: '',
    technicalTeam: '',

    // وضعیت محصول و فنی
    productStage: 'Idea',
    ipStatus: 'None',
    hasLicenses: 'some',
    techDependency: 'no',
    techEducation: 'related',

    // اطلاعات مالی
    salesTrend: 'stable',
    currentRevenue: '',
    retainedEarnings: '',
    currentRatio: '',
    debtRatio: 'moderate',
    receivablesDays: '',
    creditHistory: 'good',

    // کسب و کار
    marketSize: '',
    marketDemand: 'growing',
    competitionLevel: 'moderate',
    revenueModel: 'recurring',
    customerType: 'mixed',

    // قراردادی
    commitmentHistory: 'good',
    overdueContracts: 'none',
    outsourcingStatus: 'none',

    // سایر
    fundingRequest: '',
    traction: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [metricsResult, setMetricsResult] = useState<FundMetricsResult | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingMessageIndex(0);
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (metricsResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [metricsResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setMetricsResult(null);

    // Build metrics input
    const metricsInput = {
      companyName: formData.companyName,
      companyType: formData.companyType,
      yearsInMarket: formData.yearsInMarket,
      teamSize: parseInt(formData.teamSize) || 0,
      technicalTeam: parseInt(formData.technicalTeam) || 0,
      productStage: formData.productStage,
      ipStatus: formData.ipStatus,
      hasLicenses: formData.hasLicenses,
      techDependency: formData.techDependency,
      techEducation: formData.techEducation,
      salesTrend: formData.salesTrend,
      currentRevenue: formData.currentRevenue,
      retainedEarnings: formData.retainedEarnings,
      currentRatio: formData.currentRatio,
      debtRatio: formData.debtRatio,
      receivablesDays: formData.receivablesDays,
      creditHistory: formData.creditHistory,
      marketSize: formData.marketSize,
      marketDemand: formData.marketDemand,
      competitionLevel: formData.competitionLevel,
      revenueModel: formData.revenueModel,
      customerType: formData.customerType,
      commitmentHistory: formData.commitmentHistory,
      overdueContracts: formData.overdueContracts,
      outsourcingStatus: formData.outsourcingStatus,
      fundingRequest: formData.fundingRequest,
      traction: formData.traction,
    };

    const metrics = evaluateWithFundMetrics(metricsInput);
    setMetricsResult(metrics);

    try {
      const response = await fetch('/api/park-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('ارزیابی با خطا مواجه شد');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      toast.error('خطا در ارزیابی هوش مصنوعی');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          idea: `صندوق پژوهش و فناوری- ${formData.companyName}`,
          verdict: result?.decision,
        }),
      });
      setShowEmailModal(false);
      toast.success('گزارش کامل به ایمیل شما ارسال خواهد شد');
    } catch {
      toast.error('خطا در ثبت درخواست');
    }
  };

  const getDecisionStyles = (decision: string) => {
    if (decision === 'Approved') return { bg: 'bg-emerald-500', text: 'text-emerald-900', icon: '✅', label: 'تأیید شده' };
    if (decision === 'Conditional') return { bg: 'bg-amber-500', text: 'text-amber-900', icon: '⚠️', label: 'مشروط' };
    return { bg: 'bg-rose-500', text: 'text-rose-900', icon: '❌', label: 'رد شده' };
  };

  const getRiskStyles = (risk: string) => {
    if (risk === 'Low') return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'کم' };
    if (risk === 'Medium') return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'متوسط' };
    return { color: 'text-rose-600', bg: 'bg-rose-50', label: 'زیاد' };
  };

  const fillDemoData = () => {
    setFormData({
      companyName: 'فناوری نوین البرز',
      companyType: 'private',
      yearsInMarket: '4',
      teamSize: '8',
      technicalTeam: '5',
      productStage: 'MVP',
      ipStatus: 'Pending',
      hasLicenses: 'some',
      techDependency: 'no',
      techEducation: 'related',
      salesTrend: 'growing_high',
      currentRevenue: '120,000,000',
      retainedEarnings: '350,000,000',
      currentRatio: '1.8',
      debtRatio: 'moderate',
      receivablesDays: '45',
      creditHistory: 'good',
      marketSize: '500,000,000,000',
      marketDemand: 'growing',
      competitionLevel: 'moderate',
      revenueModel: 'recurring',
      customerType: 'mixed',
      commitmentHistory: 'good',
      overdueContracts: 'none',
      outsourcingStatus: 'partial',
      fundingRequest: '2,500,000,000',
      traction: 'قرارداد با ۳ شرکت صنعتی، برنده جایزه نوآوری ۱۴۰۲، تاییدیه فنی پارک علم و فناوری',
    });
    toast.success('اطلاعات نمونه بارگذاری شد');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 font-sans text-slate-900" dir="rtl">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 animate-fade-in-down">
          <div className="flex justify-center gap-3 mb-6">
            <Link href="/" className="text-xs md:text-sm bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
              <span>←</span> بازگشت به صفحه اصلی
            </Link>
            <Link href="/park-demo-en" className="text-xs md:text-sm bg-slate-50 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors font-medium flex items-center gap-2">
              🇬🇧 English Version
            </Link>
          </div>
          <div className="mb-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500">
            Powered by AradAI ™
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            سامانه ارزیابی هوشمند <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">صندوق پژوهش و فناوری</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ارزیابی دقیق بر اساس معیارهای رسمی صندوق (ماتریس AHP) + تحلیل هوش مصنوعی
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500"></div>

          <div className="flex justify-end mb-6">
            <button type="button" onClick={fillDemoData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all">
              <span>🎯</span>
              <span>پر کردن با داده نمونه</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Company Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                اطلاعات شرکت
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">نام شرکت / استارتاپ *</label>
                  <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="شرکت فناوری نوین البرز" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نوع شخصیت حقوقی</label>
                  <select value={formData.companyType} onChange={(e) => setFormData({ ...formData, companyType: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="private">سهامی خاص</option>
                    <option value="public">سهامی عام</option>
                    <option value="limited">مسئولیت محدود</option>
                    <option value="cooperative">تعاونی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">سابقه فعالیت (سال)</label>
                  <input type="number" value={formData.yearsInMarket} onChange={(e) => setFormData({ ...formData, yearsInMarket: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="3" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">تعداد اعضای تیم *</label>
                  <input type="number" value={formData.teamSize} onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="5" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">تعداد اعضای فنی</label>
                  <input type="number" value={formData.technicalTeam} onChange={(e) => setFormData({ ...formData, technicalTeam: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="3" />
                </div>
              </div>
            </div>

            {/* Section 2: Technical */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="bg-teal-100 text-teal-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                وضعیت فنی و محصول
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">مرحله محصول</label>
                  <select value={formData.productStage} onChange={(e) => setFormData({ ...formData, productStage: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Idea">ایده اولیه</option>
                    <option value="Prototype">نمونه اولیه</option>
                    <option value="MVP">MVP</option>
                    <option value="Beta">نسخه بتا</option>
                    <option value="Launched">ورود به بازار</option>
                    <option value="Scaling">در حال رشد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">وضعیت مالکیت فکری</label>
                  <select value={formData.ipStatus} onChange={(e) => setFormData({ ...formData, ipStatus: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="None">ندارم</option>
                    <option value="Pending">در حال ثبت</option>
                    <option value="Registered">ثبت شده</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">مجوزهای محصول و شرکت</label>
                  <select value={formData.hasLicenses} onChange={(e) => setFormData({ ...formData, hasLicenses: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="none">هیچ مجوزی ندارد</option>
                    <option value="some">برخی مجوزها اخذ شده</option>
                    <option value="all">کلیه مجوزها اخذ شده</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">آیا بخش فنی قائم به فرد است؟</label>
                  <select value={formData.techDependency} onChange={(e) => setFormData({ ...formData, techDependency: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="yes">بله، کاملاً وابسته به یک نفر</option>
                    <option value="partial">تا حدی</option>
                    <option value="no">خیر، سیستم‌محور است</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">دانش تخصصی تیم فنی</label>
                  <select value={formData.techEducation} onChange={(e) => setFormData({ ...formData, techEducation: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="none">ندارد</option>
                    <option value="unrelated">تحصیلات نامرتبط</option>
                    <option value="similar">تحصیلات مشابه</option>
                    <option value="related">تحصیلات مرتبط</option>
                    <option value="top_university">تحصیلات مرتبط از دانشگاه معتبر</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Financial */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                اطلاعات مالی و اقتصادی
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">روند فروش در ۳ سال اخیر</label>
                  <select value={formData.salesTrend} onChange={(e) => setFormData({ ...formData, salesTrend: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="declining">نزولی</option>
                    <option value="stable">تقریباً ثابت</option>
                    <option value="growing_low">صعودی کمتر از تورم</option>
                    <option value="growing_high">صعودی بیشتر از تورم</option>
                    <option value="growing_exceptional">صعودی چشم‌گیر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">درآمد ماهانه فعلی (تومان)</label>
                  <input type="text" value={formData.currentRevenue} onChange={(e) => setFormData({ ...formData, currentRevenue: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left" dir="ltr" placeholder="100,000,000" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">سود انباشته (تومان)</label>
                  <input type="text" value={formData.retainedEarnings} onChange={(e) => setFormData({ ...formData, retainedEarnings: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left" dir="ltr" placeholder="500,000,000" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نسبت بدهی</label>
                  <select value={formData.debtRatio} onChange={(e) => setFormData({ ...formData, debtRatio: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="low">کم (زیر ۳۰٪)</option>
                    <option value="moderate">متوسط (۳۰-۶۰٪)</option>
                    <option value="high">زیاد (بالای ۶۰٪)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">دوره وصول مطالبات (روز)</label>
                  <input type="number" value={formData.receivablesDays} onChange={(e) => setFormData({ ...formData, receivablesDays: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="60" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">سوابق اعتباری</label>
                  <select value={formData.creditHistory} onChange={(e) => setFormData({ ...formData, creditHistory: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="excellent">عالی (بدون چک برگشتی)</option>
                    <option value="good">خوب</option>
                    <option value="moderate">متوسط</option>
                    <option value="poor">ضعیف</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Business */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
                کسب و کار و بازار
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اندازه بازار هدف (تومان)</label>
                  <input type="text" value={formData.marketSize} onChange={(e) => setFormData({ ...formData, marketSize: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left" dir="ltr" placeholder="100,000,000,000" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">تقاضای بازار</label>
                  <select value={formData.marketDemand} onChange={(e) => setFormData({ ...formData, marketDemand: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="negative">تقاضای منفی</option>
                    <option value="zero">تقاضای صفر</option>
                    <option value="hidden">تقاضای پنهان</option>
                    <option value="declining">تقاضای کاهشی</option>
                    <option value="stable">تقاضای ثابت</option>
                    <option value="growing">تقاضای رو به رشد</option>
                    <option value="full">تقاضای کامل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">سطح رقابت در صنعت</label>
                  <select value={formData.competitionLevel} onChange={(e) => setFormData({ ...formData, competitionLevel: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="monopoly">انحصار کامل</option>
                    <option value="low">رقابت کم</option>
                    <option value="moderate">رقابت متوسط</option>
                    <option value="high">رقابت زیاد</option>
                    <option value="full">رقابت کامل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">مدل درآمدی</label>
                  <select value={formData.revenueModel} onChange={(e) => setFormData({ ...formData, revenueModel: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="none">هنوز مشخص نیست</option>
                    <option value="one_time">فروش یکباره</option>
                    <option value="recurring">اشتراکی / تکرارشونده</option>
                    <option value="multiple">چندگانه</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نوع مشتریان</label>
                  <select value={formData.customerType} onChange={(e) => setFormData({ ...formData, customerType: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="gov_bad">تک‌کارفرمایی دولتی با مشکل وصول</option>
                    <option value="gov_good">تک‌کارفرمایی دولتی خوش‌حساب</option>
                    <option value="mixed_bad">ترکیبی با مشکل وصول</option>
                    <option value="mixed">ترکیبی دولتی و خصوصی خوش‌حساب</option>
                    <option value="mixed_export">ترکیبی با صادرات</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Contractual */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
                سوابق قراردادی و تعهدات
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">سوابق عمل به تعهدات</label>
                  <select value={formData.commitmentHistory} onChange={(e) => setFormData({ ...formData, commitmentHistory: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="poor">شواهد نارضایتی مشتریان</option>
                    <option value="no_record">سابقه‌ای موجود نیست</option>
                    <option value="good">رضایت مشتریان</option>
                    <option value="excellent">حسن انجام کار دارد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">قراردادهای جاری تاریخ‌گذشته</label>
                  <select value={formData.overdueContracts} onChange={(e) => setFormData({ ...formData, overdueContracts: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="many">زیاد</option>
                    <option value="some">متوسط</option>
                    <option value="few">کم</option>
                    <option value="none">ندارد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">وضعیت برونسپاری</label>
                  <select value={formData.outsourcingStatus} onChange={(e) => setFormData({ ...formData, outsourcingStatus: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="core_monopoly">بخش‌های اصلی برونسپاری (پیمانکار انحصاری)</option>
                    <option value="core">بخش‌های اصلی برونسپاری</option>
                    <option value="partial_monopoly">بخش‌های فرعی برونسپاری (پیمانکار انحصاری)</option>
                    <option value="partial">بخش‌های فرعی برونسپاری</option>
                    <option value="none">فاقد برونسپاری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">مبلغ درخواستی (تومان) *</label>
                  <input type="text" value={formData.fundingRequest} onChange={(e) => setFormData({ ...formData, fundingRequest: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left" dir="ltr" placeholder="2,500,000,000" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">دستاوردها و قراردادهای کلیدی</label>
                  <textarea value={formData.traction} onChange={(e) => setFormData({ ...formData, traction: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none" placeholder="قراردادهای مهم، جوایز، تاییدیه‌ها، همکاری‌ها..." />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || !formData.companyName || !formData.fundingRequest} className="group relative w-full mt-6 px-6 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{LOADING_MESSAGES[loadingMessageIndex]}</span>
                  </>
                ) : (
                  <>
                    <span>📊</span>
                    <span>ارزیابی بر اساس معیارهای صندوق</span>
                  </>
                )}
              </span>
              {!loading && <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>}
            </button>
          </form>
        </div>

        {/* Rule-Based Metrics Section */}
        {metricsResult && (
          <div ref={resultRef} className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 md:p-10 text-white shadow-2xl mb-8 relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500 rounded-full blur-[120px] opacity-10 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-10 -ml-20 -mb-20"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📐</span>
                <div>
                  <h2 className="text-2xl font-bold">ارزیابی مبتنی بر معیارهای صندوق</h2>
                  <p className="text-indigo-200 text-sm">محاسبه شده بر اساس ماتریس AHP و وزن‌های رسمی (بدون هوش مصنوعی)</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-5xl font-black mb-2">{metricsResult.overallScore}</div>
                  <div className="text-indigo-200 text-sm font-medium">امتیاز کل از ۱۰</div>
                </div>
                <div className={`rounded-2xl p-6 text-center border border-white/10 ${metricsResult.decision === 'تایید' ? 'bg-emerald-500/20' :
                  metricsResult.decision === 'مشروط' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                  }`}>
                  <div className="text-3xl font-black mb-2">{metricsResult.decision}</div>
                  <div className="text-indigo-200 text-sm font-medium">تصمیم قانون‌مند</div>
                </div>
                <div className={`rounded-2xl p-6 text-center border border-white/10 ${metricsResult.riskLevel === 'کم' ? 'bg-emerald-500/20' :
                  metricsResult.riskLevel === 'متوسط' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                  }`}>
                  <div className="text-3xl font-black mb-2">{metricsResult.riskLevel}</div>
                  <div className="text-indigo-200 text-sm font-medium">سطح ریسک</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>📊</span> تفکیک امتیاز بر اساس شاخص‌های اکسل
                </h3>
                <div className="space-y-3">
                  {metricsResult.breakdown.map((item, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{item.persianName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-indigo-300 text-sm">وزن: {(item.weight * 100).toFixed(1)}٪</span>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{item.score}/10</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${item.score * 10}%` }}></div>
                      </div>
                      <p className="text-indigo-200 text-xs">{item.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🔐</span> تحلیل تضامین (مدل 5C)
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: 'شخصیت (Character)', data: metricsResult.guaranteeAnalysis.character },
                    { label: 'ظرفیت (Capacity)', data: metricsResult.guaranteeAnalysis.capacity },
                    { label: 'سرمایه (Capital)', data: metricsResult.guaranteeAnalysis.capital },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                      <div className="text-sm text-indigo-300 mb-1">{item.label}</div>
                      <div className="text-2xl font-black mb-1">{item.data.score}/10</div>
                      <div className="text-xs text-indigo-400">وزن: {(item.data.weight * 100).toFixed(0)}٪</div>
                      <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${item.data.status === 'تایید' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {item.data.status}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4 pt-4 border-t border-white/10">
                  <span className="text-indigo-300 text-sm">امتیاز تضامین: </span>
                  <span className="text-xl font-black">{metricsResult.guaranteeAnalysis.totalScore}/10</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Results */}
        {result && (
          <div className="animate-fade-in-up space-y-6 md:space-y-8">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              <div className={`p-8 md:p-10 bg-gradient-to-b ${getDecisionStyles(result.decision).bg}/10`}>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 text-center md:text-right">
                    <div className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">تحلیل هوش مصنوعی</div>
                    <h2 className={`text-4xl md:text-6xl font-black mb-6 flex items-center justify-center md:justify-start gap-4 ${getDecisionStyles(result.decision).text}`}>
                      {getDecisionStyles(result.decision).icon}
                      {getDecisionStyles(result.decision).label}
                    </h2>
                    <p className="text-lg text-slate-700 leading-relaxed font-medium bg-white/50 p-4 rounded-xl border border-dashed border-slate-300">
                      {result.justification}
                    </p>
                  </div>

                  <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto min-w-[300px]">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                      <div className="text-3xl font-black text-slate-800 mb-1">{result.overall_score}<span className="text-base text-slate-400 font-normal">/10</span></div>
                      <div className="text-xs font-bold text-slate-500">امتیاز AI</div>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm border ${getRiskStyles(result.risk_level).bg} border-transparent text-center flex flex-col justify-center`}>
                      <div className={`text-2xl font-black mb-1 ${getRiskStyles(result.risk_level).color}`}>{getRiskStyles(result.risk_level).label}</div>
                      <div className={`text-xs font-bold opacity-80 ${getRiskStyles(result.risk_level).color}`}>سطح ریسک</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {result.counterfactuals && result.counterfactuals.length > 0 && (
              <div className="bg-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">⚡ پیشنهادات </span>
                  </h3>
                  <div className="space-y-4">
                    {result.counterfactuals.map((cf, idx) => (
                      <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800 transition-colors">
                        <h4 className="font-bold text-white text-lg mb-1">{cf.action}</h4>
                        <p className="text-slate-400 text-sm mb-2">{cf.impact}</p>
                        <div className="flex gap-3">
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                            📈 +{cf.probability_increase}٪
                          </span>
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                            ⭐ +{cf.score_improvement}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-8 border-t border-slate-200">
              <button onClick={() => setShowEmailModal(true)} className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <span>📧</span>
                <span>دریافت PDF گزارش در ایمیل</span>
              </button>
            </div>
          </div>
        )}

        <EmailCaptureModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSubmit={handleEmailSubmit} />
      </div>
    </div>
  );
}
