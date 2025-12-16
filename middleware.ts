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

// Check if auth is required (enabled by default, can be disabled with REQUIRE_AUTH=false)
function isAuthRequired(): boolean {
    const authSetting = process.env.REQUIRE_AUTH || process.env.NEXT_PUBLIC_REQUIRE_AUTH;
    // Auth is required unless explicitly set to 'false'
    return authSetting !== 'false';
}

function getAllowedRoutes(mode: AppMode): string[] | 'all' {
    switch (mode) {
        case 'en':
            return [
                '/', '/en', '/login',
                '/api/auth', '/api/evaluate-en', '/api/generate-idea-en', '/api/premium-report-en',
                '/api/generate-pitch-deck', '/api/capture-email',
                '/_next', '/favicon.ico'
            ];
        case 'fa':
            return [
                '/', '/fa', '/pricing', '/login',
                '/api/auth', '/api/evaluate', '/api/generate-idea', '/api/premium-report',
                '/api/price-idea', '/api/generate-pitch-deck-fa', '/api/capture-email',
                '/_next', '/favicon.ico'
            ];
        case 'park':
            return [
                '/', '/park-demo', '/login',
                '/api/auth', '/api/park-evaluate', '/api/capture-email',
                '/_next', '/favicon.ico'
            ];
        case 'all':
        default:
            return 'all';
    }
}

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/_next', '/favicon.ico'];

// Parse session cookie (duplicated for edge runtime)
function parseSessionToken(token: string): { username: string; allowedApps: string[]; expiresAt: number } | null {
    try {
        const data = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        if (data.expiresAt > Date.now()) {
            return data;
        }
        return null;
    } catch {
        return null;
    }
}

// Detect which app mode a route belongs to
function getRouteAppMode(pathname: string): AppMode | null {
    if (pathname.startsWith('/en') || pathname.startsWith('/api/evaluate-en') ||
        pathname.startsWith('/api/generate-idea-en') || pathname.startsWith('/api/premium-report-en') ||
        pathname.startsWith('/api/generate-pitch-deck')) {
        return 'en';
    }
    if (pathname.startsWith('/fa') || pathname.startsWith('/pricing') ||
        pathname.startsWith('/api/evaluate') || pathname.startsWith('/api/generate-idea') ||
        pathname.startsWith('/api/premium-report') || pathname.startsWith('/api/price-idea') ||
        pathname.startsWith('/api/generate-pitch-deck-fa')) {
        return 'fa';
    }
    if (pathname.startsWith('/park-demo') || pathname.startsWith('/api/park-evaluate')) {
        return 'park';
    }
    // Portal, login, and common routes
    return null;
}

// Check if user has access to the current app mode
function userHasAppAccess(allowedApps: string[], appMode: AppMode | null): boolean {
    if (!appMode) return true; // Common routes (portal, login)
    if (allowedApps.includes('all')) return true;
    return allowedApps.includes(appMode);
}

export function middleware(request: NextRequest) {
    const mode = getAppMode();
    const allowedRoutes = getAllowedRoutes(mode);
    const pathname = request.nextUrl.pathname;
    const authRequired = isAuthRequired();

    // Skip static files
    if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
        return NextResponse.next();
    }

    // Check if route is allowed for this app mode
    if (allowedRoutes !== 'all') {
        const isAllowed = allowedRoutes.some(route => {
            if (route === pathname) return true;
            if (pathname.startsWith(route + '/')) return true;
            return false;
        });

        if (!isAllowed) {
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
    }

    // If auth is not required, allow all
    if (!authRequired) {
        return NextResponse.next();
    }

    // Check if this is a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('user_session');

    if (!sessionCookie) {
        // Redirect to login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Validate session
    const session = parseSessionToken(sessionCookie.value);
    if (!session) {
        // Invalid/expired session
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(url);
        // Clear invalid cookie
        response.cookies.delete('user_session');
        return response;
    }

    // Check if user has access to this specific route
    const routeAppMode = getRouteAppMode(pathname);
    if (!userHasAppAccess(session.allowedApps || [], routeAppMode)) {
        // User doesn't have access to this route
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('error', 'no_access');
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
