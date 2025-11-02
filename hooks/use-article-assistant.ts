"use client";

import { useState, useCallback, useRef } from "react";

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
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState("");

  const engineRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Initialize WebLLM engine (runs in browser, 100% free, no limits!)
  const initializeModels = useCallback(async () => {
    if (isInitializedRef.current || isInitializing) return;
    if (!articleContent || !articleTitle) return;
    if (typeof window === 'undefined') return;

    isInitializedRef.current = true;
    setIsInitializing(true);
    setError(null);

    try {
      // Dynamically import WebLLM (client-side only)
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

      setInitProgress("Initializing AI model (this happens once)...");

      // Use smallest, fastest model: Llama-3.2-1B (only 1GB, very fast!)
      engineRef.current = await CreateMLCEngine(
        "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        {
          initProgressCallback: (progress) => {
            setInitProgress(progress.text || "Loading...");
          },
        }
      );

      setInitProgress("");
      setIsInitializing(false);
      console.log("WebLLM engine initialized successfully!");
    } catch (err) {
      console.error("Error initializing WebLLM:", err);
      setError("Failed to load AI model. Your browser may not support WebGPU.");
      setIsInitializing(false);
      isInitializedRef.current = false;
      setInitProgress("");
    }
  }, [articleContent, articleTitle, isInitializing]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Initialize if needed
    if (!engineRef.current) {
      await initializeModels();
    }

    if (!engineRef.current) {
      setError("AI model not loaded");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare context from article
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[0-9]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 2000); // Limit context for speed

      const prompt = `You are a helpful assistant answering questions about an article.

Article Title: "${articleTitle}"

Article Content:
${cleanContent}

User Question: ${content}

Answer based only on the article content above. Be concise and factual.`;

      const reply = await engineRef.current.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      const answer = reply.choices[0]?.message?.content || "I couldn't generate a response.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error generating response:", err);
      setError("Failed to generate response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try asking your question again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, initializeModels, articleTitle, articleContent]);

  // Generate summary
  const generateSummary = useCallback(async () => {
    await sendMessage("Please provide a concise summary of this article in 3-4 sentences.");
  }, [sendMessage]);

  // Generate quiz
  const generateQuiz = useCallback(async () => {
    await sendMessage("Create 3 multiple choice questions to test my understanding of this article.");
  }, [sendMessage]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isInitializing,
    error,
    initProgress,
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
    initializeModels,
  };
}
