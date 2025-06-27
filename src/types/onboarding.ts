
export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  location: string;
  profilePic: string;
  cuisinePreferences: string[];
  diet: string;
  radius: number;
  mealTypes: string[];
  notifications: boolean;
  darkMode: boolean;
}

export interface OnboardingStep {
  id: string;
  component: string;
  title: string;
  canGoBack: boolean;
}
