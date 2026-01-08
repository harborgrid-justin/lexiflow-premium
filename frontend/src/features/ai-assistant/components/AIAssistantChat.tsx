/**
 * AI Assistant Chat Component
 * Interactive chat interface for legal queries and assistance
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import type { ChatMessage, AIAssistantContext } from '../types';

export interface AIAssistantChatProps {
  context?: AIAssistantContext;
  onAnalysisRequest?: (type: string, data: any) => void;
  className?: string;
}

export function AIAssistantChat({ context, onAnalysisRequest, className }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI legal assistant. I can help you with contract analysis, legal research, brief writing, deposition preparation, and more. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call the actual AI service)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input, context),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className || ''}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Legal Assistant</h2>
            <p className="text-sm text-blue-100">Powered by GPT-4</p>
          </div>
        </div>
        {context && (
          <div className="mt-3 flex gap-2 text-xs">
            {context.matterId && (
              <span className="px-2 py-1 bg-blue-500 text-white rounded">
                Matter: {context.matterId.slice(0, 8)}
              </span>
            )}
            {context.caseType && (
              <span className="px-2 py-1 bg-blue-500 text-white rounded">
                {context.caseType}
              </span>
            )}
            {context.jurisdiction && (
              <span className="px-2 py-1 bg-blue-500 text-white rounded">
                {context.jurisdiction}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <Loader className="w-5 h-5 text-gray-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your legal matters..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function getAIResponse(input: string, context?: AIAssistantContext): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('contract')) {
    return 'I can help you analyze contracts! I can:\n\n1. Extract key clauses and terms\n2. Identify potential risks\n3. Assess compliance issues\n4. Provide recommendations\n\nWould you like me to analyze a specific contract? Please upload the document or provide its ID.';
  }

  if (lowerInput.includes('brief') || lowerInput.includes('motion')) {
    return 'I can help you draft legal briefs! I can generate:\n\n1. Motions\n2. Memoranda of law\n3. Responses and replies\n4. Appellate briefs\n\nTo get started, please provide:\n- The facts of your case\n- Legal issues to address\n- Jurisdiction and court\n- Any relevant precedents';
  }

  if (lowerInput.includes('deposition')) {
    return 'I can help you prepare for depositions! I can create:\n\n1. Comprehensive deposition outlines\n2. Strategic question sequences\n3. Topic organization\n4. Exhibit mapping\n\nPlease provide:\n- Witness name and role\n- Case background\n- Key facts\n- Your objectives for the deposition';
  }

  if (lowerInput.includes('predict') || lowerInput.includes('outcome')) {
    return 'I can help predict case outcomes! My analysis includes:\n\n1. Probability assessments for different outcomes\n2. Key success factors\n3. Settlement range estimates\n4. Expected duration and costs\n\nPlease provide:\n- Case type and facts\n- Evidence strength\n- Jurisdiction\n- Relevant precedents';
  }

  if (lowerInput.includes('summar')) {
    return 'I can summarize legal documents! I can:\n\n1. Create concise summaries\n2. Extract key points\n3. Identify important entities\n4. Compare multiple documents\n\nJust provide the document ID or upload the file you\'d like me to summarize.';
  }

  return 'I\'m here to help with all your legal needs! I can assist with:\n\n• Contract analysis and risk assessment\n• Legal brief and motion drafting\n• Deposition preparation\n• Case outcome predictions\n• Document summarization\n• Legal research and citations\n• Due diligence analysis\n\nWhat would you like help with today?';
}
