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

    // If no paragraph ID was found, create one based on the image position
    if (!paragraphId) {
      const wrapper = doc.createElement("div");
      wrapper.id = `paragraph-with-image-${order}`;
      wrapper.className = "image-paragraph-wrapper";
      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      paragraphId = wrapper.id;
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

    // Remove the image from the content (optional - we keep it for mobile)
    // For now, we'll keep images in the content and just hide them on desktop via CSS
    img.setAttribute("data-sidebar-image", "true");
    img.setAttribute("data-image-order", order.toString());
  });

  return {
    images,
    cleanedContent: doc.body.innerHTML,
  };
}

export function getImageUrl(src: string): string {
  // If already proxied, return as is
  if (src.includes("/api/proxy-image")) {
    return src;
  }

  // If it's a Wikipedia/Wikimedia URL, proxy it
  if (src.includes("wikipedia") || src.includes("wikimedia")) {
    // Upgrade to high-res version
    const highResSrc = src.replace(/\/thumb\/(.*?)\/[\d]+px-.*$/, "/$1");
    const fullUrl = highResSrc.startsWith("//") ? "https:" + highResSrc : highResSrc;
    return `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
  }

  return src;
}
