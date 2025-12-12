// Real Scoring Engine - Mathematical formulas, not just LLM text
// This is the unique IP that buyers will pay for

export interface IdeaInput {
    // Market factors
    targetMarket: string;
    industry: string;
    marketSize?: number; // TAM in USD
    growthRate?: number; // Annual growth rate %

    // Competition
    competitorCount?: number;
    marketMaturity?: 'emerging' | 'growing' | 'mature' | 'declining';

    // Monetization
    revenueModel?: 'subscription' | 'transaction' | 'advertising' | 'enterprise' | 'marketplace' | 'freemium' | 'none';
    avgRevenuePerUser?: number; // ARPU in USD

    // Technical complexity
    techStack?: string[];
    requiresML?: boolean;
    requiresBlockchain?: boolean;
    infrastructureComplexity?: 'low' | 'medium' | 'high';

    // Differentiation
    hasPatentableTech?: boolean;
    networkEffects?: 'none' | 'weak' | 'moderate' | 'strong';
    switchingCosts?: 'none' | 'low' | 'medium' | 'high';
    brandImportance?: 'low' | 'medium' | 'high';

    // Team & Resources
    teamSize?: number;
    hasTechnicalFounder?: boolean;
    budgetRange?: string;
    timeHorizon?: string;
}

export interface ScoringResult {
    overallScore: number; // 0-100
    marketScore: number; // 0-100
    technicalScore: number; // 0-100
    differentiationScore: number; // 0-100
    viabilityScore: number; // 0-100

    breakdown: {
        market: {
            tam: number;
            growth: number;
            competition: number;
            monetization: number;
            weighted: number;
        };
        technical: {
            complexity: number;
            infrastructure: number;
            deployment: number;
            weighted: number;
        };
        differentiation: {
            moat: number;
            networkEffects: number;
            replicationRisk: number;
            weighted: number;
        };
        viability: {
            teamFit: number;
            resourceMatch: number;
            timeRealistic: number;
            weighted: number;
        };
    };

    verdict: 'High Potential' | 'Moderate Potential' | 'Low Potential' | 'Not Viable';
    confidenceLevel: number; // 0-100
    keyInsights: string[];
}

// ============ MARKET SCORING ============
function calculateMarketScore(input: IdeaInput): { score: number; breakdown: any } {
    // Market Score = 0.3×TAM + 0.2×Growth + 0.2×Competition + 0.3×Monetization

    // TAM Score (0-100)
    let tamScore = 50; // default
    if (input.marketSize) {
        if (input.marketSize >= 10_000_000_000) tamScore = 100; // $10B+
        else if (input.marketSize >= 1_000_000_000) tamScore = 85; // $1B-10B
        else if (input.marketSize >= 100_000_000) tamScore = 70; // $100M-1B
        else if (input.marketSize >= 10_000_000) tamScore = 50; // $10M-100M
        else if (input.marketSize >= 1_000_000) tamScore = 30; // $1M-10M
        else tamScore = 15; // <$1M
    }

    // Growth Score (0-100)
    let growthScore = 50;
    if (input.growthRate !== undefined) {
        if (input.growthRate >= 50) growthScore = 100; // 50%+ growth
        else if (input.growthRate >= 30) growthScore = 85;
        else if (input.growthRate >= 15) growthScore = 70;
        else if (input.growthRate >= 5) growthScore = 50;
        else if (input.growthRate >= 0) growthScore = 30;
        else growthScore = 10; // negative growth
    } else {
        // Estimate based on market maturity
        const maturityGrowth: Record<string, number> = {
            'emerging': 85,
            'growing': 70,
            'mature': 40,
            'declining': 15
        };
        growthScore = maturityGrowth[input.marketMaturity || 'growing'] || 50;
    }

    // Competition Score (0-100) - inverse scoring, less competition = higher score
    let competitionScore = 50;
    if (input.competitorCount !== undefined) {
        if (input.competitorCount === 0) competitionScore = 95;
        else if (input.competitorCount <= 3) competitionScore = 80;
        else if (input.competitorCount <= 10) competitionScore = 60;
        else if (input.competitorCount <= 50) competitionScore = 40;
        else if (input.competitorCount <= 200) competitionScore = 25;
        else competitionScore = 10;
    } else {
        // Estimate based on market maturity
        const maturityCompetition: Record<string, number> = {
            'emerging': 80,
            'growing': 60,
            'mature': 30,
            'declining': 20
        };
        competitionScore = maturityCompetition[input.marketMaturity || 'growing'] || 50;
    }

    // Monetization Score (0-100)
    const monetizationScores: Record<string, number> = {
        'subscription': 90, // Best: recurring revenue
        'enterprise': 85, // High value contracts
        'marketplace': 80, // Network effects + transaction fees
        'transaction': 75, // Per-transaction fees
        'freemium': 60, // Conversion challenges
        'advertising': 50, // Scale required
        'none': 10 // No clear model
    };
    let monetizationScore = monetizationScores[input.revenueModel || 'none'] || 40;

    // Boost if ARPU is known and high
    if (input.avgRevenuePerUser) {
        if (input.avgRevenuePerUser >= 100) monetizationScore = Math.min(100, monetizationScore + 15);
        else if (input.avgRevenuePerUser >= 50) monetizationScore = Math.min(100, monetizationScore + 10);
        else if (input.avgRevenuePerUser >= 20) monetizationScore = Math.min(100, monetizationScore + 5);
    }

    // Weighted calculation
    const weights = { tam: 0.3, growth: 0.2, competition: 0.2, monetization: 0.3 };
    const weightedScore =
        tamScore * weights.tam +
        growthScore * weights.growth +
        competitionScore * weights.competition +
        monetizationScore * weights.monetization;

    return {
        score: Math.round(weightedScore),
        breakdown: {
            tam: Math.round(tamScore),
            growth: Math.round(growthScore),
            competition: Math.round(competitionScore),
            monetization: Math.round(monetizationScore),
            weighted: Math.round(weightedScore)
        }
    };
}

