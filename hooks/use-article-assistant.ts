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
  const [isInitializing, setIsInitializing] = useState(true);
  const [initProgress, setInitProgress] = useState("");

  const engineRef = useRef<webllm.MLCEngine | null>(null);

  // Initialize model once
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (typeof window === "undefined") return;

      console.log("🚀 Starting model initialization");

      if (!("gpu" in navigator)) {
        if (mounted) {
          setError("WebGPU not supported. Use Chrome 113+");
          setIsInitializing(false);
        }
        return;
      }

      try {
        if (mounted) setInitProgress("Checking WebGPU...");

        const adapter = await (navigator.gpu as any).requestAdapter();
        if (!adapter) throw new Error("No WebGPU adapter");

        console.log("✅ WebGPU available");

        if (mounted) setInitProgress("Loading Phi-3.5 Mini...");

        const engine = await webllm.CreateMLCEngine(
          "Phi-3.5-mini-instruct-q4f16_1-MLC",
          {
            initProgressCallback: (report) => {
              if (!mounted) return;
              console.log("Progress:", report);
              if (report.text) {
                setInitProgress(report.text);
              } else if (report.progress) {
                setInitProgress(`Loading: ${Math.round(report.progress * 100)}%`);
              }
            },
          }
        );

        if (!mounted) return;

        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");
        console.log("✅ MODEL LOADED SUCCESSFULLY");
        console.log("Engine:", engineRef.current);

      } catch (err: any) {
        console.error("❌ Init error:", err);
        if (mounted) {
          setError(err.message || "Failed to load model");
          setIsInitializing(false);
        }
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  // Send message - simple async function
  async function sendMessage(content: string) {
    console.log("\n=== SEND MESSAGE ===");
    console.log("Content:", content);
    console.log("Engine exists:", !!engineRef.current);
    console.log("Is loading:", isLoading);

    if (!content?.trim()) {
      console.log("❌ Empty content");
      return;
    }

    if (!engineRef.current) {
      console.log("❌ No engine");
      setError("Model still loading...");
      return;
    }

    if (isLoading) {
      console.log("❌ Already processing");
      return;
    }

    console.log("✅ Starting processing");

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
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

      console.log("🤖 Calling AI model...");

      const response = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.trim() }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      const answer = response.choices[0]?.message?.content || "No response";

      console.log("✅ Got response:", answer.substring(0, 100));

      // Add assistant message
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message || "Error generating response");

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, an error occurred. Please try again.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      console.log("=== DONE ===\n");
    }
  }

  // Generate summary
  async function generateSummary() {
    if (!engineRef.current || isLoading) return;

    setIsLoading(true);

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Summarize this article",
      timestamp: Date.now(),
    }]);

    try {
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);

      const response = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: "Provide a concise summary in bullet points." },
          { role: "user", content: `Article: "${articleTitle}"\n\n${cleanContent}` }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const summary = response.choices[0]?.message?.content || "Could not generate summary";

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: summary,
        timestamp: Date.now(),
      }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Failed to generate summary.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  // Generate quiz
  async function generateQuiz() {
    if (!engineRef.current || isLoading) return;

    setIsLoading(true);

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Generate quiz questions",
      timestamp: Date.now(),
    }]);

    try {
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);

      const response = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: "Create 3 multiple-choice questions about the article." },
          { role: "user", content: `Article: "${articleTitle}"\n\n${cleanContent}` }
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      const quiz = response.choices[0]?.message?.content || "Could not generate quiz";

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: quiz,
        timestamp: Date.now(),
      }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Failed to generate quiz.",
        timestamp: Date.now(),
      }]);
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
