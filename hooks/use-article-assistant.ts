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
  const [isInitializing] = useState(false); // GPT4Free is always ready
  const [initProgress] = useState(""); // No initialization needed

  // Send message using GPT4Free
  async function sendMessage(content: string) {
    console.log("\n=== 📤 SEND MESSAGE (GPT4Free) ===");
    console.log("Content:", content);

    if (!content?.trim()) {
      console.log("❌ Empty content");
      return;
    }

    if (isLoading) {
      console.log("❌ Already processing another message");
      return;
    }

    console.log("✅ Starting message processing with GPT4Free");

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

      console.log("🌐 Calling GPT4Free API...");

      // Call GPT4Free via API route
      const response = await fetch('/api/gpt4free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          articleTitle,
          articleContent: cleanContent,
          question: content.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'GPT4Free API failed');
      }

      const data = await response.json();
      const answer = data.response;

      console.log("✅ Got response from GPT4Free:", answer.substring(0, 100));

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

  // Generate summary using GPT4Free
  async function generateSummary() {
    console.log("📝 Generating summary with GPT4Free");

    if (isLoading) {
      console.log("❌ Cannot generate summary - already loading");
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

      const response = await fetch('/api/gpt4free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'summary',
          articleTitle,
          articleContent: cleanContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      const summary = data.response;

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

  // Generate quiz using GPT4Free
  async function generateQuiz() {
    console.log("📝 Generating quiz with GPT4Free");

    if (isLoading) {
      console.log("❌ Cannot generate quiz - already loading");
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

      const response = await fetch('/api/gpt4free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quiz',
          articleTitle,
          articleContent: cleanContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      const quiz = data.response;

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
    isInitializing,
    initProgress,
    error,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
  };
}
