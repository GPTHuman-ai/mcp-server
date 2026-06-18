export interface HumanizerRequest {
  text: string; // Must be at least 300 chars, not exceed 2,000 words
  tone: string; // Standard, HighSchool, College, PhD | Default is College if not provided
  mode: string; // Professional, Balanced, Enhanced | Default is Balanced if not provided
}

export interface HumanizerResponse {
  id: string;
  language: string;
  similarity: number;
  readability: number;
  humanScore: number | null; // Null if the language is not recognized by the detection systems
  status: string;
  output: string; // The humanized text
  outputWordCount: number;
  outputCharCount: number;
  creditUsage: number;
  creditBalance: number;
  tone: string;
  mode: string;
  wordCount: number;
  charCount: number;
  timestamp: string;
}
