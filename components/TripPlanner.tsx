import React, { useState } from 'react';
import Header from './Header';
import type { TripDetails, User } from '../types';

interface TripPlannerProps {
  onGeneratePlan: (details: TripDetails) => void;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  user: User | null;
  onLogout: () => void;
  onGoHome: () => void;
  onLogin: () => void;
}

interface PreferenceCardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
  titleFontClass?: string;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({ imageUrl, title, subtitle, onClick, titleFontClass }) => (
  <div className="text-center cursor-pointer group transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95" onClick={onClick}>
    <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
      <img
        src={imageUrl}
        alt={title}
        className="object-cover w-full h-64 md:h-80 transform group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className={`text-3xl font-bold ${titleFontClass || ''}`}>{title}</h3>
      </div>
    </div>
    {subtitle && <p className="mt-3 text-sm text-gray-500">{subtitle}</p>}
  </div>
);


const questionsData = [
  {
    id: 1,
    question: "Which state would you like to visit?",
    key: 'state',
    options: [
      { title: 'Maharashtra', subtitle: 'Rajgad fort, Maharashtra', imageUrl: 'https://wallpaperaccess.com/full/6522957.png', titleFontClass: "font-['Gagalin']" },
      { title: 'Goa', subtitle: 'Hollant Beach, Goa', imageUrl: 'https://im.whatshot.in/img/2020/Sep/hollant-beach-2-1600674801.jpg', titleFontClass: "font-['Gagalin']" },
    ],
    gridCols: 'grid-cols-1 md:grid-cols-2',
  },
  {
    id: 2,
    question: "What Would You Prefer?",
    key: 'interest',
    options: [
      { title: 'Historical Sites', imageUrl: 'https://www.shivrajyabhishek.com/wp-content/uploads/2025/05/IMG-20240608-WA0233-scaled.jpg' },
      { title: 'Modern Cities', imageUrl: 'https://www.mypunepulse.com/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-20-at-12.34.28-PM-1-e1732086564846.jpeg' },
      { title: 'Natural Beauty', imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/f4/12/90/thoseghar-waterfall.jpg?w=1200&h=1200&s=1' },
      { title: "Beach's and Tropical Regions", imageUrl: 'https://res3.supawork.ai/application/aigc/result/common/2025/9/16/f966bc6057f94634866d374d3af3e2ff.jpg' },
      { title: 'Religious Places', imageUrl: 'https://www.revv.co.in/blogs/wp-content/uploads/2021/02/famous-templein-maharashtra.jpg' },
    ],
    gridCols: 'grid-cols-2 md:grid-cols-3',
  },
  {
    id: 3,
    question: "Which Types of Cuisines Would You Prefer?",
    key: 'cuisine',
    options: [
        { title: 'Local Cuisines', imageUrl: 'https://img.freepik.com/premium-photo/maharashtrian-food-thali-platter-mumbai-style-meal-from-indian_466689-5456.jpg?w=1060' },
        { title: 'Others', imageUrl: 'https://images.saymedia-content.com/.image/t_share/MTkyNzcyNDY5OTE5MzI4MDg3/the-top-10-italian-dishes.jpg' },
    ],
    gridCols: 'grid-cols-1 md:grid-cols-2',
  },
  {
    id: 4,
    question: "What is your ideal vibe?",
    key: 'vibe',
    options: [
      { title: 'Crowded Places', imageUrl: 'https://www.tourmyindia.com/blog//wp-content/uploads/2016/12/amboli.jpg' },
      { title: 'Peaceful and calm places', imageUrl: 'https://thewandertherapy.com/wp-content/uploads/2024/06/3.places-to-visit-in-maharashtra.jpg' },
    ],
    gridCols: 'grid-cols-1 md:grid-cols-2',
  }
];

const TripPlanner: React.FC<TripPlannerProps> = ({ onGeneratePlan, isLoading, error, isLoggedIn, user, onLogout, onGoHome, onLogin }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    state: '',
    interest: '',
    cuisine: '',
    vibe: '',
    duration: '7',
  });

  const handleSelection = (key: string, value: string) => {
    setPreferences(prev => ({...prev, [key]: value }));
    // A small delay lets the click animation play before moving to the next step
    setTimeout(() => {
        setStep(prev => prev + 1);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onLogin();
      return;
    }
    const combinedInterests = `Primary interest is ${preferences.interest}. Prefers ${preferences.cuisine} and enjoys ${preferences.vibe}.`;
    onGeneratePlan({
      destination: preferences.state,
      duration: `${preferences.duration} days`,
      interests: combinedInterests,
    });
  };

  const currentQuestion = questionsData[step - 1];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header isLoggedIn={isLoggedIn} user={user} onLogin={onLogin} onLogout={onLogout} onGoHome={onGoHome} variant="dark"/>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
            <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500 progress-bar-shimmer" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
          
          {step <= questionsData.length && currentQuestion && (
            <div key={step} className="animate-fade-in-up-fast">
              <h2 className="text-3xl font-bold text-center mb-8">{currentQuestion.question}</h2>
              <div className={`grid ${currentQuestion.gridCols} gap-6 md:gap-8`}>
                {currentQuestion.options.map(option => (
                  <PreferenceCard
                    key={option.title}
                    {...option}
                    onClick={() => handleSelection(currentQuestion.key, option.title)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
             <div className="animate-fade-in-up-fast max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-center mb-2">Almost there!</h2>
                <p className="text-center text-gray-500 mb-8">Just one last detail to perfect your adventure.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">What's the duration of your trip?</label>
                        <input
                            type="number"
                            id="duration"
                            value={preferences.duration}
                            onChange={(e) => setPreferences({...preferences, duration: e.target.value})}
                            min="1"
                            max="10"
                            placeholder="e.g., 7"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum 10 days.</p>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading && isLoggedIn}
                        className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:bg-teal-300 flex items-center justify-center transition-colors"
                    >
                        {isLoading && isLoggedIn ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Crafting Your Journey...
                            </>
                        ) : (
                            isLoggedIn ? 'Generate My Itinerary' : 'Log In to Generate Itinerary'
                        )}
                    </button>
                </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default TripPlanner;