// ============ TECHNICAL SCORING ============
function calculateTechnicalScore(input: IdeaInput): { score: number; breakdown: any } {
    // Technical Score = 100 - (Complexity + Infrastructure + Deployment Difficulty)
    // Lower complexity = higher score

    // Base complexity (0-40 penalty points)
    let complexityPenalty = 20; // default medium

    // Tech stack complexity
    const complexTech = ['blockchain', 'machine learning', 'ai', 'computer vision', 'nlp', 'quantum'];
    const techStackStr = (input.techStack || []).join(' ').toLowerCase();
    let techComplexityCount = 0;
    complexTech.forEach(tech => {
        if (techStackStr.includes(tech)) techComplexityCount++;
    });

    if (input.requiresML) techComplexityCount++;
    if (input.requiresBlockchain) techComplexityCount++;

    if (techComplexityCount >= 3) complexityPenalty = 40; // Very complex
    else if (techComplexityCount === 2) complexityPenalty = 30;
    else if (techComplexityCount === 1) complexityPenalty = 20;
    else complexityPenalty = 10; // Simple tech

    // Infrastructure complexity (0-30 penalty points)
    const infraPenalty: Record<string, number> = {
        'low': 5,
        'medium': 15,
        'high': 30
    };
    const infrastructurePenalty = infraPenalty[input.infrastructureComplexity || 'medium'];

    // Deployment difficulty (0-30 penalty points)
    let deploymentPenalty = 15; // default

    // Factors that increase deployment difficulty
    if (input.requiresML) deploymentPenalty += 10;
    if (input.requiresBlockchain) deploymentPenalty += 10;
    if (input.infrastructureComplexity === 'high') deploymentPenalty += 5;

    deploymentPenalty = Math.min(30, deploymentPenalty);

    // Calculate final score (100 - penalties)
    const totalPenalty = complexityPenalty + infrastructurePenalty + deploymentPenalty;
    const score = Math.max(0, 100 - totalPenalty);

    return {
        score: Math.round(score),
        breakdown: {
            complexity: 100 - complexityPenalty,
            infrastructure: 100 - infrastructurePenalty,
            deployment: 100 - deploymentPenalty,
            weighted: Math.round(score)
        }
    };
}

