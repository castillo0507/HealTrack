"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: { name: string; email: string };
  goals: { steps: number; waterCups: number; sleepHours: number };
  onSave: (profile: { name: string; email: string }, goals: { steps: number; waterCups: number; sleepHours: number }) => void;
}

export function ProfileModal({ open, onClose, profile, goals, onSave }: ProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [stepsGoal, setStepsGoal] = useState(String(goals.steps));
  const [waterGoal, setWaterGoal] = useState(String(goals.waterCups));
  const [sleepGoal, setSleepGoal] = useState(String(goals.sleepHours));
  const [savedMessage, setSavedMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave(
      { name: name.trim(), email: email.trim() },
      {
        steps: Number(stepsGoal),
        waterCups: Number(waterGoal),
        sleepHours: Number(sleepGoal),
      }
    );

    setSavedMessage("Profile saved.");
    setTimeout(() => setSavedMessage(""), 2000);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 transition" onClick={onClose} />
      <div className="fixed inset-x-0 top-0 z-50 flex max-h-screen w-full overflow-y-auto rounded-b-3xl border-b border-slate-200 bg-white p-6 shadow-2xl sm:inset-y-0 sm:right-0 sm:w-96 sm:rounded-none sm:rounded-l-3xl sm:border-b-0 sm:border-l">
        <div className="flex w-full flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-black">Profile</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
              aria-label="Close profile"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="profile-name" className="mb-1 block text-sm font-bold text-black">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none transition focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="mb-1 block text-sm font-bold text-black">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none transition focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="goal-steps" className="mb-1 block text-sm font-bold text-black">
                Steps Target
              </label>
              <input
                id="goal-steps"
                type="number"
                value={stepsGoal}
                onChange={(event) => setStepsGoal(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none transition focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="goal-water" className="mb-1 block text-sm font-bold text-black">
                Water Target (cups)
              </label>
              <input
                id="goal-water"
                type="number"
                value={waterGoal}
                onChange={(event) => setWaterGoal(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none transition focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="goal-sleep" className="mb-1 block text-sm font-bold text-black">
                Sleep Target (hours)
              </label>
              <input
                id="goal-sleep"
                type="number"
                step="0.5"
                value={sleepGoal}
                onChange={(event) => setSleepGoal(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none transition focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
            >
              Save Changes
            </button>

            {savedMessage && <p className="text-center text-sm text-brand-600">{savedMessage}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
