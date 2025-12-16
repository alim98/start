import { cookies } from 'next/headers';
import { User, findUser, hasAppAccess } from './users';

const SESSION_COOKIE = 'user_session';
const USAGE_PREFIX = 'usage_';

// Simple session data structure
export interface SessionData {
    username: string;
    loginTime: number;
    expiresAt: number;
}

// Create a session token (simple base64 encoding - use JWT in production)
export function createSessionToken(username: string): string {
    const session: SessionData = {
        username,
        loginTime: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    return Buffer.from(JSON.stringify(session)).toString('base64');
}

// Parse session token
export function parseSessionToken(token: string): SessionData | null {
    try {
        const data = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        if (data.expiresAt > Date.now()) {
            return data;
        }
        return null; // Expired
    } catch {
        return null;
    }
}

// Get current user from session (for server components)
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie) return null;

    const session = parseSessionToken(sessionCookie.value);
    if (!session) return null;

    return findUser(session.username) || null;
}

// Check if user can access the current app mode
export async function canAccessApp(appMode: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    return hasAppAccess(user, appMode);
}

// Usage tracking using in-memory store (use Redis/DB in production)
const usageStore = new Map<string, { count: number; date: string }>();

export function getTodayKey(username: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${USAGE_PREFIX}${username}_${today}`;
}

export function getUsageCount(username: string): number {
    const key = getTodayKey(username);
    const usage = usageStore.get(key);
    if (!usage) return 0;

    // Check if it's still today
    const today = new Date().toISOString().split('T')[0];
    if (usage.date !== today) {
        usageStore.delete(key);
        return 0;
    }

    return usage.count;
}

export function incrementUsage(username: string): number {
    const key = getTodayKey(username);
    const today = new Date().toISOString().split('T')[0];
    const current = getUsageCount(username);

    usageStore.set(key, {
        count: current + 1,
        date: today,
    });

    return current + 1;
}

export function getRemainingUsage(user: User): number {
    const used = getUsageCount(user.username);
    return Math.max(0, user.dailyLimit - used);
}

export function canUseService(user: User): boolean {
    return getRemainingUsage(user) > 0;
}
