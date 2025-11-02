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
  const [initProgress, setInitProgress] = useState("Starting...");

  const engineRef = useRef<any>(null);

  // Initialize WebLLM engine
  useEffect(() => {
    let mounted = true;

    async function initEngine() {
      try {
        console.log("🚀 Initializing Qwen2.5-3B...");
        setInitProgress("Downloading AI model...");

        const engine = await CreateMLCEngine("Qwen2.5-3B-Instruct-q4f16_1-MLC", {
          initProgressCallback: (progress) => {
            if (!mounted) return;
            console.log("📥 Progress:", progress);
            if (progress.text) {
              setInitProgress(progress.text);
            }
          },
        });

        if (!mounted) return;

        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");
        console.log("✅ Model loaded!");
      } catch (err: any) {
        console.error("❌ Init error:", err);
        if (!mounted) return;
        setError("Failed to load model: " + err.message);
        setIsInitializing(false);
      }
    }

    initEngine();

    return () => {
      mounted = false;
    };
  }, []);

  // Send message using WebLLM
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
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 1500);

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are analyzing "${articleTitle}". Article: ${cleanContent}`,
          },
          {
            role: "user",
            content: content.trim(),
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
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
    await sendMessage("Summarize this article in 3-5 bullet points");
  }

  async function generateQuiz() {
    await sendMessage("Create 3 multiple-choice questions with 4 options each and indicate correct answers");
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
