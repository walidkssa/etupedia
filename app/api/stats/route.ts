import { NextResponse } from "next/server";
import { scraperManager } from "@/lib/scraper-manager";

export async function GET() {
  try {
    const articleCount = await scraperManager.getArticleCount();
    const availableScrapers = scraperManager.getAvailableScrapers();

    return NextResponse.json({
      articleCount,
      sources: availableScrapers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
