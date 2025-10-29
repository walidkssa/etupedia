import { NextRequest, NextResponse } from "next/server";
import { scraperManager } from "@/lib/scraper-manager";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get("source") || "wikipedia";
    const url = searchParams.get("url");

    let article;

    // If URL is provided, use it directly to scrape from the specific source
    if (url && source) {
      article = await scraperManager.scrapeArticle(url, source);
    }

    // If no article found with URL or URL not provided, try Wikipedia
    if (!article) {
      article = await scraperManager.scrapeArticle(slug, "wikipedia");
    }

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Article API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