// ============ DIFFERENTIATION SCORING ============
function calculateDifferentiationScore(input: IdeaInput): { score: number; breakdown: any } {
    // Differentiation Score = Moat Potential + Network Effects - Replication Risk

    // Moat Potential (0-40 points)
    let moatScore = 20; // default

    // Patent/IP protection
    if (input.hasPatentableTech) moatScore += 15;

    // Brand importance
    const brandBonus: Record<string, number> = {
        'high': 10,
        'medium': 5,
        'low': 0
    };
    moatScore += brandBonus[input.brandImportance || 'medium'];

    // Switching costs
    const switchingBonus: Record<string, number> = {
        'high': 15,
        'medium': 8,
        'low': 3,
        'none': 0
    };
    moatScore += switchingBonus[input.switchingCosts || 'low'];

    moatScore = Math.min(40, moatScore);

    // Network Effects (0-35 points)
    const networkScores: Record<string, number> = {
        'strong': 35,
        'moderate': 20,
        'weak': 10,
        'none': 0
    };
    const networkScore = networkScores[input.networkEffects || 'none'];

    // Replication Risk (0-25 penalty points)
    let replicationRisk = 15; // default medium risk

    // Factors that reduce replication risk
    if (input.hasPatentableTech) replicationRisk -= 8;
    if (input.networkEffects === 'strong' || input.networkEffects === 'moderate') replicationRisk -= 5;
    if (input.switchingCosts === 'high' || input.switchingCosts === 'medium') replicationRisk -= 5;
    if (input.requiresML || input.requiresBlockchain) replicationRisk -= 3; // Complex tech harder to copy

    replicationRisk = Math.max(0, replicationRisk);

    // Final score
    const score = moatScore + networkScore - replicationRisk;
    const normalizedScore = Math.max(0, Math.min(100, score * 1.25)); // Scale to 0-100

    return {
        score: Math.round(normalizedScore),
        breakdown: {
            moat: Math.round((moatScore / 40) * 100),
            networkEffects: Math.round((networkScore / 35) * 100),
            replicationRisk: Math.round(100 - (replicationRisk / 25) * 100),
            weighted: Math.round(normalizedScore)
        }
    };
}

// ============ VIABILITY SCORING ============
function calculateViabilityScore(input: IdeaInput): { score: number; breakdown: any } {
    // Viability = Team Fit + Resource Match + Time Realistic

    // Team Fit (0-35 points)
    let teamFitScore = 15; // default

    if (input.hasTechnicalFounder) {
        teamFitScore += 10;
    }

    if (input.teamSize) {
        if (input.teamSize >= 5) teamFitScore += 10;
        else if (input.teamSize >= 3) teamFitScore += 7;
        else if (input.teamSize >= 2) teamFitScore += 4;
    }

    teamFitScore = Math.min(35, teamFitScore);

    // Resource Match (0-35 points)
    let resourceScore = 20; // default medium

    const budgetScores: Record<string, number> = {
        '> $500k': 35,
        '$100k-$500k': 30,
        '$25k-$100k': 25,
        '$5k-$25k': 18,
        '< $5k': 10,
        'Not sure': 15
    };
    resourceScore = budgetScores[input.budgetRange || 'Not sure'] || 20;

    // Time Realistic (0-30 points)
    let timeScore = 20; // default

    const timeScores: Record<string, number> = {
        'Long-term': 30, // 3+ years - most realistic
        '1-3 years': 25,
        'Short-term': 15 // <6 months - often unrealistic
    };
    timeScore = timeScores[input.timeHorizon || '1-3 years'] || 20;

    const totalScore = teamFitScore + resourceScore + timeScore;
    const normalizedScore = (totalScore / 100) * 100;

    return {
        score: Math.round(normalizedScore),
        breakdown: {
            teamFit: Math.round((teamFitScore / 35) * 100),
            resourceMatch: Math.round((resourceScore / 35) * 100),
            timeRealistic: Math.round((timeScore / 30) * 100),
            weighted: Math.round(normalizedScore)
        }
    };
}

