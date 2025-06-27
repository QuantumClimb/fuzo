import { secureStorage, securityLogger } from './security';

export interface UserBehavior {
  swipeHistory: SwipeEvent[];
  mapInteractions: MapInteraction[];
  savedPreferences: UserPreferences;
  learningProfile: LearningProfile;
}

export interface SwipeEvent {
  id: string;
  direction: 'left' | 'right' | 'up' | 'down';
  foodId: string;
  foodType: string;
  cuisine: string;
  timeOfDay: string;
  timestamp: Date;
}

export interface MapInteraction {
  id: string;
  eateryId: string;
  action: 'view' | 'save' | 'visit';
  cuisine: string;
  priceRange: string;
  timestamp: Date;
}

export interface UserPreferences {
  favoriteCuisines: string[];
  preferredMealTimes: string[];
  budgetPreference: 'low' | 'medium' | 'high';
  dietaryRestrictions: string[];
  discoveryRadius: number;
}

export interface LearningProfile {
  cuisineAffinities: Record<string, number>;
  timePreferences: Record<string, number>;
  pricePreferences: Record<string, number>;
  discoveryPatterns: string[];
}

class BehavioralEngine {
  private behavior: UserBehavior;

  constructor() {
    this.behavior = this.loadBehavior();
  }

  private loadBehavior(): UserBehavior {
    try {
      const stored = secureStorage.getItem('fuzo_behavior');
      if (stored) {
        securityLogger.logEvent('data_access', { 
          action: 'behavior_loaded' 
        }, 'low');
        return stored;
      }
    } catch (error) {
      securityLogger.logEvent('data_access', { 
        action: 'behavior_load_failed', 
        error: error.message 
      }, 'medium');
    }
    
    return {
      swipeHistory: [],
      mapInteractions: [],
      savedPreferences: {
        favoriteCuisines: [],
        preferredMealTimes: [],
        budgetPreference: 'medium',
        dietaryRestrictions: [],
        discoveryRadius: 50
      },
      learningProfile: {
        cuisineAffinities: {},
        timePreferences: {},
        pricePreferences: {},
        discoveryPatterns: []
      }
    };
  }

  private saveBehavior() {
    try {
      secureStorage.setItem('fuzo_behavior', this.behavior);
      securityLogger.logEvent('data_access', { 
        action: 'behavior_saved' 
      }, 'low');
    } catch (error) {
      securityLogger.logEvent('data_access', { 
        action: 'behavior_save_failed', 
        error: error.message 
      }, 'medium');
    }
  }

  recordSwipe(direction: string, foodId: string, foodType: string, cuisine: string) {
    const swipeEvent: SwipeEvent = {
      id: Date.now().toString(),
      direction: direction as any,
      foodId,
      foodType,
      cuisine,
      timeOfDay: this.getCurrentTimeCategory(),
      timestamp: new Date()
    };

    this.behavior.swipeHistory.push(swipeEvent);
    this.updateLearningProfile(swipeEvent);
    this.saveBehavior();
  }

  recordMapInteraction(eateryId: string, action: string, cuisine: string, priceRange: string) {
    const interaction: MapInteraction = {
      id: Date.now().toString(),
      eateryId,
      action: action as any,
      cuisine,
      priceRange,
      timestamp: new Date()
    };

    this.behavior.mapInteractions.push(interaction);
    this.saveBehavior();
  }

  private getCurrentTimeCategory(): string {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'dinner';
    return 'late-night';
  }

  private updateLearningProfile(swipe: SwipeEvent) {
    const { learningProfile } = this.behavior;
    
    // Update cuisine affinities based on right swipes
    if (swipe.direction === 'right') {
      learningProfile.cuisineAffinities[swipe.cuisine] = 
        (learningProfile.cuisineAffinities[swipe.cuisine] || 0) + 1;
    }

    // Update time preferences
    learningProfile.timePreferences[swipe.timeOfDay] = 
      (learningProfile.timePreferences[swipe.timeOfDay] || 0) + 1;
  }

  getPersonalizedRecommendations(items: any[]): any[] {
    const { learningProfile } = this.behavior;
    
    return items.sort((a, b) => {
      const aScore = this.calculateRecommendationScore(a, learningProfile);
      const bScore = this.calculateRecommendationScore(b, learningProfile);
      return bScore - aScore;
    });
  }

  private calculateRecommendationScore(item: any, profile: LearningProfile): number {
    let score = 0;
    
    // Cuisine preference scoring
    const cuisineAffinity = profile.cuisineAffinities[item.tag] || 0;
    score += cuisineAffinity * 2;
    
    // Time-based scoring
    const currentTime = this.getCurrentTimeCategory();
    const timePreference = profile.timePreferences[currentTime] || 0;
    score += timePreference;
    
    return score;
  }

  getUserPreferences(): UserPreferences {
    return this.behavior.savedPreferences;
  }

  getLearningProfile(): LearningProfile {
    return this.behavior.learningProfile;
  }

  resetBehavior() {
    secureStorage.removeItem('fuzo_behavior');
    this.behavior = this.loadBehavior();
    securityLogger.logEvent('data_access', { 
      action: 'behavior_reset' 
    }, 'medium');
  }
}

export const behavioralEngine = new BehavioralEngine();
