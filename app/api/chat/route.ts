import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, articleTitle, articleContent } = await request.json();

    if (!question || !articleContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Clean article content
    const cleanContent = articleContent
      .replace(/<[^>]*>/g, " ")
      .replace(/\[[0-9]+\]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Limit to first 8000 characters for API limits
    const contextContent = cleanContent.length > 8000
      ? cleanContent.substring(0, 8000) + "\n\n[Article truncated...]"
      : cleanContent;

    // Use Hugging Face Inference API (free tier)
    const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

    const prompt = `<s>[INST] You are analyzing the Wikipedia article: "${articleTitle}"

STRICT RULES - FOLLOW EXACTLY:
1. Answer ONLY from the article content below
2. If the answer is not in the article, say: "This information is not in the article"
3. Do NOT use external knowledge
4. Quote specific parts when answering
5. Be accurate and concise

ARTICLE CONTENT:
${contextContent}

USER QUESTION:
${question} [/INST]`;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use free inference API - no token required, but rate limited
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      // If model is loading, wait and retry once
      const errorData = await response.json();
      if (errorData.error?.includes("loading")) {
        // Wait 10 seconds for model to load
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Retry
        const retryResponse = await fetch(HF_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.3,
              top_p: 0.9,
              return_full_text: false,
            },
          }),
        });

        if (!retryResponse.ok) {
          throw new Error("Model failed to load");
        }

        const retryData = await retryResponse.json();
        const answer = Array.isArray(retryData)
          ? retryData[0]?.generated_text || "No response"
          : retryData.generated_text || "No response";

        return NextResponse.json({ answer: answer.trim() });
      }

      throw new Error("API request failed");
    }

    const data = await response.json();
    const answer = Array.isArray(data)
      ? data[0]?.generated_text || "No response"
      : data.generated_text || "No response";

    return NextResponse.json({ answer: answer.trim() });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
