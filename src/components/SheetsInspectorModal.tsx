import React, { useState } from 'react';
import { FaqItem, LogEntry, CoffeeItem } from '../types';
import { X, Database, RefreshCw, Plus, CheckCircle2, Download, Search, Coffee, MapPin, Tag } from 'lucide-react';

interface SheetsInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqItems: FaqItem[];
  logs: LogEntry[];
  coffeeItems?: CoffeeItem[];
  onRefreshFaq: () => void;
  onRefreshLogs: () => void;
  onRefreshCoffeeItems?: () => void;
  onAddFaq: (question: string, answer: string, category: string) => Promise<void>;
  onResetFaq: () => Promise<void>;
}

export const SheetsInspectorModal: React.FC<SheetsInspectorModalProps> = ({
  isOpen,
  onClose,
  faqItems,
  logs,
  coffeeItems = [],
  onRefreshFaq,
  onRefreshLogs,
  onRefreshCoffeeItems,
  onAddFaq,
  onResetFaq,
}) => {
  const [activeTab, setActiveTab] = useState<'coffeeItems' | 'logs' | 'faq' | 'config'>('coffeeItems');
  const [searchFilter, setSearchFilter] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('подбор кофе');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddFaq(newQuestion.trim(), newAnswer.trim(), newCategory);
      setNewQuestion('');
      setNewAnswer('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.answer.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.source.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredFaq = faqItems.filter(
    (f) =>
      f.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredCoffee = coffeeItems.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.country.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.tasteProfile.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const exportLogsAsCsv = () => {
    const headers = ['date', 'question', 'answer', 'источник', 'товар', 'модель', 'duration', 'category'];
    const rows = logs.map((l) => [
      `"${l.date.replace(/"/g, '""')}"`,
      `"${l.question.replace(/"/g, '""')}"`,
      `"${l.answer.replace(/"/g, '""')}"`,
      `"${l.source.replace(/"/g, '""')}"`,
      `"${(l.recommendedProductName || '').replace(/"/g, '""')}"`,
      `"${l.modelUsed || 'gemini-3.6-flash'}"`,
      `"${l.duration}"`,
      `"${l.category}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VibeCoffeeLogs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#FFFFFF] border border-[#EADBCE] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3D2B1F] text-[#FAF7F2] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#E8D9C5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#2C241E]">
                  Google Sheets Центр управления & Базы данных
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#7A6B60]">
                Таблицы: <code className="bg-[#EADBCE]/50 px-1 py-0.5 rounded text-[11px] font-semibold">VibeCoffeItems</code> (ID: 1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8), <code className="bg-[#EADBCE]/50 px-1 py-0.5 rounded text-[11px]">VibeCoffeeFAQ</code> и <code className="bg-[#EADBCE]/50 px-1 py-0.5 rounded text-[11px]">VibeCoffeeLogs</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefreshFaq();
                onRefreshLogs();
                if (onRefreshCoffeeItems) onRefreshCoffeeItems();
              }}
              className="p-2 text-[#7C5335] hover:bg-[#EADBCE]/50 rounded-lg transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8A6A4F] hover:text-[#2C241E] hover:bg-[#EADBCE]/50 rounded-lg transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch bar */}
        <div className="px-6 py-2.5 bg-[#FAF7F2] border-b border-[#EADBCE] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#F0E6D8] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('coffeeItems')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'coffeeItems'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4E] hover:text-[#2C241E]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-[#B58252]" />
              <span>Товары (VibeCoffeItems) · {coffeeItems.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4E] hover:text-[#2C241E]'
              }`}
            >
              Журнал аудита (VibeCoffeeLogs) · {logs.length}
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'faq'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4E] hover:text-[#2C241E]'
              }`}
            >
              База знаний (VibeCoffeeFAQ) · {faqItems.length}
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'config'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4E] hover:text-[#2C241E]'
              }`}
            >
              Интеграция Google Sheets
            </button>
          </div>

          {activeTab !== 'config' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9E8B7F]" />
                <input
                  type="text"
                  placeholder="Поиск по таблице..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[#D5C2B1] bg-white focus:outline-none focus:ring-1 focus:ring-[#7C5335]"
                />
              </div>

              {activeTab === 'logs' && logs.length > 0 && (
                <button
                  onClick={exportLogsAsCsv}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#4A3B32] bg-white border border-[#D5C2B1] hover:bg-[#F3ECE2] rounded-lg transition-colors"
                  title="Экспорт в CSV"
                >
                  <Download className="w-3 h-3 text-[#7C5335]" />
                  <span>CSV</span>
                </button>
              )}

              {activeTab === 'faq' && (
                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#3D2B1F] hover:bg-[#2A1D15] rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Добавить запись</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: VibeCoffeItems (Coffee Products Sheet) */}
        {activeTab === 'coffeeItems' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-3.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl flex items-center justify-between text-xs text-[#5C4C42]">
              <div>
                <strong className="block text-[#2C241E]">
                  Официальная Google-таблица сортов: VibeCoffeItems
                </strong>
                <span className="text-[#7A6B60]">
                  ID таблицы: <code className="font-mono text-[#3D2B1F] bg-white px-1.5 py-0.5 rounded border border-[#EADBCE]">1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8</code>
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px]">
                Подключено: {coffeeItems.length} сортов
              </span>
            </div>

            <div className="border border-[#EADBCE] rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#4A3B32] border-b border-[#EADBCE] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">название сорта</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">страна</th>
                      <th className="py-2.5 px-3 min-w-[260px]">вкусовой профиль</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">цена</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">кислотность / тело</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]/70">
                    {filteredCoffee.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#2C241E] whitespace-nowrap align-top">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[#EADBCE]"
                            />
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1E8DC] text-[#66462C]">
                            <MapPin className="w-3 h-3 text-[#7C5335]" />
                            {c.country}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#4A3B32] leading-relaxed align-top">
                          <div className="mb-1 font-medium">{c.tasteProfile}</div>
                          <div className="flex flex-wrap gap-1">
                            {c.flavorNotes.map((n, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-[#FAF7F2] border border-[#EADBCE] rounded text-[10px] text-[#5C4C42]">
                                {n}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#2C241E] whitespace-nowrap align-top">
                          {c.priceRaw || `${c.price} ₽`}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#7A6B60] whitespace-nowrap align-top">
                          <div>{c.acidityText}</div>
                          <div>{c.densityText}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: VibeCoffeeLogs (Audit Table) */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between text-xs text-[#7A6B60]">
              <span>
                Все входящие вопросы пользователей и ответы модели логируются с точным указанием источника, категории и времени:
              </span>
              <span className="font-mono text-[11px] text-[#4A3B32]">
                Записей: {filteredLogs.length}
              </span>
            </div>

            <div className="border border-[#EADBCE] rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#4A3B32] border-b border-[#EADBCE] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">date</th>
                      <th className="py-2.5 px-3 min-w-[200px]">question</th>
                      <th className="py-2.5 px-3 min-w-[260px]">answer</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">источник</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">рекомендованный товар</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">модель / fallback</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">duration</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]/70">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#9E8B7F]">
                          Логов пока нет. Задайте вопрос консультанту в чате, и он сразу отобразится здесь!
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-[#7A6B60] whitespace-nowrap align-top">
                            {log.date}
                          </td>
                          <td className="py-3 px-3 font-medium text-[#2C241E] align-top">
                            {log.question}
                          </td>
                          <td className="py-3 px-3 text-[#4A3B32] leading-relaxed align-top">
                            {log.answer}
                          </td>
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1E8DC] text-[#66462C] border border-[#E2D2C2]">
                              {log.source}
                            </span>
                          </td>
                          <td className="py-3 px-3 align-top text-[11px] text-[#4A3B32] whitespace-nowrap font-medium">
                            {log.recommendedProductName || '—'}
                          </td>
                          <td className="py-3 px-3 align-top whitespace-nowrap font-mono text-[10px] text-[#7A6B60]">
                            {log.modelUsed || 'gemini-3.6-flash'}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#7A6B60] whitespace-nowrap align-top">
                            {log.duration}
                          </td>
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F2EB] text-[#4A3B32]">
                              {log.category}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: VibeCoffeeFAQ (Knowledge Base) */}
        {activeTab === 'faq' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {isAdding && (
              <form
                onSubmit={handleCreateFaq}
                className="p-4 bg-[#FAF7F2] border border-[#D5C2B1] rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D2B1F]">
                    Добавить новую запись в таблицу VibeCoffeeFAQ
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-xs text-[#7A6B60] hover:text-[#2C241E]"
                  >
                    Отмена
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#5C4C42] mb-1">
                      Вопрос клиента
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Как получить бесплатную дегустацию?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C2B1] bg-white focus:outline-none focus:ring-1 focus:ring-[#7C5335]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#5C4C42] mb-1">
                      Категория
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C2B1] bg-white focus:outline-none focus:ring-1 focus:ring-[#7C5335]"
                    >
                      <option value="подбор кофе">подбор кофе</option>
                      <option value="помол">помол</option>
                      <option value="приготовление">приготовление</option>
                      <option value="подписка">подписка</option>
                      <option value="хранение">хранение</option>
                      <option value="доставка">доставка</option>
                      <option value="оплата">оплата</option>
                      <option value="возврат">возврат</option>
                      <option value="оборудование">оборудование</option>
                      <option value="аксессуары">аксессуары</option>
                      <option value="другое">другое</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5C4C42] mb-1">
                    Официальный ответ магазина
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Например: Каждую субботу с 12:00 до 15:00 в нашем шоуруме..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C2B1] bg-white focus:outline-none focus:ring-1 focus:ring-[#7C5335]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#3D2B1F] text-white text-xs font-semibold rounded-lg hover:bg-[#2A1D15] transition-colors"
                  >
                    Сохранить в Google Sheets FAQ
                  </button>
                </div>
              </form>
            )}

            <div className="flex items-center justify-between text-xs text-[#7A6B60]">
              <span>
                Актуальные строки таблицы VibeCoffeeFAQ (приоритет №1 для регламентов магазина):
              </span>
              <button
                onClick={onResetFaq}
                className="text-[11px] text-[#8A5A36] hover:underline"
              >
                Восстановить базовые строки
              </button>
            </div>

            <div className="space-y-3">
              {filteredFaq.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-[#EADBCE] rounded-xl hover:border-[#D5C2B1] transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="font-semibold text-sm text-[#2C241E]">
                      {item.question}
                    </h4>
                    <span className="text-[11px] font-medium text-[#7C5335] bg-[#F1E8DC] px-2 py-0.5 rounded shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A3B32] leading-relaxed mb-2">
                    {item.answer}
                  </p>
                  <div className="text-[10px] text-[#9E8B7F] flex items-center justify-between">
                    <span>Источник: {item.source}</span>
                    <span>Обновлено: {item.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Configuration */}
        {activeTab === 'config' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#4A3B32]">
            <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl">
              <h3 className="font-bold text-sm text-[#2C241E] mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#7C5335]" />
                Конфигурация Google Sheets таблиц магазина
              </h3>
              <p className="leading-relaxed mb-3">
                Магазин Vibe Coffee синхронизирует данные из трех связанных Google-таблиц:
              </p>

              <div className="space-y-2 mb-4">
                <div className="p-2.5 bg-white border border-[#EADBCE] rounded-xl">
                  <div className="font-semibold text-[#2C241E]">1. Таблица товаров: VibeCoffeItems</div>
                  <div className="text-[#7A6B60] text-[11px]">
                    ID: <code>1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8</code> — название кофе, страна, вкусовой профиль, цена.
                  </div>
                </div>
                <div className="p-2.5 bg-white border border-[#EADBCE] rounded-xl">
                  <div className="font-semibold text-[#2C241E]">2. База знаний регламентов: VibeCoffeeFAQ</div>
                  <div className="text-[#7A6B60] text-[11px]">
                    Вопросы и ответы по доставке, оплате, возврату, помолу и подписке.
                  </div>
                </div>
                <div className="p-2.5 bg-white border border-[#EADBCE] rounded-xl">
                  <div className="font-semibold text-[#2C241E]">3. Аудит-лог обращений: VibeCoffeeLogs</div>
                  <div className="text-[#7A6B60] text-[11px]">
                    Фиксация всех запросов клиентов, сформированных ответов, времени обработки и рекомендаций.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950">
              <h4 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Синхронизация активна
              </h4>
              <p className="leading-relaxed text-[11px] text-emerald-800">
                AI-консультант использует актуальные данные таблицы VibeCoffeItems для точных персональных рекомендаций на основе вкусовых предпочтений клиентов.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
