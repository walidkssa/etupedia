/**
 * GPT4Free Engine using gpt4js package
 * Automatic provider selection with fallback
 */

import GPT4js from 'gpt4js';

/**
 * GPT4Free Engine
 */
class GPT4FreeEngine {
  private static instance: GPT4FreeEngine;
  private gpt4: any;
  private providers = [
    { provider: 'Blackbox', model: '' },
    { provider: 'ChatgptFree', model: '' },
    { provider: 'DeepInfra', model: 'meta-llama/Meta-Llama-3-8B-Instruct' },
  ];
  private currentProviderIndex = 0;

  private constructor() {
    this.gpt4 = new GPT4js();
  }

  static getInstance(): GPT4FreeEngine {
    if (!GPT4FreeEngine.instance) {
      GPT4FreeEngine.instance = new GPT4FreeEngine();
    }
    return GPT4FreeEngine.instance;
  }

  /**
   * Try providers with automatic fallback
   */
  private async tryProviders(messages: any[]): Promise<string> {
    const startIndex = this.currentProviderIndex;

    for (let i = 0; i < this.providers.length; i++) {
      const providerIndex = (startIndex + i) % this.providers.length;
      const { provider, model } = this.providers[providerIndex];

      try {
        console.log(`🔄 Trying provider: ${provider}`);

        const options = {
          provider,
          model: model || undefined,
        };

        const response = await this.gpt4.chat(messages, options);

        if (response && typeof response === 'string' && response.trim()) {
          console.log(`✅ Success with ${provider}`);
          this.currentProviderIndex = providerIndex;
          return response.trim();
        }
      } catch (error: any) {
        console.error(`❌ ${provider} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All GPT4Free providers failed. Please try again.');
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

    console.log('🤖 GPT4Free: Sending chat request...');

    const messages = [
      { role: 'user', content: contextPrompt }
    ];

    return await this.tryProviders(messages);
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

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.tryProviders(messages);
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

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.tryProviders(messages);
  }

  /**
   * Get current provider name
   */
  getCurrentProvider(): string {
    return this.providers[this.currentProviderIndex]?.provider || 'Unknown';
  }
}

export const gpt4freeEngine = GPT4FreeEngine.getInstance();
