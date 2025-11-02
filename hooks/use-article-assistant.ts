"use client";

import { useState, useEffect, useRef } from "react";
import * as webllm from "@mlc-ai/web-llm";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  webSearchEnabled?: boolean;
}

interface UseArticleAssistantProps {
  articleTitle: string;
  articleContent: string;
}

export function useArticleAssistant({ articleTitle, articleContent }: UseArticleAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initProgress, setInitProgress] = useState("");

  // Use refs for values that shouldn't cause re-renders
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);

  // Initialize model - runs once on mount
  useEffect(() => {
    mountedRef.current = true;

    async function initEngine() {
      if (typeof window === "undefined") return;

      console.log("🚀 Starting AI model initialization...");

      // Check WebGPU support
      if (!("gpu" in navigator)) {
        if (mountedRef.current) {
          setError("WebGPU not supported. Use Chrome 113+ or Edge 113+");
          setIsInitializing(false);
        }
        return;
      }

      try {
        if (mountedRef.current) {
          setInitProgress("Checking WebGPU compatibility...");
        }

        // Test WebGPU
        const adapter = await (navigator.gpu as any).requestAdapter();
        if (!adapter) {
          throw new Error("No WebGPU adapter found");
        }

        console.log("✅ WebGPU is available");

        if (mountedRef.current) {
          setInitProgress("Loading Phi-3.5 Mini model...");
        }

        // Create the engine
        console.log("📥 Downloading Phi-3.5-mini-instruct-q4f16_1-MLC...");

        const engine = await webllm.CreateMLCEngine(
          "Phi-3.5-mini-instruct-q4f16_1-MLC",
          {
            initProgressCallback: (report) => {
              if (!mountedRef.current) return;

              console.log("Progress:", report);

              if (report.text) {
                setInitProgress(report.text);
              } else if (report.progress) {
                const pct = Math.round(report.progress * 100);
                setInitProgress(`Loading model: ${pct}%`);
              }
            },
            logLevel: "INFO",
          }
        );

        if (!mountedRef.current) return;

        engineRef.current = engine;
        console.log("✅ Model loaded successfully!");
        console.log("Engine reference:", engineRef.current);

        setIsInitializing(false);
        setInitProgress("");

      } catch (err: any) {
        console.error("❌ Model initialization failed:", err);

        if (mountedRef.current) {
          let msg = "Failed to load AI model. ";

          if (err.message?.includes("WebGPU") || err.message?.includes("adapter")) {
            msg += "WebGPU not available. Use Chrome/Edge 113+";
          } else if (err.message?.includes("network") || err.message?.includes("fetch")) {
            msg += "Network error. Check your connection";
          } else {
            msg += err.message || "Unknown error";
          }

          setError(msg);
          setIsInitializing(false);
        }
      }
    }

    initEngine();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty deps - run once

  // Send message function - NOT in useCallback
  async function sendMessage(content: string, enableSearch?: boolean) {
    console.log("\n🔵 sendMessage called");
    console.log("Content:", content);
    console.log("Engine exists:", !!engineRef.current);
    console.log("Processing:", processingRef.current);

    // Validation
    if (!content?.trim()) {
      console.log("❌ Empty content");
      return;
    }

    if (!engineRef.current) {
      console.log("❌ No engine");
      setError("AI model still loading...");
      return;
    }

    if (processingRef.current) {
      console.log("❌ Already processing");
      return;
    }

    if (!articleContent || !articleTitle) {
      console.log("❌ No article data");
      return;
    }

    console.log("✅ All checks passed, starting processing");

    // Lock processing
    processingRef.current = true;
    setIsLoading(true);
    setError(null);

    const useWebSearch = enableSearch ?? webSearchEnabled;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
      webSearchEnabled: useWebSearch,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      let webContext = "";

      // Web search if enabled
      if (useWebSearch) {
        console.log("🔍 Fetching web search...");
        try {
          const res = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: content.trim(),
              enableWebSearch: true,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.webSearchResults) {
              webContext = data.webSearchResults;
              console.log("✅ Web search results retrieved");
            }
          }
        } catch (e) {
          console.warn("⚠️ Web search failed:", e);
        }
      }

      // Clean article content
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 6000);

      const systemPrompt = `You are an expert assistant helping users understand articles. You have access to the article content and can answer questions about it.${webContext ? ' You also have recent web search results.' : ''}

Article Title: "${articleTitle}"

Article Content:
${cleanContent}${webContext}

Provide helpful answers to the user's questions.`;

      console.log("🤖 Calling AI model...");
      console.log("Using engine:", engineRef.current);

      // Call the model
      const response = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.trim() }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      const answer = response.choices[0]?.message?.content || "No response generated";

      console.log("✅ AI response received:", answer.substring(0, 100));

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
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      processingRef.current = false;
      setIsLoading(false);
      console.log("✅ Processing complete\n");
    }
  }

  // Generate summary
  async function generateSummary() {
    console.log("\n🔵 generateSummary called");

    if (processingRef.current || !engineRef.current || !articleContent || !articleTitle) {
      console.log("❌ Cannot generate summary");
      return;
    }

    processingRef.current = true;
    setIsLoading(true);
    setError(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Summarize this article",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);

      console.log("🤖 Generating summary...");

      const response = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a summarization expert. Provide a concise summary in 3-5 bullet points."
          },
          {
            role: "user",
            content: `Article: "${articleTitle}"\n\n${cleanContent}\n\nSummary:`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const summary = response.choices[0]?.message?.content || "Could not generate summary";

      console.log("✅ Summary generated");

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: summary,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err) {
      console.error("❌ Summary error:", err);
      setError("Failed to generate summary");

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, couldn't generate summary. Try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }

  // Generate quiz
  async function generateQuiz() {
    console.log("\n🔵 generateQuiz called");

    if (processingRef.current || !engineRef.current || !articleContent || !articleTitle) {
      console.log("❌ Cannot generate quiz");
      return;
    }

    processingRef.current = true;
    setIsLoading(true);
    setError(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Generate quiz questions",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);

      console.log("🤖 Generating quiz...");

      const response = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a quiz generator. Create 3 multiple-choice questions. Format: Q: [question]\\nA) [option]\\nB) [option]\\nC) [option]\\nD) [option]\\nCorrect: [letter]"
          },
          {
            role: "user",
            content: `Article: "${articleTitle}"\n\n${cleanContent}\n\nGenerate 3 quiz questions:`
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      const quiz = response.choices[0]?.message?.content || "Could not generate quiz";

      console.log("✅ Quiz generated");

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: quiz,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err) {
      console.error("❌ Quiz error:", err);
      setError("Failed to generate quiz");

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, couldn't generate quiz. Try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  function toggleWebSearch() {
    setWebSearchEnabled((prev) => !prev);
  }

  return {
    messages,
    isLoading,
    isInitializing,
    initProgress,
    error,
    webSearchEnabled,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
    toggleWebSearch,
  };
}
