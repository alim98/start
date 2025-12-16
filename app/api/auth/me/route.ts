import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUsageCount, getRemainingUsage } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }

        const usedToday = await getUsageCount(user.username);
        const remaining = await getRemainingUsage(user);

        return NextResponse.json({
            authenticated: true,
            user: {
                username: user.username,
                name: user.name,
                dailyLimit: user.dailyLimit,
                usedToday,
                remaining,
            },
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { authenticated: false, error: 'خطا در بررسی وضعیت' },
            { status: 500 }
        );
    }
}
