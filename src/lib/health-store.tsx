"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { defaultProfileAvatar, type ProfileAvatarId } from "../components/profile-avatar";

export type SleepQuality = "Poor" | "Fair" | "Good" | "Excellent";

export type WorkoutEntry = {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  intensity?: string;
  weightKg?: number;
  distanceKm?: number;
  sets?: number;
  reps?: number;
  rounds?: number;
  estimatedFatLossKg?: number;
  estimatedFatLossLbs?: number;
};

export type NutritionEntry = {
  id: string;
  foodLabel: string;
  mealType: string;
  category: string;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMg: number;
  date: string;
};

export type HeartRateEntry = {
  id: string;
  bpm: number;
  restingBpm?: number;
  hrvMs?: number;
  date: string;
};

export type TemperatureUnit = "C" | "F";

export type VitalSignsEntry = {
  id: string;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  temperatureUnit: TemperatureUnit;
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
  avatar: ProfileAvatarId;
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
    nutritionCalories: number;
    nutritionProteinGrams: number;
    nutritionCarbsGrams: number;
    nutritionFatGrams: number;
    nutritionFiberGrams: number;
    nutritionSugarGrams: number;
    nutritionSodiumMg: number;
  };
  workouts: WorkoutEntry[];
  nutritionEntries: NutritionEntry[];
  heartRateEntries: HeartRateEntry[];
  vitalSignsEntries: VitalSignsEntry[];
  weeklyData: DailySnapshot[];
  monthlyData: { name: string; steps: number; waterCups: number; sleepHours: number }[];
  tipIndex: number;
  activityDays?: string[];
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
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  addSteps: (count: number) => void;
  addWater: (cups: number) => void;
  setSleep: (hours: number, quality: SleepQuality) => void;
  addWorkout: (entry: Omit<WorkoutEntry, "id" | "date">) => void;
  addNutrition: (entry: Omit<NutritionEntry, "id" | "date">) => void;
  addHeartRate: (entry: Omit<HeartRateEntry, "id" | "date">) => void;
  addVitalSigns: (entry: Omit<VitalSignsEntry, "id" | "date">) => void;
  updateGoals: (goals: Partial<HealthGoals>) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  updatePassword: (password: string) => void;
  toggleCategory: (category: string) => void;
  refreshTip: () => void;
  toggleDarkMode: () => void;
  streak: number;
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
    // Start with no selected categories — only collect data when user opts in
    categories: [],
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
      nutritionCalories: 0,
      nutritionProteinGrams: 0,
      nutritionCarbsGrams: 0,
      nutritionFatGrams: 0,
      nutritionFiberGrams: 0,
      nutritionSugarGrams: 0,
      nutritionSodiumMg: 0,
    },
    workouts: [],
    nutritionEntries: [],
    heartRateEntries: [],
    vitalSignsEntries: [],
    weeklyData: makeWeeklyZeros(),
    monthlyData: makeMonthlyZeros(),
    tipIndex: 0,
    activityDays: [],
  };
}

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(activityDays: string[] | undefined) {
  if (!activityDays || activityDays.length === 0) return 0;

  const set = new Set(activityDays);
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const dayStr = isoDate(cursor);
    if (set.has(dayStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function makeGuestState(): HealthState {
  const guestData = makeEmptyAccountData({ name: "", email: "", avatar: defaultProfileAvatar });

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
    nutritionEntries: state.nutritionEntries,
    heartRateEntries: state.heartRateEntries,
    vitalSignsEntries: state.vitalSignsEntries,
    weeklyData: state.weeklyData,
    monthlyData: state.monthlyData,
    tipIndex: state.tipIndex,
    activityDays: state.activityDays ?? [],
  };
}

function withActiveData(state: HealthState, data: AccountData): HealthState {
  return {
    ...state,
    ...data,
  };
}

function normalizeAccountData(data: Partial<AccountData> | undefined, fallbackProfile: Profile): AccountData {
  const base = makeEmptyAccountData(data?.profile ?? fallbackProfile);

  return {
    ...base,
    ...data,
    profile: {
      ...base.profile,
      ...(data?.profile ?? {}),
      avatar: data?.profile?.avatar ?? base.profile.avatar,
    },
    goals: {
      ...base.goals,
      ...(data?.goals ?? {}),
    },
    today: {
      ...base.today,
      ...(data?.today ?? {}),
    },
    categories: data?.categories ?? base.categories,
    workouts: data?.workouts ?? base.workouts,
    nutritionEntries: data?.nutritionEntries ?? base.nutritionEntries,
    heartRateEntries: data?.heartRateEntries ?? base.heartRateEntries,
    vitalSignsEntries: data?.vitalSignsEntries ?? base.vitalSignsEntries,
    weeklyData: data?.weeklyData ?? base.weeklyData,
    monthlyData: data?.monthlyData ?? base.monthlyData,
    tipIndex: data?.tipIndex ?? base.tipIndex,
    activityDays: data?.activityDays ?? base.activityDays,
  };
}

function normalizeState(parsed: Partial<HealthState>): HealthState {
  const guest = makeGuestState();
  const normalizedAccounts: Record<string, AccountRecord> = {};

  for (const [email, record] of Object.entries(parsed.accounts ?? {})) {
    if (!record || typeof record !== "object") {
      continue;
    }

    normalizedAccounts[email] = {
      password: typeof record.password === "string" ? record.password : "",
      data: normalizeAccountData(record.data, guest.profile),
    };
  }

  const normalized: HealthState = {
    ...guest,
    ...parsed,
    accounts: normalizedAccounts,
    heartRateEntries: parsed.heartRateEntries ?? [],
    vitalSignsEntries: parsed.vitalSignsEntries ?? [],
  };

  const activeEmail = normalized.currentUserEmail;
  const activeRecord = activeEmail ? normalized.accounts[activeEmail] : undefined;

  if (!activeRecord) {
    return normalized;
  }

  return {
    ...normalized,
    ...activeRecord.data,
    accounts: normalized.accounts,
    currentUserEmail: activeEmail,
    isAuthenticated: Boolean(parsed.isAuthenticated),
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

    return normalizeState(parsed);
  } catch {
    return null;
  }
}

type PersistSnapshotInput = {
  userId: string;
  data: AccountData;
  darkMode: boolean;
};

async function persistSnapshotToSupabase({ userId, data, darkMode }: PersistSnapshotInput) {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = getSupabaseBrowserClient();
  const todayRow = {
    user_id: userId,
    tracked_on: isoDate(),
    steps: data.today.steps,
    water_cups: data.today.waterCups,
    sleep_hours: data.today.sleepHours,
    sleep_quality: data.today.sleepQuality,
    calories_burned: data.today.caloriesBurned,
  };

  const operations = [
    supabase.from("profiles").upsert(
      {
        user_id: userId,
        name: data.profile.name,
        email: data.profile.email,
        dark_mode: darkMode,
        tip_index: data.tipIndex,
      },
      { onConflict: "user_id" },
    ),
    supabase.from("health_goals").upsert(
      {
        user_id: userId,
        steps: data.goals.steps,
        water_cups: data.goals.waterCups,
        sleep_hours: data.goals.sleepHours,
      },
      { onConflict: "user_id" },
    ),
    supabase.from("daily_metrics").upsert(todayRow, { onConflict: "user_id,tracked_on" }),
    data.categories.length
      ? supabase.from("user_categories").upsert(
          data.categories.map((category) => ({
            user_id: userId,
            category,
            is_enabled: true,
          })),
          { onConflict: "user_id,category" },
        )
      : Promise.resolve({ error: null }),
    data.workouts.length
      ? supabase.from("workouts").upsert(
          data.workouts.map((entry) => ({
            id: entry.id,
            user_id: userId,
            workout_type: entry.type,
            duration_minutes: entry.duration,
            calories: entry.calories,
            performed_at: entry.date,
          })),
          { onConflict: "id" },
        )
      : Promise.resolve({ error: null }),
    data.nutritionEntries.length
      ? supabase.from("nutrition_entries").upsert(
          data.nutritionEntries.map((entry) => ({
            id: entry.id,
            user_id: userId,
            food_label: entry.foodLabel,
            meal_type: entry.mealType,
            category: entry.category,
            servings: entry.servings,
            calories: entry.calories,
            protein_grams: entry.proteinGrams,
            carbs_grams: entry.carbsGrams,
            fat_grams: entry.fatGrams,
            fiber_grams: entry.fiberGrams,
            sugar_grams: entry.sugarGrams,
            sodium_mg: entry.sodiumMg,
            eaten_at: entry.date,
          })),
          { onConflict: "id" },
        )
      : Promise.resolve({ error: null }),
    data.heartRateEntries.length
      ? supabase.from("heart_rate_entries").upsert(
          data.heartRateEntries.map((entry) => ({
            id: entry.id,
            user_id: userId,
            bpm: entry.bpm,
            resting_bpm: entry.restingBpm ?? null,
            hrv_ms: entry.hrvMs ?? null,
            measured_at: entry.date,
          })),
          { onConflict: "id" },
        )
      : Promise.resolve({ error: null }),
    data.vitalSignsEntries.length
      ? supabase.from("vital_signs_entries").upsert(
          data.vitalSignsEntries.map((entry) => ({
            id: entry.id,
            user_id: userId,
            systolic: entry.systolic,
            diastolic: entry.diastolic,
            spo2: entry.spo2,
            temperature: entry.temperature,
            temperature_unit: entry.temperatureUnit,
            measured_at: entry.date,
          })),
          { onConflict: "id" },
        )
      : Promise.resolve({ error: null }),
  ];

  const results = await Promise.all(operations);
  const failure = results.find((result) => result.error);

  if (failure?.error) {
    throw failure.error;
  }
}

async function fetchSnapshotFromSupabase(userId: string, fallbackEmail = ""): Promise<AccountData> {
  const supabase = getSupabaseBrowserClient();

  const [profileRes, goalsRes, todayRes, categoriesRes, workoutsRes, nutritionRes, hrRes, vitalsRes] = await Promise.all([
    supabase.from("profiles").select("name,email,tip_index").eq("user_id", userId).maybeSingle(),
    supabase.from("health_goals").select("steps,water_cups,sleep_hours").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_metrics").select("tracked_on,steps,water_cups,sleep_hours,sleep_quality,calories_burned").eq("user_id", userId).order("tracked_on", { ascending: false }).limit(1),
    supabase.from("user_categories").select("category,is_enabled").eq("user_id", userId),
    supabase.from("workouts").select("id,workout_type,duration_minutes,calories,performed_at").eq("user_id", userId).order("performed_at", { ascending: false }).limit(200),
    supabase.from("nutrition_entries").select("id,food_label,meal_type,category,servings,calories,protein_grams,carbs_grams,fat_grams,fiber_grams,sugar_grams,sodium_mg,eaten_at").eq("user_id", userId).order("eaten_at", { ascending: false }).limit(200),
    supabase.from("heart_rate_entries").select("id,bpm,resting_bpm,hrv_ms,measured_at").eq("user_id", userId).order("measured_at", { ascending: false }).limit(200),
    supabase.from("vital_signs_entries").select("id,systolic,diastolic,spo2,temperature,temperature_unit,measured_at").eq("user_id", userId).order("measured_at", { ascending: false }).limit(200),
  ]);

  // Build AccountData using available results, falling back to defaults
  const profileRow = profileRes.data ?? null;
  const goalsRow = goalsRes.data ?? null;
  const todayRow = (todayRes.data && todayRes.data.length > 0) ? todayRes.data[0] : null;
  const categories = (categoriesRes.data ?? []).filter((r: any) => r.is_enabled).map((r: any) => r.category);

  const account: AccountData = makeEmptyAccountData({ name: profileRow?.name ?? "", email: profileRow?.email ?? fallbackEmail, avatar: defaultProfileAvatar });

  if (goalsRow) {
    account.goals = {
      steps: goalsRow.steps ?? account.goals.steps,
      waterCups: goalsRow.water_cups ?? account.goals.waterCups,
      sleepHours: goalsRow.sleep_hours ?? account.goals.sleepHours,
    };
  }

  if (todayRow) {
    account.today = {
      ...account.today,
      steps: todayRow.steps ?? account.today.steps,
      waterCups: todayRow.water_cups ?? account.today.waterCups,
      sleepHours: todayRow.sleep_hours ?? account.today.sleepHours,
      sleepQuality: (todayRow.sleep_quality as SleepQuality) ?? account.today.sleepQuality,
      caloriesBurned: todayRow.calories_burned ?? account.today.caloriesBurned,
    };
    account.activityDays = [todayRow.tracked_on, ...(account.activityDays ?? [])];
  }

  account.categories = categories.length ? categories : account.categories;

  account.workouts = (workoutsRes.data ?? []).map((r: any) => ({ id: r.id, type: r.workout_type, duration: r.duration_minutes, calories: r.calories, date: r.performed_at }));

  account.nutritionEntries = (nutritionRes.data ?? []).map((r: any) => ({ id: r.id, foodLabel: r.food_label, mealType: r.meal_type, category: r.category, servings: r.servings, calories: r.calories, proteinGrams: r.protein_grams, carbsGrams: r.carbs_grams, fatGrams: r.fat_grams, fiberGrams: r.fiber_grams, sugarGrams: r.sugar_grams, sodiumMg: r.sodium_mg, date: r.eaten_at }));

  account.heartRateEntries = (hrRes.data ?? []).map((r: any) => ({ id: r.id, bpm: r.bpm, restingBpm: r.resting_bpm ?? undefined, hrvMs: r.hrv_ms ?? undefined, date: r.measured_at }));

  account.vitalSignsEntries = (vitalsRes.data ?? []).map((r: any) => ({ id: r.id, systolic: r.systolic, diastolic: r.diastolic, spo2: r.spo2, temperature: r.temperature, temperatureUnit: r.temperature_unit, date: r.measured_at }));

  return account;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HealthState>(makeGuestState());
  const [ready, setReady] = useState(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  useEffect(() => {
    const saved = safeParseState(localStorage.getItem(STORAGE_KEY));

    queueMicrotask(() => {
      if (saved) {
        setState(saved);
      }
      setReady(true);
    });

    if (!isSupabaseConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setSupabaseUserId(data.session?.user.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUserId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
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

  const syncActiveAccount = (data: AccountData, darkMode = state.darkMode) => {
    if (!isSupabaseConfigured || !supabaseUserId) {
      return;
    }

    void persistSnapshotToSupabase({
      userId: supabaseUserId,
      data,
      darkMode,
    });
  };

  const value = useMemo<HealthContextValue>(() => {
    return {
      ...state,
      login: async (email, password) => {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
          return { ok: false, message: "Please provide email and password." };
        }

        // Try Supabase auth first when configured
        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

            if (!error && (data.session || data.user)) {
              const sessionUserId = data.session?.user.id ?? data.user?.id ?? null;
              setSupabaseUserId(sessionUserId);

              let accountData: AccountData;
              if (sessionUserId) {
                accountData = await fetchSnapshotFromSupabase(sessionUserId, normalizedEmail);
              } else {
                accountData = makeEmptyAccountData({ name: "", email: normalizedEmail });
              }

              setState((prev) => {
                return withActiveData(
                  {
                    ...prev,
                    isAuthenticated: true,
                    currentUserEmail: normalizedEmail,
                    accounts: {
                      ...prev.accounts,
                      [normalizedEmail]: {
                        // Do not store remote password locally; preserve existing if present
                        password: prev.accounts[normalizedEmail]?.password ?? "",
                        data: accountData,
                      },
                    },
                  },
                  accountData,
                );
              });

              return { ok: true, message: "Welcome back!" };
            }
            // fallthrough to local auth when Supabase sign-in didn't succeed
          } catch (e) {
            // ignore and fallback to local
          }
        }

        // Local fallback (offline accounts)
        const account = state.accounts[normalizedEmail];

        if (!account) {
          return { ok: false, message: "Account not found. Please sign up first." };
        }

        if (account.password !== password) {
          return { ok: false, message: "Invalid password." };
        }

        setState((prev) => {
          const record = prev.accounts[normalizedEmail];
          if (!record) return prev;

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
      register: async ({ name, email, password }) => {
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

        let sessionUserId = supabaseUserId;

        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            const { data, error } = await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                data: {
                  name: cleanName,
                },
              },
            });

            if (!error) {
              sessionUserId = data.session?.user.id ?? data.user?.id ?? null;
              if (sessionUserId) setSupabaseUserId(sessionUserId);
            }
            // If signup failed or no session returned, fall back to local account creation below
          } catch {
            // ignore and create local-only account
          }
        }

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

        if (sessionUserId) {
          void persistSnapshotToSupabase({
            userId: sessionUserId,
            data: accountData,
            darkMode: false,
          });
        }

        return { ok: true, message: "Account created. Your tracker starts fresh at zero." };
      },
      logout: () => {
        if (isSupabaseConfigured) {
          void getSupabaseBrowserClient().auth.signOut();
          setSupabaseUserId(null);
        }

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return {
              ...prev,
              isAuthenticated: false,
              currentUserEmail: null,
            };
          }

          const email = prev.currentUserEmail;
          const activeData = pickActiveData(prev);

          if (supabaseUserId) {
            void persistSnapshotToSupabase({
              userId: supabaseUserId,
              data: activeData,
              darkMode: prev.darkMode,
            });
          }

          return {
            ...prev,
            isAuthenticated: false,
            currentUserEmail: null,
            accounts: {
              ...prev.accounts,
              [email]: {
                ...prev.accounts[email],
                data: activeData,
              },
            },
          };
        });
      },
      addSteps: (count) => {
        if (!Number.isFinite(count) || count <= 0) {
          return;
        }

        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const todayStr = isoDate();
          const existingDays = prev.activityDays ?? [];
          const updatedDays = existingDays.includes(todayStr) ? existingDays : [todayStr, ...existingDays];

          updatedData = {
            ...pickActiveData(prev),
            today: {
              ...prev.today,
              steps: prev.today.steps + count,
            },
            activityDays: updatedDays,
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      addWater: (cups) => {
        if (!Number.isFinite(cups) || cups <= 0) {
          return;
        }

        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const todayStr = isoDate();
          const existingDays = prev.activityDays ?? [];
          const updatedDays = existingDays.includes(todayStr) ? existingDays : [todayStr, ...existingDays];

          updatedData = {
            ...pickActiveData(prev),
            today: {
              ...prev.today,
              waterCups: prev.today.waterCups + cups,
            },
            activityDays: updatedDays,
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      setSleep: (hours, quality) => {
        if (!Number.isFinite(hours) || hours <= 0) {
          return;
        }

        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const todayStr = isoDate();
          const existingDays = prev.activityDays ?? [];
          const updatedDays = existingDays.includes(todayStr) ? existingDays : [todayStr, ...existingDays];

          updatedData = {
            ...pickActiveData(prev),
            today: {
              ...prev.today,
              sleepHours: hours,
              sleepQuality: quality,
            },
            activityDays: updatedDays,
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      addWorkout: (entry) => {
        if (!entry.type || entry.duration <= 0 || entry.calories <= 0) {
          return;
        }

        let updatedData: AccountData | null = null;

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

          const todayStr = isoDate();
          const existingDays = prev.activityDays ?? [];
          const updatedDays = existingDays.includes(todayStr) ? existingDays : [todayStr, ...existingDays];

          updatedData = {
            ...pickActiveData(prev),
            workouts: [workoutEntry, ...prev.workouts],
            today: {
              ...prev.today,
              caloriesBurned: prev.today.caloriesBurned + entry.calories,
            },
            activityDays: updatedDays,
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      addNutrition: (entry) => {
        if (!entry.foodLabel || entry.servings <= 0 || entry.calories <= 0) {
          return;
        }

        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const nutritionEntry: NutritionEntry = {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          };

          const todayStr = isoDate();
          const existingDays = prev.activityDays ?? [];
          const updatedDays = existingDays.includes(todayStr) ? existingDays : [todayStr, ...existingDays];

          updatedData = {
            ...pickActiveData(prev),
            nutritionEntries: [nutritionEntry, ...prev.nutritionEntries],
            today: {
              ...prev.today,
              nutritionCalories: prev.today.nutritionCalories + entry.calories,
              nutritionProteinGrams: prev.today.nutritionProteinGrams + entry.proteinGrams,
              nutritionCarbsGrams: prev.today.nutritionCarbsGrams + entry.carbsGrams,
              nutritionFatGrams: prev.today.nutritionFatGrams + entry.fatGrams,
              nutritionFiberGrams: prev.today.nutritionFiberGrams + entry.fiberGrams,
              nutritionSugarGrams: prev.today.nutritionSugarGrams + entry.sugarGrams,
              nutritionSodiumMg: prev.today.nutritionSodiumMg + entry.sodiumMg,
            },
            activityDays: updatedDays,
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      addHeartRate: (entry) => {
        if (!Number.isFinite(entry.bpm) || entry.bpm <= 0) {
          return;
        }

        if (entry.restingBpm !== undefined && (!Number.isFinite(entry.restingBpm) || entry.restingBpm <= 0)) {
          return;
        }

        if (entry.hrvMs !== undefined && (!Number.isFinite(entry.hrvMs) || entry.hrvMs <= 0)) {
          return;
        }

        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const todayStr = isoDate();
          const existingDays = prev.activityDays ?? [];
          const updatedDays = existingDays.includes(todayStr) ? existingDays : [todayStr, ...existingDays];

          const heartRateEntry: HeartRateEntry = {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          };

          updatedData = {
            ...pickActiveData(prev),
            heartRateEntries: [heartRateEntry, ...prev.heartRateEntries],
            activityDays: updatedDays,
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      addVitalSigns: (entry) => {
        if (!Number.isFinite(entry.systolic) || entry.systolic <= 0) {
          return;
        }

        if (!Number.isFinite(entry.diastolic) || entry.diastolic <= 0) {
          return;
        }

        if (!Number.isFinite(entry.spo2) || entry.spo2 <= 0 || entry.spo2 > 100) {
          return;
        }

        if (!Number.isFinite(entry.temperature)) {
          return;
        }

        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const todayStr = isoDate();
          const existingDays = prev.activityDays ?? [];
          const updatedDays = existingDays.includes(todayStr) ? existingDays : [todayStr, ...existingDays];

          const vitalSignsEntry: VitalSignsEntry = {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          };

          updatedData = {
            ...pickActiveData(prev),
            vitalSignsEntries: [vitalSignsEntry, ...prev.vitalSignsEntries],
            activityDays: updatedDays,
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      updateGoals: (goals) => {
        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          updatedData = {
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      updateProfile: (profile) => {
        let updatedData: AccountData | null = null;

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
            avatar: profile.avatar ?? prev.profile.avatar,
          };

          updatedData = {
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
      },
      updatePassword: (password) => {
        if (!password) {
          return;
        }

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;

          return {
            ...prev,
            accounts: {
              ...prev.accounts,
              [email]: {
                ...prev.accounts[email],
                password,
              },
            },
          };
        });
      },
      toggleCategory: (category) => {
        let updatedData: AccountData | null = null;

        setState((prev) => {
          if (!prev.currentUserEmail || !prev.accounts[prev.currentUserEmail]) {
            return prev;
          }

          const email = prev.currentUserEmail;
          const exists = prev.categories.includes(category);
          updatedData = {
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

        if (updatedData && supabaseUserId) {
          syncActiveAccount(updatedData);
        }
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
      streak: computeStreak(state.activityDays),
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
