"use client";

import { useEffect } from "react";

interface ArticleHeadProps {
  title: string;
  description: string;
  slug: string;
  url?: string;
}

export function ArticleHead({ title, description, slug, url }: ArticleHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Etupedia - Human Knowledge Encyclopedia`;

    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Add/update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", `https://etupedia.com/article/${slug}`);
    } else {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", `https://etupedia.com/article/${slug}`);
      document.head.appendChild(canonical);
    }

    // Update Open Graph tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    updateOrCreateMeta("og:title", `${title} | Etupedia`);
    updateOrCreateMeta("og:description", description);
    updateOrCreateMeta("og:url", `https://etupedia.com/article/${slug}`);
    updateOrCreateMeta("og:type", "article");
    updateOrCreateMeta("og:image", "https://etupedia.com/icon_dark.png");

    // Update Twitter Card tags
    const updateOrCreateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    updateOrCreateTwitterMeta("twitter:card", "summary_large_image");
    updateOrCreateTwitterMeta("twitter:title", `${title} | Etupedia`);
    updateOrCreateTwitterMeta("twitter:description", description);
    updateOrCreateTwitterMeta("twitter:image", "https://etupedia.com/icon_dark.png");

    // Add structured data for article
    let scriptTag = document.querySelector('script[type="application/ld+json"][data-article]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-article", "true");
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      url: `https://etupedia.com/article/${slug}`,
      publisher: {
        "@type": "Organization",
        name: "Etupedia",
        logo: {
          "@type": "ImageObject",
          url: "https://etupedia.com/icon_dark.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://etupedia.com/article/${slug}`,
      },
    };

    scriptTag.textContent = JSON.stringify(structuredData);
  }, [title, description, slug, url]);

  return null;
}
