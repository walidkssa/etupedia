/**
 * AI Engine Singleton
 * Manages the WebLLM engine instance globally
 */

import * as webllm from "@mlc-ai/web-llm";

class AIEngine {
  private static instance: AIEngine;
  private engine: webllm.MLCEngine | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private listeners: Set<(status: EngineStatus) => void> = new Set();

  private constructor() {}

  static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
    }
    return AIEngine.instance;
  }

  subscribe(listener: (status: EngineStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(status: EngineStatus) {
    this.listeners.forEach(listener => listener(status));
  }

  async initialize(): Promise<void> {
    // If already initialized, return
    if (this.engine) {
      console.log("✅ Engine already initialized");
      return;
    }

    // If currently initializing, wait for it
    if (this.initPromise) {
      console.log("⏳ Waiting for initialization to complete");
      return this.initPromise;
    }

    // Start initialization
    this.isInitializing = true;
    this.initPromise = this._initialize();

    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async _initialize(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("Cannot initialize in SSR");
    }

    console.log("🚀 Initializing AI Engine");

    // Check WebGPU
    if (!("gpu" in navigator)) {
      const error = "WebGPU not supported. Use Chrome/Edge 113+";
      this.notify({ status: "error", message: error });
      throw new Error(error);
    }

    try {
      this.notify({ status: "initializing", message: "Checking WebGPU..." });

      const adapter = await (navigator.gpu as any).requestAdapter();
      if (!adapter) {
        throw new Error("No WebGPU adapter found");
      }

      console.log("✅ WebGPU available");

      this.notify({ status: "initializing", message: "Loading Phi-3.5 Mini..." });

      const engine = await webllm.CreateMLCEngine(
        "Phi-3.5-mini-instruct-q4f16_1-MLC",
        {
          initProgressCallback: (report) => {
            if (report.text) {
              this.notify({ status: "initializing", message: report.text });
            } else if (report.progress !== undefined) {
              const percent = Math.round(report.progress * 100);
              this.notify({ status: "initializing", message: `Loading: ${percent}%` });
            }
          },
        }
      );

      this.engine = engine;
      console.log("✅ AI Engine initialized successfully");
      this.notify({ status: "ready", message: "Ready" });

    } catch (err: any) {
      console.error("❌ Engine initialization failed:", err);
      this.notify({ status: "error", message: err.message || "Failed to initialize" });
      throw err;
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, options?: {
    temperature?: number;
    max_tokens?: number;
  }): Promise<string> {
    if (!this.engine) {
      throw new Error("Engine not initialized");
    }

    console.log("🤖 Generating response...");

    const response = await this.engine.chat.completions.create({
      messages: messages as any,
      temperature: options?.temperature ?? 0.5,
      max_tokens: options?.max_tokens ?? 1000,
    });

    const answer = response.choices[0]?.message?.content || "";
    console.log("✅ Response generated:", answer.substring(0, 100));

    return answer;
  }

  isReady(): boolean {
    return this.engine !== null;
  }
}

export interface EngineStatus {
  status: "initializing" | "ready" | "error";
  message: string;
}

export const aiEngine = AIEngine.getInstance();
