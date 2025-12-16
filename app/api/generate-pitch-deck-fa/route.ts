import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Groq API key not configured' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are an expert Iranian startup consultant.
Your task is to generate the content for a 10-slide investor pitch deck in PERSIAN (Farsi) based on the user's startup idea.

Structure the response as a valid JSON object with a "slides" array containing exactly 10 slide objects.
Each slide object must have:
- "title": Title in Persian (e.g., "مشکل", "راه حل")
- "content": An array of 3-5 short, impactful bullet points in Persian.
- "visualPrompt": A short description of what visual/chart should be on this slide (in English or Persian).

The 10 slides MUST be in this order:
1. Title Slide (Company Name & One-liner)
2. The Problem (Pain point)
3. The Solution (Product description)
4. Why Now? (Market timing)
5. Market Size (TAM/SAM/SOM)
6. Competition (Differentiation)
7. Product (Key features)
8. Business Model (Revenue)
9. Go-to-Market (Growth strategy)
10. The Team & Ask (Funding needs)

Tone: Professional, persuasive, startup-oriented.
Ensure the content is specific to the user's idea.`;

        const userPrompt = `Startup Idea Analysis:
Title: ${body.title || 'Untitled Startup'}
Description: ${body.description}
Industry: ${body.industry || 'Technology'}
Target Market: ${body.targetMarket || 'Iran'}
Revenue Model: ${body.revenueModel || 'Unknown'}

Generate the 10-slide pitch deck content in Persian now.`;

        console.log('Generating Persian pitch deck content...');

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
