import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingCart, Check, Flame, MapPin, Mountain, Sparkles, Scale, Thermometer, Clock, Droplets } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#EADBCE] rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top section: Photo + Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#F3ECE2] border border-[#EADBCE]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#2D2118]/85 text-white text-xs px-2.5 py-1 rounded-md">
                {product.categoryLabel}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-[#8A6A4F] uppercase tracking-wider font-semibold">
                {product.subtitle}
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#2C241E]">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#7A6B60]">
                <span className="text-amber-700 font-semibold">★ {product.rating}</span>
                <span>·</span>
                <span>{product.reviewsCount} отзывов покупателей</span>
              </div>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="font-serif text-3xl font-bold text-[#2C241E]">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
                {product.originalPrice && (
                  <span className="text-sm line-through text-[#998679]">
                    {product.originalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>

              {product.weight && (
                <p className="text-xs text-[#7A6B60]">
                  Фасовка: <strong className="text-[#3D2B1F]">{product.weight}</strong> в клапанной фольгированной пачке
                </p>
              )}

              {/* Flavor tags */}
              {product.flavorNotes && (
                <div className="pt-2">
                  <span className="text-xs text-[#7A6B60] block mb-1.5">Вкусовой букет:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.flavorNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#FAF7F2] border border-[#EADBCE] text-[#4A3B32] rounded-md text-xs font-medium"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full description */}
          <div>
            <h3 className="text-sm font-semibold text-[#2C241E] uppercase tracking-wider mb-2">
              О сорте и терруаре
            </h3>
            <p className="text-sm text-[#5C4C42] leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Origin & Specs */}
          {(product.origin || product.altitude || product.processing || product.roastName) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl text-xs">
              {product.origin && (
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-[#B58252]" />
                    Регион
                  </span>
                  <p className="font-medium text-[#2C241E]">{product.origin}</p>
                </div>
              )}

              {product.altitude && (
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-1">
                    <Mountain className="w-3 h-3 text-[#B58252]" />
                    Высота
                  </span>
                  <p className="font-medium text-[#2C241E]">{product.altitude}</p>
                </div>
              )}

              {product.processing && (
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-[#B58252]" />
                    Обработка
                  </span>
                  <p className="font-medium text-[#2C241E]">{product.processing}</p>
                </div>
              )}

              {product.roastName && (
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-1">
                    <Flame className="w-3 h-3 text-[#B58252]" />
                    Обжарка
                  </span>
                  <p className="font-medium text-[#2C241E]">{product.roastName}</p>
                </div>
              )}
            </div>
          )}

          {/* Brewing Recipe if present */}
          {product.recipe && (
            <div className="p-4 bg-[#F5EFEB] border border-[#E2D2C2] rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#8A5A36]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D2B1F]">
                  Рецепт заваривания от шеф-бариста Vibe Coffee
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-0.5">
                    <Scale className="w-3 h-3 text-[#8A5A36]" /> Дозировка
                  </span>
                  <span className="font-semibold text-[#2C241E]">{product.recipe.dose}</span>
                </div>
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-0.5">
                    <Thermometer className="w-3 h-3 text-[#8A5A36]" /> Вода
                  </span>
                  <span className="font-semibold text-[#2C241E]">{product.recipe.water}</span>
                </div>
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3 text-[#8A5A36]" /> Время
                  </span>
                  <span className="font-semibold text-[#2C241E]">{product.recipe.time}</span>
                </div>
                <div>
                  <span className="text-[#7A6B60] flex items-center gap-1 mb-0.5">
                    Помол
                  </span>
                  <span className="font-semibold text-[#2C241E]">{product.recipe.grind}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="p-4 sm:p-6 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between gap-4">
          <div className="flex items-center border border-[#D5C2B1] rounded-xl bg-white overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-[#4A3B32] hover:bg-[#F3ECE2] transition-colors"
            >
              -
            </button>
            <span className="px-3 py-2 text-sm font-semibold text-[#2C241E]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-[#4A3B32] hover:bg-[#F3ECE2] transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all shadow-sm ${
              added ? 'bg-emerald-700' : 'bg-[#3D2B1F] hover:bg-[#2A1D15]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Добавлено в корзину!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-[#E8D9C5]" />
                <span>Добавить в корзину ({(product.price * quantity).toLocaleString('ru-RU')} ₽)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
