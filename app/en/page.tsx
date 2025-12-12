'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import ScoreRadarChart from '@/components/ScoreRadarChart';
import PricingModal from '@/components/PricingModal';
import EmailCaptureModalEN from '@/components/EmailCaptureModalEN';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EvaluationResult {
    verdict: 'Garbage' | 'Maybe' | 'Promising';
    score: number;
    justification: string;
    market_analysis: string;
    competition: string;
    feasibility: string;
    budget_estimate: string;
    regulatory_risk: string;
    risks: string[];
    detectedRevenueModel?: string;
    detectedCategory?: string;
    similarStartups?: Array<{
        name: string;
        description: string;
        reason: string;
        website?: string;
        funding?: string;
        revenue?: string;
        category?: string;
        revenueModel?: string;
        complexity?: string;
        upvotes?: number;
        tagline?: string;
    }>;
    scoreBreakdown?: {
        market: number;
        technical: number;
        differentiation: number;
        viability: number;
    };
    potentialAcquirers?: Array<{
        name: string;
        reason: string;
    }>;
    premium?: {
        roadmap: Array<{
            phase: string;
            duration: string;
            budget: string;
            tasks: string[];
            team_needed: string[];
        }>;
        pre_launch_steps: string[];
    };
    // Support legacy field names for safety
    market_iran?: string;
    market_global?: string;
    budget_range_eur?: string;
    budget_range_IRR?: string;
}

const LOADING_MESSAGES = [
    'Connecting to AI server...',
    'Analyzing market opportunity...',
    'Evaluating competition landscape...',
    'Calculating MVP costs...',
    'Assessing regulatory requirements...',
    'Generating final verdict...',
];

