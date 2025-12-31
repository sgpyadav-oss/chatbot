import React from 'react';
import { Message } from '../types';
import { BotIcon, UserIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
          ${isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}
          shadow-md
        `}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
        </div>

        {/* Message Bubble */}
        <div className={`
          relative px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-blue-600 text-white rounded-tr-sm' 
            : isError
              ? 'bg-red-900/50 border border-red-800 text-red-200 rounded-tl-sm'
              : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm'
          }
        `}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Timestamp (visible on hover) */}
          <div className={`
            absolute -bottom-5 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity
            ${isUser ? 'right-0' : 'left-0'}
          `}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};