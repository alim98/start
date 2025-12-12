import { NextRequest, NextResponse } from 'next/server';
import { getIdeaById } from '@/lib/idea-database';

/**
 * GET /api/ideas/[id]
 * Get a single idea by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idea = await getIdeaById(id);

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
