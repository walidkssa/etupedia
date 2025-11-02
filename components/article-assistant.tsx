"use client";

import { useState, useRef, useEffect } from "react";
import { useArticleAssistant } from "@/hooks/use-article-assistant";
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
    webSearchEnabled,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
    toggleWebSearch,
  } = useArticleAssistant({
    articleTitle,
    articleContent,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

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
          <h2 className="font-semibold text-lg">AI Article Assistant</h2>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {articleTitle}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="Close assistant"
        >
          <Cross2Icon className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={generateSummary}
            disabled={isLoading || isInitializing}
            className="px-3 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Summarize
          </button>
          <button
            onClick={generateQuiz}
            disabled={isLoading || isInitializing}
            className="px-3 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quiz Me
          </button>
          <button
            onClick={toggleWebSearch}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              webSearchEnabled
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-accent hover:bg-accent/80'
            }`}
            title="Enable web search for latest information"
          >
            {webSearchEnabled ? '🌐 Web Search ON' : '🌐 Web Search'}
          </button>
          <button
            onClick={clearChat}
            disabled={isLoading || isInitializing || messages.length === 0}
            className="px-3 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Model loading progress */}
        {isInitializing && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ReloadIcon className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="font-semibold text-base mb-2">
              Loading Mistral 7B Instruct
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              {initProgress || "Initializing local AI model..."}
            </p>
            <div className="w-full max-w-xs bg-secondary rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full animate-pulse"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              This may take 30-60 seconds on first load
            </p>
          </div>
        )}

        {/* Welcome message */}
        {!isInitializing && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-base mb-2">
              Your AI Reading Assistant
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Ask me anything about this article, request a summary, or test your knowledge with a quiz!
            </p>
            <p className="text-xs text-primary/70 mt-3">
              ✓ Powered by Mistral 7B running locally
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Chat messages */}
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

        {/* Loading indicator */}
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
            placeholder={isInitializing ? "Loading models..." : "Ask a question about this article..."}
            disabled={isLoading || isInitializing}
            className="flex-1 px-4 py-2.5 bg-input border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isInitializing}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            {isLoading ? (
              <ReloadIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PaperPlaneIcon className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Powered by Mistral 7B Instruct running locally • 100% private
        </p>
      </div>
    </div>
  );
}
