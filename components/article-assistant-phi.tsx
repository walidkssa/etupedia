"use client";

import { useState, useRef, useEffect } from "react";
import { useArticleAssistant } from "@/hooks/use-article-assistant-phi";
import { Cross2Icon, PaperPlaneIcon, ReloadIcon } from "@radix-ui/react-icons";

interface ArticleAssistantProps {
  articleTitle: string;
  articleContent: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleAssistant({
  articleTitle,
  articleContent,
  isOpen,
  onClose,
}: ArticleAssistantProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isInitializing,
    initProgress,
    error,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
  } = useArticleAssistant({
    articleTitle,
    articleContent,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isInitializing) {
      inputRef.current?.focus();
    }
  }, [isOpen, isInitializing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-screen w-full lg:w-[500px] bg-background border-l border-border z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex-1">
          <h2 className="font-semibold text-lg">AI Assistant</h2>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {articleTitle}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="Close"
        >
          <Cross2Icon className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions */}
      {!isInitializing && (
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={generateSummary}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              Summarize
            </button>
            <button
              onClick={generateQuiz}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              Quiz
            </button>
            <button
              onClick={clearChat}
              disabled={isLoading || messages.length === 0}
              className="px-3 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors disabled:opacity-50 ml-auto"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Loading State */}
        {isInitializing && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ReloadIcon className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="font-semibold text-base mb-2">
              Loading Phi-3.5 Mini (400MB)
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-3">
              {initProgress || "Initializing..."}
            </p>
            <div className="text-xs text-muted-foreground/60 space-y-1 max-w-xs">
              <p>⏱️ First load: 1-2 minutes</p>
              <p>💾 Cached after first load</p>
              <p>⚡ Next loads: instant</p>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-3 max-w-xs">
              Please wait - downloading model files...
            </p>
          </div>
        )}

        {/* Welcome */}
        {!isInitializing && messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base mb-2">
              Ready to Help!
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Ask questions, get summaries, or test your knowledge
            </p>
            <p className="text-xs text-primary/70 mt-3">
              ✓ Phi-3.5 Mini • Local & Private
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium mb-2">⚠️ Error</p>
            <p className="text-xs text-destructive/80">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1.5 text-xs bg-destructive/20 hover:bg-destructive/30 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <p className="text-[10px] opacity-60 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isInitializing ? "Loading model..." : "Ask about this article..."}
            disabled={isLoading || isInitializing}
            className="flex-1 px-4 py-2.5 bg-input border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isInitializing}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Send"
          >
            {isLoading ? (
              <ReloadIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PaperPlaneIcon className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Powered by Phi-3.5 Mini • Runs in your browser
        </p>
      </div>
    </div>
  );
}
