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
        console.log("🚀 Initializing Qwen2.5 1.5B...");
        setInitProgress("Initializing WebLLM...");

        // Qwen2.5 1.5B - powerful 900MB model with 32K context
        let modelName = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

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
        setError(`Failed to load model: ${errorMsg}. Try refreshing the page.`);
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
      // Clean and prepare the FULL article content
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Qwen2.5 1.5B has 32K token context (~24K characters)
      // Use as much article as possible within context limit
      const contextContent = cleanContent.length > 24000
        ? cleanContent.substring(0, 24000) + "\n\n[Article truncated - showing first 24K characters]"
        : cleanContent;

      console.log(`📄 Article: ${cleanContent.length} chars, using: ${contextContent.length} chars for context`);

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant analyzing the Wikipedia article "${articleTitle}".

CRITICAL RULES:
1. Answer ONLY using information from the article below
2. If information is NOT in the article, respond: "This information is not in the article"
3. Do NOT use your general knowledge - ONLY use the article
4. Quote or reference specific parts of the article in your answers
5. Be accurate and factual - do not invent or assume information

FULL ARTICLE CONTENT:
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
    await sendMessage("Read the entire article carefully. Then provide a comprehensive summary in 5-7 bullet points covering ONLY the main ideas, key concepts, and important conclusions found in THIS article. Do not add external information.");
  }

  async function generateQuiz() {
    await sendMessage("Based STRICTLY on the information in THIS article, create 3 multiple-choice questions with 4 options each. Each question must be answerable using ONLY information from the article. Include the correct answer and explain WHERE in the article this information can be found.");
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
