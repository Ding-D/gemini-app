export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  toolCalls?: ToolCall[];
  toolResponse?: ToolResponse;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  status: 'pending' | 'executed' | 'rejected';
  result?: string;
}

export interface ToolResponse {
  name: string;
  response: { result: any };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export enum AppStatus {
  IDLE = 'idle',
  LISTENING = 'listening',
  THINKING = 'thinking',
  EXECUTING = 'executing'
}
