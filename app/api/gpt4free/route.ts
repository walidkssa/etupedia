import { NextRequest, NextResponse } from 'next/server';
import { gpt4freeEngine } from '@/lib/gpt4free-engine';

export const runtime = 'nodejs'; // G4F needs Node.js runtime

export async function POST(request: NextRequest) {
  try {
    const { action, articleTitle, articleContent, question } = await request.json();

    if (!action || !articleTitle || !articleContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`🤖 GPT4Free API: ${action} action`);

    let response: string;

    switch (action) {
      case 'chat':
        if (!question) {
          return NextResponse.json(
            { error: 'Question required for chat action' },
            { status: 400 }
          );
        }
        response = await gpt4freeEngine.chat(articleTitle, articleContent, question);
        break;

      case 'summary':
        response = await gpt4freeEngine.generateSummary(articleTitle, articleContent);
        break;

      case 'quiz':
        response = await gpt4freeEngine.generateQuiz(articleTitle, articleContent);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    console.log(`✅ GPT4Free response generated`);

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('❌ GPT4Free API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    );
  }
}
