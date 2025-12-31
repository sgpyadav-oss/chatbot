import React from 'react';
import { BotIcon } from './Icons';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full justify-start mb-6 animate-fade-in">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
          <BotIcon className="w-5 h-5" />
        </div>
        <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-12">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot delay-100"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot delay-200"></div>
        </div>
      </div>
    </div>
  );
};