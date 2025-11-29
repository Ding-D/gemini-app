import React, { useState } from 'react';
import { Check, X, Calendar, Ticket, Database, Play, Loader2 } from 'lucide-react';
import { ToolCall } from '../types';

interface ToolWidgetProps {
  toolCall: ToolCall;
  onExecute: (toolCall: ToolCall) => void;
  onReject: (toolCall: ToolCall) => void;
}

export const ToolWidget: React.FC<ToolWidgetProps> = ({ toolCall, onExecute, onReject }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExecute = () => {
    setIsProcessing(true);
    // Simulate API latency for effect
    setTimeout(() => {
        onExecute(toolCall);
    }, 1000);
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'schedule_meeting': return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'create_ticket': return <Ticket className="w-5 h-5 text-blue-600" />;
      case 'query_sales_data': return <Database className="w-5 h-5 text-emerald-600" />;
      default: return <Play className="w-5 h-5 text-gray-600" />;
    }
  };

  const getToolTitle = (name: string) => {
     switch (name) {
      case 'schedule_meeting': return 'Schedule Meeting Request';
      case 'create_ticket': return 'Create Ticket Request';
      case 'query_sales_data': return 'Database Query Request';
      default: return 'Action Request';
    }
  };

  if (toolCall.status === 'executed') {
      return (
          <div className="mt-3 mb-3 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-sm text-green-700 animate-in fade-in duration-300">
              <div className="bg-green-100 p-1 rounded-full"><Check className="w-4 h-4" /></div>
              <span className="font-medium">Action successfully executed</span>
          </div>
      );
  }

  if (toolCall.status === 'rejected') {
    return (
        <div className="mt-3 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-sm text-gray-500">
            <div className="bg-gray-200 p-1 rounded-full"><X className="w-4 h-4" /></div>
            <span className="font-medium">Action cancelled</span>
        </div>
    );
}

  return (
    <div className="mt-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 max-w-md">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {getToolIcon(toolCall.name)}
            <span className="font-semibold text-gray-800 text-sm">{getToolTitle(toolCall.name)}</span>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{toolCall.name}</span>
      </div>

      {/* Body: Parameters */}
      <div className="p-4 bg-white">
        <div className="space-y-2">
            {Object.entries(toolCall.args).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between text-sm">
                    <span className="text-gray-500 font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-gray-800 font-mono bg-slate-50 px-1 rounded text-right truncate max-w-[200px]">{String(value)}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-3">
        <button 
            onClick={handleExecute}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isProcessing ? 'Processing...' : 'Confirm & Execute'}
        </button>
        <button 
            onClick={() => onReject(toolCall)}
            disabled={isProcessing}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
            Cancel
        </button>
      </div>
    </div>
  );
};
