export type SharedTask = {
  id: string;
  pairId: string;
  title: string;
  assignedTo: 'Alejandro' | 'Mario' | 'Ambos';
  completed: boolean;
  createdAt?: { seconds: number } | Date | null;
  completedAt?: { seconds: number } | Date | null;
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
