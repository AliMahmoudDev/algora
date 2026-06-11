// Algora AI Hints — powered by Google Gemini
// Provides bilingual (Arabic/English) code hints for algorithmic problems
//
// Uses @google/genai (new SDK) with Gemini 3.5 Flash
// Falls back gracefully if API key is not configured

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, aiHintLimiter } from '@/lib/rate-limit';
import { db } from '@/lib/db';

interface HintRequest {
  problemId: string;
  code: string;
  language: string;
  locale?: 'en' | 'ar';
  hintLevel?: number; // 1, 2, or 3 — progressive hints
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (5 req/min per IP)
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await checkRateLimit(aiHintLimiter, ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many hint requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body: HintRequest = await request.json();
    const { problemId, code, language, locale = 'en', hintLevel = 1 } = body;

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

    // Parse examples and constraints for richer context
    let examples: Array<{ input: string; output: string; explanation?: string }> = [];
    try {
      examples = typeof problem.examples === 'string'
        ? JSON.parse(problem.examples)
        : (problem.examples as typeof examples || []);
    } catch { /* empty */ }

    let constraints = problem.constraints || '';
    if (locale === 'ar' && problem.constraintsAr) {
      constraints = problem.constraintsAr;
    }

    const tags: string[] = typeof problem.tags === 'string'
      ? JSON.parse(problem.tags)
      : [];

    // Build a rich, well-structured prompt for maximum accuracy
    const langInstruction = locale === 'ar'
      ? 'أجب باللغة العربية. اكتب الشرح بالعربي والأكواد بالإنجليزي.'
      : 'Answer in English.';

    const hintLevelInstruction = hintLevel === 1
      ? 'Give a gentle, conceptual hint. Point the user toward the right data structure or algorithm pattern without any code.'
      : hintLevel === 2
      ? 'Give a more specific hint. Explain the approach in 2-3 steps, mention edge cases, but do NOT write the full solution code.'
      : 'Give a near-solution hint. Explain the algorithm in detail with pseudocode. The user can figure out the last pieces themselves.';

    const prompt = `You are Algora's AI Tutor — a friendly, expert programming coach for a competitive coding platform.
${langInstruction}

## Problem Information
- **Title:** ${problem.title} (${problem.titleAr || ''})
- **Difficulty:** ${problem.difficulty}
- **Category:** ${problem.category}
- **Tags:** ${tags.join(', ')}
- **Constraints:** ${constraints || 'None specified'}

## Problem Description (${locale === 'ar' ? 'Arabic' : 'English'})
${(locale === 'ar' ? problem.descriptionAr : problem.description || '').slice(0, 1000)}

## Examples
${examples.slice(0, 3).map((ex, i) => `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}${ex.explanation ? '\n  Explanation: ' + ex.explanation : ''}`).join('\n\n')}

## User's Current Code (${language})
\`\`\`${language}
${code.slice(0, 3000)}
\`\`\`

## Instructions
${hintLevelInstruction}

Your hint should:
1. Be encouraging and educational — build confidence
2. Analyze what the user's code is doing and identify where it might be going wrong
3. Suggest the correct approach, data structure, or algorithmic technique
4. Mention relevant time/space complexity considerations
5. Be concise (3-5 sentences max for level 1, up to 6 sentences for level 2, up to 8 for level 3)
6. NEVER give the complete working solution code

Respond in this exact JSON format (no markdown fences, no extra text):
{"hint": "your hint text here", "concept": "relevant concept name", "complexity": "time/space complexity if relevant", "nextStep": "what the user should try next"}

IMPORTANT: Return ONLY the JSON object, nothing else. No \`\`\`json markers.`;

    // Call Gemini API using @google/genai (new SDK)
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = (response.text || '').trim();

    // Parse the JSON response
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { hint: responseText, concept: '', complexity: '', nextStep: '' };
      }
    } catch {
      parsed = { hint: responseText, concept: '', complexity: '', nextStep: '' };
    }

    return NextResponse.json({
      hint: parsed.hint || responseText,
      concept: parsed.concept || '',
      complexity: parsed.complexity || '',
      nextStep: parsed.nextStep || '',
      hintLevel,
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
