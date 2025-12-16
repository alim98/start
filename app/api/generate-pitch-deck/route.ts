import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';

// Defining the standard 10-slide structure
type Slide = {
    title: string;
    content: string[]; // Bullet points
    visualPrompt?: string; // Description for a potential image/chart
};

type PitchDeckResponse = {
    slides: Slide[];
    designTheme: 'modern' | 'minimal' | 'bold';
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Groq API key not configured' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are a world-class startup fundraising consultant (ex-YCombinator, ex-Sequoia).
Your task is to generate the content for a high-impact 10-slide investor pitch deck based on the user's startup idea.

Structure the response as a valid JSON object with a "slides" array containing exactly 10 slide objects.
Each slide object must have:
- "title": Short, punchy title (e.g., "The Problem", "Our Solution")
- "content": An array of 3-5 short, impactful bullet points. NO long paragraphs.
- "visualPrompt": A short description of what visual/chart should be on this slide (e.g., "Graph showing market growth", "Screenshot of mobile app").

The 10 slides MUST be in this order:
1. Title Slide (Company Name & One-liner)
2. The Problem (Pain point, current solutions suck)
3. The Solution (Product description, value prop)
4. Why Now? (Market timing, trends)
5. Market Size (TAM/SAM/SOM breakdown)
6. Competition (How we are different/better)
7. Product (Key features/tech sauce)
8. Business Model (How we make money)
9. Go-to-Market (Growth strategy)
10. The Team & Ask (Who we are + Funding requirement)

Tone: Professional, confident, concise. Use active verbs.
Ensure the content is specific to the user's idea, not generic.`;

        const userPrompt = `Startup Idea Analysis:
Title: ${body.title || 'Untitled Startup'}
Description: ${body.description}
Industry: ${body.industry}
Target Market: ${body.targetMarket}
Revenue Model: ${body.revenueModel}
Unique Value: ${body.uniqueValue || 'N/A'}

Generate the 10-slide pitch deck content now.`;

        console.log('Generating pitch deck content...');

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

        const parsedResponse = JSON.parse(responseText);

        // Basic validation
        if (!parsedResponse.slides || !Array.isArray(parsedResponse.slides) || parsedResponse.slides.length < 8) {
            throw new Error('Invalid slide format generated');
        }

        return NextResponse.json(parsedResponse);

    } catch (error) {
        console.error('Pitch deck generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate pitch deck' },
            { status: 500 }
        );
    }
}
