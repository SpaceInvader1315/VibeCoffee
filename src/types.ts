export type ProductCategory = 'beans' | 'drip' | 'equipment' | 'accessories';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  shortDescription: string;
  fullDescription: string;
  origin?: string;
  altitude?: string;
  processing?: string;
  roastLevel?: number; // 1-5
  roastName?: string;
  flavorNotes: string[];
  acidity?: number; // 1-5
  density?: number; // 1-5
  sweetness?: number; // 1-5
  brewingMethods: string[];
  recipe?: {
    ratio: string;
    dose: string;
    water: string;
    temp?: string;
    time: string;
    grind: string;
  };
  image: string;
  inStock: boolean;
  weight?: string;
}

export interface CoffeeItem {
  id: string;
  name: string;
  country: string;
  tasteProfile: string;
  price: number;
  priceRaw: string;
  link?: string;
  flavorNotes: string[];
  acidityText: string;
  acidityLevel: number;
  densityText: string;
  densityLevel: number;
  roastName: string;
  roastLevel: number;
  brewingMethods: string[];
  image: string;
  shortDescription: string;
  fullDescription: string;
}

export type SourceType =
  | 'Google Sheets'
  | 'Knowledge Base'
  | 'Web'
  | 'Google Sheets + Knowledge Base'
  | 'Google Sheets + Web';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: SourceType;
  duration?: string;
  category?: string;
  recommendedProductId?: string | null;
  recommendedProduct?: Product | null;
  hasRecommendation?: boolean;
  isOffTopic?: boolean;
  modelUsed?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string;
  updatedAt: string;
  source: string;
}

export interface LogEntry {
  id: string;
  date: string;
  question: string;
  answer: string;
  source: SourceType | string;
  duration: string;
  category: string;
  recommendedProductId?: string;
  recommendedProductName?: string;
  modelUsed?: string;
}

export interface AskQuestionResponse {
  answer: string;
  source: SourceType;
  duration: string;
  durationMs: number;
  category: string;
  recommendedProductId: string | null;
  recommendedProduct?: Product | null;
  hasRecommendation: boolean;
  recommendationReason?: string;
  isOffTopic: boolean;
  logged: boolean;
  logId?: string;
  modelUsed?: string;
}
