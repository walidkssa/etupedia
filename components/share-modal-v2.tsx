"use client";

import { BottomSheet } from "@/components/bottom-sheet";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
  articleExcerpt: string;
  articleImage?: string;
  articleUrl: string;
  selectedText?: string;
  coverImage?: string;
}

export function ShareModalV2({
  isOpen,
  onClose,
  articleTitle,
  articleExcerpt,
  articleImage,
  articleUrl,
  selectedText,
  coverImage,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"article" | "text">(
    selectedText ? "text" : "article"
  );
  const { theme } = useTheme();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: activeTab === "article" ? articleTitle : `Quote from ${articleTitle}`,
      text: activeTab === "article" ? articleExcerpt : selectedText,
      url: articleUrl,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy link
        await handleCopyLink();
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === "article" ? "Share Article" : "Share Text"}
      coverImage={coverImage}
      height="70vh"
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Tabs - if there's selected text */}
        {selectedText && (
          <div className="flex border-b border-border rounded-lg overflow-hidden bg-muted/30">
            <button
              onClick={() => setActiveTab("article")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "article"
                  ? "text-foreground bg-background"
                  : "text-foreground/60"
              }`}
            >
              Share Article
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "text"
                  ? "text-foreground bg-background"
                  : "text-foreground/60"
              }`}
            >
              Share Text
            </button>
          </div>
        )}

        {/* Preview Card */}
        <div className="rounded-2xl overflow-hidden bg-background border border-border">
          {activeTab === "article" ? (
            <div
              className="relative"
              style={{
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    ${theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} 2px,
                    ${theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} 4px
                  )
                `,
              }}
            >
              <div className="p-6">
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {articleTitle}
                </h3>
                <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
                  {articleExcerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-foreground/50">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                  >
                    <path d="M8 4L4 28H10L12 18H20L22 28H28L24 4H18L16 14H12L14 4H8Z" />
                  </svg>
                  <span>Etupedia Article</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="p-6"
              style={{
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    ${theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} 2px,
                    ${theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} 4px
                  )
                `,
              }}
            >
              <div className="text-6xl text-foreground/30 mb-2">&ldquo;</div>
              <p
                className="font-serif text-foreground mb-3 px-2"
                style={{ lineHeight: 1.6 }}
              >
                {selectedText}
              </p>
              <div className="text-6xl text-foreground/30 text-right mb-4">
                &rdquo;
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/50">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M8 4L4 28H10L12 18H20L22 28H28L24 4H18L16 14H12L14 4H8Z" />
                </svg>
                <span>From {articleTitle.split(" ")[0]}, Etupedia</span>
              </div>
            </div>
          )}
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          {/* Native Share */}
          {typeof window !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className={`w-full py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 ${
              typeof window !== "undefined" && "share" in navigator
                ? "bg-muted hover:bg-muted/80 text-foreground"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Link Copied!
              </>
            ) : (
              <>
                <LinkIcon className="w-5 h-5" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
