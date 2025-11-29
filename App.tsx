import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, MoreHorizontal } from 'lucide-react';
import { Message, ToolCall, AppStatus } from './types';
import { sendMessageToGemini, sendToolResultToGemini } from './services/gemini';
import { ChatMessage } from './components/ChatMessage';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Atlas, your Digital Employee. \n\nI can help you **manage tasks**, **schedule meetings**, or **analyze sales data**. \n\nHow can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || status === AppStatus.THINKING) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setStatus(AppStatus.THINKING);

    try {
      const response = await sendMessageToGemini(userMessage.text || '');
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        toolCalls: response.toolCalls?.map(tc => ({...tc, status: 'pending'})),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setStatus(AppStatus.IDLE);
    }
  };

  const handleExecuteTool = async (toolCall: ToolCall) => {
    // 1. Mark tool as executed locally
    setMessages(prev => prev.map(msg => {
        if (!msg.toolCalls) return msg;
        const updatedCalls = msg.toolCalls.map(tc => 
            tc.id === toolCall.id ? { ...tc, status: 'executed' as const } : tc
        );
        return { ...msg, toolCalls: updatedCalls };
    }));

    setStatus(AppStatus.EXECUTING);

    // 2. Simulate Execution Result (In a real app, this calls your backend)
    let executionResult = "Success";
    if (toolCall.name === 'query_sales_data') {
        executionResult = JSON.stringify({ 
            region: toolCall.args.region, 
            revenue: "$1,250,000", 
            growth: "+15%" 
        });
    } else if (toolCall.name === 'schedule_meeting') {
        executionResult = `Meeting scheduled for ${toolCall.args.time} with ${toolCall.args.participants?.join(', ')}`;
    } else if (toolCall.name === 'create_ticket') {
        executionResult = `Ticket #${Math.floor(Math.random() * 1000)} created with priority ${toolCall.args.priority}`;
    }

    // 3. Send result back to Gemini to continue conversation
    try {
        const response = await sendToolResultToGemini(toolCall.name, toolCall.id, executionResult);
        
        const followUpMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: response.text,
            toolCalls: response.toolCalls?.map(tc => ({...tc, status: 'pending'})),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, followUpMessage]);
    } catch (error) {
        console.error("Failed to send tool result", error);
    } finally {
        setStatus(AppStatus.IDLE);
    }
  };

  const handleRejectTool = (toolCall: ToolCall) => {
    setMessages(prev => prev.map(msg => {
        if (!msg.toolCalls) return msg;
        const updatedCalls = msg.toolCalls.map(tc => 
            tc.id === toolCall.id ? { ...tc, status: 'rejected' as const } : tc
        );
        return { ...msg, toolCalls: updatedCalls };
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      
      {/* Sidebar (Visual only for "App" feel) */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-gray-800">Atlas AI</span>
        </div>
        
        <div className="p-4">
          <button className="w-full flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <Plus className="w-4 h-4" />
            New Thread
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</div>
          {['Sales Analysis Q3', 'Ticket Management', 'Meeting Setup'].map((item, i) => (
             <div key={i} className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer truncate">
                {item}
             </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Jane Doe</span>
                    <span className="text-xs text-gray-400">Admin</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="font-semibold text-gray-700">Digital Employee Workspace</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onExecuteTool={handleExecuteTool}
                onRejectTool={handleRejectTool}
              />
            ))}
            
            {status === AppStatus.THINKING && (
               <div className="flex justify-start w-full mb-6">
                 <div className="flex max-w-[75%] gap-3">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                     <BotIcon className="w-5 h-5 text-white animate-pulse" />
                   </div>
                   <div className="px-5 py-3.5 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                 </div>
               </div>
            )}
             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Atlas to check sales, create tickets, or schedule meetings..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none max-h-32 min-h-[60px] shadow-sm transition-all"
              rows={1}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || status === AppStatus.THINKING}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200 ${
                inputValue.trim() 
                  ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-400">Atlas can make mistakes. Please verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Icon wrapper for the Loading State
const BotIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

export default App;
