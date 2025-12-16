import { cookies } from 'next/headers';
import { User, findUser, hasAppAccess } from './users';

const SESSION_COOKIE = 'user_session';
const USAGE_PREFIX = 'usage_';

// Simple session data structure
export interface SessionData {
    username: string;
    allowedApps: string[];
    loginTime: number;
    expiresAt: number;
}

// Create a session token (simple base64 encoding - use JWT in production)
export function createSessionToken(username: string, allowedApps: string[]): string {
    const session: SessionData = {
        username,
        allowedApps,
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

// Usage tracking using database (persists across server restarts)
import { prisma } from './idea-database';

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function getUsageCount(username: string): Promise<number> {
    const today = getTodayDate();

    try {
        const usage = await prisma.dailyUsage.findUnique({
            where: {
                username_date: {
                    username,
                    date: today,
                },
            },
        });

        return usage?.count || 0;
    } catch (error) {
        console.error('Error getting usage count:', error);
        return 0;
    }
}

export async function incrementUsage(username: string): Promise<number> {
    const today = getTodayDate();

    try {
        const usage = await prisma.dailyUsage.upsert({
            where: {
                username_date: {
                    username,
                    date: today,
                },
            },
            create: {
                username,
                date: today,
                count: 1,
            },
            update: {
                count: { increment: 1 },
            },
        });

        return usage.count;
    } catch (error) {
        console.error('Error incrementing usage:', error);
        return 0;
    }
}

export async function getRemainingUsage(user: User): Promise<number> {
    const used = await getUsageCount(user.username);
    return Math.max(0, user.dailyLimit - used);
}

export async function canUseService(user: User): Promise<boolean> {
    const remaining = await getRemainingUsage(user);
    return remaining > 0;
}
