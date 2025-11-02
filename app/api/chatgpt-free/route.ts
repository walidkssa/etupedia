import { NextRequest, NextResponse } from 'next/server';
import { askChatGPTWithContext } from '@/lib/chatgpt-free';

export const runtime = 'edge'; // Use edge runtime for faster responses

export async function POST(request: NextRequest) {
  try {
    const { articleTitle, articleContent, question } = await request.json();

    if (!question || !articleTitle || !articleContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🤖 ChatGPT Free API called');

    const response = await askChatGPTWithContext(
      articleTitle,
      articleContent,
      question
    );

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('❌ ChatGPT Free API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    );
  }
}
