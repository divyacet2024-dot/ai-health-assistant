/**
 * Enhanced Gemini API with Retry Logic
 * - Exponential backoff retries
 * - Improved error handling
 * - Rate limiting support
 * - Context preservation
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ChatMessage } from './types';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

export interface GeminiRetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

export interface GeminiResponse {
  text: string;
  finishReason?: string;
  error?: string;
}

const DEFAULT_RETRY_CONFIG: GeminiRetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  multiplier: number
): number {
  const delay = initialDelayMs * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelayMs);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  const message = error?.message || '';
  const status = error?.status;

  // Network errors
  if (
    message.includes('Network') ||
    message.includes('fetch') ||
    message.includes('timeout')
  ) {
    return true;
  }

  // Rate limiting (429)
  if (status === 429) {
    return true;
  }

  // Server errors (5xx)
  if (status && status >= 500) {
    return true;
  }

  // Specific Gemini errors that are retryable
  if (message.includes('RESOURCE_EXHAUSTED')) {
    return true;
  }

  if (message.includes('SERVICE_UNAVAILABLE')) {
    return true;
  }

  if (message.includes('DEADLINE_EXCEEDED')) {
    return true;
  }

  return false;
}

/**
 * Get error message from Gemini error
 */
function getErrorMessage(error: any): string {
  if (error?.message) {
    return error.message;
  }

  if (error?.error?.message) {
    return error.error.message;
  }

  return 'Unknown error occurred with Gemini API';
}

/**
 * Enhanced Gemini API Client
 */
export class EnhancedGeminiClient {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: GeminiConfig;
  private retryConfig: GeminiRetryConfig;
  private conversationHistory: Array<{ role: string; parts: string[] }> = [];

  constructor(config: GeminiConfig, retryConfig?: GeminiRetryConfig) {
    this.config = {
      model: 'gemini-pro',
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
      ...config,
    };

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    };

    this.client = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.client.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        topP: this.config.topP,
        topK: this.config.topK,
        maxOutputTokens: this.config.maxOutputTokens,
      },
    });
  }

  /**
   * Send a message with retry logic
   */
  async sendMessage(
    message: string,
    context?: string
  ): Promise<GeminiResponse> {
    let lastError: any;

    for (let attempt = 0; attempt <= (this.retryConfig.maxRetries || 3); attempt++) {
      try {
        // Add context if provided
        const fullMessage = context ? `${context}\n\nUser: ${message}` : message;

        // Send message
        const response = await this.model.generateContent(fullMessage);
        const result = response.response;

        // Extract text
        const text = result.text();

        if (!text) {
          throw new Error('Empty response from Gemini API');
        }

        // Add to conversation history
        this.conversationHistory.push({
          role: 'user',
          parts: [message],
        });

        this.conversationHistory.push({
          role: 'assistant',
          parts: [text],
        });

        return {
          text,
          finishReason: result.candidates?.[0]?.finishReason,
        };
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        if (!isRetryableError(error) || attempt === (this.retryConfig.maxRetries || 3)) {
          console.error(`Gemini API error (attempt ${attempt + 1}):`, error);

          return {
            text: '',
            error: getErrorMessage(error),
          };
        }

        // Calculate delay with exponential backoff
        const delay = calculateBackoffDelay(
          attempt,
          this.retryConfig.initialDelayMs || 1000,
          this.retryConfig.maxDelayMs || 10000,
          this.retryConfig.backoffMultiplier || 2
        );

        console.warn(
          `Gemini API error (attempt ${attempt + 1}), retrying in ${delay}ms:`,
          getErrorMessage(error)
        );

        await sleep(delay);
      }
    }

    return {
      text: '',
      error: getErrorMessage(lastError) || 'Failed to get response from Gemini API',
    };
  }

  /**
   * Send a chat message with conversation history
   */
  async chat(message: string): Promise<GeminiResponse> {
    let lastError: any;

    for (let attempt = 0; attempt <= (this.retryConfig.maxRetries || 3); attempt++) {
      try {
        // Start a new chat session
        const chat = this.model.startChat({
          history: this.conversationHistory.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: msg.parts.map((part) => ({ text: part })),
          })),
        });

        // Send message
        const response = await chat.sendMessage(message);
        const result = response.response;

        // Extract text
        const text = result.text();

        if (!text) {
          throw new Error('Empty response from Gemini API');
        }

        // Add to conversation history
        this.conversationHistory.push({
          role: 'user',
          parts: [message],
        });

        this.conversationHistory.push({
          role: 'assistant',
          parts: [text],
        });

        return {
          text,
          finishReason: result.candidates?.[0]?.finishReason,
        };
      } catch (error: any) {
        lastError = error;

        if (!isRetryableError(error) || attempt === (this.retryConfig.maxRetries || 3)) {
          console.error(`Gemini API error (attempt ${attempt + 1}):`, error);

          return {
            text: '',
            error: getErrorMessage(error),
          };
        }

        const delay = calculateBackoffDelay(
          attempt,
          this.retryConfig.initialDelayMs || 1000,
          this.retryConfig.maxDelayMs || 10000,
          this.retryConfig.backoffMultiplier || 2
        );

        console.warn(
          `Gemini API error (attempt ${attempt + 1}), retrying in ${delay}ms:`,
          getErrorMessage(error)
        );

        await sleep(delay);
      }
    }

    return {
      text: '',
      error: getErrorMessage(lastError) || 'Failed to get response from Gemini API',
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): Array<{ role: string; parts: string[] }> {
    return [...this.conversationHistory];
  }

  /**
   * Set conversation history
   */
  setHistory(history: Array<{ role: string; parts: string[] }>): void {
    this.conversationHistory = history;
  }
}

/**
 * Create a singleton Gemini client
 */
let geminiClient: EnhancedGeminiClient | null = null;

export function getGeminiClient(
  config?: GeminiConfig,
  retryConfig?: GeminiRetryConfig
): EnhancedGeminiClient {
  if (!geminiClient) {
    const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    geminiClient = new EnhancedGeminiClient(
      {
        apiKey,
        ...config,
      },
      retryConfig
    );
  }

  return geminiClient;
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
}
