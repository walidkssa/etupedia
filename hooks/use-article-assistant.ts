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

  // No initialization needed - using Hugging Face API
  const isInitializing = false;
  const initProgress = "";

  // Send message using Hugging Face Inference API (free)
  async function sendMessage(content: string) {
    if (!content?.trim()) {
      return;
    }

    if (isLoading) {
      return;
    }

    console.log("\n=== 📤 Sending message ===");
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
        .substring(0, 2000);

      const prompt = `You are analyzing an encyclopedia article titled "${articleTitle}".

Article content: ${cleanContent}

User question: ${content.trim()}

Provide a clear, concise answer based on the article:`;

      console.log("🤖 Calling AI API...");

      // Use our Next.js API route to call Hugging Face
      const response = await fetch("/api/huggingface", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.retry) {
          throw new Error(errorData.message || "Model is loading. Please try again.");
        }

        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || "No response generated";

      console.log("✅ Response received");

      // Add assistant message
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message || "Error generating response");

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, an error occurred. The AI model may be loading. Please wait a moment and try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  // Generate summary
  async function generateSummary() {
    if (isLoading) {
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
        .substring(0, 2500);

      const prompt = `Summarize this encyclopedia article titled "${articleTitle}" in 3-5 clear bullet points:

${cleanContent}

Summary:`;

      const response = await fetch("/api/huggingface", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      const summary = data.answer || "Failed to generate summary";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: summary.trim(),
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
          content: "Failed to generate summary. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Generate quiz
  async function generateQuiz() {
    if (isLoading) {
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
        .substring(0, 2500);

      const prompt = `Create 3 multiple-choice questions about this article titled "${articleTitle}":

${cleanContent}

Format each question with:
- The question
- 4 options (A, B, C, D)
- Indicate the correct answer

Questions:`;

      const response = await fetch("/api/huggingface", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          parameters: {
            max_new_tokens: 600,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      const quiz = data.answer || "Failed to generate quiz";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: quiz.trim(),
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
          content: "Failed to generate quiz. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