// ============ MAIN SCORING FUNCTION ============
export function calculateStartupScore(input: IdeaInput): ScoringResult {
    // Calculate individual scores
    const market = calculateMarketScore(input);
    const technical = calculateTechnicalScore(input);
    const differentiation = calculateDifferentiationScore(input);
    const viability = calculateViabilityScore(input);

    // Overall weighted score
    // Market is most important (40%), then differentiation (25%), viability (20%), technical (15%)
    const weights = {
        market: 0.40,
        differentiation: 0.25,
        viability: 0.20,
        technical: 0.15
    };

    const overallScore =
        market.score * weights.market +
        differentiation.score * weights.differentiation +
        viability.score * weights.viability +
        technical.score * weights.technical;

    // Determine verdict
    let verdict: ScoringResult['verdict'];
    if (overallScore >= 75) verdict = 'High Potential';
    else if (overallScore >= 55) verdict = 'Moderate Potential';
    else if (overallScore >= 35) verdict = 'Low Potential';
    else verdict = 'Not Viable';

    // Calculate confidence level based on data completeness
    const dataPoints = [
        input.marketSize,
        input.growthRate,
        input.competitorCount,
        input.revenueModel,
        input.infrastructureComplexity,
        input.networkEffects,
        input.teamSize,
        input.budgetRange
    ].filter(x => x !== undefined && x !== null).length;

    const confidenceLevel = Math.min(100, (dataPoints / 8) * 100);

    // Generate key insights
    const keyInsights: string[] = [];

    if (market.score >= 75) keyInsights.push('✅ Strong market opportunity with significant TAM');
    else if (market.score < 40) keyInsights.push('⚠️ Limited market size or high competition');

    if (differentiation.score >= 70) keyInsights.push('✅ Strong competitive moat and differentiation');
    else if (differentiation.score < 40) keyInsights.push('⚠️ Weak differentiation - high replication risk');

    if (technical.score >= 70) keyInsights.push('✅ Technically feasible with manageable complexity');
    else if (technical.score < 40) keyInsights.push('⚠️ High technical complexity may slow execution');

    if (viability.score >= 70) keyInsights.push('✅ Team and resources well-matched to opportunity');
    else if (viability.score < 40) keyInsights.push('⚠️ Resource constraints may limit execution');

    return {
        overallScore: Math.round(overallScore),
        marketScore: market.score,
        technicalScore: technical.score,
        differentiationScore: differentiation.score,
        viabilityScore: viability.score,
        breakdown: {
            market: market.breakdown,
            technical: technical.breakdown,
            differentiation: differentiation.breakdown,
            viability: viability.breakdown
        },
        verdict,
        confidenceLevel: Math.round(confidenceLevel),
        keyInsights
    };
}

// Helper function to extract scoring inputs from text description using patterns
export function extractScoringInputsFromDescription(description: string, formData: any): Partial<IdeaInput> {
    const input: Partial<IdeaInput> = {
        targetMarket: formData.targetMarket || 'Global',
        industry: formData.industry || 'Technology',
        budgetRange: formData.budgetRange,
        timeHorizon: formData.timeHorizon
    };

    const lowerDesc = description.toLowerCase();

    // Detect revenue model
    if (lowerDesc.includes('subscription') || lowerDesc.includes('saas')) input.revenueModel = 'subscription';
    else if (lowerDesc.includes('marketplace') || lowerDesc.includes('platform')) input.revenueModel = 'marketplace';
    else if (lowerDesc.includes('enterprise') || lowerDesc.includes('b2b')) input.revenueModel = 'enterprise';
    else if (lowerDesc.includes('transaction') || lowerDesc.includes('commission')) input.revenueModel = 'transaction';
    else if (lowerDesc.includes('freemium') || lowerDesc.includes('free tier')) input.revenueModel = 'freemium';
    else if (lowerDesc.includes('ads') || lowerDesc.includes('advertising')) input.revenueModel = 'advertising';

    // Detect technical complexity
    input.requiresML = lowerDesc.includes('ai') || lowerDesc.includes('machine learning') || lowerDesc.includes('ml');
    input.requiresBlockchain = lowerDesc.includes('blockchain') || lowerDesc.includes('web3') || lowerDesc.includes('crypto');

    // Detect network effects
    if (lowerDesc.includes('network effect') || lowerDesc.includes('viral') || lowerDesc.includes('marketplace')) {
        input.networkEffects = 'moderate';
    }
    if (lowerDesc.includes('social') || lowerDesc.includes('community')) {
        input.networkEffects = 'strong';
    }

    // Detect infrastructure needs
    if (input.requiresML || input.requiresBlockchain || lowerDesc.includes('real-time') || lowerDesc.includes('iot')) {
        input.infrastructureComplexity = 'high';
    } else if (lowerDesc.includes('mobile') || lowerDesc.includes('api')) {
        input.infrastructureComplexity = 'medium';
    } else {
        input.infrastructureComplexity = 'low';
    }

    return input;
}
