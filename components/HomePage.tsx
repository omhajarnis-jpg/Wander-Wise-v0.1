
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import type { User } from '../types';

interface HomePageProps {
  isLoggedIn: boolean;
  user: User | null;
  onStartJourney: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn, user, onStartJourney, onLogin, onLogout, onGoHome }) => {
  const backgroundImageUrl = 'https://media.admiddleeast.com/photos/67bf29d7cf3e24ef025e4ff6/16:9/w_2560%2Cc_limit/GettyImages-506115180.jpg';

  return (
    <div 
      className="flex flex-col min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 flex-grow flex flex-col">
        <Header isLoggedIn={isLoggedIn} user={user} onLogin={onLogin} onLogout={onLogout} onGoHome={onGoHome} />

        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <button
            onClick={onStartJourney}
            className="group flex items-center justify-center mx-auto space-x-3 px-10 py-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-xl rounded-full shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transform hover:scale-105 transition-all duration-300 ease-in-out animate-fade-in-up-fast"
            aria-label="Start your journey to plan a trip"
          >
            <span>Start Your Journey</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
