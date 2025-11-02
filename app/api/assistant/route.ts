import { NextRequest } from "next/server";

// LangSearch API for web search
const LANGSEARCH_API_KEY = process.env.LANGSEARCH_API_KEY || "";
const LANGSEARCH_API_URL = "https://api.langsearch.com/v1/web-search";

export async function POST(request: NextRequest) {
  try {
    const { question, enableWebSearch } = await request.json();

    if (!question) {
      return Response.json({ error: "Missing question" }, { status: 400 });
    }

    let webSearchResults = "";

    // Perform web search if enabled using LangSearch
    if (enableWebSearch && LANGSEARCH_API_KEY) {
      try {
        const searchResponse = await fetch(LANGSEARCH_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LANGSEARCH_API_KEY}`,
          },
          body: JSON.stringify({
            query: question,
            freshness: "noLimit",
            summary: true,
            count: 5,
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          if (searchData?.data?.webPages?.value && searchData.data.webPages.value.length > 0) {
            webSearchResults = "\n\nRecent Web Findings:\n" +
              searchData.data.webPages.value.map((result: any, idx: number) =>
                `${idx + 1}. ${result.name}\n   ${result.summary || result.snippet}\n   Source: ${result.url}`
              ).join("\n\n");
          }
        }
      } catch (err) {
        console.error("Web search error:", err);
        // Continue without web results
      }
    }

    // Return web search results - the AI processing will be done in the browser with Mistral 7B
    return Response.json({
      webSearchResults: webSearchResults || null,
      message: "Web search completed. AI processing will be done locally in your browser."
    });

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
