"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SleepQuality = "Poor" | "Fair" | "Good" | "Excellent";

export type WorkoutEntry = {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
};

export type DailySnapshot = {
  day: string;
  steps: number;
  waterCups: number;
  sleepHours: number;
  caloriesBurned: number;
};

type HealthGoals = {
  steps: number;
  waterCups: number;
  sleepHours: number;
};

type Profile = {
  name: string;
  email: string;
};

type AccountData = {
  profile: Profile;
  categories: string[];
  goals: HealthGoals;
  today: {
    steps: number;
    caloriesBurned: number;
    waterCups: number;
    sleepHours: number;
    sleepQuality: SleepQuality;
  };
  workouts: WorkoutEntry[];
  weeklyData: DailySnapshot[];
  monthlyData: { name: string; steps: number; waterCups: number; sleepHours: number }[];
  tipIndex: number;
};

type AccountRecord = {
  password: string;
  data: AccountData;
};

type HealthState = AccountData & {
  isAuthenticated: boolean;
  currentUserEmail: string | null;
  darkMode: boolean;
  accounts: Record<string, AccountRecord>;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type HealthContextValue = HealthState & {
  login: (email: string, password: string) => { ok: boolean; message: string };
  register: (input: RegisterInput) => { ok: boolean; message: string };
  logout: () => void;
  addSteps: (count: number) => void;
  addWater: (cups: number) => void;
  setSleep: (hours: number, quality: SleepQuality) => void;
  addWorkout: (entry: Omit<WorkoutEntry, "id" | "date">) => void;
  updateGoals: (goals: Partial<HealthGoals>) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  toggleCategory: (category: string) => void;
  refreshTip: () => void;
  toggleDarkMode: () => void;
};

const STORAGE_KEY = "healtrack-state-v2";

const categoryDefaults = [
  "Physical Activity",
  "Heart Health",
  "Sleep Tracking",
  "Hydration",
  "Mental Wellness",
  "Nutrition",
  "Exercise & Workouts",
  "Vital Signs",
];

const motivationalTips = [
  "Small actions each day create big health wins over time.",
  "Your future self is built by what you track and improve today.",
  "Hydrate early, move often, and rest well for better focus.",
  "Consistency beats intensity. Keep your streak alive today.",
  "Great health starts with one deliberate choice at a time.",
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeWeeklyZeros(): DailySnapshot[] {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    steps: 0,
    waterCups: 0,
    sleepHours: 0,
    caloriesBurned: 0,
  }));
}

function makeMonthlyZeros() {
  return ["Week 1", "Week 2", "Week 3", "Week 4"].map((name) => ({
    name,
    steps: 0,
    waterCups: 0,
    sleepHours: 0,
  }));
}

function makeEmptyAccountData(profile: Profile): AccountData {
  return {
    profile,
    categories: [...categoryDefaults],
    goals: {
      steps: 10000,
      waterCups: 8,
      sleepHours: 8,
    },
    today: {
      steps: 0,
      caloriesBurned: 0,
      waterCups: 0,
      sleepHours: 0,
      sleepQuality: "Good",
    },
    workouts: [],
    weeklyData: makeWeeklyZeros(),
    monthlyData: makeMonthlyZeros(),
    tipIndex: 0,
  };
}

function makeGuestState(): HealthState {
  const guestData = makeEmptyAccountData({ name: "", email: "" });

  return {
    ...guestData,
    isAuthenticated: false,
    currentUserEmail: null,
    darkMode: false,
    accounts: {},
  };
}

function pickActiveData(state: HealthState): AccountData {
  return {
    profile: state.profile,
    categories: state.categories,
    goals: state.goals,
    today: state.today,
    workouts: state.workouts,
    weeklyData: state.weeklyData,
    monthlyData: state.monthlyData,
    tipIndex: state.tipIndex,
  };
}

function withActiveData(state: HealthState, data: AccountData): HealthState {
  return {
    ...state,
    ...data,
  };
}

