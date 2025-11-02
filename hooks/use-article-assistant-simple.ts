"use client";

import { useState } from "react";

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

  async function sendMessage(content: string) {
    if (!content?.trim() || isLoading) return;

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
      // Call our API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: content.trim(),
          articleTitle,
          articleContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
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
          content: "Error processing your question. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateSummary() {
    await sendMessage("Summarize this article in 5-7 bullet points. Use ONLY information from the article.");
  }

  async function generateQuiz() {
    await sendMessage("Create 3 quiz questions based ONLY on this article. Include correct answers and explain where in the article each answer is found.");
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
  };
}
