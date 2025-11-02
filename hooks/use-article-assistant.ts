"use client";

import { useState, useEffect, useRef } from "react";
import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { pipeline, cos_sim } from "@xenova/transformers";

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

interface ArticleChunk {
  text: string;
  embedding?: number[];
}

export function useArticleAssistant({ articleTitle, articleContent }: UseArticleAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initProgress, setInitProgress] = useState("");

  const engineRef = useRef<any>(null);
  const embedderRef = useRef<any>(null);
  const chunksRef = useRef<ArticleChunk[]>([]);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize models
  useEffect(() => {
    if (initPromiseRef.current) return;

    let mounted = true;

    const initModels = async () => {
      try {
        console.log("🚀 Initializing AI models...");

        // Step 1: Initialize embeddings model for semantic search
        setInitProgress("Loading semantic search model...");
        console.log("📦 Loading MiniLM embeddings model (small & fast)");

        const embedder = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2"
        );

        if (!mounted) return;
        embedderRef.current = embedder;
        console.log("✅ Embeddings model loaded");

        // Step 2: Process article into chunks with embeddings
        setInitProgress("Processing article content...");
        console.log("📄 Chunking and embedding article");

        const cleanContent = articleContent
          .replace(/<[^>]*>/g, " ")
          .replace(/\[[0-9]+\]/g, "")
          .replace(/\s+/g, " ")
          .trim();

        // Split into chunks of ~500 characters
        const chunks: ArticleChunk[] = [];
        const chunkSize = 500;
        for (let i = 0; i < cleanContent.length; i += chunkSize) {
          const chunk = cleanContent.substring(i, i + chunkSize);
          if (chunk.trim().length > 50) { // Skip very small chunks
            chunks.push({ text: chunk.trim() });
          }
        }

        console.log(`📊 Created ${chunks.length} chunks`);

        // Generate embeddings for all chunks
        setInitProgress(`Embedding ${chunks.length} text chunks...`);
        for (let i = 0; i < chunks.length; i++) {
          if (!mounted) return;

          const output = await embedder(chunks[i].text, {
            pooling: "mean",
            normalize: true,
          });
          chunks[i].embedding = Array.from(output.data) as number[];

          if (i % 10 === 0) {
            setInitProgress(`Embedded ${i + 1}/${chunks.length} chunks...`);
          }
        }

        chunksRef.current = chunks;
        console.log("✅ All chunks embedded");

        // Step 3: Initialize Llama 3.2 1B
        if (!mounted) return;
        setInitProgress("Loading Llama 3.2 1B...");
        console.log("🦙 Loading Llama 3.2 1B");

        const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
          initProgressCallback: (progress) => {
            if (!mounted) return;
            console.log("📥 Progress:", progress);

            if (progress.text) {
              setInitProgress(progress.text);
            } else if (progress.progress !== undefined) {
              const percent = Math.round(progress.progress * 100);
              setInitProgress(`Downloading Llama 3.2: ${percent}%`);
            }
          },
        });

        if (!mounted) return;
        engineRef.current = engine;
        setIsInitializing(false);
        setInitProgress("");
        console.log("✅ All models ready!");

      } catch (err: any) {
        console.error("❌ Initialization error:", err);
        if (!mounted) return;

        setError(err.message || "Failed to load models");
        setIsInitializing(false);
      }
    };

    initPromiseRef.current = initModels();

    return () => {
      mounted = false;
    };
  }, [articleContent]);

  // Semantic search function
  async function findRelevantChunks(query: string, topK: number = 5): Promise<string[]> {
    if (!embedderRef.current || chunksRef.current.length === 0) {
      return [];
    }

    try {
      // Generate embedding for the query
      const queryOutput = await embedderRef.current(query, {
        pooling: "mean",
        normalize: true,
      });
      const queryEmbedding = Array.from(queryOutput.data) as number[];

      // Calculate similarity scores (filter out chunks without embeddings)
      const scores = chunksRef.current
        .map((chunk, idx) => ({
          idx,
          score: chunk.embedding ? cos_sim(queryEmbedding, chunk.embedding as number[]) : 0,
        }))
        .filter(s => s.score > 0);

      // Sort by score and get top K
      scores.sort((a, b) => b.score - a.score);
      const topChunks = scores.slice(0, topK).map((s) => chunksRef.current[s.idx].text);

      console.log(`🔍 Found ${topChunks.length} relevant chunks for query`);
      return topChunks;
    } catch (err) {
      console.error("Semantic search error:", err);
      return [];
    }
  }

  // Send message with semantic search
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
      // Use semantic search to find relevant context
      const relevantChunks = await findRelevantChunks(content.trim(), 5);
      const context = relevantChunks.join("\n\n");

      console.log(`📄 Using ${context.length} characters from semantic search`);

      // Generate response with Llama 3.2 1B
      const completion = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are analyzing the Wikipedia article: "${articleTitle}"

STRICT RULES:
1. Answer ONLY using the context below
2. If the answer is not in the context, say "Not found in article"
3. Be accurate and concise
4. Quote specific parts when relevant

RELEVANT CONTEXT:
${context}`,
          },
          {
            role: "user",
            content: content.trim(),
          },
        ],
        temperature: 0.3,
        max_tokens: 400,
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
      setError(err.message);

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
    // Use first chunks for summary
    const topChunks = chunksRef.current.slice(0, 10).map(c => c.text).join("\n\n");
    await sendMessage(`Based on this content, provide a 5-7 bullet point summary: ${topChunks.substring(0, 2000)}`);
  }

  async function generateQuiz() {
    await sendMessage("Create 3 quiz questions with answers based on the article.");
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