function safeParseState(value: string | null): HealthState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<HealthState>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (!parsed.accounts || typeof parsed.accounts !== "object") {
      return null;
    }

    return parsed as HealthState;
  } catch {
    return null;
  }
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HealthState>(makeGuestState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = safeParseState(localStorage.getItem(STORAGE_KEY));

    queueMicrotask(() => {
      if (saved) {
        setState(saved);
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  const value = useMemo<HealthContextValue>(() => {
    return {
      ...state,
      login: (email, password) => {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
          return { ok: false, message: "Please provide email and password." };
        }

        const account = state.accounts[normalizedEmail];

        if (!account) {
          return { ok: false, message: "Account not found. Please sign up first." };
        }

        if (account.password !== password) {
          return { ok: false, message: "Invalid password." };
        }

        setState((prev) => {
          const record = prev.accounts[normalizedEmail];
          if (!record) {
            return prev;
          }

          return withActiveData(
            {
              ...prev,
              isAuthenticated: true,
              currentUserEmail: normalizedEmail,
            },
            record.data,
          );
        });

        return { ok: true, message: "Welcome back!" };
      },
      register: ({ name, email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const cleanName = name.trim();

        if (!cleanName || !normalizedEmail || !password) {
          return { ok: false, message: "Please complete all fields." };
        }

        if (state.accounts[normalizedEmail]) {
          return { ok: false, message: "This email is already registered." };
        }

        const accountData = makeEmptyAccountData({
          name: cleanName,
          email: normalizedEmail,
        });

        setState((prev) => {
          const account: AccountRecord = {
            password,
            data: accountData,
          };

          return withActiveData(
            {
              ...prev,
              isAuthenticated: true,
              currentUserEmail: normalizedEmail,
              accounts: {
                ...prev.accounts,
                [normalizedEmail]: account,
              },
            },
            accountData,
          );
        });

        return { ok: true, message: "Account created. Your tracker starts fresh at zero." };
      },
      logout: () => {
        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return {
              ...prev,
              isAuthenticated: false,
              currentUserEmail: null,
            };
          }

          const email = prev.currentUserEmail;

          return {
            ...prev,
            isAuthenticated: false,
            currentUserEmail: null,
            accounts: {
              ...prev.accounts,
              [email]: {
                ...prev.accounts[email],
                data: pickActiveData(prev),
              },
            },
          };
        });
      },
      addSteps: (count) => {
        if (!Number.isFinite(count) || count <= 0) {
          return;
        }

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const updatedData: AccountData = {
            ...pickActiveData(prev),
            today: {
              ...prev.today,
              steps: prev.today.steps + count,
            },
          };

          return withActiveData(
            {
              ...prev,
              accounts: {
                ...prev.accounts,
                [email]: {
                  ...prev.accounts[email],
                  data: updatedData,
                },
              },
            },
            updatedData,
          );
        });
      },
      addWater: (cups) => {
        if (!Number.isFinite(cups) || cups <= 0) {
          return;
        }

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const updatedData: AccountData = {
            ...pickActiveData(prev),
            today: {
              ...prev.today,
              waterCups: prev.today.waterCups + cups,
            },
          };

          return withActiveData(
            {
              ...prev,
              accounts: {
                ...prev.accounts,
                [email]: {
                  ...prev.accounts[email],
                  data: updatedData,
                },
              },
            },
            updatedData,
          );
        });
      },
      setSleep: (hours, quality) => {
        if (!Number.isFinite(hours) || hours <= 0) {
          return;
        }

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const updatedData: AccountData = {
            ...pickActiveData(prev),
            today: {
              ...prev.today,
              sleepHours: hours,
              sleepQuality: quality,
            },
          };

          return withActiveData(
            {
              ...prev,
              accounts: {
                ...prev.accounts,
                [email]: {
                  ...prev.accounts[email],
                  data: updatedData,
                },
              },
            },
            updatedData,
          );
        });
      },
      addWorkout: (entry) => {
        if (!entry.type || entry.duration <= 0 || entry.calories <= 0) {
          return;
        }

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const workoutEntry: WorkoutEntry = {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          };

          const updatedData: AccountData = {
            ...pickActiveData(prev),
            workouts: [workoutEntry, ...prev.workouts],
            today: {
              ...prev.today,
              caloriesBurned: prev.today.caloriesBurned + entry.calories,
            },
          };

          return withActiveData(
            {
              ...prev,
              accounts: {
                ...prev.accounts,
                [email]: {
                  ...prev.accounts[email],
                  data: updatedData,
                },
              },
            },
            updatedData,
          );
        });
      },
      updateGoals: (goals) => {
        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const updatedData: AccountData = {
            ...pickActiveData(prev),
            goals: { ...prev.goals, ...goals },
          };

          return withActiveData(
            {
              ...prev,
              accounts: {
                ...prev.accounts,
                [email]: {
                  ...prev.accounts[email],
                  data: updatedData,
                },
              },
            },
            updatedData,
          );
        });
      },
      updateProfile: (profile) => {
        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const currentEmail = prev.currentUserEmail;
          const requestedEmail = profile.email ? normalizeEmail(profile.email) : currentEmail;
          const targetEmail = requestedEmail || currentEmail;

          if (targetEmail !== currentEmail && prev.accounts[targetEmail]) {
            return prev;
          }

          const updatedProfile: Profile = {
            ...prev.profile,
            ...profile,
            email: targetEmail,
          };

          const updatedData: AccountData = {
            ...pickActiveData(prev),
            profile: updatedProfile,
          };

          const oldRecord = prev.accounts[currentEmail];
          const nextAccounts = { ...prev.accounts };

          delete nextAccounts[currentEmail];
          nextAccounts[targetEmail] = {
            ...oldRecord,
            data: updatedData,
          };

          return withActiveData(
            {
              ...prev,
              currentUserEmail: targetEmail,
              accounts: nextAccounts,
            },
            updatedData,
          );
        });
      },
      toggleCategory: (category) => {
        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const exists = prev.categories.includes(category);
          const updatedData: AccountData = {
            ...pickActiveData(prev),
            categories: exists
              ? prev.categories.filter((item) => item !== category)
              : [...prev.categories, category],
          };

          return withActiveData(
            {
              ...prev,
              accounts: {
                ...prev.accounts,
                [email]: {
                  ...prev.accounts[email],
                  data: updatedData,
                },
              },
            },
            updatedData,
          );
        });
      },
      refreshTip: () => {
        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const updatedData: AccountData = {
            ...pickActiveData(prev),
            tipIndex: (prev.tipIndex + 1) % motivationalTips.length,
          };

          return withActiveData(
            {
              ...prev,
              accounts: {
                ...prev.accounts,
                [email]: {
                  ...prev.accounts[email],
                  data: updatedData,
                },
              },
            },
            updatedData,
          );
        });
      },
      toggleDarkMode: () => {
        setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
      },
    };
  }, [state]);

  if (!ready) {
    return null;
  }

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used inside HealthProvider");
  }
  return context;
}

export function useMotivationalTip(index: number) {
  return motivationalTips[index] ?? motivationalTips[0];
}

export const allCategories = categoryDefaults;
