/**
 * ChatGPT Free API Access
 * Uses the unofficial free endpoint that doesn't require authentication
 */

interface ChatGPTMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate a simple unique ID for conversation tracking
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Call ChatGPT free API (no authentication required)
 */
async function callChatGPTFree(messages: ChatGPTMessage[]): Promise<string> {
  const conversationId = generateId();
  const parentMessageId = generateId();

  try {
    // Use the public ChatGPT endpoint
    const response = await fetch('https://chat.openai.com/backend-anon/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://chat.openai.com',
        'Referer': 'https://chat.openai.com/',
      },
      body: JSON.stringify({
        action: 'next',
        messages: messages.map((msg, idx) => ({
          id: generateId(),
          author: { role: msg.role },
          content: { content_type: 'text', parts: [msg.content] },
          metadata: {}
        })),
        parent_message_id: parentMessageId,
        model: 'text-davinci-002-render-sha',
        timezone_offset_min: new Date().getTimezoneOffset(),
        suggestions: [],
        history_and_training_disabled: true,
        conversation_mode: { kind: 'primary_assistant' },
        websocket_request_id: generateId()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse the streaming response
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim().startsWith('data: '));

    for (const line of lines.reverse()) {
      try {
        const data = JSON.parse(line.replace('data: ', ''));
        if (data.message?.content?.parts?.[0]) {
          return data.message.content.parts[0];
        }
      } catch {
        continue;
      }
    }

    throw new Error('No valid response found');

  } catch (error: any) {
    console.error('❌ ChatGPT Free API error:', error);
    throw new Error(`ChatGPT request failed: ${error.message}`);
  }
}

/**
 * Ask ChatGPT with article context
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

  console.log('🤖 Asking ChatGPT Free:', userQuestion);

  const response = await callChatGPTFree([
    { role: 'user', content: contextPrompt }
  ]);

  console.log('✅ Got response from ChatGPT');
  return response;
}

/**
 * Generate summary using ChatGPT
 */
export async function generateChatGPTSummary(
  articleTitle: string,
  articleContent: string
): Promise<string> {
  return callChatGPTFree([
    {
      role: 'user',
      content: `Summarize this article in 3-5 bullet points:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Provide a concise summary.`
    }
  ]);
}

/**
 * Generate quiz using ChatGPT
 */
export async function generateChatGPTQuiz(
  articleTitle: string,
  articleContent: string
): Promise<string> {
  return callChatGPTFree([
    {
      role: 'user',
      content: `Create 3 multiple-choice questions about this article:

Title: "${articleTitle}"

Content:
${articleContent.substring(0, 4000)}

Format: Question, then 4 options (A-D), indicate correct answer.`
    }
  ]);
}

/**
 * Check if ChatGPT is available
 */
export async function isChatGPTAvailable(): Promise<boolean> {
  try {
    await callChatGPTFree([{ role: 'user', content: 'Hello' }]);
    return true;
  } catch {
    return false;
  }
}
