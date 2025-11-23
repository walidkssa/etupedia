import { jsPDF } from "jspdf";

export async function generatePDF(
  articleTitle: string,
  articleContent: string,
  textModifications: any[] = []
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkAddPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(articleTitle, contentWidth);
  titleLines.forEach((line: string) => {
    checkAddPage(12);
    doc.text(line, margin, yPosition);
    yPosition += 12;
  });

  yPosition += 10;

  // Get the actual modified content from the DOM
  const articleBody = document.querySelector(".article-body");
  let contentToExport = articleContent;

  if (articleBody) {
    // Always use the DOM content to get real-time modifications
    contentToExport = articleBody.innerHTML;
  }

  // Parse HTML content
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(contentToExport, "text/html");

  // Process all text nodes and elements with proper hierarchy
  const processNode = (node: Node, depth: number = 0) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        const parent = node.parentElement;
        if (parent && !parent.hasAttribute('data-modification')) {
          // Regular text without modification
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);

          const lines = doc.splitTextToSize(text, contentWidth);
          lines.forEach((line: string) => {
            checkAddPage(6);
            doc.text(line, margin, yPosition);
            yPosition += 6;
          });
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const hasModification = element.hasAttribute('data-modification');

      // Skip if this is a container that will be processed by its children
      if (!hasModification && ['div', 'section', 'article'].includes(tagName)) {
        element.childNodes.forEach(child => processNode(child, depth + 1));
        return;
      }

      const text = element.textContent?.trim() || "";
      if (!text) return;

      // Handle modified text spans
      if (hasModification) {
        checkAddPage(8);

        const modificationType = element.getAttribute('data-modification');
        const bgColor = element.style.backgroundColor;
        const textColor = element.style.color;
        const isUnderlined = element.style.textDecoration?.includes('underline') || false;
        const isBold = element.style.fontWeight === 'bold';
        const isItalic = element.style.fontStyle === 'italic';

        // Set background color for highlights
        if (bgColor && modificationType === 'highlight') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = bgColor;
            const color = ctx.fillStyle;
            // Convert hex to RGB
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            doc.setFillColor(r, g, b);
            const textWidth = doc.getTextWidth(text);
            doc.rect(margin - 1, yPosition - 4, Math.min(textWidth + 2, contentWidth), 6, 'F');
          }
        }

        // Set text styling
        const fontStyle = isBold && isItalic ? 'bolditalic' :
                        isBold ? 'bold' :
                        isItalic ? 'italic' : 'normal';
        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(11);

        // Set text color
        if (textColor && modificationType === 'color') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = textColor;
            const color = ctx.fillStyle;
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            doc.setTextColor(r, g, b);
          }
        }

        const spanLines = doc.splitTextToSize(text, contentWidth);
        spanLines.forEach((line: string) => {
          checkAddPage(6);
          if (isUnderlined) {
            const textWidth = doc.getTextWidth(line);
            doc.text(line, margin, yPosition);
            doc.line(margin, yPosition + 0.5, margin + textWidth, yPosition + 0.5);
          } else {
            doc.text(line, margin, yPosition);
          }
          yPosition += 6;
        });

        // Reset colors
        doc.setTextColor(0, 0, 0);
        yPosition += 2;
        return;
      }

      // Handle regular HTML elements
      switch (tagName) {
        case "h1":
        case "h2":
          checkAddPage(15);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          const h1Lines = doc.splitTextToSize(text, contentWidth);
          h1Lines.forEach((line: string) => {
            doc.text(line, margin, yPosition);
            yPosition += 9;
          });
          yPosition += 5;
          break;

        case "h3":
          checkAddPage(12);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          const h3Lines = doc.splitTextToSize(text, contentWidth);
          h3Lines.forEach((line: string) => {
            doc.text(line, margin, yPosition);
            yPosition += 7;
          });
          yPosition += 4;
          break;

        case "h4":
        case "h5":
        case "h6":
          checkAddPage(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          const hLines = doc.splitTextToSize(text, contentWidth);
          hLines.forEach((line: string) => {
            doc.text(line, margin, yPosition);
            yPosition += 6;
          });
          yPosition += 3;
          break;

        case "p":
          // Skip if all children are modified spans (they'll be processed separately)
          if (Array.from(element.children).every(child =>
            child.hasAttribute('data-modification'))) {
            element.childNodes.forEach(child => processNode(child, depth + 1));
          } else {
            checkAddPage(10);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const pLines = doc.splitTextToSize(text, contentWidth);
            pLines.forEach((line: string) => {
              checkAddPage(6);
              doc.text(line, margin, yPosition);
              yPosition += 6;
            });
            yPosition += 4;
          }
          break;

        case "li":
          checkAddPage(8);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          const liLines = doc.splitTextToSize("• " + text, contentWidth - 5);
          liLines.forEach((line: string, index: number) => {
            checkAddPage(6);
            doc.text(line, margin + (index === 0 ? 0 : 5), yPosition);
            yPosition += 6;
          });
          yPosition += 2;
          break;

        case "blockquote":
          checkAddPage(10);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const quoteLines = doc.splitTextToSize(text, contentWidth - 10);
          quoteLines.forEach((line: string) => {
            checkAddPage(6);
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
          });
          doc.setTextColor(0, 0, 0);
          yPosition += 4;
          break;

        default:
          // Process children for other containers
          element.childNodes.forEach(child => processNode(child, depth + 1));
          break;
      }
    }
  };

  // Process the document body
  htmlDoc.body.childNodes.forEach(node => processNode(node));

  // Add footer with source
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Source: Etupedia`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
  }

  const fileName = `${articleTitle
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}.pdf`;
  doc.save(fileName);
}
