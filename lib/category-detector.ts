/**
 * Detect startup category from description and industry
 */
export function detectCategory(description: string, industry?: string): string {
    const lowerDesc = description.toLowerCase();
    const lowerIndustry = industry?.toLowerCase() || '';

    // Check for specific keywords
    if (lowerDesc.includes('productivity') || lowerDesc.includes('task') ||
        lowerDesc.includes('project management') || lowerDesc.includes('collaboration') ||
        lowerDesc.includes('workflow') || lowerDesc.includes('organization')) {
        return 'Productivity';
    }

    if (lowerDesc.includes('design') || lowerDesc.includes('ui') || lowerDesc.includes('ux') ||
        lowerDesc.includes('graphic') || lowerDesc.includes('creative')) {
        return 'Design';
    }

    if (lowerDesc.includes('payment') || lowerDesc.includes('fintech') || lowerDesc.includes('finance') ||
        lowerDesc.includes('banking') || lowerDesc.includes('transaction') || lowerIndustry.includes('fintech')) {
        return 'Fintech';
    }

    if (lowerDesc.includes('developer') || lowerDesc.includes('code') || lowerDesc.includes('api') ||
        lowerDesc.includes('programming') || lowerDesc.includes('software development')) {
        return 'Developer Tools';
    }

    if (lowerDesc.includes('health') || lowerDesc.includes('medical') || lowerDesc.includes('healthcare') ||
        lowerDesc.includes('fitness') || lowerDesc.includes('wellness')) {
        return 'Healthcare';
    }

    if (lowerDesc.includes('education') || lowerDesc.includes('learning') || lowerDesc.includes('course') ||
        lowerDesc.includes('training') || lowerDesc.includes('teaching')) {
        return 'Education';
    }

    if (lowerDesc.includes('ecommerce') || lowerDesc.includes('e-commerce') || lowerDesc.includes('marketplace') ||
        lowerDesc.includes('shopping') || lowerDesc.includes('retail')) {
        return 'E-commerce';
    }

    if (lowerDesc.includes('marketing') || lowerDesc.includes('advertising') || lowerDesc.includes('seo') ||
        lowerDesc.includes('analytics') || lowerDesc.includes('campaign')) {
        return 'Marketing';
    }

    if (lowerDesc.includes('ai') || lowerDesc.includes('machine learning') || lowerDesc.includes('artificial intelligence') ||
        lowerDesc.includes('ml') || lowerDesc.includes('deep learning')) {
        return 'AI/ML';
    }

    // Check industry as fallback
    if (lowerIndustry.includes('saas')) return 'SaaS';
    if (lowerIndustry.includes('technology')) return 'Technology';

    // Default
    return 'Technology';
}

/**
 * Detect revenue model from description
 */
export function detectRevenueModel(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('subscription') || lowerDesc.includes('monthly') || lowerDesc.includes('saas')) {
        return 'subscription';
    }

    if (lowerDesc.includes('freemium') || lowerDesc.includes('free tier')) {
        return 'freemium';
    }

    if (lowerDesc.includes('marketplace') || lowerDesc.includes('commission') || lowerDesc.includes('transaction fee')) {
        return 'marketplace';
    }

    if (lowerDesc.includes('transaction') || lowerDesc.includes('per-use') || lowerDesc.includes('pay per')) {
        return 'transaction';
    }

    if (lowerDesc.includes('ads') || lowerDesc.includes('advertising')) {
        return 'advertising';
    }

    if (lowerDesc.includes('one-time') || lowerDesc.includes('license')) {
        return 'license';
    }

    // Default for most SaaS
    return 'subscription';
}
