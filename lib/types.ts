export type SharedTask = {
  id: string;
  pairId: string;
  title: string;
  assignedTo: 'Alejandro' | 'Mario' | 'Ambos';
  completed: boolean;
  dueDate?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  repeatDay?: number;
  createdAt?: { seconds: number } | Date | null;
  completedAt?: { seconds: number } | Date | null;
};

export const SHOPPING_CATEGORIES = [
  'Fruta y verdura',
  'Carne y pescado',
  'Lácteos',
  'Panadería',
  'Despensa',
  'Congelados',
  'Limpieza',
  'Higiene',
  'Bebidas',
  'Otros',
] as const;

export type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

export type ShoppingItem = {
  id: string;
  pairId: string;
  name: string;
  category: ShoppingCategory;
  completed: boolean;
  createdAt?: { seconds: number } | Date | null;
  completedAt?: { seconds: number } | Date | null;
  createdBy?: string;
};

export type CoupleGoal = {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string | null;
  targetCents?: number;
  targetDate?: string;
  contributions?: { id: string; amountCents: number; author: string; date: string }[];
};


export type CouplePlan = {
  id: string;
  title: string;
  dateTime?: string;
  completedAt: string;
};

export type CoupleDate = {
  id: string;
  title: string;
  date: string;
  yearly: boolean;
  reminderDays?: number;
};

export type CoupleWish = {
  id: string;
  title: string;
  owner: 'one' | 'two' | 'both';
  priceCents: number | null;
  url: string;
  completed: boolean;
};

export type CoupleData = {
  pairId: string;
  partnerOneName?: string;
  partnerTwoName?: string;
  relationshipStart?: string;
  nextPlan?: {
    title: string;
    dateTime?: string;
  } | null;
  goals?: CoupleGoal[];
  planHistory?: CouplePlan[];
  dates?: CoupleDate[];
  wishes?: CoupleWish[];
  questionHistory?: Record<string, NonNullable<CoupleData['dailyQuestion']>>;
  dailyQuestion?: {
    day: string;
    question: string;
    answers: Record<string, string>;
  };
  poll?: {
    id: string;
    title: string;
    options: string[];
    votes: Record<string, number>;
    secret?: boolean;
    commitments?: Record<string, string>;
  };
};
