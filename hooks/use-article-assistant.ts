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

  // Initialize SmolLM2-1.7B
  useEffect(() => {
    if (initPromiseRef.current) return;

    let mounted = true;

    const initEngine = async () => {
      try {
        console.log("🚀 Initializing SmolLM2-1.7B...");
        setInitProgress("Loading SmolLM2-1.7B...");

        const engine = await CreateMLCEngine("SmolLM2-1.7B-Instruct-q4f16_1-MLC", {
          initProgressCallback: (progress) => {
            if (!mounted) return;
            console.log("📥 Progress:", progress);

            if (progress.text) {
              setInitProgress(progress.text);
            } else if (progress.progress !== undefined) {
              const percent = Math.round(progress.progress * 100);
              setInitProgress(`Downloading model: ${percent}%`);
            }
          },
        });

        if (!mounted) return;

        console.log("✅ Model loaded successfully!");
        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");

      } catch (err: any) {
        console.error("❌ Initialization error:", err);
        if (!mounted) return;

        let errorMsg = "Failed to load model";
        if (err?.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
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
      // Clean article content
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Use full article content (SmolLM2 has good context window)
      const contextContent = cleanContent.length > 30000
        ? cleanContent.substring(0, 30000) + "\n\n[Article continues...]"
        : cleanContent;

      console.log(`📄 Context: ${contextContent.length} chars`);

      // Generate response with SmolLM2-1.7B
      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are analyzing: "${articleTitle}"

RULES:
1. Answer ONLY from the article below
2. If not in article, say: "Not in article"
3. Be concise and accurate
4. Quote specific parts when relevant

ARTICLE:
${contextContent}`,
          },
          {
            role: "user",
            content: content.trim(),
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
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
      console.error("❌ Chat error:", err);
      setError(err.message);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateSummary() {
    await sendMessage("Summarize this article in 5-7 bullet points using ONLY article content.");
  }

  async function generateQuiz() {
    await sendMessage("Create 3 quiz questions with answers based ONLY on this article.");
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
