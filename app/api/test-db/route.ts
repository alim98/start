// Simple test API to check database connection
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/idea-database';

export async function GET() {
    // If prisma is not available, return early
    if (!prisma) {
        return NextResponse.json({
            success: false,
            error: 'Database not configured (DATABASE_URL not set)',
            count: 0,
            ideas: []
        });
    }

    try {
        console.log('Testing database connection...');

        const count = await prisma.startupIdea.count();
        console.log(`Found ${count} ideas`);

        const ideas = await prisma.startupIdea.findMany({
            take: 3,
            select: {
                name: true,
                category: true,
                revenueModel: true
            }
        });

        return NextResponse.json({
            success: true,
            count,
            ideas
        });
    } catch (error: any) {
        console.error('Database error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
