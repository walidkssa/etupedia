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
   * Use GPT4js with automatic provider/model selection
   */
  private async askGPT(messages: any[]): Promise<string> {
    try {
      console.log('🤖 GPT4Free: Using automatic provider/model selection...');

      // Let gpt4js choose the best provider and model automatically
      const response = await this.gpt4.chat(messages);

      if (response && typeof response === 'string' && response.trim()) {
        console.log('✅ Success with GPT4Free');
        return response.trim();
      }

      throw new Error('Empty response from GPT4Free');
    } catch (error: any) {
      console.error('❌ GPT4Free error:', error.message);
      throw new Error('GPT4Free failed. Please try again.');
    }
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

    const messages = [
      { role: 'user', content: contextPrompt }
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
    const prompt = `Summarize this encyclopedia article in 3-5 clear bullet points:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Provide a concise, informative summary.`;

    const messages = [
      { role: 'user', content: prompt }
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
    const prompt = `Create 3 multiple-choice questions about this article:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Format each question with:
- The question
- 4 options (A, B, C, D)
- Indicate the correct answer

Make questions testing understanding of key concepts.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.askGPT(messages);
  }
}

export const gpt4freeEngine = GPT4FreeEngine.getInstance();
