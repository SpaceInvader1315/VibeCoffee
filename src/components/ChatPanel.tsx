import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SourceType } from '../types';
import { Send, Sparkles, Coffee, AlertCircle, Clock, Database, Globe, RotateCcw, Copy, Check, ChevronRight } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onSelectProduct: (productId: string) => void;
  onClearHistory: () => void;
}

const TASTE_SUGGESTIONS = [
  { label: '🍫 Шоколад и орехи без кислинки', query: 'Люблю плотный кофе с нотами шоколада и фундука без кислинки. Что порекомендуешь?' },
  { label: '🍓 Ягоды и цитрусы с кислинкой', query: 'Посоветуй кофе с яркой ягодной или цитрусовой кислинкой' },
  { label: '🌸 Жасмин, бергамот и персик', query: 'Хочу легкий цветочный сорт с нотами жасмина и персика' },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onSelectProduct,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSourceBadge = (source?: SourceType) => {
    if (!source) return null;

    if (source === 'Google Sheets') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
          title="Ответ строго по официальной таблице магазина (VibeCoffeeFAQ / VibeCoffeItems)"
        >
          <Database className="w-3 h-3 text-emerald-600" />
          <span>Google Sheets</span>
        </span>
      );
    }

    if (source === 'Web') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200"
          title="Ответ найден в интернете (веб-поиск), так как в таблице VibeCoffeeFAQ данный вопрос не описан"
        >
          <Globe className="w-3 h-3 text-sky-600" />
          <span>Интернет (веб-поиск)</span>
        </span>
      );
    }

    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200"
        title="Ответ составлен на основе сторонних источников"
      >
        <Globe className="w-3 h-3 text-amber-700" />
        <span>{source}</span>
      </span>
    );
  };

  return (
    <div className="relative bg-[#FFFFFF] border border-[#EADBCE] rounded-2xl shadow-sm flex flex-col h-[780px] max-h-[88vh] overflow-hidden">
      {/* Floating "Стереть" button at the very top right of the chat container without consuming vertical space */}
      {messages.length > 1 && (
        <button
          onClick={onClearHistory}
          className="absolute top-3.5 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#7A6B60] hover:text-[#B85C38] border border-[#EADBCE] shadow-xs text-xs font-semibold transition-all backdrop-blur-md"
          title="Стереть переписку в чате"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8A5A36]" />
          <span>Стереть</span>
        </button>
      )}

      {/* Message history — occupies the full top area with maximum vertical space */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed transition-all ${
                  isUser
                    ? 'bg-[#3D2B1F] text-[#FAF7F2] rounded-tr-none shadow-xs'
                    : 'bg-[#F9F5EF] text-[#2C241E] border border-[#EADBCE] rounded-tl-none'
                }`}
              >
                {/* Assistant avatar & header */}
                {!isUser && (
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#EADBCE]/60 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-[#7C5335]">
                      <Sparkles className="w-3.5 h-3.5 text-[#B58252]" />
                      <span>Бариста Vibe Coffee</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-[#8A6A4F] hover:text-[#3D2B1F] transition-colors p-0.5"
                        title="Скопировать ответ"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Message text with markdown rendering (bold and italic) */}
                <div className="space-y-2">
                  <MarkdownRenderer content={msg.text} />
                </div>

                {/* Interactive recommendation callout if AI recommended a product */}
                {!isUser && msg.recommendedProductId && (
                  <div className="mt-3.5 p-3 bg-white border border-[#E2D2C2] rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] flex items-center justify-center shrink-0 text-[#7C5335]">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#7C5335] uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#B58252]" />
                          Подобранный сорт из VibeCoffeItems
                        </div>
                        <div className="text-xs font-semibold text-[#2C241E] truncate">
                          Посмотрите карточку товара справа
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProduct(msg.recommendedProductId!)}
                      className="shrink-0 px-2.5 py-1.5 bg-[#3D2B1F] text-[#FAF7F2] hover:bg-[#2A1D15] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Открыть сорт</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Off-topic notice */}
                {msg.isOffTopic && (
                  <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/70 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                    <span>
                      Вопрос вне компетенции кофейного магазина. Консультант сфокусирован на зерне, заваривании и сервисах Vibe Coffee.
                    </span>
                  </div>
                )}

                {/* Metadata footer for assistant messages */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-[#EADBCE]/60 flex flex-wrap items-center gap-2 text-[11px] text-[#7A6B60]">
                    {renderSourceBadge(msg.source)}

                    {msg.duration && (
                      <span className="flex items-center gap-1 text-[#8A6A4F]">
                        <Clock className="w-3 h-3" />
                        <span>{msg.duration}</span>
                      </span>
                    )}

                    {msg.modelUsed && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                          msg.modelUsed.startsWith('gemini')
                            ? 'text-emerald-800 bg-emerald-50/80 border-emerald-200'
                            : 'text-amber-900 bg-amber-50/80 border-amber-200'
                        }`}
                        title={`Модель генерации: ${msg.modelUsed}`}
                      >
                        {msg.modelUsed.startsWith('gemini') ? `✨ ${msg.modelUsed}` : `⚡ ${msg.modelUsed}`}
                      </span>
                    )}

                    {msg.category && msg.category !== 'другое' && (
                      <span className="text-[#8A6A4F]">
                        · <strong className="font-semibold text-[#5C4230]">{msg.category}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-[#9E8B7F] px-1 mt-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-[#F9F5EF] border border-[#EADBCE] rounded-2xl rounded-tl-none p-4 max-w-[80%] text-sm text-[#5C4C42] shadow-xs">
              <div className="flex items-center gap-2 mb-2 font-medium text-xs text-[#7C5335]">
                <Coffee className="w-3.5 h-3.5 animate-bounce text-[#B58252]" />
                <span>Бариста сверяется с таблицами VibeCoffeItems и VibeCoffeeFAQ...</span>
              </div>
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full bg-[#B58252] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-[#8A6A4F] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#5C4230] animate-pulse" />
                <span className="text-xs text-[#7A6B60] ml-2">Анализ вкусовых предпочтений и подбор сорта</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Taste Preference Chips */}
      <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#EADBCE]/80 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
        <span className="text-[10px] uppercase font-bold text-[#8A6A4F] shrink-0 mr-1">
          Быстрый выбор вкуса:
        </span>
        {TASTE_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(item.query)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white border border-[#D5C2B1] hover:border-[#7C5335] hover:bg-[#F3ECE2] text-[#4A3B32] text-xs rounded-full whitespace-nowrap transition-colors disabled:opacity-50 shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-3 sm:p-4 bg-[#FFFFFF] border-t border-[#EADBCE] shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={2}
              placeholder="Опишите свои вкусовые предпочтения (например: «Люблю шоколад и орехи без кислинки»)..."
              className="w-full resize-none rounded-xl border border-[#D5C2B1] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#2C241E] placeholder:text-[#998679] focus:outline-none focus:ring-2 focus:ring-[#7C5335]/40 focus:border-[#7C5335] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="h-11 px-4 rounded-xl bg-[#3D2B1F] text-[#FAF7F2] hover:bg-[#2C1E15] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-xs shrink-0"
            aria-label="Отправить вопрос"
          >
            <Send className="w-4 h-4 text-[#E8D9C5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
