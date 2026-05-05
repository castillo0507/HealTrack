"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, X } from "lucide-react";
import { ProfileAvatarBadge, profileAvatars, type ProfileAvatarId } from "./profile-avatar";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: { name: string; email: string; avatar: ProfileAvatarId };
  onSave: (profile: { name: string; email: string; avatar: ProfileAvatarId }, password: string) => void;
}

export function ProfileModal({ open, onClose, profile, onSave }: ProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<ProfileAvatarId>(profile.avatar);
  const [savedMessage, setSavedMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave({ name: name.trim(), email: email.trim(), avatar }, password);

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
            <div>
              <h2 className="text-2xl font-black text-black">Profile</h2>
              <p className="mt-1 text-sm text-slate-500">User details, password, and avatar.</p>
            </div>
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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <ProfileAvatarBadge avatarId={avatar} className="h-14 w-14" iconClassName="h-7 w-7" />
                <div>
                  <p className="text-sm font-bold text-black">Profile avatar</p>
                  <p className="text-xs text-slate-500">Pick the avatar that appears on the dashboard.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {profileAvatars.map((option) => {
                  const Icon = option.icon;
                  const selected = option.id === avatar;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAvatar(option.id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition ${selected ? "border-brand-500 bg-white shadow-sm" : "border-slate-200 bg-white/70 hover:border-slate-300"}`}
                      aria-label={`Select ${option.label} avatar`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${option.badgeClassName}`}>
                        <Icon className={`h-5 w-5 ${option.iconClassName}`} />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

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
              <label htmlFor="profile-password" className="mb-1 flex items-center gap-2 text-sm font-bold text-black">
                <LockKeyhole className="h-4 w-4" />
                Password
              </label>
              <input
                id="profile-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none transition focus:border-brand-500"
                placeholder="Leave blank to keep current password"
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
