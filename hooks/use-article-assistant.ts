"use client";

import { useState, useEffect, useRef } from "react";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface UseArticleAssistantProps {
  articleTitle: string;
  articleContent: string;
}

export function useArticleAssistant({ articleTitle, articleContent }: UseArticleAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initProgress, setInitProgress] = useState("");

  const engineRef = useRef<any>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize Llama 3.2 1B
  useEffect(() => {
    if (initPromiseRef.current) return;

    let mounted = true;

    const initEngine = async () => {
      try {
        console.log("🚀 Initializing Llama 3.2 1B...");
        setInitProgress("Loading AI model...");

        const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
          initProgressCallback: (progress) => {
            if (!mounted) return;

            if (progress.text) {
              console.log("📥", progress.text);
              setInitProgress(progress.text);
            } else if (progress.progress !== undefined) {
              const percent = Math.round(progress.progress * 100);
              console.log(`📥 Download: ${percent}%`);
              setInitProgress(`Downloading: ${percent}%`);
            }
          },
        });

        if (!mounted) return;

        console.log("✅ Model ready!");
        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");

      } catch (err: any) {
        console.error("❌ Error:", err);
        if (!mounted) return;

        setError(err?.message || "Failed to load model");
        setIsInitializing(false);
      }
    };

    initPromiseRef.current = initEngine();

    return () => {
      mounted = false;
    };
  }, []);

  // Send message with article context
  async function sendMessage(content: string) {
    if (!content?.trim() || isLoading || !engineRef.current) return;

    setIsLoading(true);
    setError(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Clean article content (remove HTML tags and extra spaces)
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Llama 3.2 1B has limited context (4096 tokens) - use smaller chunk
      // ~3 chars = 1 token, so 4096 tokens ≈ 12000 chars
      // Leave room for system prompt and response
      const contextContent = cleanContent.length > 10000
        ? cleanContent.substring(0, 10000) + "\n[Article truncated...]"
        : cleanContent;

      console.log(`📄 Using ${contextContent.length} chars`);

      // Generate response with Llama 3.2 1B
      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are analyzing the Wikipedia article: "${articleTitle}"

Answer questions ONLY using information from the article below.
If the answer is not in the article, say "I don't see that information in the article."
Be accurate, concise, and helpful.

ARTICLE:
${contextContent}`,
          },
          {
            role: "user",
            content: content.trim(),
          },
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      const answer = completion.choices[0]?.message?.content || "No response";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: answer,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err?.message || "Something went wrong");

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, there was an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateSummary() {
    await sendMessage("Please summarize this article in 5-7 clear bullet points.");
  }

  async function generateQuiz() {
    await sendMessage("Create 3 quiz questions with answers based on this article.");
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  return {
    messages,
    isLoading,
    isInitializing,
    initProgress,
    error,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
  };
}
