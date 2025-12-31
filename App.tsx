import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { streamChatResponse } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { TypingIndicator } from './components/TypingIndicator';
import { SendIcon, RefreshIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change or while streaming
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const stream = streamChatResponse(messages, userMessage.content);
      
      let fullResponse = '';
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingContent(prev => prev + chunk);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: fullResponse,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="flex-none h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-900/20">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-100 leading-tight">Gemini Chat</h1>
            <p className="text-xs text-emerald-400 font-medium">Powered by Gemini 3 Flash</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          title="New Chat"
        >
          <RefreshIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-0">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          
          {/* Welcome Empty State */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/20">
                <SparklesIcon className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">How can I help you today?</h2>
              <p className="text-gray-400 max-w-md">
                I can help you write code, analyze text, brainstorm ideas, and much more.
              </p>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Streaming Message (Ghost Bubble) */}
            {isLoading && streamingContent && (
               <ChatMessage 
                 message={{
                   id: 'streaming',
                   role: 'model',
                   content: streamingContent,
                   timestamp: Date.now()
                 }} 
               />
            )}
            
            {/* Loading Indicator (before first token) */}
            {isLoading && !streamingContent && (
              <TypingIndicator />
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 md:pb-6 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end bg-gray-800/80 border border-gray-700 rounded-2xl shadow-lg shadow-black/20 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all backdrop-blur-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemini..."
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 p-4 max-h-[150px] overflow-y-auto resize-none outline-none rounded-2xl"
              rows={1}
            />
            <div className="pb-3 pr-3">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`
                  p-2 rounded-xl transition-all duration-200
                  ${input.trim() && !isLoading 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 hover:scale-105 active:scale-95' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            AI can make mistakes. Please double-check responses.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;