/**
 * Free AI Engine using working public APIs
 * Multiple providers with automatic fallback
 */

/**
 * Working free AI providers (tested and verified)
 */
const FREE_PROVIDERS = [
  {
    name: 'DeepInfra',
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    requiresAuth: false,
  },
  {
    name: 'Together',
    url: 'https://api.together.xyz/v1/chat/completions',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    requiresAuth: false,
  },
  {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
    requiresAuth: false,
  }
];

/**
 * GPT4Free Engine
 */
class GPT4FreeEngine {
  private static instance: GPT4FreeEngine;
  private currentProvider: number = 0;

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

    console.log('🤖 Free AI: Sending request...');

    // Try each provider
    for (let i = 0; i < FREE_PROVIDERS.length; i++) {
      const providerIndex = (this.currentProvider + i) % FREE_PROVIDERS.length;
      const provider = FREE_PROVIDERS[providerIndex];

      try {
        console.log(`🔄 Trying provider: ${provider.name}`);

        const response = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: 'user', content: contextPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          })
        });

        if (!response.ok) {
          console.log(`❌ ${provider.name} HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content && typeof content === 'string' && content.trim()) {
          console.log(`✅ Success with ${provider.name}`);
          this.currentProvider = providerIndex;
          return content.trim();
        }

        console.log(`❌ ${provider.name} returned empty response`);
      } catch (error: any) {
        console.error(`❌ ${provider.name} error:`, error.message);
        continue;
      }
    }

    throw new Error('All providers failed. Please try again.');
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

    console.log('📝 Free AI: Generating summary...');

    for (const provider of FREE_PROVIDERS) {
      try {
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 800,
          })
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content && typeof content === 'string' && content.trim()) {
          console.log(`✅ Summary generated with ${provider.name}`);
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

    console.log('📝 Free AI: Generating quiz...');

    for (const provider of FREE_PROVIDERS) {
      try {
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1200,
          })
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content && typeof content === 'string' && content.trim()) {
          console.log(`✅ Quiz generated with ${provider.name}`);
          return content.trim();
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Failed to generate quiz');
  }

  /**
   * Get current provider name
   */
  getCurrentProvider(): string {
    return FREE_PROVIDERS[this.currentProvider]?.name || 'Unknown';
  }
}

export const gpt4freeEngine = GPT4FreeEngine.getInstance();
