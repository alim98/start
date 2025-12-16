import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

// Only initialize Prisma if DATABASE_URL is set and we're confident it's working
function createPrismaClient(): PrismaClient | null {
    // Don't try to connect if no DATABASE_URL
    if (!process.env.DATABASE_URL) {
        console.log('DATABASE_URL not set, Prisma disabled');
        return null;
    }

    try {
        return new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
        });
    } catch (error) {
        console.error('Failed to create Prisma client:', error);
        return null;
    }
}

// Lazy initialization - only create if needed and DATABASE_URL exists
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma;
}

// Type exports
export type { StartupIdea } from '@prisma/client';

/**
 * Get similar ideas based on category, industry, or revenue model
 */
export async function getSimilarIdeas(input: {
    category?: string;
    industry?: string;
    revenueModel?: string;
    limit?: number;
}) {
    if (!prisma) return [];

    const { category, industry, revenueModel, limit = 10 } = input;

    return prisma.startupIdea.findMany({
        where: {
            OR: [
                category ? { category } : {},
                industry ? { industry } : {},
                revenueModel ? { revenueModel } : {},
            ].filter(obj => Object.keys(obj).length > 0),
        },
        take: limit,
        orderBy: {
            upvotes: 'desc',
        },
    });
}

/**
 * Get idea by ID
 */
export async function getIdeaById(id: string) {
    if (!prisma) return null;
    return prisma.startupIdea.findUnique({
        where: { id },
    });
}

/**
 * Search ideas by name or description
 */
export async function searchIdeas(query: string, limit: number = 20) {
    if (!prisma) return [];
    return prisma.startupIdea.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { tagline: { contains: query } },
            ],
        },
        take: limit,
        orderBy: {
            upvotes: 'desc',
        },
    });
}

/**
 * Get random ideas
 */
export async function getRandomIdeas(count: number = 5) {
    if (!prisma) return [];
    const allIdeas = await prisma.startupIdea.findMany();

    // Fisher-Yates shuffle
    for (let i = allIdeas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIdeas[i], allIdeas[j]] = [allIdeas[j], allIdeas[i]];
    }

    return allIdeas.slice(0, count);
}

/**
 * Get ideas by source
 */
export async function getIdeasBySource(source: string, limit: number = 50) {
    if (!prisma) return [];
    return prisma.startupIdea.findMany({
        where: { source },
        take: limit,
        orderBy: {
            scrapedAt: 'desc',
        },
    });
}

/**
 * Get database statistics
 */
export async function getStats() {
    if (!prisma) return { total: 0, bySource: [], byCategory: [], byIndustry: [] };

    const [total, bySource, byCategory, byIndustry] = await Promise.all([
        prisma.startupIdea.count(),
        prisma.startupIdea.groupBy({
            by: ['source'],
            _count: true,
        }),
        prisma.startupIdea.groupBy({
            by: ['category'],
            _count: true,
        }),
        prisma.startupIdea.groupBy({
            by: ['industry'],
            _count: true,
        }),
    ]);

    return {
        total,
        bySource,
        byCategory,
        byIndustry,
    };
}
