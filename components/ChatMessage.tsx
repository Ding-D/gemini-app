import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import { Message, ToolCall } from '../types';
import { ToolWidget } from './ToolWidget';

interface ChatMessageProps {
  message: Message;
  onExecuteTool: (toolCall: ToolCall) => void;
  onRejectTool: (toolCall: ToolCall) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onExecuteTool, onRejectTool }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-800'}`}>
          {isModel ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
          {message.text && (
            <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
              isModel 
                ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                : 'bg-blue-600 text-white rounded-tr-none'
            }`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    // Style basic markdown elements
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    a: ({node, ...props}) => <a className="underline hover:text-blue-200" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    code: ({node, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !String(children).includes('\n') ? (
                          <code className={`${isModel ? 'bg-gray-100 text-red-500' : 'bg-blue-700 text-white'} px-1 py-0.5 rounded font-mono text-xs`} {...props}>
                            {children}
                          </code>
                        ) : (
                          <div className="my-2 rounded bg-gray-900 text-gray-100 p-3 text-xs font-mono overflow-x-auto">
                              {children}
                          </div>
                        )
                      }
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}

          {/* Render Tool Widgets if present */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="w-full mt-2">
              {message.toolCalls.map((toolCall) => (
                <ToolWidget 
                  key={toolCall.id}
                  toolCall={toolCall}
                  onExecute={onExecuteTool}
                  onReject={onRejectTool}
                />
              ))}
            </div>
          )}
          
          <span className="text-[10px] text-gray-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
