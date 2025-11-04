import { create } from 'zustand';

interface CelebrationData {
  type: "goal" | "personal_best" | "streak" | "badge";
  title: string;
  message: string;
  metric?: string;
  value?: number;
}

interface CelebrationState extends CelebrationData {
  isOpen: boolean;
  celebrate: (celebration: CelebrationData) => void;
  close: () => void;
}

export const useCelebration = create<CelebrationState>((set) => ({
  isOpen: false,
  type: "goal",
  title: "",
  message: "",
  metric: undefined,
  value: undefined,
  celebrate: (celebration) => set({ ...celebration, isOpen: true }),
  close: () => set({ isOpen: false }),
}));
