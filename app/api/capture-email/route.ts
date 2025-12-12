import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface EmailCapture {
  email: string;
  idea: string;
  verdict?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, idea, verdict } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Store in a JSON file for now (simple approach for MVP)
    const dataDir = path.join(process.cwd(), 'data');
    const emailsFile = path.join(dataDir, 'emails.json');

    // Create data directory if it doesn't exist
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Read existing emails or create empty array
    let emails: EmailCapture[] = [];
    if (existsSync(emailsFile)) {
      const fileContent = await readFile(emailsFile, 'utf-8');
      emails = JSON.parse(fileContent);
    }

    // Add new email
    emails.push({
      email,
      idea,
      verdict,
      timestamp: new Date().toISOString(),
    });

    // Write back to file
    await writeFile(emailsFile, JSON.stringify(emails, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email capture error:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    );
  }
}
