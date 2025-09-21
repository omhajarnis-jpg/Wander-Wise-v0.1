

export interface User {
  name: string;
  email: string;
  mobile: string;
}

export interface TripDetails {
  destination: string;
  duration: string;
  interests: string;
}

export interface Activity {
  time: string;
  description: string;
  location?: string;
}

// NEW: Add FoodSuggestion interface
export interface FoodSuggestion {
  name:string;
  description: string;
  imageUrl: string;
}

// NEW: Add NearbySuggestion interface
export interface NearbySuggestion {
  name: string;
  description: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  // NEW fields
  dayImage: string;
  foodSuggestion: FoodSuggestion;
  nearbySuggestion?: NearbySuggestion;
  coords: {
    lat: number;
    lng: number;
  };
}

// NEW: Add weather forecast types
export interface DailyForecast {
  dayOfWeek: string;
  icon: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rain' | 'storm';
  highTemp: number;
  lowTemp: number;
  description: string;
}

export interface WeatherForecast {
  daily: DailyForecast[];
}

export interface Itinerary {
  tripTitle: string;
  bestTimeToVisit: string;
  days: DayPlan[];
  weatherForecast?: WeatherForecast;
}

// NEW: Add Storybook types
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