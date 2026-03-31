import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  name?: string;
  goals: string[];
  appsToBlock: string[];
  struggleTimes: string[];
  moodBaseline: number;
  closenessBaseline: number;
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
}

export interface DhikrSession {
  id: string;
  date: string;
  mood: number;
  closeness: number;
  type: "dhikr" | "dua";
  completedAt: string;
}

export interface AppState {
  profile: UserProfile;
  sessions: DhikrSession[];
  streak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  isPremium: boolean;
  onboardingStep: number;
}

interface AppContextType {
  state: AppState;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeSession: (session: Omit<DhikrSession, "id" | "completedAt">) => void;
  setOnboardingStep: (step: number) => void;
  setPremium: (value: boolean) => void;
  resetOnboarding: () => void;
  isLoading: boolean;
}

const defaultProfile: UserProfile = {
  goals: [],
  appsToBlock: [],
  struggleTimes: [],
  moodBaseline: 5,
  closenessBaseline: 5,
  onboardingComplete: false,
  notificationsEnabled: false,
};

const defaultState: AppState = {
  profile: defaultProfile,
  sessions: [],
  streak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
  isPremium: false,
  onboardingStep: 0,
};

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@dhikr_app_state";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({ ...defaultState, ...parsed });
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = useCallback(async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      // ignore
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => {
      const newState = {
        ...prev,
        profile: { ...prev.profile, ...updates },
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const completeSession = useCallback((session: Omit<DhikrSession, "id" | "completedAt">) => {
    setState((prev) => {
      const now = new Date();
      const today = now.toDateString();
      const newSession: DhikrSession = {
        ...session,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        completedAt: now.toISOString(),
      };

      let newStreak = prev.streak;
      let newLongest = prev.longestStreak;

      if (prev.lastCompletionDate !== today) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (prev.lastCompletionDate === yesterday.toDateString()) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
        newLongest = Math.max(newStreak, prev.longestStreak);
      }

      const newState = {
        ...prev,
        sessions: [newSession, ...prev.sessions].slice(0, 200),
        streak: newStreak,
        longestStreak: newLongest,
        lastCompletionDate: today,
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const setOnboardingStep = useCallback((step: number) => {
    setState((prev) => {
      const newState = { ...prev, onboardingStep: step };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const setPremium = useCallback((value: boolean) => {
    setState((prev) => {
      const newState = { ...prev, isPremium: value };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const resetOnboarding = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        onboardingStep: 0,
        profile: { ...prev.profile, onboardingComplete: false },
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  return (
    <AppContext.Provider value={{
      state,
      updateProfile,
      completeSession,
      setOnboardingStep,
      setPremium,
      resetOnboarding,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
