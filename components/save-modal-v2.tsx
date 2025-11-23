"use client";

import { BottomSheet } from "@/components/bottom-sheet";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
  articleContent: string;
  coverImage?: string;
}

export function SaveModalV2({
  isOpen,
  onClose,
  articleTitle,
  articleContent,
  coverImage,
}: SaveModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");

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

      // Parse HTML content
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(articleContent, "text/html");
      const elements = htmlDoc.body.querySelectorAll("*");

      elements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim() || "";

        if (!text) return;

        // Skip if text is already in parent
        if (element.parentElement && element.parentElement.textContent === text) {
          return;
        }

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
        }
      });

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

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Save Article"
      coverImage={coverImage}
      height="50vh"
      hideCloseButton
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Preview Card */}
        <div className="rounded-2xl overflow-hidden bg-muted/50 border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-background rounded-lg">
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{articleTitle}</h3>
              <p className="text-sm text-muted-foreground">
                Download as formatted PDF document with proper structure
              </p>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="w-full py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download as PDF
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="bg-accent/30 rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              PDF includes:
            </span>
            <br />
            • Formatted headings and subheadings
            <br />
            • Structured paragraphs
            <br />
            • Proper spacing and typography
            <br />• Page numbers and source attribution
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
