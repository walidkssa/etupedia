/**
 * GPT4Free Engine
 * Uses multiple free AI providers via gpt4free
 * 100% free, no API keys needed
 */

import { G4F } from 'g4f';

const g4f = new G4F();

/**
 * Available providers (in order of preference)
 */
const PROVIDERS = [
  'Bing',
  'ChatGpt',
  'You',
  'Phind',
  'FreeGpt',
  'Llama2',
] as const;

/**
 * GPT4Free Chat Engine
 */
class GPT4FreeEngine {
  private static instance: GPT4FreeEngine;
  private currentProvider: string = PROVIDERS[0];

  private constructor() {}

  static getInstance(): GPT4FreeEngine {
    if (!GPT4FreeEngine.instance) {
      GPT4FreeEngine.instance = new GPT4FreeEngine();
    }
    return GPT4FreeEngine.instance;
  }

  /**
   * Chat with article context
   */
  async chat(
    articleTitle: string,
    articleContent: string,
    userQuestion: string
  ): Promise<string> {
    const contextPrompt = `You are analyzing this encyclopedia article:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 3000)}

User Question: ${userQuestion}

Provide a clear, concise answer based on the article.`;

    console.log('🤖 GPT4Free: Sending request...');

    // Try each provider until one works
    for (const provider of PROVIDERS) {
      try {
        console.log(`🔄 Trying provider: ${provider}`);

        const messages = [
          {
            role: 'user',
            content: contextPrompt
          }
        ];

        const response = await g4f.chatCompletion(messages, {
          provider: provider,
          model: 'gpt-3.5-turbo',
        });

        if (response && typeof response === 'string' && response.trim()) {
          console.log(`✅ Success with ${provider}`);
          this.currentProvider = provider;
          return response.trim();
        }

        // If response is an object, try to extract content
        if (response && typeof response === 'object') {
          const content = (response as any).content || (response as any).message?.content;
          if (content && typeof content === 'string' && content.trim()) {
            console.log(`✅ Success with ${provider}`);
            this.currentProvider = provider;
            return content.trim();
          }
        }

        console.log(`❌ ${provider} returned empty response`);
      } catch (error: any) {
        console.error(`❌ ${provider} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All GPT4Free providers failed');
  }

  /**
   * Generate summary
   */
  async generateSummary(
    articleTitle: string,
    articleContent: string
  ): Promise<string> {
    const prompt = `Summarize this encyclopedia article in 3-5 clear bullet points:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Provide a concise, informative summary.`;

    console.log('📝 GPT4Free: Generating summary...');

    for (const provider of PROVIDERS) {
      try {
        const response = await g4f.chatCompletion([
          { role: 'user', content: prompt }
        ], {
          provider: provider,
          model: 'gpt-3.5-turbo',
        });

        const content = typeof response === 'string'
          ? response
          : (response as any)?.content || (response as any)?.message?.content;

        if (content && typeof content === 'string' && content.trim()) {
          console.log(`✅ Summary generated with ${provider}`);
          return content.trim();
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Failed to generate summary');
  }

  /**
   * Generate quiz
   */
  async generateQuiz(
    articleTitle: string,
    articleContent: string
  ): Promise<string> {
    const prompt = `Create 3 multiple-choice questions about this article:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Format each question with:
- The question
- 4 options (A, B, C, D)
- Indicate the correct answer

Make questions testing understanding of key concepts.`;

    console.log('📝 GPT4Free: Generating quiz...');

    for (const provider of PROVIDERS) {
      try {
        const response = await g4f.chatCompletion([
          { role: 'user', content: prompt }
        ], {
          provider: provider,
          model: 'gpt-3.5-turbo',
        });

        const content = typeof response === 'string'
          ? response
          : (response as any)?.content || (response as any)?.message?.content;

        if (content && typeof content === 'string' && content.trim()) {
          console.log(`✅ Quiz generated with ${provider}`);
          return content.trim();
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Failed to generate quiz');
  }

  /**
   * Check if engine is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await g4f.chatCompletion([
        { role: 'user', content: 'Hello' }
      ], {
        provider: PROVIDERS[0],
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): string {
    return this.currentProvider;
  }
}

export const gpt4freeEngine = GPT4FreeEngine.getInstance();
