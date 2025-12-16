import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';
import { checkUsageLimit, recordUsage } from '@/lib/usage-check';
import { calculateStartupScore, extractScoringInputsFromDescription, type IdeaInput } from '@/lib/scoring-engine';
import { getSimilarIdeas } from '@/lib/idea-database'; // prisma removed - DB disabled
import { detectCategory, detectRevenueModel } from '@/lib/category-detector';

interface EvaluationRequest {
    title: string;
    description: string;
    targetMarket: string;
    industry: string;
    skills: string;
    budgetRange: string;
    timeHorizon: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: EvaluationRequest = await request.json();

        console.log('Received international evaluation request:', {
            title: body.title,
            descriptionLength: body.description?.length,
            targetMarket: body.targetMarket,
            industry: body.industry,
        });

        if (!body.description || body.description.trim().length < 10) {
            console.log('Validation failed: description too short');
            return NextResponse.json(
                { error: 'Description is required and must be at least 10 characters' },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Groq API key not configured' },
                { status: 500 }
            );
        }

        // Extract scoring inputs from description and form data
        const scoringInput = extractScoringInputsFromDescription(body.description, body);

        // Calculate mathematical score using the scoring engine
        const scoringResult = calculateStartupScore(scoringInput as IdeaInput);

        // Detect category and find similar startups
        const detectedCategory = detectCategory(body.description, body.industry);
        const detectedRevenueModel = detectRevenueModel(body.description);

        let similarStartups: any[] = [];
        try {
            similarStartups = await getSimilarIdeas({
                category: detectedCategory,
                limit: 3
            });
            console.log(`Found ${similarStartups.length} similar startups in category: ${detectedCategory}`);
        } catch (error) {
            console.error('Error fetching similar startups:', error);
            // Continue without similar startups if database fails
        }