export default function HomeEN() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetMarket: 'Global',
        industry: 'Technology',
        skills: 'Tech',
        budgetRange: 'Not sure',
        timeHorizon: '1-3 years',
    });
    const [loading, setLoading] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Premium & Pricing State
    const [showPricing, setShowPricing] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    // Pitch Deck State
    const [showPitchDeck, setShowPitchDeck] = useState(false);
    const [pitchDeckData, setPitchDeckData] = useState<any>(null);
    const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const [generatingIdea, setGeneratingIdea] = useState(false);
    const [loadingPremium, setLoadingPremium] = useState(false);
    const [showPremium, setShowPremium] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    // Load premium status from local storage
    useEffect(() => {
        const storedPremium = localStorage.getItem('isPremium');
        if (storedPremium === 'true') {
            setIsPremium(true);
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            setLoadingMessageIndex(0);
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (result && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        setShowPremium(false);

        try {
            const response = await fetch('/api/evaluate-en', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Evaluation failed');
            }

            const data = await response.json();
            const finalScore = data.mathematicalScore || data.score || 50;
            setResult({ ...data, score: finalScore });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
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
                    idea: formData.title || formData.description.substring(0, 100),
                    verdict: result?.verdict,
                }),
            });
            setShowEmailModal(false);
            toast.success('Email registered successfully');
        } catch (err) {
            console.error('Failed to capture email:', err);
            toast.error('Error registering email');
        }
    };

    const getVerdictStyles = (verdict: string) => {
        if (verdict === 'Promising') return {
            bg: 'bg-emerald-500',
            text: 'text-emerald-900',
            border: 'border-emerald-200',
            gradient: 'from-emerald-500 to-teal-600',
            icon: '🚀',
            label: 'Promising'
        };
        if (verdict === 'Maybe') return {
            bg: 'bg-amber-500',
            text: 'text-amber-900',
            border: 'border-amber-200',
            gradient: 'from-amber-500 to-orange-500',
            icon: '🤔',
            label: 'Maybe'
        };
        return {
            bg: 'bg-rose-500',
            text: 'text-rose-900',
            border: 'border-rose-200',
            gradient: 'from-rose-500 to-red-600',
            icon: '🗑️',
            label: 'Not Viable'
        };
    };

    const generateCreativeIdea = async () => {
        if (!formData.description || formData.description.length < 10) {
            setError('Please enter an idea first so we can create a more creative version');
            return;
        }

        setGeneratingIdea(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-idea-en', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseIdea: formData.description,
                    mode: 'creative',
                    targetMarket: formData.targetMarket,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate idea');

            const data = await response.json();
            setFormData({
                ...formData,
                title: data.title,
                description: data.description,
            });
        } catch (err) {
            setError('Error generating idea. Please try again.');
        } finally {
            setGeneratingIdea(false);
        }
    };

    const generateRandomIdea = async () => {
        setGeneratingIdea(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-idea-en', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'random',
                    targetMarket: formData.targetMarket,
                    skills: formData.skills,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate idea');

            const data = await response.json();
            setFormData({
                ...formData,
                title: data.title,
                description: data.description,
            });
        } catch (err) {
            setError('Error generating random idea. Please try again.');
        } finally {
            setGeneratingIdea(false);
        }
    };

    const getPremiumReport = async () => {
        if (!result) return;

        if (!isPremium) {
            setShowPricing(true);
            return;
        }

        setLoadingPremium(true);
        setError(null);

        try {
            const response = await fetch('/api/premium-report-en', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea: formData.description,
                    market: formData.targetMarket,
                    initialAnalysis: result
                }),
            });

            if (!response.ok) throw new Error('Failed to generate report');

            const data = await response.json();
            setResult({
                ...result,
                premium: data
            });
            setShowPremium(true);
        } catch (err) {
            setError('Error generating premium report');
        } finally {
            setLoadingPremium(false);
        }
    };

    const generatePitchDeck = async () => {
        setIsGeneratingDeck(true);
        setShowPitchDeck(true);
        try {
            const response = await fetch('/api/generate-pitch-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    industry: formData.industry,
                    targetMarket: formData.targetMarket,
                    revenueModel: result?.detectedRevenueModel || 'Generic'
                })
            });
            const data = await response.json();
            if (data.slides) {
                setPitchDeckData(data);
                setCurrentSlideIndex(0);
            }
        } catch (error) {
            console.error('Failed to generate deck', error);
        } finally {
            setIsGeneratingDeck(false);
        }
    };

    const copyResult = () => {
        if (!result) return;
        const text = `
🎯 Startup Idea Evaluation: ${formData.title}
Verdict: ${getVerdictStyles(result.verdict).label}
Score: ${result.score}/100

Market Analysis: ${result.market_analysis}
Competition: ${result.competition}

Evaluated by StartupEvaluator.app
        `;
        navigator.clipboard.writeText(text);
        toast.success('Result copied to clipboard!');
    };

    const handleDownloadPDF = async () => {
        if (!resultRef.current) return;

        // Gate for premium
        if (!isPremium) {
            setShowPricing(true);
            return;
        }

        const toastId = toast.loading('Generating Professional Report...');

        try {
            // Wait a bit for charts to fully render/animate
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(resultRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                ignoreElements: (element) => {
                    // Ignore buttons in the PDF
                    return element.tagName === 'BUTTON';
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${formData.title.replace(/\s+/g, '-').toLowerCase() || 'startup-report'}.pdf`);

            toast.success('Report downloaded successfully', { id: toastId });
        } catch (err) {
            console.error('PDF Generation failed:', err);
            toast.error('Could not generate PDF', { id: toastId });
        }
    };


    // Helper to safely extract score numbers whether they are raw numbers or objects
    const getSafeScore = (val: any): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'object' && val !== null) {
            return Number(val.weighted || val.score || val.overallScore || 0);
        }
        return Number(val) || 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 md:py-16 px-4 md:px-8 font-sans text-slate-900" dir="ltr">
            <Toaster position="top-center" />
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12 animate-fade-in md:mb-16">
                    <div className="flex justify-center gap-4 mb-6">
                        <Link href="/en" className="text-sm font-bold text-slate-900 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                            🇺🇸 English
                        </Link>
                        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 px-4 py-2 hover:bg-white/50 rounded-full transition-all">
                            🇮🇷 فارسی
                        </Link>
                    </div>
                    <div className="mb-4 inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-xs font-semibold text-blue-600">
                        Powered by Advanced AI
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Smart</span> Startup Idea Evaluator
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Get a brutally honest, data-driven analysis of your startup idea.
                        <br className="hidden md:block" />
                        <span className="text-sm md:text-base text-slate-500 mt-2 block">
                            Powered by AI trained on thousands of successful and failed startups
                        </span>
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Idea Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400"
                                    placeholder="e.g., AI-powered fitness coaching platform"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
                                    <span>Idea Description <span className="text-red-500">*</span></span>
                                    <span className="text-xs font-normal text-slate-400">Minimum 10 characters</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 resize-none"
                                    placeholder="Describe your idea in detail. What problem does it solve? Who are your target customers? What makes it unique?"
                                />

                                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                                    <button
                                        type="button"
                                        onClick={generateCreativeIdea}
                                        disabled={generatingIdea || !formData.description}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
                                    >
                                        {generatingIdea ? '⏳ ...' : '✨ Enhance with AI'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={generateRandomIdea}
                                        disabled={generatingIdea}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
                                    >
                                        {generatingIdea ? '⏳ ...' : '🎲 Random Idea'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Market</label>
                                    <div className="relative">
                                        <select
                                            value={formData.targetMarket}
                                            onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="Global">Global</option>
                                            <option value="North America">North America</option>
                                            <option value="Europe">Europe</option>
                                            <option value="Asia Pacific">Asia Pacific</option>
                                            <option value="Latin America">Latin America</option>
                                            <option value="Middle East & Africa">Middle East & Africa</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                                    <div className="relative">
                                        <select
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="Technology">Technology</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Fintech">Fintech</option>
                                            <option value="E-commerce">E-commerce</option>
                                            <option value="Education">Education</option>
                                            <option value="SaaS">SaaS</option>
                                            <option value="Consumer">Consumer</option>
                                            <option value="Enterprise">Enterprise</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Initial Budget (USD)</label>
                                    <div className="relative">
                                        <select
                                            value={formData.budgetRange}
                                            onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="Not sure">Not sure yet</option>
                                            <option value="< $5k">Less than $5,000</option>
                                            <option value="$5k-$25k">$5,000 - $25,000</option>
                                            <option value="$25k-$100k">$25,000 - $100,000</option>
                                            <option value="$100k-$500k">$100,000 - $500,000</option>
                                            <option value="> $500k">More than $500,000</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Time Horizon</label>
                                    <div className="relative">
                                        <select
                                            value={formData.timeHorizon}
                                            onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="Short-term">Short-term (less than 6 months)</option>
                                            <option value="1-3 years">Medium-term (1 to 3 years)</option>
                                            <option value="Long-term">Long-term (more than 3 years)</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.description}
                            className="group relative w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 overflow-hidden"
                        >
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
                                        <span>🚀</span>
                                        <span>Evaluate My Idea</span>
                                    </>
                                )}
                            </span>
                            {!loading && <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>}
                        </button>
                    </form>

                    {/* Error */}
                    {error && (
                        <div className="mt-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-start gap-3 animate-shake">
                            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div>
                                <p className="font-bold">Error</p>
                                <p className="text-sm mt-1 opacity-90">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pitch Deck Modal */}
                {showPitchDeck && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                            {/* Deck Header */}
                            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📊</span>
                                    <h3 className="font-bold">Investor Pitch Deck</h3>
                                </div>
                                <button
                                    onClick={() => setShowPitchDeck(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Deck Content */}
                            <div className="flex-1 bg-slate-50 relative flex items-center justify-center p-8">
                                {isGeneratingDeck ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <h4 className="text-xl font-bold text-slate-800 mb-2">Generating Your Deck...</h4>
                                        <p className="text-slate-500 animate-pulse">Drafting slides based on YCombinator standards</p>
                                    </div>
                                ) : pitchDeckData ? (
                                    <div className="bg-white w-full h-full shadow-lg rounded-xl flex flex-col border border-slate-200 overflow-hidden">
                                        {/* Slide Number */}
                                        <div className="absolute top-12 right-12 text-slate-300 font-bold text-6xl opacity-20 pointer-events-none">
                                            {currentSlideIndex + 1}
                                        </div>

                                        {/* Slide Content */}
                                        <div className="flex-1 p-12 flex flex-col justify-center relative z-10">
                                            <h2 className="text-4xl font-black text-slate-800 mb-8 border-l-8 border-indigo-600 pl-6">
                                                {pitchDeckData.slides[currentSlideIndex].title}
                                            </h2>
                                            <div className="space-y-4 pl-8">
                                                {pitchDeckData.slides[currentSlideIndex].content.map((point: string, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-3">
                                                        <span className="text-indigo-500 mt-1.5">•</span>
                                                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                                            {point}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Visual Hint */}
                                            <div className="mt-12 bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-center gap-3 text-indigo-700 text-sm italic">
                                                <span>🖼️ Suggested Visual:</span>
                                                <span>{pitchDeckData.slides[currentSlideIndex].visualPrompt}</span>
                                            </div>
                                        </div>

                                        {/* Footer with Controls */}
                                        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                                                    disabled={currentSlideIndex === 0}
                                                    className="px-6 py-2 rounded-lg bg-white border hover:bg-slate-50 disabled:opacity-50 font-bold transition-all"
                                                >
                                                    ← Previous
                                                </button>
                                                <span className="text-slate-400 font-mono text-sm">
                                                    {currentSlideIndex + 1} / {pitchDeckData.slides.length}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentSlideIndex(Math.min(pitchDeckData.slides.length - 1, currentSlideIndex + 1))}
                                                    disabled={currentSlideIndex === pitchDeckData.slides.length - 1}
                                                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-bold shadow-md hover:shadow-lg transition-all"
                                                >
                                                    Next Slide →
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="text-slate-400 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 transition-colors"
                                            >
                                                <span>↓</span> Download PDF {isPremium ? '' : '🔒'}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div ref={resultRef} className="animate-fade-in-up space-y-6 md:space-y-8">

                        {/* NEW: Action Buttons (Pitch Deck) */}
                        <div className="bg-indigo-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                                    <h3 className="text-2xl font-bold">Ready to Launch?</h3>
                                </div>
                                <p className="text-indigo-200">Turn this analysis into a professional investor pitch deck instantly.</p>
                            </div>
                            <button
                                onClick={generatePitchDeck}
                                className="relative z-10 bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                            >
                                <span>📊</span> Generate Pitch Deck
                            </button>
                        </div>

                        {/* Verdict Card */}
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                            <div className={`p-8 md:p-10 bg-gradient-to-b ${getVerdictStyles(result.verdict).bg}/10`}>
                                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                                    <div className="flex-1 text-center md:text-left">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 bg-white border shadow-sm ${getVerdictStyles(result.verdict).text} ${getVerdictStyles(result.verdict).border}`}>
                                            <span>Final Verdict</span>
                                        </div>
                                        <h2 className={`text-4xl md:text-5xl font-black mb-4 ${getVerdictStyles(result.verdict).text}`}>
                                            {getVerdictStyles(result.verdict).label}
                                        </h2>
                                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                            {result.justification}
                                        </p>
                                    </div>

                                    <div className="flex-shrink-0 relative">
                                        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-8 border-slate-100 bg-white shadow-inner flex items-center justify-center relative">
                                            <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-current border-r-current rotate-45" style={{ color: result.verdict === 'Promising' ? '#10b981' : result.verdict === 'Maybe' ? '#f59e0b' : '#f43f5e' }}></div>
                                            <div className="text-center z-10">
                                                <span className="block text-4xl md:text-5xl font-black text-slate-800">{getSafeScore(result.score)}</span>
                                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Score</span>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-3xl">
                                            {getVerdictStyles(result.verdict).icon}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center md:justify-start mt-6 gap-3">
                                    <button
                                        onClick={() => setShowEmailModal(true)}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors px-3 py-1 rounded-lg hover:bg-blue-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        Send to Email
                                    </button>
                                    <button
                                        onClick={copyResult}
                                        className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors px-3 py-1 rounded-lg hover:bg-black/5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                        Copy Result
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Similar Startups Card */}
                        {result.similarStartups && result.similarStartups.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl shadow-xl overflow-hidden border border-purple-100">
                                <div className="p-8 md:p-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800">Similar Successful Startups</h3>
                                            <p className="text-sm text-slate-600">Your idea is similar to these proven companies in {result.detectedCategory}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {result.similarStartups.map((startup, idx) => (
                                            <div key={idx} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-100">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-xl font-bold text-slate-800">{startup.name}</h4>
                                                            {startup.upvotes && (
                                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                                                    ▲ {startup.upvotes.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-3">{startup.tagline}</p>
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                                {startup.category}
                                                            </span>
                                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                                {startup.revenueModel}
                                                            </span>
                                                            {startup.complexity && (
                                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                                    {startup.complexity} complexity
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(startup.funding || startup.revenue) && (
                                                            <div className="flex gap-4 text-xs text-slate-500">
                                                                {startup.funding && <span>💰 {startup.funding} raised</span>}
                                                                {startup.revenue && <span>📈 {startup.revenue} revenue</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {startup.website && (
                                                        <a
                                                            href={startup.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visual Radar Chart */}
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8 overflow-hidden relative">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">360° Analysis</h3>
                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">Visual Breakdown</span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-full md:w-1/2">
                                    <ScoreRadarChart
                                        scores={{
                                            market: getSafeScore(result.scoreBreakdown?.market) || 70,
                                            technical: getSafeScore(result.scoreBreakdown?.technical) || 70,
                                            differentiation: getSafeScore(result.scoreBreakdown?.differentiation) || 70,
                                            viability: getSafeScore(result.scoreBreakdown?.viability) || 70
                                        }}
                                    />
                                </div>
                                <div className="w-full md:w-1/2 space-y-4">
                                    <h4 className="font-bold text-slate-600 mb-2">Key Drivers</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-700">🎯 Market Fit</span>
                                            <span className="font-bold text-slate-900">{getSafeScore(result.scoreBreakdown?.market) || 'N/A'}/100</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-700">⚙️ Technical Feasibility</span>
                                            <span className="font-bold text-slate-900">{getSafeScore(result.scoreBreakdown?.technical) || 'N/A'}/100</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-700">🦄 Uniqueness</span>
                                            <span className="font-bold text-slate-900">{getSafeScore(result.scoreBreakdown?.differentiation) || 'N/A'}/100</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-700">💼 Viability</span>
                                            <span className="font-bold text-slate-900">{getSafeScore(result.scoreBreakdown?.viability) || 'N/A'}/100</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Potential Acquirers Intelligence */}
                        {result.potentialAcquirers && (
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-2xl">🤝</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Potential Acquirers Intelligence</h3>
                                            <p className="text-slate-400 text-sm">Who might acquire this startup?</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        {result.potentialAcquirers.map((acquirer, idx) => (
                                            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/5 hover:bg-white/15 transition-all group">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                                    <h4 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                                                        {acquirer.name}
                                                    </h4>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-3 mt-1">
                                                    "{acquirer.reason}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid Stats */}
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            {[
                                { title: 'Market Opportunity', icon: '🎯', content: result.market_analysis, color: 'blue' },
                                { title: 'Competition Analysis', icon: '⚔️', content: result.competition, color: 'indigo' },
                                { title: 'Technical Feasibility', icon: '⚙️', content: result.feasibility, color: 'slate' },
                                { title: 'Budget Estimate', icon: '💰', content: result.budget_estimate, color: 'emerald' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center text-xl`}>
                                            {item.icon}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                        {item.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Risk Box */}
                        <div className="bg-orange-50 rounded-2xl p-6 md:p-8 border border-orange-100">
                            <div className="flex items-start gap-4">
                                <div className="bg-orange-100 text-orange-600 p-2 rounded-lg shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-orange-900 mb-2 text-lg">Key Risks & Challenges</h3>
                                    <p className="text-orange-800 mb-4">{result.regulatory_risk}</p>
                                    <ul className="space-y-2">
                                        {result.risks.map((risk, idx) => (
                                            <li key={idx} className="flex gap-2 text-orange-800/80 text-sm">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                                                <span>{risk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Premium CTAs */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white rounded-2xl p-8 border border-slate-100 text-center">
                                <h3 className="text-2xl font-black text-slate-800 mb-4">Need an Execution Roadmap?</h3>
                                <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                                    Get a step-by-step action plan, detailed budget breakdown, and team requirements to turn this idea into reality.
                                </p>
                                <button
                                    onClick={getPremiumReport}
                                    disabled={loadingPremium || showPremium}
                                    className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                >
                                    {loadingPremium ? '⏳ Generating strategy...' : showPremium ? '✓ Report opened below' : '🔓 Get Detailed Roadmap (Free)'}
                                </button>
                            </div>
                        </div>

                        {/* Premium Report Content */}
                        {showPremium && result.premium && (
                            <div className="space-y-8 animate-fade-in-up">
                                {/* Pre-launch Steps */}
                                <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
                                    <div className="bg-purple-50 p-6 border-b border-purple-100">
                                        <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                                            <span>📋</span> Pre-Launch Checklist
                                        </h3>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <ul className="space-y-4">
                                            {result.premium.pre_launch_steps.map((step, idx) => (
                                                <li key={idx} className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-slate-700 leading-relaxed pt-1">{step}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Roadmap Timeline */}
                                <div className="relative">
                                    <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 hidden md:block"></div>
                                    <div className="space-y-6">
                                        {result.premium.roadmap.map((phase, idx) => (
                                            <div key={idx} className="relative md:pl-20">
                                                <div className="absolute left-6 top-6 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-md ring-1 ring-slate-200 hidden md:block z-10"></div>

                                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-50 pb-4">
                                                        <div>
                                                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Phase {idx + 1}</div>
                                                            <h4 className="text-xl font-bold text-slate-900">{phase.phase}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full">⏱️ {phase.duration}</span>
                                                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">💰 {phase.budget}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <h5 className="font-semibold text-slate-800 mb-2">Tasks:</h5>
                                                            <ul className="grid md:grid-cols-2 gap-2">
                                                                {phase.tasks.map((task, tIdx) => (
                                                                    <li key={tIdx} className="flex items-start gap-2 text-slate-600 text-sm">
                                                                        <svg className="w-4 h-4 text-emerald-500 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                                        <span>{task}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {phase.team_needed.length > 0 && (
                                                            <div className="pt-2">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {phase.team_needed.map((member, mIdx) => (
                                                                        <span key={mIdx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                                                            👤 {member}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <PricingModal
                    isOpen={showPricing}
                    onClose={() => setShowPricing(false)}
                    lang="en"
                    onSelectPlan={(plan) => {
                        setShowPricing(false);
                        // Simulate payment flow with a realistic delay
                        toast.promise(
                            new Promise((resolve) => setTimeout(resolve, 2000)),
                            {
                                loading: 'Processing secure payment...',
                                success: () => {
                                    setIsPremium(true);
                                    localStorage.setItem('isPremium', 'true'); // Persist premium status
                                    return 'Upgrade successful! Premium features unlocked.';
                                },
                                error: 'Payment failed with test card',
                            }
                        );
                    }}
                />

                <EmailCaptureModalEN
                    isOpen={showEmailModal}
                    onClose={() => setShowEmailModal(false)}
                    onSubmit={handleEmailSubmit}
                />
            </div>
        </div>
    );
}
