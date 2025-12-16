import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';
import { checkUsageLimit, recordUsage } from '@/lib/usage-check';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Groq API key not configured' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are an expert startup strategy consultant with deep knowledge of global markets.

Task: Provide a detailed report including:
1. Pre-launch steps (permits, market research, legal matters, preparation)
2. Complete roadmap with precise phases, required team, and budget breakdown

JSON response format:
{
  "pre_launch_steps": [
    "First step with complete details",
    "Second step with complete details",
    ...
  ],
  "roadmap": [
    {
      "phase": "Phase name",
      "duration": "Time duration (e.g., 2-3 months)",
      "tasks": ["Task 1", "Task 2", ...],
      "team_needed": ["Role 1", "Role 2", ...],
      "budget": "Budget range in USD"
    },
    ...
  ]
}

Important rules:
- Minimum 8-10 pre-launch steps
- Minimum 5-6 phases in roadmap
- Each phase has 4-8 specific tasks
- Realistic and practical teams (e.g., Frontend Developer, Product Manager, Digital Marketer)
- Realistic budget based on global market rates
- Consider regulatory requirements for the target market
- Operational and detailed information
- All text must be in English

For pre-launch steps include:
- Market research and competitive analysis
- Obtaining necessary permits and licenses
- Legal and tax consultation
- Business plan preparation
- Testing initial assumptions
- Defining revenue model
- Identifying suppliers and partners
- Calculating initial capital

For roadmap include phases:
- Research and Validation
- Design and Prototyping
- MVP Development
- Beta Testing
- Public Launch
- Growth and Scaling`;

        const userPrompt = `Idea: ${body.idea}
Title: ${body.title || 'None'}
Target Market: ${body.targetMarket}
Skills: ${body.skills}
Budget Expectation: ${body.budgetRange}
Time Horizon: ${body.timeHorizon}

Provide a detailed and practical report for executing this idea.`;

        console.log('Generating international premium report...');

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

        const premiumData = JSON.parse(responseText);

        // Validate response structure
        if (!premiumData.pre_launch_steps || !Array.isArray(premiumData.pre_launch_steps)) {
            throw new Error('Invalid pre_launch_steps format');
        }

        if (!premiumData.roadmap || !Array.isArray(premiumData.roadmap)) {
            throw new Error('Invalid roadmap format');
        }

        console.log('International premium report generated successfully');

        return NextResponse.json(premiumData);
    } catch (error) {
        console.error('Premium report error:', error);
        return NextResponse.json(
            { error: 'Failed to generate premium report' },
            { status: 500 }
        );
    }
}
