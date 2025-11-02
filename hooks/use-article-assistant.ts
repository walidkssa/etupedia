"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { pipeline, env } from "@xenova/transformers";

// Disable local model loading for faster performance
env.allowLocalModels = false;

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

  const generatorRef = useRef<any>(null);
  const embeddingsRef = useRef<any>(null);
  const articleChunksRef = useRef<string[]>([]);
  const articleEmbeddingsRef = useRef<number[][]>([]);

  // Initialize models
  const initializeModels = useCallback(async () => {
    if (generatorRef.current && embeddingsRef.current) return;

    setIsInitializing(true);
    setError(null);

    try {
      console.log("Loading AI models...");

      // Load embedding model for RAG (smaller, faster)
      if (!embeddingsRef.current) {
        console.log("Loading embedding model...");
        embeddingsRef.current = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2"
        );
        console.log("Embedding model loaded!");
      }

      // Load text generation model (using a small, fast model)
      if (!generatorRef.current) {
        console.log("Loading language model...");
        generatorRef.current = await pipeline(
          "text-generation",
          "Xenova/gpt2"
        );
        console.log("Language model loaded!");
      }

      // Process article into chunks for RAG
      if (articleChunksRef.current.length === 0) {
        console.log("Processing article...");
        const chunks = chunkArticle(articleContent);
        articleChunksRef.current = chunks;

        // Generate embeddings for each chunk
        console.log("Generating embeddings...");
        const embeddings = await Promise.all(
          chunks.map(async (chunk) => {
            const output = await embeddingsRef.current(chunk, {
              pooling: "mean",
              normalize: true,
            });
            return Array.from(output.data) as number[];
          })
        );
        articleEmbeddingsRef.current = embeddings as number[][];
        console.log("Article processed!");
      }

      setIsInitializing(false);
    } catch (err) {
      console.error("Error initializing models:", err);
      setError("Failed to load AI models. Please refresh and try again.");
      setIsInitializing(false);
    }
  }, [articleContent]);

  // Chunk article into smaller pieces for RAG
  const chunkArticle = (content: string): string[] => {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    // Split into sentences
    const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [textContent];

    // Group sentences into chunks of ~3 sentences
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences.slice(i, i + 3).join(" ").trim();
      if (chunk.length > 50) { // Only keep meaningful chunks
        chunks.push(chunk);
      }
    }

    return chunks;
  };

  // Calculate cosine similarity
  const cosineSimilarity = (a: number[], b: number[]): number => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  // Retrieve relevant chunks for a query
  const retrieveRelevantChunks = async (query: string, topK: number = 3): Promise<string[]> => {
    if (!embeddingsRef.current || articleChunksRef.current.length === 0) {
      return [];
    }

    // Generate embedding for query
    const queryOutput = await embeddingsRef.current(query, {
      pooling: "mean",
      normalize: true,
    });
    const queryEmbedding = Array.from(queryOutput.data) as number[];

    // Calculate similarities
    const similarities = articleEmbeddingsRef.current.map((chunkEmbedding, idx) => ({
      chunk: articleChunksRef.current[idx],
      similarity: cosineSimilarity(queryEmbedding, chunkEmbedding),
    }));

    // Sort by similarity and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK).map((s) => s.chunk);
  };

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Initialize models if needed
    if (!generatorRef.current || !embeddingsRef.current) {
      await initializeModels();
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
      // Retrieve relevant chunks using RAG
      const relevantChunks = await retrieveRelevantChunks(content, 3);
      const context = relevantChunks.join(" ");

      // Create prompt with context
      const prompt = `Article: "${articleTitle}"

Context from article:
${context}

User question: ${content}
Answer based on the context:`;

      // Generate response
      const output = await generatorRef.current(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
        top_k: 50,
      });

      const generatedText = output[0].generated_text;
      const answer = generatedText.split("Answer based on the context:")[1]?.trim() || 
                    "I'm processing the article. Could you rephrase your question?";

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
  }, [isLoading, initializeModels, articleTitle]);

  // Generate summary
  const generateSummary = useCallback(async () => {
    await sendMessage("Please provide a concise summary of this article in 3-4 sentences.");
  }, [sendMessage]);

  // Generate quiz
  const generateQuiz = useCallback(async () => {
    await sendMessage("Create 3 multiple choice questions to test my understanding of this article. Format: Question | Option A | Option B | Option C | Option D | Correct Answer");
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
    sendMessage,
    generateSummary,
    generateQuiz,
    clearChat,
    initializeModels,
  };
}
