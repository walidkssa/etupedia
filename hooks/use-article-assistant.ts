"use client";

import { useState, useEffect, useRef } from "react";
import * as webllm from "@mlc-ai/web-llm";

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
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState("");

  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const isInitRef = useRef(false);

  // Initialize Phi-4 on mount
  useEffect(() => {
    if (isInitRef.current) return;
    isInitRef.current = true;

    async function initEngine() {
      try {
        console.log("🚀 Starting Phi-4 initialization...");
        setIsInitializing(true);
        setInitProgress("Loading Phi-4 model...");

        const engine = await webllm.CreateMLCEngine(
          "Phi-3.5-mini-instruct-q4f16_1-MLC",
          {
            initProgressCallback: (progress) => {
              console.log("📦 Progress:", progress);
              setInitProgress(progress.text || "Loading...");
            },
          }
        );

        engineRef.current = engine;
        console.log("✅ Phi-4 loaded successfully!");
        setInitProgress("Ready!");
        setIsInitializing(false);
      } catch (err: any) {
        console.error("❌ Failed to load Phi-4:", err);
        setError("Failed to initialize AI model");
        setIsInitializing(false);
      }
    }

    initEngine();
  }, []);

  // Send message using Phi-4
  async function sendMessage(content: string) {
    console.log("\n=== 📤 SEND MESSAGE (Phi-4) ===");
    console.log("Content:", content);

    if (!content?.trim()) {
      console.log("❌ Empty content");
      return;
    }

    if (isLoading || isInitializing) {
      console.log("❌ Already processing or initializing");
      return;
    }

    if (!engineRef.current) {
      console.log("❌ Engine not initialized");
      setError("AI model not ready");
      return;
    }

    console.log("✅ Starting message processing with Phi-4");

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
        .substring(0, 3000);

      const systemPrompt = `You are analyzing this encyclopedia article:

Title: "${articleTitle}"

Content:
${cleanContent}

Provide clear, concise answers based on the article.`;

      console.log("🤖 Generating response with Phi-4...");

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.trim() }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const answer = completion.choices[0]?.message?.content || "No response generated";

      console.log("✅ Got response from Phi-4:", answer.substring(0, 100));

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

  // Generate summary using Phi-4
  async function generateSummary() {
    console.log("📝 Generating summary with Phi-4");

    if (isLoading || isInitializing || !engineRef.current) {
      console.log("❌ Cannot generate summary - not ready");
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

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant that creates concise summaries." },
          {
            role: "user",
            content: `Summarize this encyclopedia article in 3-5 clear bullet points:

Title: "${articleTitle}"

Content:
${cleanContent}

Provide a concise, informative summary.`
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      const summary = completion.choices[0]?.message?.content || "Failed to generate summary";

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

  // Generate quiz using Phi-4
  async function generateQuiz() {
    console.log("📝 Generating quiz with Phi-4");

    if (isLoading || isInitializing || !engineRef.current) {
      console.log("❌ Cannot generate quiz - not ready");
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

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant that creates educational quizzes." },
          {
            role: "user",
            content: `Create 3 multiple-choice questions about this article:

Title: "${articleTitle}"

Content:
${cleanContent}

Format each question with:
- The question
- 4 options (A, B, C, D)
- Indicate the correct answer

Make questions testing understanding of key concepts.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
      });

      const quiz = completion.choices[0]?.message?.content || "Failed to generate quiz";

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
