import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { TavilyClient } from "tavily";

// Initialize Groq with Llama 3.3 70B (FREE, ultra-fast!)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Initialize Tavily for web search (FREE tier available) - only if API key is present
const tavilyClient = process.env.TAVILY_API_KEY
  ? new TavilyClient({ apiKey: process.env.TAVILY_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { articleContent, articleTitle, question, action, enableWebSearch } = await request.json();

    if (!articleContent || !articleTitle) {
      return Response.json({ error: "Missing article content or title" }, { status: 400 });
    }

    let response: string;

    if (action === "summarize") {
      // Use the existing summarize API
      const summaryResponse = await fetch(`${request.nextUrl.origin}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: articleContent }),
      });

      if (!summaryResponse.ok) {
        throw new Error("Failed to generate summary");
      }

      const { summary } = await summaryResponse.json();
      response = summary;
    } else if (action === "quiz") {
      // Generate quiz with AI
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a quiz generator. Create 3 multiple-choice questions based on the article content. Format each as: Q: [question]\\nA) [option]\\nB) [option]\\nC) [option]\\nD) [option]\\nCorrect: [letter]"
          },
          {
            role: "user",
            content: `Article: "${articleTitle}"\n\n${cleanContent}\n\nGenerate 3 quiz questions:`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 800,
      });

      response = chatCompletion.choices[0]?.message?.content || "Could not generate quiz.";
    } else if (question) {
      // Answer questions with optional web search
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 6000);

      let webSearchResults = "";

      // Perform web search if enabled
      if (enableWebSearch && tavilyClient) {
        try {
          const searchResults = await tavilyClient.search(`${articleTitle} ${question}`);

          if (searchResults?.results && searchResults.results.length > 0) {
            webSearchResults = "\n\nRecent Web Findings:\n" +
              searchResults.results.map((result: any, idx: number) =>
                `${idx + 1}. ${result.content} (Source: ${result.url})`
              ).join("\n\n");
          }
        } catch (err) {
          console.error("Web search error:", err);
          // Continue without web results
        }
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert assistant that helps users understand articles. You are contextually aware of the article content and can provide insights, suggest new ideas, and incorporate recent information from web searches when available. Be concise, factual, and helpful.`
          },
          {
            role: "user",
            content: `Article Title: "${articleTitle}"

Article Content:
${cleanContent}${webSearchResults}

User Question: ${question}

Please provide a comprehensive answer based on the article content${webSearchResults ? ' and recent web findings' : ''}. If suggesting new ideas or perspectives, clearly indicate they go beyond the article.`
          }
        ],
        model: "llama-3.3-70b-versatile", // Best free model available!
        temperature: 0.4,
        max_tokens: 1000,
      });

      response = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
    } else {
      return Response.json({ error: "No question or action provided" }, { status: 400 });
    }

    return Response.json({ response });
  } catch (error: any) {
    console.error("Assistant error:", error);

    // Handle rate limit errors gracefully
    if (error?.status === 429) {
      return Response.json(
        { error: "Rate limit reached. Please try again in a moment." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
