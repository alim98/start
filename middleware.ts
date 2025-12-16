import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// App mode configuration (duplicated for edge runtime compatibility)
type AppMode = 'en' | 'fa' | 'park' | 'all';

function getAppMode(): AppMode {
    const mode = process.env.NEXT_PUBLIC_APP_MODE || process.env.APP_MODE || 'all';
    if (['en', 'fa', 'park', 'all'].includes(mode)) {
        return mode as AppMode;
    }
    return 'all';
}

function getAllowedRoutes(mode: AppMode): string[] | 'all' {
    switch (mode) {
        case 'en':
            return [
                '/', '/en',
                '/api/evaluate-en', '/api/generate-idea-en', '/api/premium-report-en',
                '/api/generate-pitch-deck', '/api/capture-email',
                '/_next', '/favicon.ico'
            ];
        case 'fa':
            return [
                '/', '/fa', '/pricing',
                '/api/evaluate', '/api/generate-idea', '/api/premium-report',
                '/api/price-idea', '/api/generate-pitch-deck-fa', '/api/capture-email',
                '/_next', '/favicon.ico'
            ];
        case 'park':
            return [
                '/', '/park-demo', '/park-demo-en',
                '/api/park-evaluate', '/api/capture-email',
                '/_next', '/favicon.ico'
            ];
        case 'all':
        default:
            return 'all';
    }
}

export function middleware(request: NextRequest) {
    const mode = getAppMode();
    const allowedRoutes = getAllowedRoutes(mode);

    // If all routes are allowed, skip middleware
    if (allowedRoutes === 'all') {
        return NextResponse.next();
    }

    const pathname = request.nextUrl.pathname;

    // Check if the current path is allowed
    const isAllowed = allowedRoutes.some(route => {
        if (route === pathname) return true;
        if (pathname.startsWith(route + '/')) return true;
        if (pathname.startsWith('/_next')) return true;
        return false;
    });

    if (!isAllowed) {
        // Redirect to the default route for this mode
        const defaultRoutes: Record<AppMode, string> = {
            'en': '/en',
            'fa': '/fa',
            'park': '/park-demo',
            'all': '/'
        };

        const url = request.nextUrl.clone();
        url.pathname = defaultRoutes[mode];
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
