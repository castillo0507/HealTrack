import type { ComponentType } from "react";
import { Brain, HeartPulse, Leaf, MoonStar, Sparkles, SunMedium, UserRound } from "lucide-react";

export type ProfileAvatarId = "sparkles" | "sun" | "heart" | "leaf" | "brain" | "moon" | "user";

export type ProfileAvatarOption = {
  id: ProfileAvatarId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeClassName: string;
  iconClassName: string;
};

export const profileAvatars: ProfileAvatarOption[] = [
  { id: "sparkles", label: "Sparkles", icon: Sparkles, badgeClassName: "bg-sky-100 text-sky-700", iconClassName: "text-sky-700" },
  { id: "sun", label: "Sun", icon: SunMedium, badgeClassName: "bg-amber-100 text-amber-700", iconClassName: "text-amber-700" },
  { id: "heart", label: "Heart", icon: HeartPulse, badgeClassName: "bg-rose-100 text-rose-700", iconClassName: "text-rose-700" },
  { id: "leaf", label: "Leaf", icon: Leaf, badgeClassName: "bg-emerald-100 text-emerald-700", iconClassName: "text-emerald-700" },
  { id: "brain", label: "Brain", icon: Brain, badgeClassName: "bg-indigo-100 text-indigo-700", iconClassName: "text-indigo-700" },
  { id: "moon", label: "Moon", icon: MoonStar, badgeClassName: "bg-violet-100 text-violet-700", iconClassName: "text-violet-700" },
  { id: "user", label: "User", icon: UserRound, badgeClassName: "bg-slate-100 text-slate-700", iconClassName: "text-slate-700" },
];

export const defaultProfileAvatar: ProfileAvatarId = "sparkles";

export function getProfileAvatar(avatarId?: ProfileAvatarId | null) {
  return profileAvatars.find((avatar) => avatar.id === avatarId) ?? profileAvatars[0];
}

export function ProfileAvatarBadge({
  avatarId,
  className = "",
  iconClassName = "h-5 w-5",
}: {
  avatarId?: ProfileAvatarId | null;
  className?: string;
  iconClassName?: string;
}) {
  const avatar = getProfileAvatar(avatarId);
  const Icon = avatar.icon;

  return (
    <span className={`inline-flex items-center justify-center rounded-full ${avatar.badgeClassName} ${className}`}>
      <Icon className={`${iconClassName} ${avatar.iconClassName}`} />
    </span>
  );
}