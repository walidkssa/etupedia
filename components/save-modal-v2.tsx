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
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import("jspdf");

      // Create new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set font
      doc.setFont("helvetica");

      // Add title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(articleTitle, 170);
      doc.text(titleLines, 20, 20);

      // Add content
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      // Remove HTML tags from content
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

      // Split content into lines that fit the page
      const contentLines = doc.splitTextToSize(cleanContent, 170);

      let yPosition = 40;
      const pageHeight = 280;
      const lineHeight = 7;

      contentLines.forEach((line: string) => {
        if (yPosition + lineHeight > pageHeight) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += lineHeight;
      });

      // Add footer with source
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Source: Etupedia - Page ${i} of ${pageCount}`,
          20,
          287
        );
      }

      // Save the PDF
      const fileName = `${articleTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      doc.save(fileName);

      // Show success feedback
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
                Download as PDF document
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
        <p className="text-xs text-center text-muted-foreground">
          The PDF will include the full article content in a formatted document.
        </p>
      </div>
    </BottomSheet>
  );
}