        // LLM Fallback: If fewer than 3 similar startups found, ask LLM to generate them
        let llmGeneratedStartups: any[] = [];
        if (similarStartups.length < 3) {
            try {
                const missingCount = 3 - similarStartups.length;
                console.log(`Generating ${missingCount} similar startups via LLM...`);

                const fallbackPrompt = `
You are a startup database expert. The user has an idea: "${body.title || 'Untitled'}: ${body.description}".
Category: ${detectedCategory}.

I need you to identify ${missingCount} REAL, EXISTING successful startups that are similar to this idea.
Do not invent fake startups. Use real companies like Stripe, Airbnb, Notion, Linear, etc.

Return ONLY a valid JSON array of objects with this structure:
[
  {
    "name": "Name of real startup",
    "tagline": "Short punchy tagline",
    "category": "${detectedCategory}",
    "revenueModel": "freemium" | "subscription" | "marketplace" | "transaction",
    "upvotes": 10000 (estimated number between 1000-50000),
    "website": "https://website.com",
    "techStack": ["react", "node", "aws"],
    "complexity": "medium",
    "funding": "Public" | "$X M" | "Bootstrapped",
    "revenue": "$X M+" (estimated annual revenue)
  }
],
"potentialAcquirers": [
]
`;

                const fallbackCompletion = await getGroqClient().chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON.' },
                        { role: 'user', content: fallbackPrompt }
                    ],
                    temperature: 0.5,
                    response_format: { type: 'json_object' }
                });

                const fallbackText = fallbackCompletion.choices[0].message.content;
                if (fallbackText) {
                    const parsed = JSON.parse(fallbackText);
                    // Handle case where LLM returns object with key instead of array
                    const startups = Array.isArray(parsed) ? parsed : (parsed.startups || parsed.companies || Object.values(parsed)[0]);

                    if (Array.isArray(startups)) {
                        llmGeneratedStartups = startups.slice(0, missingCount);
                        // Mark as generated so we can optionally show a badge
                        llmGeneratedStartups.forEach(s => s.source = 'llm-generated');
                    }
                }
            } catch (error) {
                console.error('LLM fallback failed:', error);
            }
        }

        // Merge database and LLM startups
        const allSimilarStartups = [...similarStartups, ...llmGeneratedStartups];

        console.log('Mathematical scoring complete:', {
            overallScore: scoringResult.overallScore,
            verdict: scoringResult.verdict,
            confidence: scoringResult.confidenceLevel
        });


        // Build the system prompt for international evaluation
        const systemPrompt = `You are an expert startup advisor with deep knowledge of global technology markets.

You have expertise in:
- Global market dynamics across North America, Europe, Asia Pacific, Latin America, and MENA
- Industry-specific insights: SaaS, Fintech, Healthcare, E-commerce, Consumer Tech, Enterprise
- Technical feasibility assessment for various tech stacks and team sizes
- Realistic budget ranges for MVPs and early-stage products (in USD)
- Competitive landscape analysis and market timing
- Regulatory considerations across different regions (GDPR, data privacy, financial regulations)

Evaluate startup ideas with brutal honesty. No fake encouragement. If an idea is derivative, weak, or faces insurmountable barriers, say so directly.

Respond ONLY with valid JSON with these exact keys:
{
  "verdict": "Garbage" | "Maybe" | "Promising",
  "market_analysis": "2-3 sentence analysis of overall market potential and opportunity size",
  "competition": "2-3 sentence analysis of competitive landscape and differentiation potential",
  "feasibility": "2-3 sentences about technical complexity and team requirements",
  "budget_estimate": "Estimated MVP budget range in USD (e.g., '<$5k', '$5k-$25k', '$25k-$100k', '$100k-$500k', '>$500k')",
  "regulatory_risk": "2-3 sentences about regulatory considerations, compliance requirements, or legal barriers",
  "risks": ["array", "of", "3-5", "specific", "major", "obstacles", "or", "risks"],
  "regulatory_risk": "2-3 sentences about regulatory considerations, compliance requirements, or legal barriers",
  "risks": ["array", "of", "3-5", "specific", "major", "obstacles", "or", "risks"],
  "justification": "2-3 sentences explaining the final verdict",
  "potentialAcquirers": [
    {
      "name": "Company Name",
      "reason": "Why they would buy this startup (1 sentence)"
    },
    {
      "name": "Company Name",
      "reason": "Why they would buy this startup (1 sentence)"
    },
    {
      "name": "Company Name",
      "reason": "Why they would buy this startup (1 sentence)"
    }
  ]
}

Key evaluation criteria:
1. Market potential (TAM, SAM, SOM, growth trajectory)
2. Competitive advantage (moat, differentiation, timing)
3. Technical feasibility (complexity, required skills, infrastructure needs)
4. Business model viability (unit economics, scalability, path to profitability)
5. Budget reality check (MVP cost, runway requirements, funding likelihood)
6. Team-market fit (skills alignment, domain expertise)

Be specific. Reference similar existing startups. Point out weak differentiation. Identify specific regulatory hurdles. Do not sugarcoat.`;

        const userPrompt = `Evaluate this startup idea:

**Title:** ${body.title || 'Untitled'}
**Description:** ${body.description}
**Target Market:** ${body.targetMarket}
**Industry:** ${body.industry || 'Technology'}
**Founder Skills:** ${body.skills}
**Budget Expectation:** ${body.budgetRange}
**Time Horizon:** ${body.timeHorizon}

Provide a brutally honest, realistic evaluation following the exact JSON format specified.`;

        const completion = await getGroqClient().chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) {
            throw new Error('Empty response from Groq');
        }

        console.log('Groq response received, parsing JSON...');
        const evaluation = JSON.parse(responseText);

        // Validate the response structure
        const requiredKeys = [
            'verdict',
            'market_analysis',
            'competition',
            'feasibility',
            'budget_estimate',
            'regulatory_risk',
            'risks',
            'justification',
            'potentialAcquirers',
        ];

        for (const key of requiredKeys) {
            if (!(key in evaluation)) {
                throw new Error(`Missing required key: ${key}`);
            }
        }

        // Combine LLM evaluation with mathematical scoring and similar startups
        const finalResult = {
            ...evaluation,
            // Add mathematical scores
            mathematicalScore: scoringResult.overallScore,
            scoreBreakdown: {
                market: scoringResult.marketScore,
                technical: scoringResult.technicalScore,
                differentiation: scoringResult.differentiationScore,
                viability: scoringResult.viabilityScore
            },
            detailedBreakdown: scoringResult.breakdown,
            confidenceLevel: scoringResult.confidenceLevel,
            keyInsights: scoringResult.keyInsights,
            // Keep LLM verdict but add mathematical verdict for comparison
            mathematicalVerdict: scoringResult.verdict,
            // Similar startups from database + LLM
            similarStartups: allSimilarStartups.map((startup: any) => ({
                name: startup.name,
                tagline: startup.tagline,
                category: startup.category,
                revenueModel: startup.revenueModel,
                upvotes: startup.upvotes,
                website: startup.website,
                techStack: JSON.parse(startup.techStack),
                complexity: startup.complexity,
                funding: startup.funding,
                revenue: startup.revenue,
            })),
            detectedCategory,
            detectedRevenueModel,
        };

        // Database save disabled - uncomment when DB is configured
        // try {
        //     await prisma.userSubmission.create({...});
        // } catch (dbError) {
        //     console.error('Failed to save submission to DB:', dbError);
        // }

        console.log('International evaluation successful, returning combined result');
        return NextResponse.json({
            ...evaluation,
            score: scoringResult.overallScore,
            scoreBreakdown: scoringResult.breakdown,
            similarStartups: allSimilarStartups
        });
    } catch (error) {
        console.error('Evaluation error:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Failed to parse AI response' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to evaluate idea. Please try again.' },
            { status: 500 }
        );
    }
}
