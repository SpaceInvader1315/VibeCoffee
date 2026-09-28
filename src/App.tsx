import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { SheetsInspectorModal } from './components/SheetsInspectorModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { Product, ChatMessage, FaqItem, LogEntry, AskQuestionResponse, CoffeeItem } from './types';
import { ShieldCheck, Database, MessageSquare, Coffee } from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: `Здравствуйте! Я персональный AI-консультант онлайн-магазина свежеобжаренного кофе **Vibe Coffee**.\n\nНа основе ваших вкусовых предпочтений (ноты, баланс кислинки, плотность, страна) я порекомендую конкретный сорт из нашей официальной таблицы товаров **VibeCoffeItems**, а также отвечу на любые вопросы о доставке, помоле и правилах магазина по базе знаний **VibeCoffeeFAQ**.\n\n💡 *Я рекомендую кофе только тогда, когда вы сами попросите рекомендацию или назовёте свои предпочтения по вкусу (например: «Люблю шоколад и фундук без кислинки» или «Посоветуй яркий ягодный кофе»).*\n\nЧем могу помочь вам сегодня?`,
    timestamp: 'Только что',
    source: 'Google Sheets',
    duration: '210 ms',
    category: 'подбор кофе',
    recommendedProductId: null,
    hasRecommendation: false,
  },
];

