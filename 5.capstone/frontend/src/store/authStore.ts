import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/config/api";

interface User {
  id: string;
  name: string;
  email: string;
  role?: "superadmin" | "tenantAdmin" | "user";
  tenantId?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        set({ token: null, user: null, isAuthenticated: false });
      },
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage",
    }
  )
);
