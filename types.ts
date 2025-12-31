export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  streamingContent: string;
}

export interface ModelConfig {
  modelName: string;
  temperature: number;
}