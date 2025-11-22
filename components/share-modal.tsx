"use client";

import { X, Instagram, Facebook, MessageCircle, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
  articleExcerpt: string;
  articleImage?: string;
  articleUrl: string;
  selectedText?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  articleTitle,
  articleExcerpt,
  articleImage,
  articleUrl,
  selectedText,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"article" | "text">(
    selectedText ? "text" : "article"
  );

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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium">
            {activeTab === "article" ? "Share Article" : "Share Text"}
          </h2>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Tabs - Only show if there's selected text */}
        {selectedText && (
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("article")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "article"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Share Article
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "text"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground"
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
            <div className="bg-accent/30 rounded-2xl overflow-hidden border border-border">
              {activeTab === "article" ? (
                <>
                  {articleImage && (
                    <div className="relative w-full h-48 bg-muted">
                      <Image
                        src={articleImage}
                        alt={articleTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {articleTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {articleExcerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="flex-shrink-0"
                      >
                        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm4.5 11.5c-.4.4-1 .4-1.4 0L8 8.4l-3.1 3.1c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L6.6 7 3.5 3.9c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L8 5.6l3.1-3.1c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L9.4 7l3.1 3.1c.4.4.4 1 0 1.4z" />
                      </svg>
                      <span>From {articleTitle.split(" ")[0]}, Wikipedia</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <div className="text-4xl mb-4">"</div>
                  <p className="font-serif text-foreground mb-4 italic">
                    {selectedText}
                  </p>
                  <div className="text-4xl text-right mb-4">"</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="flex-shrink-0"
                    >
                      <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm4.5 11.5c-.4.4-1 .4-1.4 0L8 8.4l-3.1 3.1c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L6.6 7 3.5 3.9c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L8 5.6l3.1-3.1c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L9.4 7l3.1 3.1c.4.4.4 1 0 1.4z" />
                    </svg>
                    <span>From {articleTitle.split(" ")[0]}, Wikipedia</span>
                  </div>
                </div>
              )}
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  /* Instagram share logic */
                }}
                className="p-4 bg-accent hover:bg-accent/70 rounded-full transition-colors"
                aria-label="Share on Instagram"
              >
                <Instagram className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  /* Facebook share logic */
                }}
                className="p-4 bg-accent hover:bg-accent/70 rounded-full transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  /* TikTok/Other share logic */
                }}
                className="p-4 bg-accent hover:bg-accent/70 rounded-full transition-colors"
                aria-label="Share on TikTok"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Copy Link Button */}
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
