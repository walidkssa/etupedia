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

  // Available providers with their best models
  private providers = [
    { name: 'Nextway', model: 'gpt-4o-free' },
    { name: 'Blackbox', model: 'blackbox' },
    { name: 'ChatGpt', model: 'gpt-4o-mini' },
  ];

  private currentProviderIndex = 0;

  private constructor() {}

  static getInstance(): GPT4FreeEngine {
    if (!GPT4FreeEngine.instance) {
      GPT4FreeEngine.instance = new GPT4FreeEngine();
    }
    return GPT4FreeEngine.instance;
  }

  /**
   * Try providers with automatic fallback
   */
  private async askGPT(messages: any[]): Promise<string> {
    const startIndex = this.currentProviderIndex;

    for (let i = 0; i < this.providers.length; i++) {
      const providerIndex = (startIndex + i) % this.providers.length;
      const { name, model } = this.providers[providerIndex];

      try {
        console.log(`🔄 Trying provider: ${name} with model: ${model}`);

        const provider = GPT4js.createProvider(name);
        const options = { provider: name, model };

        const text = await provider.chatCompletion(messages, options);

        if (text && typeof text === 'string' && text.trim()) {
          console.log(`✅ Success with ${name}`);
          this.currentProviderIndex = providerIndex;
          return text.trim();
        }
      } catch (error: any) {
        console.error(`❌ ${name} failed:`, error.message);
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
    const messages = [
      {
        role: 'system',
        content: `You are analyzing this encyclopedia article:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 3000)}

Provide clear, concise answers based on the article.`
      },
      {
        role: 'user',
        content: userQuestion
      }
    ];

    return await this.askGPT(messages);
  }

  /**
   * Generate summary
   */
  async generateSummary(
    articleTitle: string,
    articleContent: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise summaries.'
      },
      {
        role: 'user',
        content: `Summarize this encyclopedia article in 3-5 clear bullet points:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Provide a concise, informative summary.`
      }
    ];

    return await this.askGPT(messages);
  }

  /**
   * Generate quiz
   */
  async generateQuiz(
    articleTitle: string,
    articleContent: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates educational quizzes.'
      },
      {
        role: 'user',
        content: `Create 3 multiple-choice questions about this article:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Format each question with:
- The question
- 4 options (A, B, C, D)
- Indicate the correct answer

Make questions testing understanding of key concepts.`
      }
    ];

    return await this.askGPT(messages);
  }
}

export const gpt4freeEngine = GPT4FreeEngine.getInstance();
