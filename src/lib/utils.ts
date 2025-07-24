import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to reset onboarding state (for testing)
export function resetOnboarding() {
  localStorage.removeItem('hasSeenOnboarding');
}

// Utility function to check if user has seen onboarding
export function hasSeenOnboarding(): boolean {
  return localStorage.getItem('hasSeenOnboarding') === 'true';
}
