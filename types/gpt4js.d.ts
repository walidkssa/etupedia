declare module 'gpt4js' {
  export interface ChatOptions {
    provider?: string;
    model?: string;
  }

  export default class GPT4js {
    constructor();
    chat(messages: Array<{ role: string; content: string }>, options?: ChatOptions): Promise<string>;
  }
}
