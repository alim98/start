import { NextRequest, NextResponse } from 'next/server';
import { getIdeaById } from '@/lib/idea-database';

/**
 * GET /api/ideas/[id]
 * Get a single idea by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const idea = await getIdeaById(params.id);

        if (!idea) {
            return NextResponse.json(
                { error: 'Idea not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(idea);
    } catch (error) {
        console.error('Idea fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch idea' },
            { status: 500 }
        );
    }
}
