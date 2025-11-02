"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

  // Refs
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  const articleTitleRef = useRef(articleTitle);
  const articleContentRef = useRef(articleContent);

  // Update refs when props change
  useEffect(() => {
    articleTitleRef.current = articleTitle;
    articleContentRef.current = articleContent;
  }, [articleTitle, articleContent]);

  // Initialize model
  useEffect(() => {
    mountedRef.current = true;

    async function initEngine() {
      if (typeof window === "undefined") return;

      console.log("🚀 Initializing AI model...");

      if (!("gpu" in navigator)) {
        if (mountedRef.current) {
          setError("WebGPU not supported. Use Chrome 113+");
          setIsInitializing(false);
        }
        return;
      }

      try {
        if (mountedRef.current) {
          setInitProgress("Checking WebGPU...");
        }

        const adapter = await (navigator.gpu as any).requestAdapter();
        if (!adapter) {
          throw new Error("No WebGPU adapter");
        }

        console.log("✅ WebGPU available");

        if (mountedRef.current) {
          setInitProgress("Loading Phi-3.5 Mini...");
        }

        console.log("📥 Creating engine...");

        const engine = await webllm.CreateMLCEngine(
          "Phi-3.5-mini-instruct-q4f16_1-MLC",
          {
            initProgressCallback: (report) => {
              if (!mountedRef.current) return;
              console.log("📊", report);
              if (report.text) {
                setInitProgress(report.text);
              } else if (report.progress) {
                setInitProgress(`Loading: ${Math.round(report.progress * 100)}%`);
              }
            },
            logLevel: "INFO",
          }
        );

        if (!mountedRef.current) return;

        engineRef.current = engine;
        console.log("✅ ENGINE LOADED:", !!engineRef.current);

        setIsInitializing(false);
        setInitProgress("");

      } catch (err: any) {
        console.error("❌ Init failed:", err);
        if (mountedRef.current) {
          setError(err.message || "Failed to load model");
          setIsInitializing(false);
        }
      }
    }

    initEngine();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Stable function references using useMemo
  const api = useMemo(() => {
    return {
      sendMessage: async (content: string, enableSearch?: boolean) => {
        console.log("\n🔵 SEND MESSAGE");
        console.log("Engine:", !!engineRef.current);
        console.log("Processing:", processingRef.current);
        console.log("Content:", content);

        if (!content?.trim()) {
          console.log("❌ Empty");
          return;
        }

        if (!engineRef.current) {
          console.log("❌ No engine");
          setError("Model still loading");
          return;
        }

        if (processingRef.current) {
          console.log("❌ Busy");
          return;
        }

        const title = articleTitleRef.current;
        const articleText = articleContentRef.current;

        if (!title || !articleText) {
          console.log("❌ No article");
          return;
        }

        console.log("✅ Processing...");

        processingRef.current = true;
        setIsLoading(true);
        setError(null);

        const userMsg: Message = {
          id: `u${Date.now()}`,
          role: "user",
          content: content.trim(),
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);

        try {
          let webCtx = "";

          if (enableSearch ?? webSearchEnabled) {
            console.log("🔍 Web search...");
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
                  webCtx = data.webSearchResults;
                  console.log("✅ Web results");
                }
              }
            } catch (e) {
              console.warn("⚠️ Web search failed");
            }
          }

          const clean = articleText
            .replace(/<[^>]*>/g, " ")
            .replace(/\[[0-9]+\]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 6000);

          const prompt = `You are an AI assistant helping with this article.${webCtx ? ' You have web search results.' : ''}

Article: "${title}"

Content:
${clean}${webCtx}

Answer the user's question helpfully.`;

          console.log("🤖 Generating...");

          const resp = await engineRef.current!.chat.completions.create({
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: content.trim() }
            ],
            temperature: 0.5,
            max_tokens: 1000,
          });

          const answer = resp.choices[0]?.message?.content || "No response";

          console.log("✅ Got response:", answer.substring(0, 50));

          setMessages((prev) => [...prev, {
            id: `a${Date.now()}`,
            role: "assistant",
            content: answer,
            timestamp: Date.now(),
          }]);

        } catch (err: any) {
          console.error("❌ Error:", err);
          setError(err.message || "Error");
          setMessages((prev) => [...prev, {
            id: `e${Date.now()}`,
            role: "assistant",
            content: "Error occurred. Please try again.",
            timestamp: Date.now(),
          }]);
        } finally {
          processingRef.current = false;
          setIsLoading(false);
          console.log("✅ Done\n");
        }
      },

      generateSummary: async () => {
        console.log("\n🔵 SUMMARY");

        if (processingRef.current || !engineRef.current) {
          console.log("❌ Can't generate");
          return;
        }

        processingRef.current = true;
        setIsLoading(true);
        setError(null);

        setMessages((prev) => [...prev, {
          id: `u${Date.now()}`,
          role: "user",
          content: "Summarize this article",
          timestamp: Date.now(),
        }]);

        try {
          const clean = articleContentRef.current
            .replace(/<[^>]*>/g, " ")
            .replace(/\[[0-9]+\]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 4000);

          const resp = await engineRef.current.chat.completions.create({
            messages: [
              { role: "system", content: "Summarize in 3-5 bullet points." },
              { role: "user", content: `Article: "${articleTitleRef.current}"\n\n${clean}\n\nSummary:` }
            ],
            temperature: 0.3,
            max_tokens: 500,
          });

          const summary = resp.choices[0]?.message?.content || "No summary";

          setMessages((prev) => [...prev, {
            id: `a${Date.now()}`,
            role: "assistant",
            content: summary,
            timestamp: Date.now(),
          }]);

        } catch (err) {
          console.error("❌", err);
          setError("Summary failed");
          setMessages((prev) => [...prev, {
            id: `e${Date.now()}`,
            role: "assistant",
            content: "Couldn't generate summary.",
            timestamp: Date.now(),
          }]);
        } finally {
          processingRef.current = false;
          setIsLoading(false);
        }
      },

      generateQuiz: async () => {
        console.log("\n🔵 QUIZ");

        if (processingRef.current || !engineRef.current) {
          console.log("❌ Can't generate");
          return;
        }

        processingRef.current = true;
        setIsLoading(true);
        setError(null);

        setMessages((prev) => [...prev, {
          id: `u${Date.now()}`,
          role: "user",
          content: "Generate quiz questions",
          timestamp: Date.now(),
        }]);

        try {
          const clean = articleContentRef.current
            .replace(/<[^>]*>/g, " ")
            .replace(/\[[0-9]+\]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 4000);

          const resp = await engineRef.current.chat.completions.create({
            messages: [
              { role: "system", content: "Create 3 multiple-choice questions. Format: Q: [question]\\nA) [option]\\nB) [option]\\nC) [option]\\nD) [option]\\nCorrect: [letter]" },
              { role: "user", content: `Article: "${articleTitleRef.current}"\n\n${clean}\n\nGenerate quiz:` }
            ],
            temperature: 0.5,
            max_tokens: 800,
          });

          const quiz = resp.choices[0]?.message?.content || "No quiz";

          setMessages((prev) => [...prev, {
            id: `a${Date.now()}`,
            role: "assistant",
            content: quiz,
            timestamp: Date.now(),
          }]);

        } catch (err) {
          console.error("❌", err);
          setError("Quiz failed");
          setMessages((prev) => [...prev, {
            id: `e${Date.now()}`,
            role: "assistant",
            content: "Couldn't generate quiz.",
            timestamp: Date.now(),
          }]);
        } finally {
          processingRef.current = false;
          setIsLoading(false);
        }
      },

      clearChat: () => {
        setMessages([]);
        setError(null);
      },

      toggleWebSearch: () => {
        setWebSearchEnabled((prev) => !prev);
      },
    };
  }, [webSearchEnabled]); // Only webSearchEnabled as dependency

  return {
    messages,
    isLoading,
    isInitializing,
    initProgress,
    error,
    webSearchEnabled,
    sendMessage: api.sendMessage,
    generateSummary: api.generateSummary,
    generateQuiz: api.generateQuiz,
    clearChat: api.clearChat,
    toggleWebSearch: api.toggleWebSearch,
  };
}
