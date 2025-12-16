// Database is completely disabled for now
// Re-enable when MongoDB connection is properly configured

// Prisma client is null - database features are disabled
export const prisma = null;

// Type exports - use empty type if Prisma is unavailable
export type StartupIdea = {
    id: string;
    name: string;
    tagline: string;
    description: string;
    category: string;
    industry: string;
    targetMarket: string;
    revenueModel: string;
    upvotes?: number;
};

/**
 * Get similar ideas - DISABLED
 */
export async function getSimilarIdeas(_input: {
    category?: string;
    industry?: string;
    revenueModel?: string;
    limit?: number;
}) {
    return [];
}

/**
 * Get idea by ID - DISABLED
 */
export async function getIdeaById(_id: string) {
    return null;
}

/**
 * Search ideas - DISABLED
 */
export async function searchIdeas(_query: string, _limit: number = 20) {
    return [];
}

/**
 * Get random ideas - DISABLED
 */
export async function getRandomIdeas(_count: number = 5) {
    return [];
}

/**
 * Get ideas by source - DISABLED
 */
export async function getIdeasBySource(_source: string, _limit: number = 50) {
    return [];
}

/**
 * Get database statistics - DISABLED
 */
export async function getStats() {
    return { total: 0, bySource: [], byCategory: [], byIndustry: [] };
}
