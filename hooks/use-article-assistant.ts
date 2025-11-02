"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const isProcessingRef = useRef(false);

  // Initialize Phi-3.5 Mini model
  useEffect(() => {
    let mounted = true;

    const initializeModel = async () => {
      if (typeof window === "undefined") return;

      // Check WebGPU support first
      if (!("gpu" in navigator)) {
        if (mounted) {
          setError("WebGPU is not supported in your browser. Please use Chrome 113+, Edge 113+, or another Chromium-based browser.");
          setIsInitializing(false);
        }
        return;
      }

      try {
        if (mounted) {
          setIsInitializing(true);
          setInitProgress("Checking browser compatibility...");
        }

        // Test WebGPU availability
        try {
          const adapter = await (navigator.gpu as any).requestAdapter();
          if (!adapter) {
            throw new Error("WebGPU adapter not available");
          }
        } catch (gpuErr) {
          throw new Error("WebGPU is not available. Please use a Chromium-based browser (Chrome, Edge, Brave) version 113+.");
        }

        if (mounted) {
          setInitProgress("Downloading AI model (Phi-3.5 Mini)...");
        }

        // Create engine
        const engine = await webllm.CreateMLCEngine(
          "Phi-3.5-mini-instruct-q4f16_1-MLC",
          {
            initProgressCallback: (progress) => {
              if (!mounted) return;
              console.log("Model loading progress:", progress);

              if (progress.text) {
                setInitProgress(progress.text);
              } else if (progress.progress !== undefined) {
                const percent = Math.round(progress.progress * 100);
                setInitProgress(`Downloading model: ${percent}%`);
              }
            },
            logLevel: "INFO",
          }
        );

        if (!mounted) return;

        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");
        console.log("✅ Phi-3.5 Mini loaded successfully!");

      } catch (err: any) {
        if (!mounted) return;

        console.error("Error initializing AI model:", err);

        let errorMsg = "Failed to load AI model. ";

        if (err.message?.includes("WebGPU") || err.message?.includes("adapter")) {
          errorMsg += "WebGPU is not available. Please use Chrome 113+, Edge 113+, or another Chromium-based browser.";
        } else if (err.message?.includes("Cache") || err.message?.includes("network") || err.message?.includes("fetch")) {
          errorMsg += "Network error occurred. Please check your internet connection and try refreshing the page.";
        } else if (err.message?.includes("out of memory") || err.message?.includes("OOM")) {
          errorMsg += "Your device ran out of memory. Please close other tabs and try again.";
        } else {
          errorMsg += err.message || "Unknown error occurred. Please try refreshing the page.";
        }

        setError(errorMsg);
        setIsInitializing(false);
        setInitProgress("");
      }
    };

    initializeModel();

    return () => {
      mounted = false;
    };
  }, []);

  // Send a message - completely rebuilt
  const sendMessage = useCallback(
    async (content: string, enableSearch?: boolean) => {
      // Validate input
      if (!content.trim()) {
        console.log("❌ Empty content");
        return;
      }

      // Check if engine is ready
      if (!engineRef.current) {
        console.log("❌ Engine not ready");
        setError("AI model is still loading. Please wait...");
        return;
      }

      // Prevent concurrent requests
      if (isProcessingRef.current) {
        console.log("❌ Already processing a request");
        return;
      }

      // Validate article data
      if (!articleContent || !articleTitle) {
        console.log("❌ Missing article data");
        return;
      }

      console.log("✅ Starting message processing...");

      // Set processing flag FIRST
      isProcessingRef.current = true;
      setIsLoading(true);
      setError(null);

      const shouldUseWebSearch = enableSearch !== undefined ? enableSearch : webSearchEnabled;

      // Add user message to chat
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
        webSearchEnabled: shouldUseWebSearch,
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        let webSearchContext = "";

        // Get web search results if enabled
        if (shouldUseWebSearch) {
          try {
            console.log("🔍 Fetching web search results...");
            const response = await fetch("/api/assistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: content.trim(),
                enableWebSearch: true,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.webSearchResults) {
                webSearchContext = data.webSearchResults;
                console.log("✅ Web search results retrieved");
              }
            }
          } catch (err) {
            console.error("⚠️ Web search error:", err);
            // Continue without web search
          }
        }

        // Prepare context for the AI
        const cleanContent = articleContent
          .replace(/<[^>]*>/g, " ")
          .replace(/\[[0-9]+\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 6000);

        const systemPrompt = `You are an expert assistant that helps users understand articles. You are contextually aware of the article content and can provide insights and answer questions based on it.${webSearchContext ? ' You also have access to recent web search results to provide up-to-date information.' : ''}

Article Title: "${articleTitle}"

Article Content:
${cleanContent}${webSearchContext}

Please provide a comprehensive and helpful answer to the user's question.`;

        console.log("🤖 Generating AI response...");

        // Generate response using Phi-3.5 Mini
        const response = await engineRef.current.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: content.trim() }
          ],
          temperature: 0.4,
          max_tokens: 1000,
        });

        const answer = response.choices[0]?.message?.content || "I couldn't generate a response.";

        console.log("✅ AI response generated");

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: answer,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

      } catch (err: any) {
        console.error("❌ Error generating response:", err);
        setError(err.message || "Failed to generate response. Please try again.");

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try asking your question again.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        // Always reset flags
        isProcessingRef.current = false;
        setIsLoading(false);
        console.log("✅ Message processing complete");
      }
    },
    [articleTitle, articleContent, webSearchEnabled]
  );

  // Generate summary
  const generateSummary = useCallback(async () => {
    if (isProcessingRef.current || !engineRef.current || !articleContent || !articleTitle) {
      console.log("❌ Cannot generate summary - conditions not met");
      return;
    }

    console.log("✅ Starting summary generation...");

    isProcessingRef.current = true;
    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Summarize this article",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

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
            content: `You are a summarization expert. Provide a concise summary of the following article in 3-5 bullet points.`
          },
          {
            role: "user",
            content: `Article: "${articleTitle}"\n\n${cleanContent}\n\nProvide a summary:`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const summary = response.choices[0]?.message?.content || "Could not generate summary.";

      console.log("✅ Summary generated");

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: summary,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("❌ Error generating summary:", err);
      setError("Failed to generate summary.");

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I couldn't generate a summary. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
      console.log("✅ Summary generation complete");
    }
  }, [articleTitle, articleContent]);

  // Generate quiz
  const generateQuiz = useCallback(async () => {
    if (isProcessingRef.current || !engineRef.current || !articleContent || !articleTitle) {
      console.log("❌ Cannot generate quiz - conditions not met");
      return;
    }

    console.log("✅ Starting quiz generation...");

    isProcessingRef.current = true;
    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Generate quiz questions",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

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
            content: "You are a quiz generator. Create 3 multiple-choice questions based on the article content. Format each as: Q: [question]\\nA) [option]\\nB) [option]\\nC) [option]\\nD) [option]\\nCorrect: [letter]"
          },
          {
            role: "user",
            content: `Article: "${articleTitle}"\n\n${cleanContent}\n\nGenerate 3 quiz questions:`
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      const quiz = response.choices[0]?.message?.content || "Could not generate quiz.";

      console.log("✅ Quiz generated");

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: quiz,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("❌ Error generating quiz:", err);
      setError("Failed to generate quiz.");

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I couldn't generate quiz questions. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
      console.log("✅ Quiz generation complete");
    }
  }, [articleTitle, articleContent]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Toggle web search
  const toggleWebSearch = useCallback(() => {
    setWebSearchEnabled((prev) => !prev);
  }, []);

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
