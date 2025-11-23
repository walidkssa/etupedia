export interface ImageAssociation {
  src: string;
  alt: string;
  paragraphId: string;
  sectionId?: string;
  order: number;
  width?: number;
  height?: number;
}

export function extractImagesFromContent(htmlContent: string): {
  images: ImageAssociation[];
  cleanedContent: string;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const images: ImageAssociation[] = [];
  let order = 0;

  // Find all images in the content
  const imgElements = doc.querySelectorAll("img");

  imgElements.forEach((img) => {
    // Skip very small images (likely icons or decorative elements)
    const width = img.getAttribute("width");
    const height = img.getAttribute("height");
    if (width && height && (parseInt(width) < 100 || parseInt(height) < 100)) {
      return;
    }

    const src = img.getAttribute("src");
    const alt = img.getAttribute("alt") || "";

    if (!src) return;

    // Find the parent paragraph or section
    let parent = img.parentElement;
    let paragraphId = "";
    let sectionId = "";

    // Traverse up to find a meaningful parent
    while (parent && parent !== doc.body) {
      // Check if parent is a paragraph or figure
      if (parent.tagName === "P" || parent.tagName === "FIGURE" || parent.tagName === "DIV") {
        // Generate or get an ID for this paragraph
        if (!parent.id) {
          parent.id = `paragraph-with-image-${order}`;
        }
        paragraphId = parent.id;
        break;
      }
      parent = parent.parentElement;
    }

    // Find the closest section heading
    let element: Element | null = img;
    while (element && element !== doc.body) {
      const prev = element.previousElementSibling;
      if (prev && /^H[2-6]$/.test(prev.tagName)) {
        sectionId = prev.getAttribute("data-section-id") || prev.id || "";
        break;
      }
      element = element.parentElement;
      if (element && /^H[2-6]$/.test(element.tagName)) {
        sectionId = element.getAttribute("data-section-id") || element.id || "";
        break;
      }
    }

    // If no paragraph ID was found, create a marker div where the image was
    if (!paragraphId) {
      const marker = doc.createElement("div");
      marker.id = `paragraph-with-image-${order}`;
      marker.className = "image-paragraph-marker";
      // Insert marker before the image
      img.parentNode?.insertBefore(marker, img);
      paragraphId = marker.id;
    } else {
      // Add a marker class to the parent for tracking
      const parentElement = document.getElementById(paragraphId);
      if (parentElement) {
        parentElement.classList.add("has-sidebar-image");
      }
    }

    images.push({
      src,
      alt,
      paragraphId,
      sectionId,
      order,
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
    });

    order++;

    // IMPORTANT: Remove the image completely from the content
    // It will only appear in the sidebar
    const parentToClean = img.parentElement;
    img.remove();

    // If parent was a figure or wrapper that's now empty, remove it too
    if (parentToClean &&
        (parentToClean.tagName === "FIGURE" || parentToClean.classList.contains("image-wrapper")) &&
        !parentToClean.textContent?.trim()) {
      parentToClean.remove();
    }
  });

  return {
    images,
    cleanedContent: doc.body.innerHTML,
  };
}

export function getImageUrl(src: string, highQuality: boolean = false): string {
  // If already proxied, extract and upgrade if needed
  if (src.includes("/api/proxy-image")) {
    if (!highQuality) return src;

    // Extract original URL and upgrade to high quality
    const urlParam = new URLSearchParams(src.split("?")[1]).get("url");
    if (urlParam) {
      const originalUrl = decodeURIComponent(urlParam);
      return getImageUrl(originalUrl, true);
    }
    return src;
  }

  // Ensure https protocol
  let fullUrl = src.startsWith("//") ? "https:" + src : src;

  // If it's a Wikipedia/Wikimedia URL
  if (fullUrl.includes("wikipedia") || fullUrl.includes("wikimedia")) {
    if (highQuality) {
      // Remove ALL thumbnail/resize parameters for maximum quality
      // Pattern 1: /thumb/path/to/file/XXXpx-filename -> /path/to/file
      fullUrl = fullUrl.replace(/\/thumb\/([^/]+\/[^/]+\/[^/]+)\/\d+px-[^/]+$/, "/$1");

      // Pattern 2: Remove any remaining /thumb/ prefix
      fullUrl = fullUrl.replace(/\/thumb\//, "/");

      // Pattern 3: Remove width parameters from URL
      fullUrl = fullUrl.replace(/\/\d+px-/, "/");

      // Pattern 4: Get the original file by removing resize suffix
      fullUrl = fullUrl.replace(/\/([^/]+)\/\d+px-(.+)$/, "/$1/$2");
    }

    return `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
  }

  return fullUrl;
}
