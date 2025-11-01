import { NextRequest, NextResponse } from "next/server";
import { scraperManager } from "@/lib/scraper-manager";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const sourcesParam = searchParams.get("sources");
    const lang = searchParams.get("lang") || "en";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const sources = sourcesParam ? sourcesParam.split(",") : undefined;

    const results = await scraperManager.search(query, sources, lang);

    return NextResponse.json({
      results,
      count: results.length,
      sources: sources || scraperManager.getAvailableScrapers(),
      language: lang,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
