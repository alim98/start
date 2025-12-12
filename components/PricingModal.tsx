import React from 'react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlan: (plan: string) => void;
    lang?: 'en' | 'fa';
}

export default function PricingModal({ isOpen, onClose, onSelectPlan, lang = 'en' }: PricingModalProps) {
    if (!isOpen) return null;

    const content = {
        en: {
            title: 'Choose Your Plan',
            subtitle: 'Unlock professional features and detailed reports',
            plans: [
                {
                    name: 'Starter',
                    price: 'Free',
                    features: ['Basic Analysis', 'Web Radar Chart', 'Limited Access'],
                    cta: 'Current Plan',
                    active: false,
                    color: 'bg-slate-100'
                },
                {
                    name: 'Pro Founder',
                    price: '$29',
                    features: ['Deep Market Analysis', 'PDF Export (Pitch Deck + Report)', 'Competitor Intel', 'Acquirer Intelligence'],
                    cta: 'Upgrade Now',
                    active: true,
                    color: 'bg-slate-900 text-white'
                },
                {
                    name: 'VC / Angel',
                    price: '$99',
                    features: ['Everything in Pro', 'Unlimited Evaluations', 'API Access', 'White-label Reports'],
                    cta: 'Contact Sales',
                    active: false,
                    color: 'bg-slate-100'
                }
            ]
        },
        fa: {
            title: 'انتخاب طرح',
            subtitle: 'برای دسترسی به امکانات حرفه‌ای و گزارش کامل',
            plans: [
                {
                    name: 'رایگان',
                    price: '۰ تومان',
                    features: ['تحلیل اولیه', 'نمودار راداری', 'دسترسی محدود'],
                    cta: 'طرح فعلی',
                    active: false,
                    color: 'bg-slate-100'
                },
                {
                    name: 'حرفه‌ای',
                    price: '۲۹۰,۰۰۰ تومان',
                    features: ['تحلیل عمیق بازار', 'خروجی PDF (پیچ‌دک + گزارش)', 'هوش مصنوعی رقبا', 'پیشنهاد خریداران احتمالی'],
                    cta: 'ارتقا دهید',
                    active: true,
                    color: 'bg-slate-900 text-white'
                },
                {
                    name: 'سازمانی',
                    price: 'تماس بگیرید',
                    features: ['تمام امکانات حرفه‌ای', 'ارزیابی نامحدود', 'دسترسی API', 'گزارش بدون لوگو'],
                    cta: 'تماس با فروش',
                    active: false,
                    color: 'bg-slate-100'
                }
            ]
        }
    };

    const t = content[lang];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                <div className="p-8 text-center border-b border-slate-100">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{t.title}</h2>
                    <p className="text-slate-500">{t.subtitle}</p>
                    <button
                        onClick={onClose}
                        className={`absolute top-6 ${lang === 'fa' ? 'left-6' : 'right-6'} p-2 rounded-full hover:bg-slate-100 transition-colors`}
                    >
                        ✕
                    </button>
                </div>

                <div className="p-8 bg-slate-50">
                    <div className="grid md:grid-cols-3 gap-6">
                        {t.plans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`rounded-2xl p-6 border transition-all hover:scale-105 duration-200 ${plan.active ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                {plan.active && (
                                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 text-center bg-indigo-50 py-1 rounded-full">Most Popular</div>
                                )}
                                <h3 className="text-xl font-bold text-center mb-1">{plan.name}</h3>
                                <div className="text-3xl font-black text-center mb-6">{plan.price}</div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-2 text-sm">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-slate-600 font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => plan.active ? onSelectPlan(plan.name) : null}
                                    className={`w-full py-3 rounded-xl font-bold transition-transform active:scale-95 ${plan.active ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
