export type SharedTask = {
  id: string;
  pairId: string;
  title: string;
  assignedTo: 'Alejandro' | 'Mario' | 'Ambos';
  completed: boolean;
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
};

export type CouplePlan = {
  id: string;
  title: string;
  dateTime?: string;
  completedAt: string;
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
};
