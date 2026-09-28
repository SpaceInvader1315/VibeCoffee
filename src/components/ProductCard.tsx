import React from 'react';
import { Product } from '../types';
import { Sparkles, Eye, ShoppingCart, RefreshCw, Flame, Compass, Check, MapPin, Coffee } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isAiRecommended?: boolean;
  recommendationReason?: string;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onRefreshRandom: () => void;
  allCoffeeProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  isLoading?: boolean;
  addedToast?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAiRecommended = false,
  recommendationReason,
  onOpenDetails,
  onAddToCart,
  onRefreshRandom,
  allCoffeeProducts = [],
  onSelectProduct,
  isLoading = false,
  addedToast = false,
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#EADBCE] rounded-2xl shadow-sm overflow-hidden flex flex-col h-full transition-all">
      {/* Top Header of Recommendation Status */}
      <div
        className={`px-5 py-3.5 border-b flex items-center justify-between transition-colors ${
          isAiRecommended
            ? 'bg-[#F4ECE1] border-[#DFCFBE]'
            : 'bg-[#F9F5EF] border-[#EADBCE]'
        }`}
      >
        <div className="flex items-center gap-2">
          {isAiRecommended ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C5335]">
              <Sparkles className="w-4 h-4 text-[#B58252] animate-pulse" />
              <span>Рекомендация по вкусовым предпочтениям</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#665449]">
              <Compass className="w-4 h-4 text-[#8A6A4F]" />
              <span>Товар из таблицы VibeCoffeItems</span>
            </div>
          )}
        </div>

        <button
          onClick={onRefreshRandom}
          disabled={isLoading}
          className="text-xs text-[#8A6A4F] hover:text-[#3D2B1F] flex items-center gap-1 p-1 hover:bg-[#EADBCE]/50 rounded-md transition-colors"
          title="Показать другой сорт"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Другой сорт</span>
        </button>
      </div>

      {/* Main card body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Recommendation Banner if AI recommended */}
          {isAiRecommended && recommendationReason && (
            <div className="mb-3.5 p-2.5 bg-[#F9F3EA] border border-[#E8D9C5] rounded-xl text-xs text-[#634832] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#B58252] shrink-0 mt-0.5" />
              <span>
                <strong>Совпадение по вкусу:</strong> {recommendationReason}
              </span>
            </div>
          )}

          {/* Product Image */}
          <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden bg-[#F3ECE2] group mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Category badge */}
            <div className="absolute top-3 left-3 bg-[#2D2118]/85 backdrop-blur-xs text-[#FAF7F2] text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
              <Coffee className="w-3 h-3 text-[#E8D9C5]" />
              <span>{product.categoryLabel}</span>
            </div>

            {/* Country badge */}
            {product.origin && (
              <div className="absolute top-3 right-3 bg-[#FAF7F2]/95 backdrop-blur-xs text-[#3D2B1F] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#B58252]" />
                <span>{product.origin}</span>
              </div>
            )}
          </div>

          {/* Rating & origin */}
          <div className="flex items-center justify-between text-xs text-[#7A6B60] mb-1.5">
            <span className="font-medium text-[#7C5335]">
              {product.origin ? `Страна: ${product.origin}` : product.subtitle}
            </span>
            <span className="font-medium text-[#4A3B32]">★ {product.rating} (отзывы)</span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C241E] leading-snug mb-2">
            {product.name}
          </h2>

          {/* Short description */}
          <p className="text-sm text-[#5C4C42] line-clamp-2 mb-4 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Characteristics block */}
          <div className="bg-[#FAF7F2] border border-[#EADBCE]/80 rounded-xl p-3.5 space-y-2.5 mb-4 text-xs text-[#4A3B32]">
            {/* Roast level */}
            {product.roastName && (
              <div className="flex items-center justify-between">
                <span className="text-[#7A6B60] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#B58252]" />
                  Обжарка:
                </span>
                <span className="font-medium text-[#2C241E]">{product.roastName}</span>
              </div>
            )}

            {/* Flavor notes */}
            {product.flavorNotes && product.flavorNotes.length > 0 && (
              <div>
                <div className="text-[#7A6B60] mb-1.5">Вкусовой профиль / Дескрипторы:</div>
                <div className="flex flex-wrap gap-1.5">
                  {product.flavorNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E2D2C2] text-[#4A3B32] rounded text-[11px] font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Brewing methods */}
            {product.brewingMethods && product.brewingMethods.length > 0 && (
              <div className="pt-1 border-t border-[#EADBCE]/50 flex items-center justify-between">
                <span className="text-[#7A6B60]">Способы заваривания:</span>
                <span className="font-medium text-[#2C241E] text-right truncate max-w-[60%]">
                  {product.brewingMethods.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Mini carousel of other coffees from VibeCoffeItems */}
          {allCoffeeProducts.length > 1 && onSelectProduct && (
            <div className="mb-4">
              <div className="text-[11px] font-medium text-[#7A6B60] mb-1.5">
                Другие сорта из таблицы VibeCoffeItems:
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {allCoffeeProducts.map((p) => {
                  const isSelected = p.id === product.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className={`px-2 py-1 text-[11px] rounded-lg shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] font-semibold'
                          : 'bg-[#FAF7F2] text-[#5C4C42] border-[#EADBCE] hover:border-[#8A6A4F]'
                      }`}
                    >
                      {p.name.replace('Бразилия + Колумбия «Шоколадный блэнд»', 'Шоколадный блэнд')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price & Action buttons */}
        <div className="pt-2 border-t border-[#EADBCE]">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif text-2xl font-bold text-[#2C241E]">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
            <span className="text-xs text-[#7A6B60]">за пачку 250 г</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onOpenDetails(product)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#D5C2B1] bg-[#FAF7F2] text-[#3D2B1F] text-xs font-semibold hover:bg-[#F3ECE2] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#7C5335]" />
              <span>Подробнее</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-white transition-all shadow-xs ${
                addedToast ? 'bg-emerald-700' : 'bg-[#3D2B1F] hover:bg-[#2A1D15]'
              }`}
            >
              {addedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>В корзине!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-[#E8D9C5]" />
                  <span>В корзину</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
