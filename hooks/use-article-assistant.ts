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

  // Initialize Mistral 7B Instruct model
  useEffect(() => {
    const initializeModel = async () => {
      if (typeof window === "undefined") return;

      try {
        setIsInitializing(true);
        setInitProgress("Loading Mistral 7B Instruct model...");

        const engine = await webllm.CreateMLCEngine(
          "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
          {
            initProgressCallback: (progress) => {
              setInitProgress(progress.text);
            },
          }
        );

        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");
      } catch (err: any) {
        console.error("Error initializing model:", err);
        setError("Failed to load AI model. Please refresh the page.");
        setIsInitializing(false);
      }
    };

    initializeModel();

    return () => {
      // Cleanup
      if (engineRef.current) {
        engineRef.current = null;
      }
    };
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, enableSearch?: boolean) => {
    if (!content.trim() || isLoading || !engineRef.current) return;
    if (!articleContent || !articleTitle) return;

    const shouldUseWebSearch = enableSearch !== undefined ? enableSearch : webSearchEnabled;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
      webSearchEnabled: shouldUseWebSearch,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let webSearchContext = "";

      // Get web search results if enabled
      if (shouldUseWebSearch) {
        try {
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
            }
          }
        } catch (err) {
          console.error("Web search error:", err);
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

      // Generate response using Mistral 7B
      const response = await engineRef.current!.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.trim() }
        ],
        temperature: 0.4,
        max_tokens: 1000,
      });

      const answer = response.choices[0]?.message?.content || "I couldn't generate a response.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error generating response:", err);
      setError(err.message || "Failed to generate response. Please try again.");

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
  }, [isLoading, articleTitle, articleContent, webSearchEnabled]);

  // Generate summary using Mistral 7B
  const generateSummary = useCallback(async () => {
    if (isLoading || !engineRef.current || !articleContent || !articleTitle) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: summary,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error generating summary:", err);
      setError("Failed to generate summary.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't generate a summary. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, articleTitle, articleContent]);

  // Generate quiz using Mistral 7B
  const generateQuiz = useCallback(async () => {
    if (isLoading || !engineRef.current || !articleContent || !articleTitle) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: quiz,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError("Failed to generate quiz.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't generate quiz questions. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, articleTitle, articleContent]);

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
