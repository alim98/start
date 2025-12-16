import { cookies } from 'next/headers';
import { findUser, User } from './users';
import { incrementUsage, getUsageCount } from './auth';

// Parse session token
function parseSessionToken(token: string): { username: string } | null {
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

// Check if auth is required (enabled by default, can be disabled with REQUIRE_AUTH=false)
function isAuthRequired(): boolean {
    const authSetting = process.env.REQUIRE_AUTH || process.env.NEXT_PUBLIC_REQUIRE_AUTH;
    return authSetting !== 'false';
}

export interface UsageCheckResult {
    allowed: boolean;
    user: User | null;
    error?: string;
    remaining?: number;
}

// Check if user can make a request (for API routes)
export async function checkUsageLimit(): Promise<UsageCheckResult> {
    // If auth is not required, allow all
    if (!isAuthRequired()) {
        return { allowed: true, user: null };
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        return {
            allowed: false,
            user: null,
            error: 'لطفاً وارد سیستم شوید'
        };
    }

    const session = parseSessionToken(sessionCookie.value);
    if (!session) {
        return {
            allowed: false,
            user: null,
            error: 'نشست شما منقضی شده. لطفاً دوباره وارد شوید'
        };
    }

    const user = findUser(session.username);
    if (!user) {
        return {
            allowed: false,
            user: null,
            error: 'کاربر یافت نشد'
        };
    }

    const usedToday = await getUsageCount(user.username);
    const remaining = user.dailyLimit - usedToday;

    if (remaining <= 0) {
        return {
            allowed: false,
            user,
            error: `سقف استفاده روزانه شما (${user.dailyLimit} بار) تمام شده است. فردا دوباره تلاش کنید.`,
            remaining: 0
        };
    }

    return {
        allowed: true,
        user,
        remaining
    };
}

// Record usage after successful API call
export async function recordUsage(): Promise<void> {
    if (!isAuthRequired()) return;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) return;

    const session = parseSessionToken(sessionCookie.value);
    if (!session) return;

    await incrementUsage(session.username);
}
