'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ValuationResult {
  estimated_value_irr: string;
  estimated_value_usd: string;
  valuation_breakdown: {
    market_size_score: number;
    innovation_score: number;
    execution_difficulty: number;
    revenue_potential_score: number;
    competitive_advantage_score: number;
    scalability_score: number;
  };
  revenue_projection?: {
    year_1: string;
    year_3: string;
    explanation: string;
  };
  competitor_analysis?: {
    direct_competitors: string[];
    indirect_competitors: string[];
    competitive_advantage: string;
    market_share_potential: string;
  };
  scalability_analysis?: {
    score: number;
    reasoning: string;
    scaling_challenges: string;
  };
  reasoning: string;
  comparable_startups: string[];
  risk_adjusted_value: string;
  investment_recommendation: string;
  valuation_range: {
    min_irr: string;
    max_irr: string;
    min_usd: string;
    max_usd: string;
  };
}

export default function PricingPage() {
  const [formData, setFormData] = useState({
    idea: '',
    stage: 'ایده اولیه',
    hasPrototype: 'خیر',
    hasCustomers: 'خیر',
    teamSize: '1',
    monthlyRevenue: '0',
    targetMarket: 'ایران',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/price-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'خطا در قیمت‌گذاری');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBar = (score: number) => {
    const percentage = (score / 10) * 100;
    let colorClass = 'bg-red-500';
    if (score >= 8) colorClass = 'bg-green-500';
    else if (score >= 6) colorClass = 'bg-yellow-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  const formatPrice = (price: string) => {
    // Extract number and unit from string like "450 میلیون تومان" or "2 میلیارد تومان"
    const numberMatch = price.match(/([\d,\.]+)/);
    
    if (!numberMatch) return price;
    
    const number = numberMatch[1].replace(/,/g, '');
    const formatted = parseInt(number).toLocaleString('fa-IR');
    
    // Check if it has "تومان" already, if not add unit based on size
    if (price.includes('تومان')) {
      return price.replace(/([\d,\.]+)/, formatted);
    }
    
    // If no unit, determine based on number size
    const numValue = parseInt(number);
    if (numValue >= 1000) {
      return `${formatted} میلیارد تومان`;
    } else {
      return `${formatted} میلیون تومان`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50" dir="rtl">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-700 mb-4 inline-block">
            ← بازگشت به ارزیاب ایده
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            💰 قیمت‌گذاری هوش مصنوعی ایده
          </h1>
          <p className="text-lg text-slate-600">
            ارزش واقعی ایده استارتاپی خود را با هوش مصنوعی محاسبه کنید
          </p>
          <p className="text-sm text-slate-500 mt-2">
            تخمین ارزش بر اساس بازار، نوآوری، و پتانسیل درآمدزایی
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ایده استارتاپ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-right text-slate-900"
                placeholder="ایده خود را به طور کامل توضیح دهید. چه مشکلی را حل می‌کند؟ چه کسانی مشتری شما هستند؟ چگونه درآمد کسب می‌کنید؟"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  مرحله فعلی
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                >
                  <option value="ایده اولیه">ایده اولیه</option>
                  <option value="پروتوتایپ">پروتوتایپ آماده</option>
                  <option value="MVP">MVP راه‌اندازی شده</option>
                  <option value="محصول کامل">محصول کامل</option>
                  <option value="در حال رشد">در حال رشد (Growth)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  بازار هدف
                </label>
                <select
                  value={formData.targetMarket}
                  onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                >
                  <option value="ایران">ایران</option>
                  <option value="جهانی">جهانی</option>
                  <option value="منطقه خاورمیانه">منطقه خاورمیانه</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  پروتوتایپ دارید؟
                </label>
                <select
                  value={formData.hasPrototype}
                  onChange={(e) => setFormData({ ...formData, hasPrototype: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                >
                  <option value="خیر">خیر</option>
                  <option value="در حال ساخت">در حال ساخت</option>
                  <option value="بله">بله، آماده است</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  مشتری دارید؟
                </label>
                <select
                  value={formData.hasCustomers}
                  onChange={(e) => setFormData({ ...formData, hasCustomers: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                >
                  <option value="خیر">خیر</option>
                  <option value="کمتر از 10">کمتر از ۱۰ نفر</option>
                  <option value="10-100">۱۰ تا ۱۰۰ نفر</option>
                  <option value="100-1000">۱۰۰ تا ۱۰۰۰ نفر</option>
                  <option value="بیشتر از 1000">بیشتر از ۱۰۰۰ نفر</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  تعداد تیم
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                >
                  <option value="1">فقط خودم</option>
                  <option value="2-3">۲-۳ نفر</option>
                  <option value="4-10">۴-۱۰ نفر</option>
                  <option value="10+">بیشتر از ۱۰ نفر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  درآمد ماهانه (تومان)
                </label>
                <select
                  value={formData.monthlyRevenue}
                  onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900"
                >
                  <option value="0">هنوز درآمدی ندارم</option>
                  <option value="1-10">۱ تا ۱۰ میلیون</option>
                  <option value="10-50">۱۰ تا ۵۰ میلیون</option>
                  <option value="50-100">۵۰ تا ۱۰۰ میلیون</option>
                  <option value="100-500">۱۰۰ تا ۵۰۰ میلیون</option>
                  <option value="500+">بیشتر از ۵۰۰ میلیون</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.idea}
            className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '⏳ در حال محاسبه ارزش...' : '💎 قیمت‌گذاری ایده من'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8">
            <p className="font-semibold">خطا:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            {/* Main Valuation */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-8 text-center shadow-xl">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                <h2 className="text-sm font-semibold text-white">💎 ارزش تخمینی ایده شما</h2>
              </div>
              <div className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-lg">
                {formatPrice(result.estimated_value_irr)}
              </div>
              <div className="text-lg text-teal-100 font-medium">
                معادل {result.estimated_value_usd} دلار
              </div>
            </div>

            {/* Valuation Range */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span>محدوده ارزش‌گذاری</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg">
                  <p className="text-sm text-blue-100 mb-2 font-medium">🔽 حداقل ارزش</p>
                  <p className="text-3xl font-black text-white mb-1">{formatPrice(result.valuation_range.min_irr)}</p>
                  <p className="text-xs text-blue-100">{result.valuation_range.min_usd}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl shadow-lg">
                  <p className="text-sm text-green-100 mb-2 font-medium">🔼 حداکثر ارزش</p>
                  <p className="text-3xl font-black text-white mb-1">{formatPrice(result.valuation_range.max_irr)}</p>
                  <p className="text-xs text-green-100">{result.valuation_range.max_usd}</p>
                </div>
              </div>
            </div>

            {/* Breakdown Scores */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-slate-900 mb-4">🎯 تحلیل امتیازات</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">اندازه بازار</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(result.valuation_breakdown.market_size_score)}`}>
                      {result.valuation_breakdown.market_size_score}/10
                    </span>
                  </div>
                  {getScoreBar(result.valuation_breakdown.market_size_score)}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">نوآوری و خلاقیت</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(result.valuation_breakdown.innovation_score)}`}>
                      {result.valuation_breakdown.innovation_score}/10
                    </span>
                  </div>
                  {getScoreBar(result.valuation_breakdown.innovation_score)}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">پتانسیل درآمدزایی</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(result.valuation_breakdown.revenue_potential_score)}`}>
                      {result.valuation_breakdown.revenue_potential_score}/10
                    </span>
                  </div>
                  {getScoreBar(result.valuation_breakdown.revenue_potential_score)}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">مزیت رقابتی</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(result.valuation_breakdown.competitive_advantage_score)}`}>
                      {result.valuation_breakdown.competitive_advantage_score}/10
                    </span>
                  </div>
                  {getScoreBar(result.valuation_breakdown.competitive_advantage_score)}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">سختی اجرا (پایین‌تر بهتر)</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(10 - result.valuation_breakdown.execution_difficulty)}`}>
                      {result.valuation_breakdown.execution_difficulty}/10
                    </span>
                  </div>
                  {getScoreBar(result.valuation_breakdown.execution_difficulty)}
                </div>

                {result.valuation_breakdown.scalability_score && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">اسکیل‌پذیری (مقیاس‌پذیری)</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(result.valuation_breakdown.scalability_score)}`}>
                        {result.valuation_breakdown.scalability_score}/10
                      </span>
                    </div>
                    {getScoreBar(result.valuation_breakdown.scalability_score)}
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Projection */}
            {result.revenue_projection && (
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-5">
                <h3 className="font-semibold text-green-900 mb-3">💰 پیش‌بینی درآمد</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 mb-1">سال اول</p>
                    <p className="text-xl font-bold text-green-900">{result.revenue_projection.year_1}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 mb-1">سال سوم</p>
                    <p className="text-xl font-bold text-green-900">{result.revenue_projection.year_3}</p>
                  </div>
                </div>
                <p className="text-sm text-green-800">{result.revenue_projection.explanation}</p>
              </div>
            )}

            {/* Scalability Analysis */}
            {result.scalability_analysis && (
              <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-5">
                <h3 className="font-semibold text-blue-900 mb-3">📈 تحلیل اسکیل‌پذیری</h3>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-700">امتیاز اسکیل‌پذیری:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(result.scalability_analysis.score)}`}>
                      {result.scalability_analysis.score}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-blue-800 mb-3">{result.scalability_analysis.reasoning}</p>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">چالش‌های رشد:</p>
                  <p className="text-sm text-blue-900">{result.scalability_analysis.scaling_challenges}</p>
                </div>
              </div>
            )}

            {/* Competitor Analysis */}
            {result.competitor_analysis && (
              <div className="border-2 border-red-200 bg-red-50 rounded-lg p-5">
                <h3 className="font-semibold text-red-900 mb-3">⚔️ تحلیل رقابتی</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div className="bg-white p-3 rounded border border-red-200">
                    <p className="text-xs font-semibold text-red-600 mb-2">رقبای مستقیم:</p>
                    <ul className="space-y-1">
                      {result.competitor_analysis.direct_competitors.map((comp, idx) => (
                        <li key={idx} className="text-sm text-red-800">• {comp}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border border-red-200">
                    <p className="text-xs font-semibold text-red-600 mb-2">رقبای غیرمستقیم:</p>
                    <ul className="space-y-1">
                      {result.competitor_analysis.indirect_competitors.map((comp, idx) => (
                        <li key={idx} className="text-sm text-red-800">• {comp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-red-200 mb-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">مزیت رقابتی:</p>
                  <p className="text-sm text-red-900">{result.competitor_analysis.competitive_advantage}</p>
                </div>
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="text-xs font-semibold text-red-600 mb-1">پتانسیل سهم بازار:</p>
                  <p className="text-sm font-bold text-red-900">{result.competitor_analysis.market_share_potential}</p>
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-slate-900 mb-3">💡 تحلیل و استدلال</h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{result.reasoning}</p>
            </div>

            {/* Comparable Startups */}
            <div className="border border-purple-200 bg-purple-50 rounded-lg p-5">
              <h3 className="font-semibold text-purple-900 mb-3">🏢 استارتاپ‌های مشابه</h3>
              <ul className="space-y-2">
                {result.comparable_startups.map((startup, idx) => (
                  <li key={idx} className="text-sm text-purple-800 flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>{startup}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Adjusted Value */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-6">
              <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span>ارزش تعدیل‌شده با ریسک</span>
              </h3>
              <p className="text-4xl font-black text-orange-700 mb-3">{formatPrice(result.risk_adjusted_value)}</p>
              <p className="text-sm text-orange-800 leading-relaxed">این عدد ارزش واقعی‌تر ایده با در نظر گرفتن ریسک‌های اجرایی، بازار و رقابت است.</p>
            </div>

            {/* Investment Recommendation */}
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-5">
              <h3 className="font-semibold text-green-900 mb-3">🎯 توصیه سرمایه‌گذاری</h3>
              <p className="text-sm text-green-800 leading-relaxed">{result.investment_recommendation}</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-5">
              <p className="text-center text-sm text-slate-700">
                <span className="font-bold text-orange-700">⚠️ توجه:</span> این ارزش‌گذاری تخمینی است و بر اساس تحلیل هوش مصنوعی. 
                برای سرمایه‌گذاری واقعی حتماً با مشاورین مالی و ارزیاب‌های حرفه‌ای مشورت کنید.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
