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
        console.log("🚀 Initializing Llama 3.2 3B...");
        setInitProgress("Initializing WebLLM...");

        // Try 3B model first, fallback to 1B if it fails
        let modelName = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

        console.log(`📦 Attempting to load model: ${modelName}`);
        setInitProgress("Connecting to model server...");

        const engine = await CreateMLCEngine(modelName, {
          initProgressCallback: (progress) => {
            if (!mounted) return;
            console.log("📥 Progress:", progress);

            // Show detailed progress
            if (progress.text) {
              setInitProgress(progress.text);
            } else if (progress.progress) {
              const percent = Math.round(progress.progress * 100);
              setInitProgress(`Downloading model: ${percent}%`);
            }
          },
        });

        if (!mounted) return;

        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");
        console.log("✅ Model loaded successfully!");
      } catch (err: any) {
        console.error("❌ Init error:", err);
        console.error("Full error:", JSON.stringify(err, null, 2));

        if (!mounted) return;

        // Show detailed error message
        const errorMsg = err.message || "Unknown error";
        setError(`Failed to load 3B model: ${errorMsg}. Try refreshing the page.`);
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
        .substring(0, 3000); // Increased context for 3B model

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specialized in analyzing academic articles. You are currently analyzing the article titled "${articleTitle}".

Your role is to:
- Answer questions ONLY based on the article content provided below
- Provide accurate, detailed explanations from the article
- If the answer is not in the article, say "This information is not covered in the article"
- Always reference specific parts of the article when answering
- Be concise but comprehensive

Article content:
${cleanContent}`,
          },
          {
            role: "user",
            content: content.trim(),
          },
        ],
        temperature: 0.6,
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
    await sendMessage("Based on the article content, provide a comprehensive summary in 5-7 bullet points covering the main ideas, key concepts, and important conclusions.");
  }

  async function generateQuiz() {
    await sendMessage("Based strictly on the article content, create 3 multiple-choice questions with 4 options each. Include the correct answer and a brief explanation referencing the article.");
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
