"use client";

import { useEffect, useRef, useState } from "react";
import { Link2Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import DOMPurify from "isomorphic-dompurify";

interface ArticleContentProps {
  content: string;
  language?: string;
}

interface PreviewData {
  title: string;
  excerpt: string;
}

export function ArticleContent({ content, language = 'en' }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number; placement?: string } | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previewCacheRef = useRef<Map<string, PreviewData>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    // Find all headings with data-section-id
    const headings = doc.querySelectorAll("h2[data-section-id], h3[data-section-id], h4[data-section-id], h5[data-section-id], h6[data-section-id]");

    headings.forEach((heading) => {
      const sectionId = heading.getAttribute("data-section-id");

      if (sectionId) {
        // Add group class for hover effect
        heading.classList.add("group");
        heading.setAttribute("id", sectionId);

        // Create link button
        const linkButton = doc.createElement("button");
        linkButton.className = "section-link-button inline-flex items-center justify-center w-6 h-6 ml-2 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all duration-200";
        linkButton.setAttribute("data-section-link", sectionId);
        linkButton.setAttribute("aria-label", "Copy link to section");
        linkButton.setAttribute("title", "Copy link to section");
        linkButton.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"><path d="M8.51194 3.00541C9.18829 2.54594 10.0435 2.53694 10.6788 2.95419C10.8231 3.04893 10.9771 3.1993 11.389 3.61119C11.8009 4.02307 11.9513 4.17714 12.046 4.32141C12.4633 4.95675 12.4543 5.81192 11.9948 6.48827C11.8899 6.64264 11.7276 6.80811 11.3006 7.23511L10.6819 7.85383C10.4867 8.04909 10.4867 8.36567 10.6819 8.56093C10.8772 8.7562 11.1938 8.7562 11.389 8.56093L12.0077 7.94221L12.0507 7.89929C12.4203 7.52976 12.6568 7.2933 12.822 7.0502C13.4972 6.05623 13.5321 4.76252 12.8819 3.77248C12.7233 3.53102 12.4922 3.3027 12.1408 2.95119L12.0961 2.90654L12.0515 2.86189C11.7001 2.51039 11.4717 2.27924 11.2303 2.12064C10.2402 1.47043 8.94647 1.50534 7.95249 2.1805C7.70939 2.34571 7.47294 2.58221 7.10337 2.95177L6.48465 3.57049C6.28939 3.76575 6.28939 4.08233 6.48465 4.27759C6.67991 4.47286 6.99649 4.47286 7.19175 4.27759L7.81047 3.65887C8.23747 3.23187 8.40294 3.06639 8.51194 2.96148L8.51194 3.00541ZM4.27759 6.48465C4.47285 6.28939 4.47285 5.97281 4.27759 5.77755C4.08233 5.58228 3.76575 5.58228 3.57049 5.77755L2.95177 6.39627L2.90654 6.44154C2.53711 6.81097 2.30057 7.04751 2.1353 7.29061C1.46018 8.28458 1.42526 9.57829 2.07548 10.5684C2.23407 10.8098 2.46522 11.0381 2.81672 11.3896L2.86137 11.4343L2.90602 11.4789C3.25752 11.8304 3.48867 12.0616 3.73013 12.2202C4.72017 12.8704 6.01388 12.8355 7.00785 12.1603C7.25095 11.9951 7.48749 11.7585 7.85696 11.389L8.47568 10.7703C8.67094 10.575 8.67094 10.2584 8.47568 10.0632C8.28042 9.86791 7.96384 9.86791 7.76858 10.0632L7.14986 10.6819C6.72286 11.1089 6.55739 11.2743 6.44839 11.3793C5.77204 11.8388 4.91687 11.8478 4.28153 11.4305C4.13726 11.3358 3.98319 11.1854 3.57131 10.7735C3.15943 10.3616 3.00536 10.2076 2.91062 10.0633C2.49337 9.42798 2.50237 8.57281 2.96184 7.89647C3.06674 7.78747 3.23221 7.622 3.65921 7.195L4.27759 6.57627L4.27759 6.48465Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;

        // Wrap the heading text in a span with the button
        const textContent = heading.textContent || "";
        heading.textContent = "";
        const wrapper = doc.createElement("span");
        wrapper.className = "inline-flex items-center";
        wrapper.textContent = textContent;
        wrapper.appendChild(linkButton);
        heading.appendChild(wrapper);
      }
    });

    // Set the modified HTML with DOMPurify sanitization
    const sanitizedHTML = DOMPurify.sanitize(doc.body.innerHTML, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre', 'span', 'div', 'button', 'svg', 'path', 'figure', 'figcaption', 'video', 'audio', 'source'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'data-section-id', 'data-section-link', 'aria-label', 'width', 'height', 'viewBox', 'fill', 'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'd', 'fill-rule', 'clip-rule', 'controls'],
      ALLOW_DATA_ATTR: true,
    });
    containerRef.current.innerHTML = sanitizedHTML;

    // Add click handlers to all link buttons
    const attachClickHandlers = () => {
      const linkButtons = containerRef.current?.querySelectorAll("[data-section-link]");
      linkButtons?.forEach((button) => {
        const sectionId = button.getAttribute("data-section-link");
        if (sectionId) {
          button.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Build full URL for copying
            const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${sectionId}`;

            try {
              await navigator.clipboard.writeText(url);
              setCopiedSection(sectionId);

              // Update ONLY the hash - prevents Next.js from reloading the page
              window.history.replaceState(null, "", `#${sectionId}`);

              setTimeout(() => setCopiedSection(null), 2000);

              // Update button to show check icon
              button.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-600 dark:text-green-400"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
              setTimeout(() => {
                button.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"><path d="M8.51194 3.00541C9.18829 2.54594 10.0435 2.53694 10.6788 2.95419C10.8231 3.04893 10.9771 3.1993 11.389 3.61119C11.8009 4.02307 11.9513 4.17714 12.046 4.32141C12.4633 4.95675 12.4543 5.81192 11.9948 6.48827C11.8899 6.64264 11.7276 6.80811 11.3006 7.23511L10.6819 7.85383C10.4867 8.04909 10.4867 8.36567 10.6819 8.56093C10.8772 8.7562 11.1938 8.7562 11.389 8.56093L12.0077 7.94221L12.0507 7.89929C12.4203 7.52976 12.6568 7.2933 12.822 7.0502C13.4972 6.05623 13.5321 4.76252 12.8819 3.77248C12.7233 3.53102 12.4922 3.3027 12.1408 2.95119L12.0961 2.90654L12.0515 2.86189C11.7001 2.51039 11.4717 2.27924 11.2303 2.12064C10.2402 1.47043 8.94647 1.50534 7.95249 2.1805C7.70939 2.34571 7.47294 2.58221 7.10337 2.95177L6.48465 3.57049C6.28939 3.76575 6.28939 4.08233 6.48465 4.27759C6.67991 4.47286 6.99649 4.47286 7.19175 4.27759L7.81047 3.65887C8.23747 3.23187 8.40294 3.06639 8.51194 2.96148L8.51194 3.00541ZM4.27759 6.48465C4.47285 6.28939 4.47285 5.97281 4.27759 5.77755C4.08233 5.58228 3.76575 5.58228 3.57049 5.77755L2.95177 6.39627L2.90654 6.44154C2.53711 6.81097 2.30057 7.04751 2.1353 7.29061C1.46018 8.28458 1.42526 9.57829 2.07548 10.5684C2.23407 10.8098 2.46522 11.0381 2.81672 11.3896L2.86137 11.4343L2.90602 11.4789C3.25752 11.8304 3.48867 12.0616 3.73013 12.2202C4.72017 12.8704 6.01388 12.8355 7.00785 12.1603C7.25095 11.9951 7.48749 11.7585 7.85696 11.389L8.47568 10.7703C8.67094 10.575 8.67094 10.2584 8.47568 10.0632C8.28042 9.86791 7.96384 9.86791 7.76858 10.0632L7.14986 10.6819C6.72286 11.1089 6.55739 11.2743 6.44839 11.3793C5.77204 11.8388 4.91687 11.8478 4.28153 11.4305C4.13726 11.3358 3.98319 11.1854 3.57131 10.7735C3.15943 10.3616 3.00536 10.2076 2.91062 10.0633C2.49337 9.42798 2.50237 8.57281 2.96184 7.89647C3.06674 7.78747 3.23221 7.622 3.65921 7.195L4.27759 6.57627L4.27759 6.48465Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
              }, 2000);
            } catch (error) {
              console.error("Failed to copy link:", error);
            }
          });
        }
      });
    };

    attachClickHandlers();

    // Intercept Wikipedia links and add preview functionality
    const interceptWikipediaLinks = () => {
      const links = containerRef.current?.querySelectorAll("a[href]");
      links?.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;

        // Skip internal anchors (same page sections)
        if (href.startsWith("#")) return;

        // Skip mailto, tel, javascript, etc.
        if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;

        // Skip links that already point to Etupedia
        if (href.startsWith("/article/")) return;

        // Skip links that are in the "Source:" section (external source attribution)
        const parentText = link.parentElement?.textContent || "";
        if (parentText.includes("Source:")) return;

        // Check if it's a Wikipedia link
        const wikiMatch = href.match(/https?:\/\/[^/]+\.wikipedia\.org\/wiki\/([^#?]+)/);
        if (wikiMatch) {
          const articleSlug = wikiMatch[1];

          // Skip Wikipedia template/special pages
          if (articleSlug.startsWith("Template:") ||
              articleSlug.startsWith("Wikipedia:") ||
              articleSlug.startsWith("Help:") ||
              articleSlug.startsWith("Category:") ||
              articleSlug.startsWith("File:") ||
              articleSlug.startsWith("Special:")) {
            return;
          }

          // Build Etupedia URL with language parameter
          const langParam = language !== 'en' ? `?lang=${language}` : '';
          const etupediaUrl = `/article/${articleSlug}${langParam}`;
          const wikiTitle = decodeURIComponent(articleSlug.replace(/_/g, ' '));

          // Update the link to point to Etupedia
          link.setAttribute("href", etupediaUrl);
          link.classList.add("hover:bg-accent/50", "transition-colors", "rounded", "px-0.5", "-mx-0.5");

          // Use client-side navigation (no reload) - let Next.js handle it
          // No need to prevent default - the href will work with Next.js Link behavior

          // Add hover preview handlers
          link.addEventListener("mouseenter", async (e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

            // Clear any existing timeout
            if (previewTimeoutRef.current) {
              clearTimeout(previewTimeoutRef.current);
            }

            // Show preview after 200ms delay
            previewTimeoutRef.current = setTimeout(async () => {
              try {
                let previewData;

                // Check cache first
                if (previewCacheRef.current.has(wikiTitle)) {
                  previewData = previewCacheRef.current.get(wikiTitle)!;
                } else {
                  // Fetch from Wikipedia API in the current language
                  const apiUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
                  const response = await fetch(apiUrl);
                  const data = await response.json();

                  if (data && data.title && data.extract) {
                    previewData = {
                      title: data.title,
                      excerpt: data.extract,
                    };

                    // Cache the preview
                    previewCacheRef.current.set(wikiTitle, previewData);
                  }
                }

                if (previewData) {
                  setPreview(previewData);

                  // Smart positioning: calculate the best position based on available space
                  const previewWidth = 384; // w-96 = 384px
                  const previewHeight = 200; // max height with padding
                  const margin = 16;
                  const gap = 8; // 8px gap = ~2mm between word and preview
                  const viewportWidth = window.innerWidth;
                  const viewportHeight = window.innerHeight;

                  // Use rect positions directly (fixed positioning, no scrollY needed)
                  let x = rect.left + rect.width / 2;
                  let y = rect.bottom + gap; // Just 8px gap below the word
                  let placement = 'bottom';

                  // Check if preview would overflow right edge
                  if (x + previewWidth / 2 > viewportWidth - margin) {
                    x = viewportWidth - previewWidth / 2 - margin;
                  }
                  // Check if preview would overflow left edge
                  if (x - previewWidth / 2 < margin) {
                    x = previewWidth / 2 + margin;
                  }

                  // Check if preview would overflow bottom edge of viewport
                  if (rect.bottom + gap + previewHeight > viewportHeight) {
                    // Check if there's space above
                    if (rect.top - gap - previewHeight > 0) {
                      // Show above the word
                      y = rect.top - gap;
                      placement = 'top';
                    } else {
                      // Not enough space above either, keep below but adjust
                      y = rect.bottom + gap;
                    }
                  }

                  setPreviewPosition({
                    x,
                    y,
                    placement,
                  });
                }
              } catch (error) {
                console.error("Error fetching preview:", error);
              }
            }, 200);
          });

          link.addEventListener("mouseleave", () => {
            if (previewTimeoutRef.current) {
              clearTimeout(previewTimeoutRef.current);
            }
            setPreview(null);
            setPreviewPosition(null);
          });
        }
      });
    };

    interceptWikipediaLinks();

    // Intercept image clicks to show modal instead of redirecting
    const interceptImageClicks = () => {
      const images = containerRef.current?.querySelectorAll("img");
      images?.forEach((img) => {
        // Remove any existing click handlers
        const parent = img.parentElement;

        // If image is wrapped in a link, prevent the link from working
        if (parent?.tagName === "A") {
          parent.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        }

        // Add click handler to image to open modal
        img.style.cursor = "pointer";
        img.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          let imgSrc = img.getAttribute("src");

          if (imgSrc) {
            // If image is already proxied, extract the original URL
            if (imgSrc.includes("/api/proxy-image?url=")) {
              const urlParam = new URLSearchParams(imgSrc.split("?")[1]).get("url");
              if (urlParam) {
                let originalUrl = decodeURIComponent(urlParam);

                // Try to get high-resolution version from Wikipedia
                if (originalUrl.includes("wikipedia") || originalUrl.includes("wikimedia")) {
                  // Remove thumbnail sizing from Wikipedia URLs
                  originalUrl = originalUrl.replace(/\/thumb\/(.*?)\/[\d]+px-.*$/, "/$1");
                }

                // Re-proxy the high-res version
                imgSrc = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
              }
            } else if (imgSrc.includes("wikipedia") || imgSrc.includes("wikimedia")) {
              // Handle legacy direct URLs (if any exist)
              imgSrc = imgSrc.replace(/\/thumb\/(.*?)\/[\d]+px-.*$/, "/$1");
              if (imgSrc.startsWith("//")) {
                imgSrc = "https:" + imgSrc;
              }
              imgSrc = `/api/proxy-image?url=${encodeURIComponent(imgSrc)}`;
            }

            setModalImage(imgSrc);
          }
        });
      });
    };

    interceptImageClicks();

    // Scroll to hash on mount if present
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const yOffset = -120;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, [content, language]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cleanup preview timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalImage) {
        setModalImage(null);
      }
    };

    if (modalImage) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [modalImage]);

  return (
    <>
      <div
        ref={containerRef}
        className="article-content text-base leading-relaxed"
      />

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setModalImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all z-[101]"
            aria-label="Close image"
          >
            <Cross2Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
            {/* Image - high quality with smart sizing */}
            <img
              src={modalImage}
              alt="Enlarged view"
              className="shadow-2xl max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              style={{
                borderRadius: isMobile ? '24px' : '8px'
              }}
            />
          </div>
        </div>
      )}

      {/* Link Preview Popup */}
      {preview && previewPosition && (
        <div
          className="fixed z-[90] w-96 max-w-[90vw] bg-popover border border-border rounded-lg shadow-2xl p-4 opacity-0 animate-[fadeIn_0.15s_ease-out_forwards] pointer-events-auto"
          style={{
            left: `${previewPosition.x}px`,
            ...(previewPosition.placement === 'top'
              ? { bottom: `${window.innerHeight - previewPosition.y}px`, transform: "translateX(-50%)" }
              : { top: `${previewPosition.y}px`, transform: "translateX(-50%)" }
            ),
            maxHeight: "200px",
            overflowY: "auto",
          }}
          onMouseEnter={() => {
            // Keep preview open when hovering over it
            if (previewTimeoutRef.current) {
              clearTimeout(previewTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            setPreview(null);
            setPreviewPosition(null);
          }}
        >
          <h3 className="font-space font-semibold text-sm mb-2 text-foreground leading-tight">
            {preview.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
            {preview.excerpt}
          </p>
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground/70 italic">
              Hover to read more • Click link to view full article
            </p>
          </div>
        </div>
      )}
    </>
  );
}
