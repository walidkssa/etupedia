import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { prompt, parameters } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Hugging Face API key not configured' },
        { status: 500 }
      );
    }

    // Use Hugging Face Inference API with a reliable model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: parameters?.max_new_tokens || 500,
            temperature: parameters?.temperature || 0.7,
            top_p: parameters?.top_p || 0.9,
            return_full_text: false,
            ...parameters,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API error:', response.status, errorText);

      // If model is loading, return a specific message
      if (response.status === 503) {
        return NextResponse.json(
          {
            error: 'Model is loading',
            message: 'The AI model is currently loading. Please wait a moment and try again.',
            retry: true
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const answer = data[0]?.generated_text || data.generated_text || 'No response generated';

    return NextResponse.json({ answer });

  } catch (error: any) {
    console.error('Error in HuggingFace API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