export default function App() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  // Recommended product state
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isAiRecommended, setIsAiRecommended] = useState(false);
  const [recommendationReason, setRecommendationReason] = useState<string | undefined>(undefined);
  const [isRefreshingProduct, setIsRefreshingProduct] = useState(false);

  // Modals & Drawers state
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addedToast, setAddedToast] = useState(false);

  // Mobile layout tab: 'chat' | 'product'
  const [mobileTab, setMobileTab] = useState<'chat' | 'product'>('chat');

  // Backend Google Sheets data state
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [coffeeItems, setCoffeeItems] = useState<CoffeeItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sheetsStatus, setSheetsStatus] = useState<string>('active_local');

  // Load initial product, coffee items and FAQ data from backend
  useEffect(() => {
    fetchInitialCatalog();
    fetchCoffeeItemsData();
    fetchFaqData();
    fetchLogsData();
  }, []);

  const fetchInitialCatalog = async () => {
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setAllProducts(data.products);
          // Set Ethiopia Yirgacheffe as default initial featured product from VibeCoffeItems
          const defaultProd = data.products.find((p: Product) => p.id === 'ethiopia-yirgacheffe') || data.products[0];
          setCurrentProduct(defaultProd);
        }
      }
    } catch (err) {
      console.warn('Could not load catalog:', err);
    }
  };

  const fetchCoffeeItemsData = async () => {
    try {
      const res = await fetch('/api/coffee-items');
      if (res.ok) {
        const data = await res.json();
        setCoffeeItems(data.items || []);
      }
    } catch (err) {
      console.warn('Could not fetch coffee items:', err);
    }
  };

  const fetchFaqData = async () => {
    try {
      const res = await fetch('/api/faq');
      if (res.ok) {
        const data = await res.json();
        setFaqItems(data.items || []);
        if (data.meta?.status) {
          setSheetsStatus(data.meta.status);
        }
      }
    } catch (err) {
      console.warn('Could not fetch FAQ data:', err);
    }
  };

  const fetchLogsData = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Could not fetch logs data:', err);
    }
  };

  // Rotate / get another product manually
  const handleRefreshRandomProduct = async () => {
    setIsRefreshingProduct(true);
    try {
      const excludeParam = currentProduct ? `?exclude=${currentProduct.id}` : '';
      const res = await fetch(`/api/catalog/random${excludeParam}`);
      if (res.ok) {
        const product = await res.json();
        setCurrentProduct(product);
        setIsAiRecommended(false);
        setRecommendationReason(undefined);
      }
    } catch (err) {
      console.warn('Error fetching random product:', err);
    } finally {
      setTimeout(() => setIsRefreshingProduct(false), 300);
    }
  };

  // Main chat sending handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessageTime = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: userMessageTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: text.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AskQuestionResponse = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: data.source,
        duration: data.duration,
        category: data.category,
        recommendedProductId: data.recommendedProductId,
        recommendedProduct: data.recommendedProduct,
        hasRecommendation: data.hasRecommendation,
        isOffTopic: data.isOffTopic,
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If AI made a taste recommendation, update the right side card with that recommended coffee!
      if (data.hasRecommendation && data.recommendedProduct) {
        setCurrentProduct(data.recommendedProduct);
        setIsAiRecommended(true);
        setRecommendationReason(data.recommendationReason);
      } else {
        // If it was a general question (e.g. delivery, grind, storage), do NOT claim the card is recommended
        setIsAiRecommended(false);
        setRecommendationReason(undefined);
      }

      // Refresh logs so inspector stays synchronized
      fetchLogsData();
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: 'Наши бариста на связи: вы можете выбрать любой сорт из таблицы VibeCoffeItems справа или повторить вопрос через секунду!',
        timestamp: 'Сейчас',
        source: 'Knowledge Base',
        duration: '120 ms',
        category: 'другое',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to cart handler
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Select product from chat recommendation link
  const handleSelectProductFromChat = async (productId: string) => {
    try {
      const res = await fetch(`/api/catalog/${productId}`);
      if (res.ok) {
        const prod = await res.json();
        setCurrentProduct(prod);
        setSelectedProductForModal(prod);
      }
    } catch (err) {
      console.warn('Could not load recommended product:', err);
    }
  };

  // FAQ Admin handlers
  const handleAddFaqItem = async (question: string, answer: string, category: string) => {
    const res = await fetch('/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, category }),
    });
    if (res.ok) {
      fetchFaqData();
    }
  };

  const handleResetFaq = async () => {
    const res = await fetch('/api/faq/reset', { method: 'POST' });
    if (res.ok) {
      fetchFaqData();
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const coffeeBeansProducts = allProducts.filter((p) => p.category === 'beans');

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex flex-col">
      {/* Top Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogs={() => setIsSheetsModalOpen(true)}
        onClearChat={() => setMessages(INITIAL_MESSAGES)}
        hasMessages={messages.length > 1}
        sheetsStatus={sheetsStatus}
        totalFaqCount={faqItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center bg-[#F0E6D8] p-1 rounded-xl mb-4 max-w-md mx-auto">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'chat'
                ? 'bg-white text-[#2C241E] shadow-xs'
                : 'text-[#6B5A4E]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#7C5335]" />
            <span>Чат с AI-консультантом</span>
          </button>
          <button
            onClick={() => setMobileTab('product')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'product'
                ? 'bg-white text-[#2C241E] shadow-xs'
                : 'text-[#6B5A4E]'
            }`}
          >
            <Coffee className="w-4 h-4 text-[#B58252]" />
            <span>{isAiRecommended ? 'Рекомендованный сорт' : 'Карточка товара'}</span>
          </button>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Chat with AI Consultant */}
          <div
            className={`lg:col-span-7 xl:col-span-7 ${
              mobileTab === 'product' ? 'hidden lg:block' : 'block'
            }`}
          >
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onSelectProduct={handleSelectProductFromChat}
              onClearHistory={() => setMessages(INITIAL_MESSAGES)}
            />
          </div>

          {/* Right Column: Recommended Product Card */}
          <div
            className={`lg:col-span-5 xl:col-span-5 ${
              mobileTab === 'chat' ? 'hidden lg:block' : 'block'
            }`}
          >
            {currentProduct ? (
              <ProductCard
                product={currentProduct}
                isAiRecommended={isAiRecommended}
                recommendationReason={recommendationReason}
                onOpenDetails={(p) => setSelectedProductForModal(p)}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onRefreshRandom={handleRefreshRandomProduct}
                allCoffeeProducts={coffeeBeansProducts}
                onSelectProduct={(p) => {
                  setCurrentProduct(p);
                  setIsAiRecommended(false);
                  setRecommendationReason(undefined);
                }}
                isLoading={isRefreshingProduct}
                addedToast={addedToast}
              />
            ) : (
              <div className="bg-white border border-[#EADBCE] rounded-2xl p-12 text-center text-[#7A6B60]">
                <Coffee className="w-10 h-10 mx-auto text-[#B58252] animate-pulse mb-3" />
                <p className="text-sm font-medium">Загрузка каталога кофе из VibeCoffeItems...</p>
              </div>
            )}

            {/* Quick store features under card */}
            <div className="mt-4 p-4 bg-[#F5EFEB] border border-[#E2D2C2] rounded-2xl grid grid-cols-2 gap-3 text-xs text-[#5C4C42]">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7C5335] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-[#2C241E]">VibeCoffeItems</strong>
                  <span>7 отборных сортов specialty арабики</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-[#7C5335] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-[#2C241E]">Google Sheets</strong>
                  <span>Синхронизация каталога и регламентов</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
      />

      {/* Google Sheets & Audit Logs Inspector */}
      <SheetsInspectorModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        faqItems={faqItems}
        coffeeItems={coffeeItems}
        logs={logs}
        onRefreshFaq={fetchFaqData}
        onRefreshLogs={fetchLogsData}
        onRefreshCoffeeItems={fetchCoffeeItemsData}
        onAddFaq={handleAddFaqItem}
        onResetFaq={handleResetFaq}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />
    </div>
  );
}
