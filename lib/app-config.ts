// App mode configuration
// Set APP_MODE environment variable to control which app is shown:
// - 'en': English Evaluator only
// - 'fa': Persian Evaluator + Pricing
// - 'park': Fund Demo (Persian only)
// - 'all' or undefined: Show all apps (portal mode)

export type AppMode = 'en' | 'fa' | 'park' | 'pricing' | 'all';

export function getAppMode(): AppMode {
    const mode = process.env.NEXT_PUBLIC_APP_MODE || process.env.APP_MODE || 'all';
    if (['en', 'fa', 'park', 'pricing', 'all'].includes(mode)) {
        return mode as AppMode;
    }
    return 'all';
}

export function getAppConfig(mode: AppMode) {
    switch (mode) {
        case 'en':
            return {
                name: 'AI Startup Evaluator',
                defaultRoute: '/en',
                allowedRoutes: ['/en', '/api/evaluate-en', '/api/generate-idea-en', '/api/premium-report-en', '/api/generate-pitch-deck', '/api/capture-email'],
                showPortal: false,
            };
        case 'fa':
            return {
                name: 'ارزیاب هوشمند ایده',
                defaultRoute: '/fa',
                allowedRoutes: ['/fa', '/pricing', '/api/evaluate', '/api/generate-idea', '/api/premium-report', '/api/price-idea', '/api/generate-pitch-deck-fa', '/api/capture-email'],
                showPortal: false,
            };
        case 'park':
            return {
                name: 'دمو صندوق فناوری',
                defaultRoute: '/park-demo',
                allowedRoutes: ['/park-demo', '/api/park-evaluate', '/api/capture-email'],
                showPortal: false,
            };
        case 'pricing':
            return {
                name: 'قیمت‌گذاری هوشمند',
                defaultRoute: '/pricing',
                allowedRoutes: ['/pricing', '/api/price-idea', '/api/capture-email'],
                showPortal: false,
            };
        case 'all':
        default:
            return {
                name: 'Startup Intelligence Suite',
                defaultRoute: '/',
                allowedRoutes: 'all',
                showPortal: true,
            };
    }
}
