"use client";

import { useState, useEffect, useRef } from "react";
import * as webllm from "@mlc-ai/web-llm";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
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
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initProgress, setInitProgress] = useState("");

  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const processingRef = useRef(false);

  // Initialize model
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (typeof window === "undefined") return;

      console.log("🚀 Init model");

      if (!("gpu" in navigator)) {
        if (mounted) {
          setError("WebGPU not supported");
          setIsInitializing(false);
        }
        return;
      }

      try {
        if (mounted) setInitProgress("Checking WebGPU...");

        const adapter = await (navigator.gpu as any).requestAdapter();
        if (!adapter) throw new Error("No adapter");

        console.log("✅ WebGPU OK");

        if (mounted) setInitProgress("Loading model...");

        const engine = await webllm.CreateMLCEngine(
          "Phi-3.5-mini-instruct-q4f16_1-MLC",
          {
            initProgressCallback: (r) => {
              if (!mounted) return;
              if (r.text) setInitProgress(r.text);
              else if (r.progress) setInitProgress(`${Math.round(r.progress * 100)}%`);
            },
          }
        );

        if (!mounted) return;

        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");
        console.log("✅ Model loaded!");

      } catch (err: any) {
        console.error("❌", err);
        if (mounted) {
          setError(err.message || "Failed to load");
          setIsInitializing(false);
        }
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  // Handler refs that are always up to date
  const handlersRef = useRef({
    sendMessage: async (content: string, enableSearch?: boolean) => {
      console.log("🔵 SEND:", content);

      if (!content?.trim()) return;
      if (!engineRef.current) {
        setError("Model loading...");
        return;
      }
      if (processingRef.current) return;
      if (!articleContent || !articleTitle) return;

      processingRef.current = true;
      setIsLoading(true);
      setError(null);

      setMessages(prev => [...prev, {
        id: `u${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      }]);

      try {
        let webCtx = "";

        if (enableSearch ?? webSearchEnabled) {
          try {
            const res = await fetch("/api/assistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: content, enableWebSearch: true }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.webSearchResults) webCtx = data.webSearchResults;
            }
          } catch (e) {
            console.warn("Web search failed");
          }
        }

        const clean = articleContent
          .replace(/<[^>]*>/g, " ")
          .replace(/\[[0-9]+\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 6000);

        const prompt = `Article: "${articleTitle}"\n\nContent:\n${clean}${webCtx}\n\nAnswer helpfully.`;

        console.log("🤖 Calling AI...");

        const resp = await engineRef.current!.chat.completions.create({
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: content.trim() }
          ],
          temperature: 0.5,
          max_tokens: 1000,
        });

        const answer = resp.choices[0]?.message?.content || "No response";

        console.log("✅ Response:", answer.substring(0, 50));

        setMessages(prev => [...prev, {
          id: `a${Date.now()}`,
          role: "assistant",
          content: answer,
          timestamp: Date.now(),
        }]);

      } catch (err: any) {
        console.error("❌", err);
        setError(err.message);
        setMessages(prev => [...prev, {
          id: `e${Date.now()}`,
          role: "assistant",
          content: "Error. Try again.",
          timestamp: Date.now(),
        }]);
      } finally {
        processingRef.current = false;
        setIsLoading(false);
      }
    },

    generateSummary: async () => {
      if (processingRef.current || !engineRef.current) return;

      processingRef.current = true;
      setIsLoading(true);

      setMessages(prev => [...prev, {
        id: `u${Date.now()}`,
        role: "user",
        content: "Summarize this article",
        timestamp: Date.now(),
      }]);

      try {
        const clean = articleContent
          .replace(/<[^>]*>/g, " ")
          .replace(/\[[0-9]+\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 4000);

        const resp = await engineRef.current.chat.completions.create({
          messages: [
            { role: "system", content: "Summarize in bullet points." },
            { role: "user", content: `"${articleTitle}"\n\n${clean}` }
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        const summary = resp.choices[0]?.message?.content || "No summary";

        setMessages(prev => [...prev, {
          id: `a${Date.now()}`,
          role: "assistant",
          content: summary,
          timestamp: Date.now(),
        }]);

      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, {
          id: `e${Date.now()}`,
          role: "assistant",
          content: "Summary failed.",
          timestamp: Date.now(),
        }]);
      } finally {
        processingRef.current = false;
        setIsLoading(false);
      }
    },

    generateQuiz: async () => {
      if (processingRef.current || !engineRef.current) return;

      processingRef.current = true;
      setIsLoading(true);

      setMessages(prev => [...prev, {
        id: `u${Date.now()}`,
        role: "user",
        content: "Generate quiz questions",
        timestamp: Date.now(),
      }]);

      try {
        const clean = articleContent
          .replace(/<[^>]*>/g, " ")
          .replace(/\[[0-9]+\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 4000);

        const resp = await engineRef.current.chat.completions.create({
          messages: [
            { role: "system", content: "Create 3 quiz questions." },
            { role: "user", content: `"${articleTitle}"\n\n${clean}` }
          ],
          temperature: 0.5,
          max_tokens: 800,
        });

        const quiz = resp.choices[0]?.message?.content || "No quiz";

        setMessages(prev => [...prev, {
          id: `a${Date.now()}`,
          role: "assistant",
          content: quiz,
          timestamp: Date.now(),
        }]);

      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, {
          id: `e${Date.now()}`,
          role: "assistant",
          content: "Quiz failed.",
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
      setWebSearchEnabled(prev => !prev);
    },
  });

  // Update handler refs whenever dependencies change
  useEffect(() => {
    handlersRef.current.sendMessage = async (content: string, enableSearch?: boolean) => {
      console.log("🔵 SEND:", content);

      if (!content?.trim()) return;
      if (!engineRef.current) {
        setError("Model loading...");
        return;
      }
      if (processingRef.current) return;
      if (!articleContent || !articleTitle) return;

      processingRef.current = true;
      setIsLoading(true);
      setError(null);

      setMessages(prev => [...prev, {
        id: `u${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      }]);

      try {
        let webCtx = "";

        if (enableSearch ?? webSearchEnabled) {
          try {
            const res = await fetch("/api/assistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: content, enableWebSearch: true }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.webSearchResults) webCtx = data.webSearchResults;
            }
          } catch (e) {
            console.warn("Web search failed");
          }
        }

        const clean = articleContent
          .replace(/<[^>]*>/g, " ")
          .replace(/\[[0-9]+\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 6000);

        const prompt = `Article: "${articleTitle}"\n\nContent:\n${clean}${webCtx}\n\nAnswer helpfully.`;

        console.log("🤖 Calling AI...");

        const resp = await engineRef.current!.chat.completions.create({
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: content.trim() }
          ],
          temperature: 0.5,
          max_tokens: 1000,
        });

        const answer = resp.choices[0]?.message?.content || "No response";

        console.log("✅ Response:", answer.substring(0, 50));

        setMessages(prev => [...prev, {
          id: `a${Date.now()}`,
          role: "assistant",
          content: answer,
          timestamp: Date.now(),
        }]);

      } catch (err: any) {
        console.error("❌", err);
        setError(err.message);
        setMessages(prev => [...prev, {
          id: `e${Date.now()}`,
          role: "assistant",
          content: "Error. Try again.",
          timestamp: Date.now(),
        }]);
      } finally {
        processingRef.current = false;
        setIsLoading(false);
      }
    };
  }, [articleTitle, articleContent, webSearchEnabled]);

  // Return stable function references
  return {
    messages,
    isLoading,
    isInitializing,
    initProgress,
    error,
    webSearchEnabled,
    sendMessage: (content: string, enableSearch?: boolean) => handlersRef.current.sendMessage(content, enableSearch),
    generateSummary: () => handlersRef.current.generateSummary(),
    generateQuiz: () => handlersRef.current.generateQuiz(),
    clearChat: () => handlersRef.current.clearChat(),
    toggleWebSearch: () => handlersRef.current.toggleWebSearch(),
  };
}
