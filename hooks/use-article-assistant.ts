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

  // Initialize model on mount
  useEffect(() => {
    if (isInitRef.current) return;
    isInitRef.current = true;

    async function initEngine() {
      try {
        console.log("🚀 Starting model initialization...");
        setIsInitializing(true);
        setError(null);

        // Use Phi-3.5-mini as it's the most stable
        const modelId = "Phi-3.5-mini-instruct-q4f16_1-MLC";

        console.log(`📦 Loading model: ${modelId}`);
        setInitProgress(`Initializing ${modelId}...`);

        const engine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: (progress) => {
            console.log("Progress:", progress);

            // Update progress display - keep initializing true during download
            if (progress.progress !== undefined) {
              const percent = Math.round(progress.progress * 100);
              setInitProgress(`Downloading model: ${percent}%`);
              setIsInitializing(true); // Keep showing loading screen
            } else if (progress.text) {
              setInitProgress(progress.text);
              setIsInitializing(true); // Keep showing loading screen
            }
          },
        });

        engineRef.current = engine;
        console.log("✅ Model loaded successfully!");
        setInitProgress("Model ready!");

        // Wait a bit before hiding loading screen
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsInitializing(false);

      } catch (err: any) {
        console.error("❌ Failed to load model:", err);
        setError(`Failed to load AI model: ${err.message}`);
        setInitProgress("Failed to load model");
        setIsInitializing(false);
      }
    }

    initEngine();
  }, []);

  // Send message
  async function sendMessage(content: string) {
    if (!content?.trim()) {
      console.log("❌ Empty content");
      return;
    }

    if (isLoading || isInitializing) {
      console.log("❌ Busy or initializing");
      return;
    }

    if (!engineRef.current) {
      console.log("❌ Engine not ready");
      setError("AI model not ready. Please wait for initialization.");
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
        .substring(0, 2500);

      console.log("🤖 Generating response...");

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are analyzing an encyclopedia article titled "${articleTitle}". Provide clear, concise answers based on the article content.`
          },
          {
            role: "user",
            content: `Article content: ${cleanContent}\n\nQuestion: ${content.trim()}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const answer = completion.choices[0]?.message?.content || "No response generated";

      console.log("✅ Response received:", answer.substring(0, 100));

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
    }
  }

  // Generate summary
  async function generateSummary() {
    if (isLoading || isInitializing || !engineRef.current) {
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
        .substring(0, 3500);

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise summaries."
          },
          {
            role: "user",
            content: `Summarize this encyclopedia article titled "${articleTitle}" in 3-5 clear bullet points:\n\n${cleanContent}`
          }
        ],
        temperature: 0.5,
        max_tokens: 600,
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

  // Generate quiz
  async function generateQuiz() {
    if (isLoading || isInitializing || !engineRef.current) {
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
        .substring(0, 3500);

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates educational quizzes."
          },
          {
            role: "user",
            content: `Create 3 multiple-choice questions about this article titled "${articleTitle}":\n\n${cleanContent}\n\nFormat each question with:\n- The question\n- 4 options (A, B, C, D)\n- Indicate the correct answer`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
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
