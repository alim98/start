import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { getAppMode, getAppConfig } from '@/lib/app-config';
import { getCurrentUser } from '@/lib/auth';
import { hasAppAccess } from '@/lib/users';
import PortalUserStatus from '@/components/PortalUserStatus';

export default async function Portal() {
  const mode = getAppMode();
  const config = getAppConfig(mode);

  // If not in portal mode, redirect to the default route for this app
  if (!config.showPortal) {
    redirect(config.defaultRoute);
  }

  // Get current user to filter apps
  const user = await getCurrentUser();

  const allApps = [
    {
      id: 'eval-fa',
      appMode: 'fa',
      title: 'ارزیاب هوشمند ایده',
      subtitle: 'نسخه فارسی',
      description: 'تحلیل دقیق ایده استارتاپی شما با هوش مصنوعی، مخصوص بازار ایران.',
      href: '/fa',
      icon: '🧠',
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      tag: '🇮🇷 Persian'
    },
    {
      id: 'eval-en',
      appMode: 'en',
      title: 'AI Startup Evaluator',
      subtitle: 'English Version',
      description: 'Global market analysis and scoring for your startup idea.',
      href: '/en',
      icon: '🚀',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      tag: '🇬🇧 Global'
    },
    {
      id: 'park-fa',
      appMode: 'park',
      title: 'دمو صندوق فناوری',
      subtitle: 'کمیته سرمایه‌گذاری',
      description: 'شبیه‌سازی جلسه دفاع در برابر داوران پارک علم و فناوری.',
      href: '/park-demo',
      icon: '🏢',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      tag: '🇮🇷 صندوق'
    }
  ];

  // Filter apps based on user access
  const apps = user
    ? allApps.filter(app => hasAppAccess(user, app.appMode))
    : allApps; // Show all if no user (shouldn't happen if auth is required)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100" dir="rtl">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <Toaster position="top-center" />

      <main className="container mx-auto px-4 py-16 md:py-24 relative z-10">

        {/* User Status with Tokens and Logout */}
        <PortalUserStatus />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 animate-fade-in-down">
          <div className="inline-block p-3 rounded-2xl bg-white shadow-xl mb-6 transform hover:rotate-3 transition-transform duration-300">
            <span className="text-5xl">🦄</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">Startup</span> Intelligence Suite
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            مجموعه ابزارهای هوشمند برای ارزیابی، تحلیل و جذب سرمایه استارتاپ‌ها
            <span className="block mt-2 opacity-75 text-base">Select your tool to begin</span>
          </p>
        </div>

        {/* Grid */}
        <div className={`grid ${apps.length === 1 ? 'md:grid-cols-1 max-w-md' : apps.length <= 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-2 max-w-5xl'} gap-6 md:gap-8 mx-auto`}>
          {apps.map((app, idx) => (
            <Link
              key={app.id}
              href={app.href}
              className="group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden hover:-translate-y-2 flex flex-col"
            >
              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-${app.color}-50 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {app.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-${app.color}-50 text-${app.color}-700`}>
                  {app.tag}
                </span>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-indigo-900 transition-colors">
                  {app.title}
                </h3>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {app.subtitle}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="mt-8 relative z-10 flex items-center text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                <span>ورود به سامانه</span>
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {apps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">شما به هیچ سامانه‌ای دسترسی ندارید.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-24 text-slate-400 text-sm">
          <p>© 2025 AI Startup Evaluator. Powered by Gemini & Groq.</p>
        </div>

      </main>
    </div>
  );
}
