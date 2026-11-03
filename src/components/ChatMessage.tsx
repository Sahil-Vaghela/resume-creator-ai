import React from 'react';
import { Pencil, FileSpreadsheet, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../engine/conversationEngine';

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit?: (message: ChatMessageType) => void;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({ message, onEdit }) => {
  const isBot = message.sender === 'bot';

  return (
    <div
      className={`group flex items-start gap-3 my-4 min-w-0 ${
        isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Bot Avatar: Theme-scoped Neomorphic Avatar */}
      {isBot && (
        <div className="w-8 h-8 rounded-2xl chat-scoped-avatar flex items-center justify-center shrink-0 mt-0.5">
          <FileSpreadsheet className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[88%] sm:max-w-[80%] flex flex-col min-w-0 ${
          isBot ? 'items-start' : 'items-end'
        }`}
      >
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-bold chat-scoped-meta">
            {isBot ? 'ResumeCraft' : 'You'}
          </span>
          <span className="text-[10px] chat-scoped-meta tabular-nums">
            {message.timestamp}
          </span>

          {!isBot && message.isEditable && onEdit && (
            <button
              onClick={() => onEdit(message)}
              title="Edit this answer"
              className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity chat-scoped-meta hover:opacity-100 p-1 rounded-md cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Bubble styled with scoped theme classes */}
        <div
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all break-words overflow-hidden ${
            isBot
              ? 'chat-scoped-bot-bubble'
              : 'chat-scoped-user-bubble font-normal'
          }`}
        >
          <div className="whitespace-pre-line break-words">{message.text}</div>
        </div>
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="w-8 h-8 rounded-2xl neu-inset chat-scoped-meta flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
