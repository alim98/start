// English version - Scoring logic based on the fund's official evaluation matrix (metrics.xlsm)
// Weights are extracted from AHP analysis in the Excel file

export interface FundMetricsInputEN {
    // Company Info
    companyName: string;
    companyType: string;      // Legal entity type
    yearsInMarket: string;    // Years of operation
    teamSize: number;
    technicalTeam: number;

    // Product & Technical
    productStage: string;
    ipStatus: string;
    hasLicenses: string;      // Required licenses
    techDependency: string;   // Key person dependency
    techEducation: string;    // Team expertise

    // Financial
    salesTrend: string;       // Sales trend
    currentRevenue: string;
    retainedEarnings: string; // Retained earnings
    currentRatio: string;     // Current ratio
    debtRatio: string;        // Debt ratio
    receivablesDays: string;  // Receivables collection period
    creditHistory: string;    // Credit history

    // Business
    marketSize: string;
    marketDemand: string;
    competitionLevel: string;
    revenueModel: string;
    customerType: string;

    // Contractual
    commitmentHistory: string;
    overdueContracts: string;
    outsourcingStatus: string;

    // Other
    fundingRequest: string;
    traction: string;
}

export interface CategoryBreakdownEN {
    category: string;
    displayName: string;
    weight: number;
    score: number;
    weightedScore: number;
    details: string;
    subIndicators: {
        name: string;
        weight: number;
        score: number;
    }[];
}

export interface FundMetricsResultEN {
    overallScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    decision: 'Approved' | 'Conditional' | 'Rejected';
    breakdown: CategoryBreakdownEN[];
    guaranteeAnalysis: {
        character: { score: number; weight: number; status: string };
        capacity: { score: number; weight: number; status: string };
        capital: { score: number; weight: number; status: string };
        totalScore: number;
    };
}

// Parse currency strings
function parseCurrency(value: string): number {
    if (!value) return 0;
    const normalized = value.replace(/[^0-9.]/g, '');
    return parseFloat(normalized) || 0;
}

// ========== CATEGORY WEIGHTS FROM EXCEL AHP MATRIX ==========
const CATEGORY_WEIGHTS = {
    financial: 0.375346237415203,
    technical: 0.1876731187076015,
    contractual: 0.1251154124717343,
    business: 0.125,
    stakeholders: 0.04912286521481924,
    management: 0.07506924748304059,
    political: 0.06255770623586715,
};

// ========== EVALUATION FUNCTIONS (using Excel indicators) ==========

function evaluateFinancial(input: FundMetricsInputEN): CategoryBreakdownEN {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // 3-Year Sales Trend (0.03)
    const salesScores: Record<string, number> = {
        'declining': 2, 'stable': 5, 'growing_low': 6, 'growing_high': 8, 'growing_exceptional': 10
    };
    subIndicators.push({ name: '3-Year Sales Trend', weight: 0.03, score: salesScores[input.salesTrend] || 5 });

    // Retained Earnings (0.12)
    const earningsValue = parseCurrency(input.retainedEarnings);
    let earningsScore = 5;
    if (earningsValue > 1_000_000) earningsScore = 10;
    else if (earningsValue > 100_000) earningsScore = 7;
    else if (earningsValue > 0) earningsScore = 5;
    else earningsScore = 3;
    subIndicators.push({ name: 'Retained Earnings', weight: 0.12, score: earningsScore });

    // Debt Ratio (0.09)
    const debtScores: Record<string, number> = {
        'low': 9, 'moderate': 6, 'high': 3
    };
    const debtScore = input.debtRatio ? (debtScores[input.debtRatio] || 5) : 5;
    subIndicators.push({ name: 'Debt Ratio', weight: 0.09, score: debtScore });

    // Receivables Collection Period (0.06)
    const receivablesValue = parseInt(input.receivablesDays) || 60;
    let receivablesScore = 5;
    if (receivablesValue <= 30) receivablesScore = 10;
    else if (receivablesValue <= 60) receivablesScore = 7;
    else if (receivablesValue <= 90) receivablesScore = 5;
    else receivablesScore = 3;
    subIndicators.push({ name: 'Receivables Collection', weight: 0.06, score: receivablesScore });

    // Credit History (0.016)
    const creditScores: Record<string, number> = {
        'excellent': 10, 'good': 7, 'moderate': 5, 'poor': 2
    };
    subIndicators.push({ name: 'Credit History', weight: 0.016, score: creditScores[input.creditHistory] || 5 });

    // Calculate weighted score
    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'financial',
        displayName: 'Financial, Economic & Credit',
        weight: CATEGORY_WEIGHTS.financial,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.financial,
        details: `Sales Trend: ${input.salesTrend} | Credit History: ${input.creditHistory}`,
        subIndicators,
    };
}

