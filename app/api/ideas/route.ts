import { NextRequest, NextResponse } from 'next/server';
import { getSimilarIdeas, searchIdeas, getRandomIdeas, getIdeaById, getStats } from '@/lib/idea-database';

/**
 * GET /api/ideas
 * Query params:
 * - category: filter by category
 * - industry: filter by industry
 * - revenueModel: filter by revenue model
 * - limit: number of results (default: 10)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');

        // Get stats
        if (action === 'stats') {
            const stats = await getStats();
            return NextResponse.json(stats);
        }

        // Get random ideas
        if (action === 'random') {
            const count = parseInt(searchParams.get('count') || '5');
            const ideas = await getRandomIdeas(count);
            return NextResponse.json(ideas);
        }

        // Search ideas
        const query = searchParams.get('q');
        if (query) {
            const limit = parseInt(searchParams.get('limit') || '20');
            const ideas = await searchIdeas(query, limit);
            return NextResponse.json(ideas);
        }

        // Get similar ideas
        const category = searchParams.get('category') || undefined;
        const industry = searchParams.get('industry') || undefined;
        const revenueModel = searchParams.get('revenueModel') || undefined;
        const limit = parseInt(searchParams.get('limit') || '10');

        const ideas = await getSimilarIdeas({
            category,
            industry,
            revenueModel,
            limit,
        });

        return NextResponse.json(ideas);
    } catch (error) {
        console.error('Ideas API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ideas' },
            { status: 500 }
        );
    }
}
