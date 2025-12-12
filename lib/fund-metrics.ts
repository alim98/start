// Scoring logic based on the fund's official evaluation matrix (metrics.xlsm)
// Weights are extracted from AHP analysis in the Excel file

export interface FundMetricsInput {
    // Company Info
    companyName: string;
    companyType: string;      // نوع شخصیت حقوقی
    yearsInMarket: string;    // سابقه فعالیت
    teamSize: number;
    technicalTeam: number;

    // Product & Technical
    productStage: string;
    ipStatus: string;
    hasLicenses: string;      // مجوزهای لازم
    techDependency: string;   // قائم به فرد بودن
    techEducation: string;    // دانش تخصصی

    // Financial
    salesTrend: string;       // روند فروش
    currentRevenue: string;
    retainedEarnings: string; // سود انباشته
    currentRatio: string;     // نسبت جاری
    debtRatio: string;        // نسبت بدهی
    receivablesDays: string;  // دوره وصول مطالبات
    creditHistory: string;    // سوابق اعتباری

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

export interface CategoryBreakdown {
    category: string;
    persianName: string;
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

export interface FundMetricsResult {
    overallScore: number;
    riskLevel: 'کم' | 'متوسط' | 'زیاد';
    decision: 'تایید' | 'مشروط' | 'رد';
    breakdown: CategoryBreakdown[];
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
    const persianNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let normalized = value;
    persianNums.forEach((pn, idx) => {
        normalized = normalized.replace(new RegExp(pn, 'g'), idx.toString());
    });
    normalized = normalized.replace(/[^0-9.]/g, '');
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

function evaluateFinancial(input: FundMetricsInput): CategoryBreakdown {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // روند فروش ۳ سال (0.03)
    const salesScores: Record<string, number> = {
        'declining': 2, 'stable': 5, 'growing_low': 6, 'growing_high': 8, 'growing_exceptional': 10
    };
    subIndicators.push({ name: 'روند فروش ۳ سال', weight: 0.03, score: salesScores[input.salesTrend] || 5 });

    // سود انباشته (0.12)
    const earningsValue = parseCurrency(input.retainedEarnings);
    let earningsScore = 5;
    if (earningsValue > 1_000_000_000) earningsScore = 10;
    else if (earningsValue > 100_000_000) earningsScore = 7;
    else if (earningsValue > 0) earningsScore = 5;
    else earningsScore = 3;
    subIndicators.push({ name: 'سود انباشته', weight: 0.12, score: earningsScore });

    // نسبت بدهی (0.09)
    const debtScores: Record<string, number> = {
        'low': 9, 'moderate': 6, 'high': 3
    };
    const debtScore = input.debtRatio ? (debtScores[input.debtRatio] || 5) : 5;
    subIndicators.push({ name: 'نسبت بدهی', weight: 0.09, score: debtScore });

    // دوره وصول مطالبات (0.06)
    const receivablesValue = parseInt(input.receivablesDays) || 60;
    let receivablesScore = 5;
    if (receivablesValue <= 30) receivablesScore = 10;
    else if (receivablesValue <= 60) receivablesScore = 7;
    else if (receivablesValue <= 90) receivablesScore = 5;
    else receivablesScore = 3;
    subIndicators.push({ name: 'دوره وصول مطالبات', weight: 0.06, score: receivablesScore });

    // سوابق اعتباری (0.016)
    const creditScores: Record<string, number> = {
        'excellent': 10, 'good': 7, 'moderate': 5, 'poor': 2
    };
    subIndicators.push({ name: 'سوابق اعتباری', weight: 0.016, score: creditScores[input.creditHistory] || 5 });

    // Calculate weighted score
    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'financial',
        persianName: 'مالی، اقتصادی و اعتباری',
        weight: CATEGORY_WEIGHTS.financial,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.financial,
        details: `روند فروش: ${input.salesTrend} | سوابق اعتباری: ${input.creditHistory}`,
        subIndicators,
    };
}

function evaluateTechnical(input: FundMetricsInput): CategoryBreakdown {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // امتیاز مرحله محصول (0.07)
    const stageScores: Record<string, number> = {
        'Idea': 2, 'Prototype': 4, 'MVP': 6, 'Beta': 7, 'Launched': 8, 'Scaling': 10,
    };
    subIndicators.push({ name: 'مرحله محصول', weight: 0.07, score: stageScores[input.productStage] || 5 });

    // قائم به فرد بودن (0.01)
    const dependencyScores: Record<string, number> = { 'yes': 3, 'partial': 6, 'no': 9 };
    subIndicators.push({ name: 'عدم قائم به فرد', weight: 0.01, score: dependencyScores[input.techDependency] || 5 });

    // دانش تخصصی (0.024)
    const educationScores: Record<string, number> = {
        'none': 2, 'unrelated': 4, 'similar': 6, 'related': 8, 'top_university': 10
    };
    subIndicators.push({ name: 'دانش تخصصی تیم', weight: 0.024, score: educationScores[input.techEducation] || 5 });

    // وجود مجوزها (0.012)
    const licenseScores: Record<string, number> = { 'none': 2, 'some': 5, 'all': 9 };
    subIndicators.push({ name: 'مجوزهای محصول', weight: 0.012, score: licenseScores[input.hasLicenses] || 5 });

    // مالکیت فکری
    const ipScores: Record<string, number> = { 'None': 3, 'Pending': 6, 'Registered': 9 };
    subIndicators.push({ name: 'مالکیت فکری', weight: 0.02, score: ipScores[input.ipStatus] || 3 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'technical',
        persianName: 'فنی',
        weight: CATEGORY_WEIGHTS.technical,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.technical,
        details: `مرحله: ${input.productStage} | تیم: ${input.technicalTeam}/${input.teamSize}`,
        subIndicators,
    };
}

function evaluateBusiness(input: FundMetricsInput): CategoryBreakdown {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // تقاضای بازار (0.01)
    const demandScores: Record<string, number> = {
        'negative': 2, 'zero': 3, 'hidden': 5, 'declining': 4, 'stable': 6, 'growing': 8, 'full': 10
    };
    subIndicators.push({ name: 'تقاضای بازار', weight: 0.01, score: demandScores[input.marketDemand] || 5 });

    // مدل درآمدی (0.065)
    const modelScores: Record<string, number> = {
        'none': 2, 'one_time': 5, 'recurring': 8, 'multiple': 10
    };
    subIndicators.push({ name: 'مدل درآمدی', weight: 0.065, score: modelScores[input.revenueModel] || 5 });

    // سطح رقابت (0.033)
    const competitionScores: Record<string, number> = {
        'monopoly': 10, 'low': 8, 'moderate': 6, 'high': 4, 'full': 2
    };
    subIndicators.push({ name: 'موانع رقابتی', weight: 0.033, score: competitionScores[input.competitionLevel] || 5 });

    // نوع مشتریان (0.028)
    const customerScores: Record<string, number> = {
        'gov_bad': 2, 'gov_good': 5, 'mixed_bad': 4, 'mixed': 7, 'mixed_export': 10
    };
    subIndicators.push({ name: 'نوع مشتریان', weight: 0.028, score: customerScores[input.customerType] || 5 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    const marketValue = parseCurrency(input.marketSize);

    return {
        category: 'business',
        persianName: 'کسب و کار',
        weight: CATEGORY_WEIGHTS.business,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.business,
        details: `اندازه بازار: ${marketValue > 0 ? marketValue.toLocaleString() : 'نامشخص'}`,
        subIndicators,
    };
}

function evaluateContractual(input: FundMetricsInput): CategoryBreakdown {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // سوابق تعهدات (0.062)
    const commitmentScores: Record<string, number> = {
        'poor': 2, 'no_record': 4, 'good': 7, 'excellent': 10
    };
    subIndicators.push({ name: 'سوابق تعهدات', weight: 0.062, score: commitmentScores[input.commitmentHistory] || 5 });

    // قراردادهای معوق (0.02)
    const overdueScores: Record<string, number> = {
        'many': 2, 'some': 5, 'few': 7, 'none': 10
    };
    subIndicators.push({ name: 'قراردادهای معوق', weight: 0.02, score: overdueScores[input.overdueContracts] || 5 });

    // برونسپاری (0.012)
    const outsourceScores: Record<string, number> = {
        'core_monopoly': 2, 'core': 4, 'partial_monopoly': 5, 'partial': 7, 'none': 10
    };
    subIndicators.push({ name: 'وضعیت برونسپاری', weight: 0.012, score: outsourceScores[input.outsourcingStatus] || 5 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'contractual',
        persianName: 'قراردادی',
        weight: CATEGORY_WEIGHTS.contractual,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.contractual,
        details: `سوابق تعهدات: ${input.commitmentHistory}`,
        subIndicators,
    };
}

function evaluateManagement(input: FundMetricsInput): CategoryBreakdown {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // تجربه مدیریتی (0.05)
    const yearsValue = parseInt(input.yearsInMarket) || 0;
    let expScore = 5;
    if (yearsValue >= 10) expScore = 10;
    else if (yearsValue >= 5) expScore = 7;
    else if (yearsValue >= 2) expScore = 5;
    else expScore = 3;
    subIndicators.push({ name: 'سابقه فعالیت', weight: 0.05, score: expScore });

    // دانش مدیریتی (0.025)
    let knowScore = 5;
    if (input.teamSize >= 5 && input.technicalTeam >= 2) knowScore = 8;
    else if (input.teamSize >= 3) knowScore = 6;
    else knowScore = 4;
    subIndicators.push({ name: 'ترکیب تیم', weight: 0.025, score: knowScore });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'management',
        persianName: 'مدیریتی',
        weight: CATEGORY_WEIGHTS.management,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.management,
        details: `سابقه: ${input.yearsInMarket || '0'} سال | تیم: ${input.teamSize} نفر`,
        subIndicators,
    };
}

function evaluatePolitical(input: FundMetricsInput): CategoryBreakdown {
    const subIndicators: { name: string; weight: number; score: number }[] = [];

    // مجوزهای شرکت (0.004 + 0.012)
    const licenseScores: Record<string, number> = { 'none': 2, 'some': 5, 'all': 9 };
    subIndicators.push({ name: 'مجوزهای شرکت و محصول', weight: 0.016, score: licenseScores[input.hasLicenses] || 5 });

    // نوع شخصیت حقوقی (impacts risk)
    const companyTypeScores: Record<string, number> = {
        'private': 7, 'public': 8, 'cooperative': 7, 'limited': 5
    };
    subIndicators.push({ name: 'شخصیت حقوقی', weight: 0.02, score: companyTypeScores[input.companyType] || 5 });

    let totalScore = 0;
    const totalWeight = subIndicators.reduce((sum, si) => sum + si.weight, 0);
    subIndicators.forEach(si => {
        totalScore += si.score * (si.weight / totalWeight);
    });

    return {
        category: 'political',
        persianName: 'سیاسی، اجتماعی و قانونی',
        weight: CATEGORY_WEIGHTS.political,
        score: Math.round(totalScore * 10) / 10,
        weightedScore: totalScore * CATEGORY_WEIGHTS.political,
        details: `نوع شرکت: ${input.companyType} | مجوزها: ${input.hasLicenses}`,
        subIndicators,
    };
}

// Guarantee analysis based on Excel "تضامین" sheet
function analyzeGuarantees(input: FundMetricsInput): FundMetricsResult['guaranteeAnalysis'] {
    // Character (40%) - شخصیت
    let characterScore = 5;
    if (input.commitmentHistory === 'excellent') characterScore = 9;
    else if (input.commitmentHistory === 'good') characterScore = 7;
    else if (input.commitmentHistory === 'no_record') characterScore = 4;
    else characterScore = 2;

    // Capacity (30%) - ظرفیت
    let capacityScore = 5;
    const techRatio = input.technicalTeam / Math.max(1, input.teamSize);
    if (techRatio >= 0.5 && input.teamSize >= 5 && input.hasLicenses === 'all') capacityScore = 9;
    else if (techRatio >= 0.3 || input.teamSize >= 3) capacityScore = 6;
    else capacityScore = 3;

    // Capital (30%) - سرمایه
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
        character: { score: characterScore, weight: 0.4, status: characterScore >= 5 ? 'تایید' : 'ضعیف' },
        capacity: { score: capacityScore, weight: 0.3, status: capacityScore >= 5 ? 'تایید' : 'ضعیف' },
        capital: { score: capitalScore, weight: 0.3, status: capitalScore >= 5 ? 'تایید' : 'ضعیف' },
        totalScore: Math.round(totalScore * 10) / 10,
    };
}

// Main evaluation function
export function evaluateWithFundMetrics(input: FundMetricsInput): FundMetricsResult {
    const breakdown: CategoryBreakdown[] = [
        evaluateFinancial(input),
        evaluateTechnical(input),
        evaluateBusiness(input),
        evaluateContractual(input),
        evaluateManagement(input),
        evaluatePolitical(input),
    ];

    const overallScore = breakdown.reduce((sum, b) => sum + b.weightedScore, 0);

    let riskLevel: 'کم' | 'متوسط' | 'زیاد';
    if (overallScore >= 7) riskLevel = 'کم';
    else if (overallScore >= 4) riskLevel = 'متوسط';
    else riskLevel = 'زیاد';

    let decision: 'تایید' | 'مشروط' | 'رد';
    if (overallScore >= 6) decision = 'تایید';
    else if (overallScore >= 4) decision = 'مشروط';
    else decision = 'رد';

    const guaranteeAnalysis = analyzeGuarantees(input);

    return {
        overallScore: Math.round(overallScore * 10) / 10,
        riskLevel,
        decision,
        breakdown,
        guaranteeAnalysis,
    };
}
