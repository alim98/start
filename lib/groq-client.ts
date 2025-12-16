import OpenAI from 'openai';

// Lazy initialization - only create the client when actually needed
let _groqClient: OpenAI | null = null;

export function getGroqClient(): OpenAI {
    if (!_groqClient) {
        _groqClient = new OpenAI({
            apiKey: process.env.GROQ_API_KEY || '',
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }
    return _groqClient;
}
