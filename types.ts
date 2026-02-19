
export interface User {
  name: string;
  email: string;
  mobile: string;
}

export interface TravelBuddy {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  interests: string[];
  compatibility: number;
}

export interface TripDetails {
  destination: string;
  duration: string;
  interests: string;
  primaryInterest: string;
  buddyPreference: 'solo' | 'friends' | 'strangers';
}

export interface Activity {
  time: string;
  description: string;
  location?: string;
}

export interface FoodSuggestion {
  name:string;
  description: string;
  imageUrl: string;
}

export interface NearbySuggestion {
  name: string;
  description: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DayPlan {
  day: number;
  title: string;
  summary: string;
  activities: Activity[];
  dayImage: string;
  foodSuggestion: FoodSuggestion;
  nearbySuggestion?: NearbySuggestion;
  coords: {
    lat: number;
    lng: number;
  };
}

export interface Itinerary {
  tripTitle: string;
  bestTimeToVisit: string;
  climate: string;
  days: DayPlan[];
  suggestedBuddies?: TravelBuddy[];
  sources?: GroundingSource[];
}

export interface StorybookPage {
  day: number;
  title: string;
  narrative: string;
  image: string;
}

export interface Storybook {
  title: string;
  coverImage: string;
  pages: StorybookPage[];
}

export interface DailyForecast {
  dayOfWeek: string;
  icon: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rain' | 'storm';
  highTemp: number;
  lowTemp: number;
}

export interface WeatherForecast {
  daily: DailyForecast[];
}
