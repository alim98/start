import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, hasAppAccess } from '@/lib/users';
import { createSessionToken, getUsageCount } from '@/lib/auth';
import { getAppMode } from '@/lib/app-config';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'نام کاربری و رمز عبور الزامی است' },
                { status: 400 }
            );
        }

        // Validate credentials
        const user = validateCredentials(username, password);
        if (!user) {
            return NextResponse.json(
                { error: 'نام کاربری یا رمز عبور اشتباه است' },
                { status: 401 }
            );
        }

        // Check app access
        const appMode = getAppMode();
        if (appMode !== 'all' && !hasAppAccess(user, appMode)) {
            return NextResponse.json(
                { error: 'شما به این سامانه دسترسی ندارید' },
                { status: 403 }
            );
        }

        // Create session with user's allowed apps
        const token = createSessionToken(username, user.allowedApps);
        const usageCount = getUsageCount(username);

        // Set cookie and respond
        const response = NextResponse.json({
            success: true,
            user: {
                username: user.username,
                name: user.name,
                dailyLimit: user.dailyLimit,
                usedToday: usageCount,
                remaining: user.dailyLimit - usageCount,
            },
        });

        // Set session cookie (24 hours)
        response.cookies.set('user_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'خطا در ورود به سیستم' },
            { status: 500 }
        );
    }
}