function evaluateTechnical(input: FundMetricsInputEN): CategoryBreakdownEN {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // Product Stage Score (0.07)
    const stageScores: Record<string, number> = {
        'Idea': 2, 'Prototype': 4, 'MVP': 6, 'Beta': 7, 'Launched': 8, 'Scaling': 10,
    };
    subIndicators.push({ name: 'Product Stage', weight: 0.07, score: stageScores[input.productStage] || 5 });

    // Key Person Dependency (0.01)
    const dependencyScores: Record<string, number> = { 'yes': 3, 'partial': 6, 'no': 9 };
    subIndicators.push({ name: 'No Key Person Dependency', weight: 0.01, score: dependencyScores[input.techDependency] || 5 });

    // Team Expertise (0.024)
    const educationScores: Record<string, number> = {
        'none': 2, 'unrelated': 4, 'similar': 6, 'related': 8, 'top_university': 10
    };
    subIndicators.push({ name: 'Team Expertise', weight: 0.024, score: educationScores[input.techEducation] || 5 });

    // Licenses (0.012)
    const licenseScores: Record<string, number> = { 'none': 2, 'some': 5, 'all': 9 };
    subIndicators.push({ name: 'Product Licenses', weight: 0.012, score: licenseScores[input.hasLicenses] || 5 });

    // Intellectual Property
    const ipScores: Record<string, number> = { 'None': 3, 'Pending': 6, 'Registered': 9 };
    subIndicators.push({ name: 'Intellectual Property', weight: 0.02, score: ipScores[input.ipStatus] || 3 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'technical',
        displayName: 'Technical',
        weight: CATEGORY_WEIGHTS.technical,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.technical,
        details: `Stage: ${input.productStage} | Team: ${input.technicalTeam}/${input.teamSize}`,
        subIndicators,
    };
}

function evaluateBusiness(input: FundMetricsInputEN): CategoryBreakdownEN {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // Market Demand (0.01)
    const demandScores: Record<string, number> = {
        'negative': 2, 'zero': 3, 'hidden': 5, 'declining': 4, 'stable': 6, 'growing': 8, 'full': 10
    };
    subIndicators.push({ name: 'Market Demand', weight: 0.01, score: demandScores[input.marketDemand] || 5 });

    // Revenue Model (0.065)
    const modelScores: Record<string, number> = {
        'none': 2, 'one_time': 5, 'recurring': 8, 'multiple': 10
    };
    subIndicators.push({ name: 'Revenue Model', weight: 0.065, score: modelScores[input.revenueModel] || 5 });

    // Competition Level (0.033)
    const competitionScores: Record<string, number> = {
        'monopoly': 10, 'low': 8, 'moderate': 6, 'high': 4, 'full': 2
    };
    subIndicators.push({ name: 'Competitive Barriers', weight: 0.033, score: competitionScores[input.competitionLevel] || 5 });

    // Customer Type (0.028)
    const customerScores: Record<string, number> = {
        'gov_bad': 2, 'gov_good': 5, 'mixed_bad': 4, 'mixed': 7, 'mixed_export': 10
    };
    subIndicators.push({ name: 'Customer Type', weight: 0.028, score: customerScores[input.customerType] || 5 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    const marketValue = parseCurrency(input.marketSize);

    return {
        category: 'business',
        displayName: 'Business',
        weight: CATEGORY_WEIGHTS.business,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.business,
        details: `Market Size: ${marketValue > 0 ? '$' + marketValue.toLocaleString() : 'Unknown'}`,
        subIndicators,
    };
}

function evaluateContractual(input: FundMetricsInputEN): CategoryBreakdownEN {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // Commitment History (0.062)
    const commitmentScores: Record<string, number> = {
        'poor': 2, 'no_record': 4, 'good': 7, 'excellent': 10
    };
    subIndicators.push({ name: 'Commitment History', weight: 0.062, score: commitmentScores[input.commitmentHistory] || 5 });

    // Overdue Contracts (0.02)
    const overdueScores: Record<string, number> = {
        'many': 2, 'some': 5, 'few': 7, 'none': 10
    };
    subIndicators.push({ name: 'Overdue Contracts', weight: 0.02, score: overdueScores[input.overdueContracts] || 5 });

    // Outsourcing (0.012)
    const outsourceScores: Record<string, number> = {
        'core_monopoly': 2, 'core': 4, 'partial_monopoly': 5, 'partial': 7, 'none': 10
    };
    subIndicators.push({ name: 'Outsourcing Status', weight: 0.012, score: outsourceScores[input.outsourcingStatus] || 5 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'contractual',
        displayName: 'Contractual',
        weight: CATEGORY_WEIGHTS.contractual,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.contractual,
        details: `Commitment History: ${input.commitmentHistory}`,
        subIndicators,
    };
}

function evaluateManagement(input: FundMetricsInputEN): CategoryBreakdownEN {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // Management Experience (0.05)
    const yearsValue = parseInt(input.yearsInMarket) || 0;
    let expScore = 5;
    if (yearsValue >= 10) expScore = 10;
    else if (yearsValue >= 5) expScore = 7;
    else if (yearsValue >= 2) expScore = 5;
    else expScore = 3;
    subIndicators.push({ name: 'Years of Operation', weight: 0.05, score: expScore });

    // Management Knowledge (0.025)
    let knowScore = 5;
    if (input.teamSize >= 5 && input.technicalTeam >= 2) knowScore = 8;
    else if (input.teamSize >= 3) knowScore = 6;
    else knowScore = 4;
    subIndicators.push({ name: 'Team Composition', weight: 0.025, score: knowScore });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'management',
        displayName: 'Management',
        weight: CATEGORY_WEIGHTS.management,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.management,
        details: `Experience: ${input.yearsInMarket || '0'} years | Team: ${input.teamSize} members`,
        subIndicators,
    };
}

function evaluatePolitical(input: FundMetricsInputEN): CategoryBreakdownEN {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // Company Licenses (0.004 + 0.012)
    const licenseScores: Record<string, number> = { 'none': 2, 'some': 5, 'all': 9 };
    subIndicators.push({ name: 'Company & Product Licenses', weight: 0.016, score: licenseScores[input.hasLicenses] || 5 });

    // Legal Entity Type (impacts risk)
    const companyTypeScores: Record<string, number> = {
        'private': 7, 'public': 8, 'cooperative': 7, 'limited': 5
    };
    subIndicators.push({ name: 'Legal Entity Type', weight: 0.02, score: companyTypeScores[input.companyType] || 5 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'political',
        displayName: 'Political, Social & Legal',
        weight: CATEGORY_WEIGHTS.political,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.political,
        details: `Company Type: ${input.companyType} | Licenses: ${input.hasLicenses}`,
        subIndicators,
    };
}

// Guarantee analysis based on Excel "Guarantees" sheet
function analyzeGuarantees(input: FundMetricsInputEN): FundMetricsResultEN['guaranteeAnalysis'] {
    // Character (40%)
    let characterScore = 5;
    if (input.commitmentHistory === 'excellent') characterScore = 9;
    else if (input.commitmentHistory === 'good') characterScore = 7;
    else if (input.commitmentHistory === 'no_record') characterScore = 4;
    else characterScore = 2;

    // Capacity (30%)
    let capacityScore = 5;
    const techRatio = input.technicalTeam / Math.max(1, input.teamSize);
    if (techRatio >= 0.5 && input.teamSize >= 5 && input.hasLicenses === 'all') capacityScore = 9;
    else if (techRatio >= 0.3 || input.teamSize >= 3) capacityScore = 6;
    else capacityScore = 3;

    // Capital (30%)
    let capitalScore = 5;
    const earnings = parseCurrency(input.retainedEarnings);
    const funding = parseCurrency(input.fundingRequest);
    if (earnings > 0 && funding > 0) {
        const ratio = earnings / funding;
        if (ratio >= 0.5) capitalScore = 9;
        else if (ratio >= 0.2) capitalScore = 6;
        else capitalScore = 3;
    } else {
        capitalScore = 3;
    }

    const totalScore = (characterScore * 0.4) + (capacityScore * 0.3) + (capitalScore * 0.3);

    return {
        character: { score: characterScore, weight: 0.4, status: characterScore >= 5 ? 'Approved' : 'Weak' },
        capacity: { score: capacityScore, weight: 0.3, status: capacityScore >= 5 ? 'Approved' : 'Weak' },
        capital: { score: capitalScore, weight: 0.3, status: capitalScore >= 5 ? 'Approved' : 'Weak' },
        totalScore: Math.round(totalScore * 10) / 10,
    };
}

// Main evaluation function
export function evaluateWithFundMetricsEN(input: FundMetricsInputEN): FundMetricsResultEN {
    const breakdown: CategoryBreakdownEN[] = [
        evaluateFinancial(input),
        evaluateTechnical(input),
        evaluateBusiness(input),
        evaluateContractual(input),
        evaluateManagement(input),
        evaluatePolitical(input),
    ];

    const overallScore = breakdown.reduce((sum, b) => sum + b.weightedScore, 0);

    let riskLevel: 'Low' | 'Medium' | 'High';
    if (overallScore >= 7) riskLevel = 'Low';
    else if (overallScore >= 4) riskLevel = 'Medium';
    else riskLevel = 'High';

    let decision: 'Approved' | 'Conditional' | 'Rejected';
    if (overallScore >= 6) decision = 'Approved';
    else if (overallScore >= 4) decision = 'Conditional';
    else decision = 'Rejected';

    const guaranteeAnalysis = analyzeGuarantees(input);

    return {
        overallScore: Math.round(overallScore * 10) / 10,
        riskLevel,
        decision,
        breakdown,
        guaranteeAnalysis,
    };
}
