"use client";

import { useState, useEffect, useRef } from "react";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

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

  const engineRef = useRef<any>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Register service worker for caching
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ Service Worker registered'))
        .catch(err => console.warn('⚠️ SW registration failed:', err));
    }
  }, []);

  // Initialize Phi-3.5 Mini
  useEffect(() => {
    if (initPromiseRef.current) return; // Prevent double initialization

    let mounted = true;

    const initEngine = async () => {
      try {
        console.log("🚀 Initializing Phi-3.5 Mini...");
        setInitProgress("Checking WebGPU support...");

        // Check WebGPU support first
        if (!navigator.gpu) {
          throw new Error("WebGPU is not supported in your browser. Please use Chrome 113+ or Edge 113+");
        }

        const modelName = "Phi-3.5-mini-instruct-q4f16_1-MLC";

        console.log(`📦 Loading ${modelName}`);
        setInitProgress("Initializing model (this may take 1-2 minutes on first load)...");

        let lastProgressUpdate = Date.now();
        const progressTimeout = 120000; // 2 minutes timeout

        const engine = await Promise.race([
          CreateMLCEngine(modelName, {
            initProgressCallback: (progress) => {
              if (!mounted) return;

              lastProgressUpdate = Date.now();
              console.log("📥 Progress:", progress);

              if (progress.text) {
                setInitProgress(progress.text);
              } else if (progress.progress !== undefined) {
                const percent = Math.round(progress.progress * 100);
                setInitProgress(`Downloading model files: ${percent}%`);
              }
            },
          }),
          new Promise((_, reject) => {
            const checkInterval = setInterval(() => {
              if (Date.now() - lastProgressUpdate > progressTimeout) {
                clearInterval(checkInterval);
                reject(new Error("Model loading timeout. The download is taking too long. Please check your internet connection."));
              }
            }, 5000);
          })
        ]);

        if (!mounted) return;

        console.log("✅ Model loaded successfully!");
        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");

      } catch (err: any) {
        console.error("❌ Initialization error:", err);

        if (!mounted) return;

        let errorMsg = "Failed to load model";

        if (err.message) {
          if (err.message.includes("timeout") || err.message.includes("taking too long")) {
            errorMsg = "Download timeout. Model files are too large. Please try again with a faster connection, or refresh and wait longer.";
          } else if (err.message.includes("Failed to fetch") || err.message.includes("network")) {
            errorMsg = "Network error. Please check your connection and try refreshing.";
          } else if (err.message.includes("WebGPU")) {
            errorMsg = "WebGPU not supported. Please use Chrome 113+ or Edge 113+.";
          } else {
            errorMsg = `Error: ${err.message}`;
          }
        }

        setError(errorMsg);
        setIsInitializing(false);
      }
    };

    initPromiseRef.current = initEngine();

    return () => {
      mounted = false;
    };
  }, []);

  async function sendMessage(content: string) {
    if (!content?.trim() || isLoading || !engineRef.current) return;

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
      // Clean article content
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Use up to 80K chars (Phi-3.5 has 128K context)
      const contextContent = cleanContent.length > 80000
        ? cleanContent.substring(0, 80000) + "\n\n[Article continues...]"
        : cleanContent;

      console.log(`📄 Context: ${contextContent.length} chars`);

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are analyzing: "${articleTitle}"

RULES:
1. Answer ONLY from the article below
2. If not in article, say: "Not in article"
3. NO external knowledge
4. Quote specific parts
5. Be concise

ARTICLE:
${contextContent}`,
          },
          {
            role: "user",
            content: content.trim(),
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      });

      const answer = completion.choices[0]?.message?.content || "No response";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: answer,
          timestamp: Date.now(),
        },
      ]);

    } catch (err: any) {
      console.error("❌ Chat error:", err);
      setError(err.message || "Failed to generate response");

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateSummary() {
    await sendMessage("Summarize this article in 5-7 bullet points using ONLY article content.");
  }

  async function generateQuiz() {
    await sendMessage("Create 3 quiz questions with answers based ONLY on this article.");
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
