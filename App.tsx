import React, { useState } from 'react';
import HomePage from './components/HomePage';
import LoginModal from './components/LoginModal';
import TripPlanner from './components/TripPlanner';
import ItineraryDisplay from './components/ItineraryDisplay';
import TripDetailsPage from './components/TripDetailsPage';
import StorybookDisplay from './components/StorybookDisplay'; // NEW: Import Storybook component
import { generateItinerary, generateStorybook } from './services/geminiService';
import type { User, TripDetails, Itinerary, DayPlan, Storybook } from './types';

type View = 'home' | 'planner' | 'itinerary' | 'details' | 'storybook'; // NEW: Add storybook view

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  // NEW: State for trip details and storybook
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [storybook, setStorybook] = useState<Storybook | null>(null);

  const handleStartJourney = () => {
    setView('planner');
  };

  const handleAuthentication = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setView('planner');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setView('home');
  };
  
  const handleGoHome = () => {
    setView('home');
    setItinerary(null);
    setError(null);
    setStorybook(null); // NEW: Reset storybook
  };

  const handleGeneratePlan = async (details: TripDetails) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setTripDetails(details); // NEW: Save trip details
    try {
      const generatedItinerary = await generateItinerary(details);
      setItinerary(generatedItinerary);
      setView('itinerary');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKnowMore = (day: DayPlan) => {
    setSelectedDay(day);
    setView('details');
  };
  
  const handleBackToItinerary = () => {
      setView('itinerary');
  };

  const handleBackToPlanner = () => {
    setView('planner');
    setItinerary(null); // NEW: Clear itinerary when going back to planner
  };

  // NEW: Handler to generate the storybook
  const handleCreateStorybook = async () => {
    if (!itinerary || !tripDetails) return;
    setIsLoading(true);
    setError(null);
    try {
        const generatedStorybook = await generateStorybook(itinerary, tripDetails);
        setStorybook(generatedStorybook);
        setView('storybook');
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage); // Can be displayed on the itinerary page
    } finally {
        setIsLoading(false);
    }
  };

  const renderView = () => {
    switch(view) {
      case 'planner':
        return (
          <TripPlanner
            onGeneratePlan={handleGeneratePlan}
            isLoading={isLoading}
            error={error}
            isLoggedIn={isLoggedIn}
            user={user}
            onLogin={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
          />
        );
      case 'itinerary':
        return (
          <ItineraryDisplay
            itinerary={itinerary}
            onKnowMore={handleKnowMore}
            onBackToPlanner={handleBackToPlanner}
            onGenerateStorybook={handleCreateStorybook} // NEW: Pass handler
            isGeneratingStorybook={isLoading} // NEW: Pass loading state
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
          />
        );
      case 'details':
        return (
            <TripDetailsPage 
                day={selectedDay}
                onBack={handleBackToItinerary}
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
                onGoHome={handleGoHome}
            />
        );
      // NEW: Case for storybook view
      case 'storybook':
        return (
            <StorybookDisplay
                storybook={storybook}
                onBack={handleBackToItinerary}
            />
        );
      case 'home':
      default:
        return (
          <HomePage
            isLoggedIn={isLoggedIn}
            user={user}
            onStartJourney={handleStartJourney}
            onLogin={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {renderView()}
      {showLoginModal && !isLoggedIn && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onAuthenticate={handleAuthentication}
        />
      )}
    </div>
  );
};

export default App;
