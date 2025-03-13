import { create } from 'zustand';

type UserState = {
  user: { id: string; name: string; role: string; email: string } | null;
  setUser: (user: UserState['user']) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));