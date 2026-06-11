// Algora AI Hints — powered by Google Gemini
// Provides bilingual (Arabic/English) code hints for algorithmic problems
//
// Uses Gemini 2.5 Flash (free tier: 10 RPM)
// Falls back gracefully if API key is not configured

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, aiHintLimiter } from '@/lib/rate-limit';
import { db } from '@/lib/db';

interface HintRequest {
  problemId: string;
  code: string;
  language: string;
  locale?: 'en' | 'ar';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await checkRateLimit(aiHintLimiter, ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many hint requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body: HintRequest = await request.json();
    const { problemId, code, language, locale = 'en' } = body;

    if (!problemId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: problemId and code' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI hints are not configured. Please set GEMINI_API_KEY.' },
        { status: 503 }
      );
    }

    // Fetch problem from DB
    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Build the prompt based on locale
    const langInstruction = locale === 'ar'
      ? 'أجب باللغة العربية. اكتب الشرح والكود بالعربي.'
      : 'Answer in English.';

    const prompt = `You are an AI programming tutor for a competitive coding platform called Algora.
${langInstruction}

A user is working on this problem:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Description (first 500 chars): ${(problem.description || '').slice(0, 500)}

The user's current code in ${language}:
\`\`\`${language}
${code.slice(0, 2000)}
\`\`\`

Provide a helpful hint that guides the user without giving away the full solution.
Your hint should:
1. Be encouraging and educational
2. Point the user in the right direction (algorithm/approach)
3. NOT give the complete solution code
4. Be concise (max 3-4 sentences)
5. Mention a relevant concept or data structure if helpful

Respond in this exact JSON format (no markdown, no code fences):
{"hint": "your hint text here", "concept": "relevant concept name"}`;

    // Call Gemini API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the JSON response (handle possible markdown fences)
    let parsed;
    try {
      // Try to extract JSON from the response (may have ```json fences)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: use the raw text as hint
        parsed = { hint: responseText, concept: '' };
      }
    } catch {
      parsed = { hint: responseText, concept: '' };
    }

    return NextResponse.json({
      hint: parsed.hint || responseText,
      concept: parsed.concept || '',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate hint';
    console.error('AI Hint error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
