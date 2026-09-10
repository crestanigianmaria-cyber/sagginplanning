import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDriverAvatar(name?: string | null, pic?: string | null): string | null {
  if (pic) return pic;
  if (!name) return null;
  const first = name.toLowerCase().trim().split(' ')[0];
  if (['francesco', 'marino', 'luca', 'claudio'].includes(first)) {
    return `/drivers/${first}.png`;
  }
  return null;
}
