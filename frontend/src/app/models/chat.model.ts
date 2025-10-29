export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ServiceAnalysis {
  serviceType: string;
  urgency: string;
  suggestedActions: string[];
  estimatedCost: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  analysis?: ServiceAnalysis;
  recommendations?: string;
}
