// Simple test API to check database connection
import { NextResponse } from 'next/server';

export async function GET() {
    // Database is disabled
    return NextResponse.json({
        success: false,
        error: 'Database is currently disabled',
        count: 0,
        ideas: [],
        message: 'Configure DATABASE_URL and re-enable Prisma to use database features'
    });
}
