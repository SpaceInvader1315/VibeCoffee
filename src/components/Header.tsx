import React from 'react';
import { Coffee, Database, ShoppingBag, RotateCcw } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenLogs: () => void;
  onClearChat?: () => void;
  hasMessages?: boolean;
  sheetsStatus?: string;
  totalFaqCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenLogs,
  onClearChat,
  hasMessages = false,
  sheetsStatus = 'active_local',
  totalFaqCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EADBCE] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D2B1F] text-[#FAF7F2] flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5 text-[#E8D9C5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#2C241E]">
                VIBE COFFEE
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-medium uppercase tracking-wider text-[#8A6A4F] bg-[#F1E8DC] px-2 py-0.5 rounded">
                Specialty Roastery
              </span>
            </div>
            <p className="text-xs text-[#7A6B60] hidden sm:block">
              Свежая обжарка микролотов · AI-консультант
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Clear chat button at the very top */}
          {onClearChat && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7A6B60] hover:text-[#B85C38] bg-[#F3ECE2] hover:bg-[#EADBCE] border border-[#E2D2C2] transition-colors"
              title="Стереть переписку в чате"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8A5A36]" />
              <span>Стереть</span>
            </button>
          )}

          {/* Google Sheets Status Pill / Button */}
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#4A3B32] bg-[#F3ECE2] hover:bg-[#EADBCE] border border-[#E2D2C2] transition-colors"
            title="Открыть базу знаний VibeCoffeeFAQ и журнал VibeCoffeeLogs"
          >
            <Database className="w-3.5 h-3.5 text-[#8A5A36]" />
            <span className="hidden md:inline">Google Sheets:</span>
            <span className="font-semibold text-[#66462C]">VibeCoffeeFAQ</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Shopping cart */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#3D2B1F] text-white hover:bg-[#2C1E15] transition-colors shadow-xs"
            aria-label="Корзина"
          >
            <ShoppingBag className="w-4 h-4 text-[#F3ECE2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B85C38] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#FAF7F2]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
