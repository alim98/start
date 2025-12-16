import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';

interface GenerateIdeaRequest {
    mode: 'creative' | 'random';
    baseIdea?: string;
    targetMarket: string;
    skills?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateIdeaRequest = await request.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Groq API key not configured' },
                { status: 500 }
            );
        }

        let systemPrompt = '';
        let userPrompt = '';

        if (body.mode === 'creative') {
            // Generate a more creative version of the existing idea
            systemPrompt = `You are a creative startup advisor who specializes in creating improved and more innovative versions of existing ideas.

Your task: Take a startup idea and create a more creative, unique, and practical version of it.

Response must be in this JSON format:
{
  "title": "New catchy title in English",
  "description": "Complete description of the improved idea in English (200-300 words). Must include: core problem, creative solution, target users, key differentiation, and why it's unique."
}

Rules:
- New idea must be related to the original but more creative and practical
- Focus on ${body.targetMarket} market
- Add unique features that competitors don't have
- Consider global infrastructure and opportunities
- Use cutting-edge but practical technology
- All text must be in English`;

            userPrompt = `Original idea:
${body.baseIdea}

Target market: ${body.targetMarket}

Create a more creative and unique version of this idea that will be more successful in the ${body.targetMarket} market.`;

        } else {
            // Generate a completely random idea
            const globalMarkets = [
                'Online Education & EdTech',
                'Digital Financial Services',
                'E-commerce & Marketplaces',
                'Telemedicine & HealthTech',
                'Travel & Tourism Tech',
                'PropTech & Real Estate',
                'Smart Transportation',
                'AgriTech & Sustainable Farming',
                'Entertainment & Media',
                'Home Services Platforms',
                'Fitness & Wellness',
                'Fashion & Beauty Tech',
                'Creator Economy & Tools',
                'Enterprise SaaS',
                'Food Delivery & Cloud Kitchens',
                'Climate Tech & Sustainability',
                'Web3 & Blockchain',
                'AI & Machine Learning Tools',
                'Cybersecurity',
                'Remote Work Solutions',
            ];

            const skillsContext = body.skills === 'Tech'
                ? 'with focus on technology and software solutions'
                : body.skills === 'Biz'
                    ? 'with focus on business models and marketing'
                    : 'that can be executed without technical skills';

            systemPrompt = `You are a creative startup idea generator for global markets.

Task: Create a completely new and creative startup idea.

Response must be in this JSON format:
{
  "title": "Catchy and professional title in English",
  "description": "Complete idea description in English (200-300 words). Include: real problem, innovative solution, target users, revenue model, and differentiation from competitors."
}

Rules:
- Idea must be realistic, practical and executable globally
- Consider global market opportunities and trends
- Focus on real problems people face worldwide
- Use available and accessible technology
- Clear and practical business model
- All text must be in English`;

            userPrompt = `Create a creative and practical startup idea for ${body.targetMarket} market ${skillsContext}.

Suggested domains: ${globalMarkets.join(', ')}

The idea should be unique, practical and suitable for global markets.`;
        }

        console.log('Generating international idea with mode:', body.mode);

        const completion = await getGroqClient().chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.9, // Higher temperature for more creative ideas
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) {
            throw new Error('Empty response from Groq');
        }

        const ideaData = JSON.parse(responseText);

        if (!ideaData.title || !ideaData.description) {
            throw new Error('Invalid response format');
        }

        console.log('Generated international idea:', ideaData.title);

        return NextResponse.json(ideaData);
    } catch (error) {
        console.error('Idea generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate idea' },
            { status: 500 }
        );
    }
}
