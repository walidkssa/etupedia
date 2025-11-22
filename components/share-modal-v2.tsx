"use client";

import { X, Instagram, Facebook, MessageCircle, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setCopied(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background image with blur */}
      {coverImage && (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt="Background"
            fill
            className="object-cover"
            style={{ filter: 'blur(40px)' }}
            priority
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>
      )}

      {!coverImage && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
      )}

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-background/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium">
            {activeTab === "article" ? "Share Article" : "Share Text"}
          </h2>
          <div className="w-9" />
        </div>

        {/* Tabs - if there's selected text */}
        {selectedText && (
          <div className="flex border-b border-foreground/20 bg-background/20">
            <button
              onClick={() => setActiveTab("article")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "article"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-foreground/60"
              }`}
            >
              Share Article
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "text"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-foreground/60"
              }`}
            >
              Share Text
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto space-y-6">
            {/* Preview Card */}
            <div className="rounded-2xl overflow-hidden bg-background/80 border border-foreground/10">
              {activeTab === "article" ? (
                <div
                  className="relative"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        ${theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 2px,
                        ${theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 4px
                      )
                    `
                  }}
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
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
                      <span>Wikipedia Article</span>
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
                        ${theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 2px,
                        ${theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 4px
                      )
                    `
                  }}
                >
                  <div className="text-6xl text-foreground/30 mb-2">&ldquo;</div>
                  <p className="font-serif text-foreground mb-3 px-2" style={{ lineHeight: 1.6 }}>
                    {selectedText}
                  </p>
                  <div className="text-6xl text-foreground/30 text-right mb-4">&rdquo;</div>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      <path d="M8 4L4 28H10L12 18H20L22 28H28L24 4H18L16 14H12L14 4H8Z" />
                    </svg>
                    <span>From {articleTitle.split(" ")[0]}, Wikipedia</span>
                  </div>
                </div>
              )}
            </div>

            {/* Social Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                className="p-4 bg-background/40 hover:bg-background/60 rounded-full transition-colors border border-foreground/10"
                aria-label="Share on Instagram"
              >
                <Instagram className="w-6 h-6" />
              </button>

              <button
                className="p-4 bg-background/40 hover:bg-background/60 rounded-full transition-colors border border-foreground/10"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-6 h-6" />
              </button>

              <button
                className="p-4 bg-background/40 hover:bg-background/60 rounded-full transition-colors border border-foreground/10"
                aria-label="Share on TikTok"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-5 h-5" />
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
