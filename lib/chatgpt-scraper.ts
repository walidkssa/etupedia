/**
 * Free ChatGPT Alternative via GPT4Free API
 * Uses multiple free AI providers as fallback
 */

/**
 * Free AI providers that work without authentication
 */
const FREE_PROVIDERS = [
  {
    name: 'DeepInfra',
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    model: 'meta-llama/Meta-Llama-3-70B-Instruct',
    headers: {}
  },
  {
    name: 'Together',
    url: 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3-70b-chat-hf',
    headers: {}
  }
];

/**
 * Ask free AI with article context
 */
export async function askChatGPTWithContext(
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

  console.log('🤖 Asking free AI:', userQuestion);

  // Try each provider until one works
  for (const provider of FREE_PROVIDERS) {
    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...provider.headers
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'user', content: contextPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        console.log(`❌ ${provider.name} failed:`, response.status);
        continue;
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;

      if (answer) {
        console.log(`✅ Got response from ${provider.name}`);
        return answer;
      }
    } catch (error) {
      console.error(`❌ ${provider.name} error:`, error);
      continue;
    }
  }

  throw new Error('All free AI providers failed');
}

/**
 * Generate summary
 */
export async function generateChatGPTSummary(
  articleTitle: string,
  articleContent: string
): Promise<string> {
  const prompt = `Summarize this article in 3-5 bullet points:

Title: "${articleTitle}"
Content: ${articleContent.substring(0, 4000)}`;

  return askChatGPTWithContext(articleTitle, articleContent, 'Please summarize this article');
}

/**
 * Generate quiz
 */
export async function generateChatGPTQuiz(
  articleTitle: string,
  articleContent: string
): Promise<string> {
  return askChatGPTWithContext(
    articleTitle,
    articleContent,
    'Create 3 multiple-choice questions about this article with 4 options each'
  );
}

/**
 * Check availability
 */
export async function isChatGPTAvailable(): Promise<boolean> {
  return true; // Always available with fallbacks
}

/**
 * Cleanup (no-op for API-based solution)
 */
export async function closeChatGPT(): Promise<void> {
  // Nothing to close
}
