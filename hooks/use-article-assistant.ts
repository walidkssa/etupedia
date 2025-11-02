"use client";

import { useState, useEffect } from "react";
import { aiEngine, type EngineStatus } from "@/lib/ai-engine";

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
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    status: "initializing",
    message: "Starting AI engine...",
  });

  // Subscribe to engine status updates
  useEffect(() => {
    console.log("🔌 Subscribing to AI Engine status");

    const unsubscribe = aiEngine.subscribe((status) => {
      console.log("📡 Engine status update:", status);
      setEngineStatus(status);

      if (status.status === "error") {
        setError(status.message);
      } else {
        setError(null);
      }
    });

    // Initialize engine
    aiEngine.initialize().catch((err) => {
      console.error("❌ Failed to initialize engine:", err);
      setError(err.message || "Failed to initialize AI engine");
    });

    return unsubscribe;
  }, []);

  // Send message
  async function sendMessage(content: string) {
    console.log("\n=== 📤 SEND MESSAGE ===");
    console.log("Content:", content);
    console.log("Engine ready:", aiEngine.isReady());
    console.log("Is loading:", isLoading);

    if (!content?.trim()) {
      console.log("❌ Empty content");
      return;
    }

    if (!aiEngine.isReady()) {
      console.log("❌ Engine not ready");
      setError("AI engine is still loading. Please wait...");
      return;
    }

    if (isLoading) {
      console.log("❌ Already processing another message");
      return;
    }

    console.log("✅ Starting message processing");

    setIsLoading(true);
    setError(null);

    // Add user message
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
        .trim()
        .substring(0, 6000);

      const systemPrompt = `You are a helpful assistant. Answer questions about this article.

Article: "${articleTitle}"

Content: ${cleanContent}

Provide clear, helpful answers.`;

      console.log("🤖 Calling AI engine...");

      const answer = await aiEngine.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.trim() },
        ],
        {
          temperature: 0.5,
          max_tokens: 1000,
        }
      );

      console.log("✅ Got response:", answer.substring(0, 100));

      // Add assistant message
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message || "Error generating response");

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, an error occurred. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      console.log("=== ✅ MESSAGE PROCESSING COMPLETE ===\n");
    }
  }

  // Generate summary
  async function generateSummary() {
    console.log("📝 Generating summary");

    if (!aiEngine.isReady() || isLoading) {
      console.log("❌ Cannot generate summary - engine not ready or already loading");
      return;
    }

    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: "Summarize this article",
        timestamp: Date.now(),
      },
    ]);

    try {
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);

      const summary = await aiEngine.chat(
        [
          { role: "system", content: "Provide a concise summary in bullet points." },
          { role: "user", content: `Article: "${articleTitle}"\n\n${cleanContent}` },
        ],
        {
          temperature: 0.3,
          max_tokens: 500,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: summary,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error("❌ Summary error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Failed to generate summary.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Generate quiz
  async function generateQuiz() {
    console.log("📝 Generating quiz");

    if (!aiEngine.isReady() || isLoading) {
      console.log("❌ Cannot generate quiz - engine not ready or already loading");
      return;
    }

    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: "Generate quiz questions",
        timestamp: Date.now(),
      },
    ]);

    try {
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);

      const quiz = await aiEngine.chat(
        [
          { role: "system", content: "Create 3 multiple-choice questions about the article." },
          { role: "user", content: `Article: "${articleTitle}"\n\n${cleanContent}` },
        ],
        {
          temperature: 0.5,
          max_tokens: 800,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: quiz,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error("❌ Quiz error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Failed to generate quiz.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function clearChat() {
    console.log("🗑️ Clearing chat");
    setMessages([]);
    setError(null);
  }

  return {
    messages,
    isLoading,
    isInitializing: engineStatus.status === "initializing",
    initProgress: engineStatus.message,
    error,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
  };
}
