declare module 'gpt4js' {
  export interface ChatOptions {
    provider?: string;
    model?: string;
  }

  export interface Provider {
    chatCompletion(
      messages: Array<{ role: string; content: string }>,
      options: ChatOptions
    ): Promise<string>;
  }

  export default class GPT4js {
    static createProvider(name: string): Provider;
  }
}
