'use client';

import { useState, useEffect, useRef } from 'react';
import EmailCaptureModalEN from '@/components/EmailCaptureModalEN';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { evaluateWithFundMetricsEN, FundMetricsResultEN } from '@/lib/fund-metrics-en';

interface CounterfactualSuggestion {
    action: string;
    impact: string;
    probability_increase: string;
    score_improvement: string;
}

interface EvaluationResult {
    decision: 'Approved' | 'Conditional' | 'Rejected';
    overall_score: number;
    risk_level: 'Low' | 'Medium' | 'High';
    justification: string;
    team_score: number;
    product_score: number;
    market_score: number;
    financial_score: number;
    kpi_score: number;
    counterfactuals: CounterfactualSuggestion[];
    recommendations: string[];
}

const LOADING_MESSAGES = [
    'Connecting to the comprehensive fund system...',
    'Reviewing team credentials and records...',
    'Analyzing financial and market data...',
    'Calculating investment risk...',
    'Generating improvement scenarios...',
    'Preparing final report...',
];

export default function ParkDemoEN() {
    const [formData, setFormData] = useState({
        // Company Information
        companyName: '',
        companyType: 'private',
        yearsInMarket: '',
        teamSize: '',
        technicalTeam: '',

        // Product & Technical Status
        productStage: 'Idea',
        ipStatus: 'None',
        hasLicenses: 'some',
        techDependency: 'no',
        techEducation: 'related',

        // Financial Information
        salesTrend: 'stable',
        currentRevenue: '',
        retainedEarnings: '',
        currentRatio: '',
        debtRatio: 'moderate',
        receivablesDays: '',
        creditHistory: 'good',

        // Business
        marketSize: '',
        marketDemand: 'growing',
        competitionLevel: 'moderate',
        revenueModel: 'recurring',
        customerType: 'mixed',

        // Contractual
        commitmentHistory: 'good',
        overdueContracts: 'none',
        outsourcingStatus: 'none',

        // Other
        fundingRequest: '',
        traction: '',
    });

    const [loading, setLoading] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [metricsResult, setMetricsResult] = useState<FundMetricsResultEN | null>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            setLoadingMessageIndex(0);
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (metricsResult && resultRef.current) {
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [metricsResult]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setMetricsResult(null);

        // Build metrics input
        const metricsInput = {
            companyName: formData.companyName,
            companyType: formData.companyType,
            yearsInMarket: formData.yearsInMarket,
            teamSize: parseInt(formData.teamSize) || 0,
            technicalTeam: parseInt(formData.technicalTeam) || 0,
            productStage: formData.productStage,
            ipStatus: formData.ipStatus,
            hasLicenses: formData.hasLicenses,
            techDependency: formData.techDependency,
            techEducation: formData.techEducation,
            salesTrend: formData.salesTrend,
            currentRevenue: formData.currentRevenue,
            retainedEarnings: formData.retainedEarnings,
            currentRatio: formData.currentRatio,
            debtRatio: formData.debtRatio,
            receivablesDays: formData.receivablesDays,
            creditHistory: formData.creditHistory,
            marketSize: formData.marketSize,
            marketDemand: formData.marketDemand,
            competitionLevel: formData.competitionLevel,
            revenueModel: formData.revenueModel,
            customerType: formData.customerType,
            commitmentHistory: formData.commitmentHistory,
            overdueContracts: formData.overdueContracts,
            outsourcingStatus: formData.outsourcingStatus,
            fundingRequest: formData.fundingRequest,
            traction: formData.traction,
        };

        const metrics = evaluateWithFundMetricsEN(metricsInput);
        setMetricsResult(metrics);

        try {
            const response = await fetch('/api/park-evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Evaluation failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            toast.error('AI evaluation error');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (email: string) => {
        try {
            await fetch('/api/capture-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    idea: `Research & Technology Fund - ${formData.companyName}`,
                    verdict: result?.decision,
                }),
            });
            setShowEmailModal(false);
            toast.success('Full report will be sent to your email');
        } catch {
            toast.error('Error submitting request');
        }
    };

    const getDecisionStyles = (decision: string) => {
        if (decision === 'Approved') return { bg: 'bg-emerald-500', text: 'text-emerald-900', icon: '✅', label: 'Approved' };
        if (decision === 'Conditional') return { bg: 'bg-amber-500', text: 'text-amber-900', icon: '⚠️', label: 'Conditional' };
        return { bg: 'bg-rose-500', text: 'text-rose-900', icon: '❌', label: 'Rejected' };
    };

    const getRiskStyles = (risk: string) => {
        if (risk === 'Low') return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Low' };
        if (risk === 'Medium') return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Medium' };
        return { color: 'text-rose-600', bg: 'bg-rose-50', label: 'High' };
    };

    const fillDemoData = () => {
        setFormData({
            companyName: 'Alborz Tech Innovations',
            companyType: 'private',
            yearsInMarket: '4',
            teamSize: '8',
            technicalTeam: '5',
            productStage: 'MVP',
            ipStatus: 'Pending',
            hasLicenses: 'some',
            techDependency: 'no',
            techEducation: 'related',
            salesTrend: 'growing_high',
            currentRevenue: '120,000',
            retainedEarnings: '350,000',
            currentRatio: '1.8',
            debtRatio: 'moderate',
            receivablesDays: '45',
            creditHistory: 'good',
            marketSize: '50,000,000',
            marketDemand: 'growing',
            competitionLevel: 'moderate',
            revenueModel: 'recurring',
            customerType: 'mixed',
            commitmentHistory: 'good',
            overdueContracts: 'none',
            outsourcingStatus: 'partial',
            fundingRequest: '2,500,000',
            traction: 'Contracts with 3 industrial companies, Innovation Award winner 2023, Science Park technical approval',
        });
        toast.success('Demo data loaded');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 font-sans text-slate-900">
            <Toaster position="top-center" />
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-10 md:mb-16 animate-fade-in-down">
                    <div className="flex justify-center gap-3 mb-6">
                        <Link href="/" className="text-xs md:text-sm bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
                            <span>←</span> Back to Home
                        </Link>
                        <Link href="/park-demo" className="text-xs md:text-sm bg-slate-50 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors font-medium flex items-center gap-2">
                            🇮🇷 نسخه فارسی
                        </Link>
                    </div>
                    <div className="mb-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500">
                        Powered by AradAI ™
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Smart Evaluation System <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Research & Technology Fund</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Precise evaluation based on official fund criteria (AHP Matrix) + AI Analysis
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-10 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500"></div>

                    <div className="flex justify-end mb-6">
                        <button type="button" onClick={fillDemoData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all">
                            <span>🎯</span>
                            <span>Fill with Demo Data</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Company Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                Company Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Company / Startup Name *</label>
                                    <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Alborz Tech Innovations Inc." />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Legal Entity Type</label>
                                    <select value={formData.companyType} onChange={(e) => setFormData({ ...formData, companyType: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="private">Private Limited Company</option>
                                        <option value="public">Public Company</option>
                                        <option value="limited">Limited Liability Company</option>
                                        <option value="cooperative">Cooperative</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Years of Operation</label>
                                    <input type="number" value={formData.yearsInMarket} onChange={(e) => setFormData({ ...formData, yearsInMarket: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="3" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Team Size *</label>
                                    <input type="number" value={formData.teamSize} onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="5" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Technical Team Members</label>
                                    <input type="number" value={formData.technicalTeam} onChange={(e) => setFormData({ ...formData, technicalTeam: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="3" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Technical */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span className="bg-teal-100 text-teal-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                Technical & Product Status
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Product Stage</label>
                                    <select value={formData.productStage} onChange={(e) => setFormData({ ...formData, productStage: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="Idea">Initial Idea</option>
                                        <option value="Prototype">Prototype</option>
                                        <option value="MVP">MVP</option>
                                        <option value="Beta">Beta Version</option>
                                        <option value="Launched">Market Launch</option>
                                        <option value="Scaling">Scaling</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Intellectual Property Status</label>
                                    <select value={formData.ipStatus} onChange={(e) => setFormData({ ...formData, ipStatus: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="None">None</option>
                                        <option value="Pending">Registration Pending</option>
                                        <option value="Registered">Registered</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Product & Company Licenses</label>
                                    <select value={formData.hasLicenses} onChange={(e) => setFormData({ ...formData, hasLicenses: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="none">No licenses</option>
                                        <option value="some">Some licenses obtained</option>
                                        <option value="all">All licenses obtained</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Key Person Dependency?</label>
                                    <select value={formData.techDependency} onChange={(e) => setFormData({ ...formData, techDependency: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="yes">Yes, fully dependent on one person</option>
                                        <option value="partial">Partially</option>
                                        <option value="no">No, system-based</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Technical Team Expertise</label>
                                    <select value={formData.techEducation} onChange={(e) => setFormData({ ...formData, techEducation: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="none">None</option>
                                        <option value="unrelated">Unrelated education</option>
                                        <option value="similar">Similar field education</option>
                                        <option value="related">Related field education</option>
                                        <option value="top_university">Related education from top university</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Financial */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                                Financial & Economic Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">3-Year Sales Trend</label>
                                    <select value={formData.salesTrend} onChange={(e) => setFormData({ ...formData, salesTrend: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="declining">Declining</option>
                                        <option value="stable">Relatively stable</option>
                                        <option value="growing_low">Growing below inflation</option>
                                        <option value="growing_high">Growing above inflation</option>
                                        <option value="growing_exceptional">Exceptional growth</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Monthly Revenue ($)</label>
                                    <input type="text" value={formData.currentRevenue} onChange={(e) => setFormData({ ...formData, currentRevenue: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="100,000" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Retained Earnings ($)</label>
                                    <input type="text" value={formData.retainedEarnings} onChange={(e) => setFormData({ ...formData, retainedEarnings: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="500,000" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Debt Ratio</label>
                                    <select value={formData.debtRatio} onChange={(e) => setFormData({ ...formData, debtRatio: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="low">Low (below 30%)</option>
                                        <option value="moderate">Moderate (30-60%)</option>
                                        <option value="high">High (above 60%)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Receivables Collection Period (Days)</label>
                                    <input type="number" value={formData.receivablesDays} onChange={(e) => setFormData({ ...formData, receivablesDays: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="60" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Credit History</label>
                                    <select value={formData.creditHistory} onChange={(e) => setFormData({ ...formData, creditHistory: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="excellent">Excellent (no bounced checks)</option>
                                        <option value="good">Good</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Business */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
                                Business & Market
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Market Size ($)</label>
                                    <input type="text" value={formData.marketSize} onChange={(e) => setFormData({ ...formData, marketSize: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="100,000,000" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Market Demand</label>
                                    <select value={formData.marketDemand} onChange={(e) => setFormData({ ...formData, marketDemand: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="negative">Negative demand</option>
                                        <option value="zero">Zero demand</option>
                                        <option value="hidden">Hidden demand</option>
                                        <option value="declining">Declining demand</option>
                                        <option value="stable">Stable demand</option>
                                        <option value="growing">Growing demand</option>
                                        <option value="full">Full demand</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Industry Competition Level</label>
                                    <select value={formData.competitionLevel} onChange={(e) => setFormData({ ...formData, competitionLevel: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="monopoly">Complete monopoly</option>
                                        <option value="low">Low competition</option>
                                        <option value="moderate">Moderate competition</option>
                                        <option value="high">High competition</option>
                                        <option value="full">Perfect competition</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Revenue Model</label>
                                    <select value={formData.revenueModel} onChange={(e) => setFormData({ ...formData, revenueModel: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="none">Not yet defined</option>
                                        <option value="one_time">One-time sales</option>
                                        <option value="recurring">Subscription / Recurring</option>
                                        <option value="multiple">Multiple streams</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Customer Type</label>
                                    <select value={formData.customerType} onChange={(e) => setFormData({ ...formData, customerType: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="gov_bad">Single govt client with collection issues</option>
                                        <option value="gov_good">Single govt client, reliable payments</option>
                                        <option value="mixed_bad">Mixed with collection issues</option>
                                        <option value="mixed">Mixed govt & private, reliable</option>
                                        <option value="mixed_export">Mixed with export contracts</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Contractual */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
                                Contractual History & Commitments
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Commitment Track Record</label>
                                    <select value={formData.commitmentHistory} onChange={(e) => setFormData({ ...formData, commitmentHistory: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="poor">Evidence of customer dissatisfaction</option>
                                        <option value="no_record">No track record available</option>
                                        <option value="good">Customer satisfaction</option>
                                        <option value="excellent">Completion certificates available</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Overdue Current Contracts</label>
                                    <select value={formData.overdueContracts} onChange={(e) => setFormData({ ...formData, overdueContracts: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="many">Many</option>
                                        <option value="some">Some</option>
                                        <option value="few">Few</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Outsourcing Status</label>
                                    <select value={formData.outsourcingStatus} onChange={(e) => setFormData({ ...formData, outsourcingStatus: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="core_monopoly">Core functions outsourced (sole contractor)</option>
                                        <option value="core">Core functions outsourced</option>
                                        <option value="partial_monopoly">Non-core outsourced (sole contractor)</option>
                                        <option value="partial">Non-core functions outsourced</option>
                                        <option value="none">No outsourcing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Funding Request Amount ($) *</label>
                                    <input type="text" value={formData.fundingRequest} onChange={(e) => setFormData({ ...formData, fundingRequest: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="2,500,000" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Key Achievements & Contracts</label>
                                    <textarea value={formData.traction} onChange={(e) => setFormData({ ...formData, traction: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none" placeholder="Major contracts, awards, certifications, partnerships..." />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !formData.companyName || !formData.fundingRequest} className="group relative w-full mt-6 px-6 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{LOADING_MESSAGES[loadingMessageIndex]}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📊</span>
                                        <span>Evaluate Based on Fund Criteria</span>
                                    </>
                                )}
                            </span>
                            {!loading && <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>}
                        </button>
                    </form>
                </div>

                {/* Rule-Based Metrics Section */}
                {metricsResult && (
                    <div ref={resultRef} className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 md:p-10 text-white shadow-2xl mb-8 relative overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500 rounded-full blur-[120px] opacity-10 -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-10 -ml-20 -mb-20"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">📐</span>
                                <div>
                                    <h2 className="text-2xl font-bold">Fund Criteria-Based Evaluation</h2>
                                    <p className="text-indigo-200 text-sm">Calculated based on AHP matrix and official weights (without AI)</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                                    <div className="text-5xl font-black mb-2">{metricsResult.overallScore}</div>
                                    <div className="text-indigo-200 text-sm font-medium">Overall Score /10</div>
                                </div>
                                <div className={`rounded-2xl p-6 text-center border border-white/10 ${metricsResult.decision === 'Approved' ? 'bg-emerald-500/20' :
                                    metricsResult.decision === 'Conditional' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                                    }`}>
                                    <div className="text-3xl font-black mb-2">{metricsResult.decision}</div>
                                    <div className="text-indigo-200 text-sm font-medium">Rule-Based Decision</div>
                                </div>
                                <div className={`rounded-2xl p-6 text-center border border-white/10 ${metricsResult.riskLevel === 'Low' ? 'bg-emerald-500/20' :
                                    metricsResult.riskLevel === 'Medium' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                                    }`}>
                                    <div className="text-3xl font-black mb-2">{metricsResult.riskLevel}</div>
                                    <div className="text-indigo-200 text-sm font-medium">Risk Level</div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span>📊</span> Score Breakdown by Excel Indicators
                                </h3>
                                <div className="space-y-3">
                                    {metricsResult.breakdown.map((item, idx) => (
                                        <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold">{item.displayName}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-indigo-300 text-sm">Weight: {(item.weight * 100).toFixed(1)}%</span>
                                                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{item.score}/10</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                                <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${item.score * 10}%` }}></div>
                                            </div>
                                            <p className="text-indigo-200 text-xs">{item.details}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span>🔐</span> Guarantee Analysis (5C Model)
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Character', data: metricsResult.guaranteeAnalysis.character },
                                        { label: 'Capacity', data: metricsResult.guaranteeAnalysis.capacity },
                                        { label: 'Capital', data: metricsResult.guaranteeAnalysis.capital },
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                            <div className="text-sm text-indigo-300 mb-1">{item.label}</div>
                                            <div className="text-2xl font-black mb-1">{item.data.score}/10</div>
                                            <div className="text-xs text-indigo-400">Weight: {(item.data.weight * 100).toFixed(0)}%</div>
                                            <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${item.data.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                {item.data.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center mt-4 pt-4 border-t border-white/10">
                                    <span className="text-indigo-300 text-sm">Guarantee Score: </span>
                                    <span className="text-xl font-black">{metricsResult.guaranteeAnalysis.totalScore}/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Results */}
                {result && (
                    <div className="animate-fade-in-up space-y-6 md:space-y-8">
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                            <div className={`p-8 md:p-10 bg-gradient-to-b ${getDecisionStyles(result.decision).bg}/10`}>
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">AI Analysis</div>
                                        <h2 className={`text-4xl md:text-6xl font-black mb-6 flex items-center justify-center md:justify-start gap-4 ${getDecisionStyles(result.decision).text}`}>
                                            {getDecisionStyles(result.decision).icon}
                                            {getDecisionStyles(result.decision).label}
                                        </h2>
                                        <p className="text-lg text-slate-700 leading-relaxed font-medium bg-white/50 p-4 rounded-xl border border-dashed border-slate-300">
                                            {result.justification}
                                        </p>
                                    </div>

                                    <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto min-w-[300px]">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                                            <div className="text-3xl font-black text-slate-800 mb-1">{result.overall_score}<span className="text-base text-slate-400 font-normal">/10</span></div>
                                            <div className="text-xs font-bold text-slate-500">AI Score</div>
                                        </div>
                                        <div className={`p-4 rounded-2xl shadow-sm border ${getRiskStyles(result.risk_level).bg} border-transparent text-center flex flex-col justify-center`}>
                                            <div className={`text-2xl font-black mb-1 ${getRiskStyles(result.risk_level).color}`}>{getRiskStyles(result.risk_level).label}</div>
                                            <div className={`text-xs font-bold opacity-80 ${getRiskStyles(result.risk_level).color}`}>Risk Level</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.counterfactuals && result.counterfactuals.length > 0 && (
                            <div className="bg-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">⚡ Recommendations</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {result.counterfactuals.map((cf, idx) => (
                                            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800 transition-colors">
                                                <h4 className="font-bold text-white text-lg mb-1">{cf.action}</h4>
                                                <p className="text-slate-400 text-sm mb-2">{cf.impact}</p>
                                                <div className="flex gap-3">
                                                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                                                        📈 +{cf.probability_increase}%
                                                    </span>
                                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                                                        ⭐ +{cf.score_improvement}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center pt-8 border-t border-slate-200">
                            <button onClick={() => setShowEmailModal(true)} className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                <span>📧</span>
                                <span>Get PDF Report via Email</span>
                            </button>
                        </div>
                    </div>
                )}

                <EmailCaptureModalEN isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSubmit={handleEmailSubmit} />
            </div>
        </div>
    );
}
