import React, { useState } from 'react';
import { Product } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Truck } from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

const FREE_SHIPPING_THRESHOLD = 2500;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  const shippingProgress = Math.min(100, (totalAmount / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClearCart();
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col border-l border-[#EADBCE]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#FAF7F2] border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#7C5335]" />
            <h2 className="font-serif text-lg font-bold text-[#2C241E]">
              Корзина заказов
            </h2>
            <span className="text-xs font-semibold text-[#8A6A4F] bg-[#F1E8DC] px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#8A6A4F] hover:text-[#2C241E] hover:bg-[#EADBCE]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="p-4 bg-[#F5EFEB] border-b border-[#E2D2C2] text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium text-[#4A3B32]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#7C5335]" />
              Бесплатная доставка от 2 500 ₽
            </span>
            <span className="font-bold text-[#2C241E]">
              {remainingForFreeShipping === 0 ? 'Достигнута!' : `еще ${remainingForFreeShipping.toLocaleString('ru-RU')} ₽`}
            </span>
          </div>
          <div className="w-full bg-[#E2D2C2] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#7C5335] h-full transition-all duration-300"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#EADBCE]/70">
          {items.length === 0 ? (
            <div className="py-16 text-center text-[#7A6B60]">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#D5C2B1] mb-3 stroke-[1.5]" />
              <p className="font-medium text-sm text-[#2C241E]">Корзина пуста</p>
              <p className="text-xs text-[#9E8B7F] mt-1 max-w-[240px] mx-auto">
                Спросите нашего AI-консультанта в чате, и он порекомендует идеальный сорт кофе!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="py-4 first:pt-0 flex gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-18 h-18 rounded-xl object-cover bg-[#F3ECE2] shrink-0 border border-[#EADBCE]"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#2C241E] leading-snug">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[#9E8B7F] hover:text-[#B85C38] transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#7A6B60]">
                      {item.product.weight || item.product.categoryLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#D5C2B1] rounded-lg bg-white overflow-hidden text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 hover:bg-[#FAF7F2] transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 hover:bg-[#FAF7F2] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-semibold text-xs text-[#2C241E]">
                      {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="p-5 bg-[#FAF7F2] border-t border-[#EADBCE] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5C4C42]">Итого к оплате:</span>
              <span className="font-serif text-xl font-bold text-[#2C241E]">
                {totalAmount.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {isSuccess ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Заказ успешно оформлен! Бариста приступает к упаковке.</span>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-[#3D2B1F] hover:bg-[#2A1D15] text-[#FAF7F2] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Оформить заказ (СБП, Карты, Долями)</span>
                <ArrowRight className="w-4 h-4 text-[#E8D9C5]" />
              </button>
            )}

            <p className="text-[10px] text-[#9E8B7F] text-center">
              Бесплатная доставка от 2 500 ₽ · Скидка 15% при оформлении подписки
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
