import React, { useState, useRef, useEffect } from 'react';
import type { Itinerary, User, DayPlan } from '../types';
import Footer from './Footer';
import L from 'leaflet';
import WeatherForecastDisplay from './WeatherForecastDisplay';

// Icons
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const FoodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
  </svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-amber-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
const PinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline-block text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);
const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v12a1 1 0 00.293.707l6 6a1 1 0 001.414 0l6-6A1 1 0 0018 16V4a1 1 0 00-.293-.707l-6-6a1 1 0 00-1.414 0l-6 6z" clipRule="evenodd" />
    </svg>
);

const StorybookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);


interface ItineraryDisplayProps {
  itinerary: Itinerary | null;
  onKnowMore: (day: DayPlan) => void;
  onBackToPlanner: () => void;
  isLoggedIn: boolean;
  user: User | null;
  onLogout: () => void;
  onGoHome: () => void;
  onGenerateStorybook: () => void;
  isGeneratingStorybook: boolean;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onKnowMore, onBackToPlanner, isLoggedIn, user, onLogout, onGoHome, onGenerateStorybook, isGeneratingStorybook }) => {
  const [heroImageUrl, setHeroImageUrl] = useState(itinerary?.days[0]?.dayImage || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop');
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  const daySectionsRef = useRef<(HTMLElement | null)[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!itinerary) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetIndex = daySectionsRef.current.findIndex(el => el === entry.target);
          if (targetIndex !== -1 && itinerary.days[targetIndex]) {
            setHeroImageUrl(itinerary.days[targetIndex].dayImage);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentRefs = daySectionsRef.current;
    currentRefs.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [itinerary]);
  
  useEffect(() => {
    if (isMapVisible && mapContainerRef.current && itinerary && !mapRef.current) {
        const L = (window as any).L;
        if (!L) return;

        const map = L.map(mapContainerRef.current).setView([19.7515, 75.7139], 6);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const markers: L.Marker[] = [];
        itinerary.days.forEach(day => {
            const marker = L.marker([day.coords.lat, day.coords.lng]).addTo(map)
                .bindPopup(`<b>Day ${day.day}: ${day.title}</b>`);
            markers.push(marker);
        });
        
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.5));
        }

        mapRef.current = map;
    }
  }, [isMapVisible, itinerary]);


  if (!itinerary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <h2 className="text-2xl font-bold mb-4">No Itinerary Found</h2>
        <button onClick={onGoHome} className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600">
          Plan a Trip
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
       <div 
        className="relative h-screen flex flex-col items-center justify-center text-white text-center px-4 bg-cover bg-center bg-fixed hero-background"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <button
            onClick={onBackToPlanner}
            className="absolute top-8 left-4 sm:left-6 lg:left-8 z-20 text-left focus:outline-none group"
            aria-label="Go back to planner"
        >
            <h2 className="text-3xl md:text-4xl font-bold tracking-wider text-white group-hover:text-teal-300 transition-colors">
                Wander Wise
            </h2>
            <p className="text-xs tracking-widest italic text-gray-300 group-hover:text-white transition-colors">
                Miles Brings Smiles...
            </p>
        </button>

        <div className="relative z-10 animate-fade-in-up-fast">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">{itinerary.tripTitle}</h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-300">Your personalized adventure awaits!</p>
        </div>
      </div>
      
      <div className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto text-center">
            <button
                onClick={() => setIsMapVisible(!isMapVisible)}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full transition-colors inline-flex items-center shadow-lg"
                aria-controls="map-container"
                aria-expanded={isMapVisible}
            >
                <MapIcon />
                {isMapVisible ? 'Hide Map View' : 'Show Trip on Map'}
            </button>
            {isMapVisible && (
                <div id="map-container" className="mt-8 animate-fade-in-up-fast max-w-5xl mx-auto">
                    <div ref={mapContainerRef} className="leaflet-container shadow-2xl"></div>
                </div>
            )}
        </div>
      </div>

      {itinerary.weatherForecast && <WeatherForecastDisplay forecast={itinerary.weatherForecast} />}

      {itinerary.days.map((day, index) => (
        <section 
          key={day.day} 
          ref={(el) => { daySectionsRef.current[index] = el; }}
          className="relative min-h-screen flex items-center justify-center py-20 px-4 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${day.dayImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="relative z-10 container mx-auto flex justify-center animate-fade-in-up-fast">

            <div className="bg-slate-50 bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full text-slate-800">
               <div className="p-8 md:p-12">
                  <h3 className="text-4xl font-bold text-teal-600 mb-6">Day {day.day}: {day.title}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-2xl font-semibold mb-4 border-b-2 border-teal-200 pb-2">Your Day's Plan</h4>
                        <ul className="space-y-4">
                            {day.activities.map((activity, actIndex) => (
                                <li key={actIndex} className="flex items-start">
                                    <div className="flex-shrink-0 w-24 text-right text-slate-600 font-semibold">{activity.time}</div>
                                    <div className="ml-4 flex-grow border-l-2 border-slate-300 pl-4">
                                        <p className="font-semibold text-slate-900">{activity.description}</p>
                                        {activity.location && (
                                            <p className="text-sm text-slate-500 flex items-center mt-1"><PinIcon /> {activity.location}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <h4 className="font-bold text-lg text-orange-800 mb-2 flex items-center"><FoodIcon /> Taste of {day.title.split("'")[0]}</h4>
                            <div className="flex items-center space-x-4">
                                <img src={day.foodSuggestion.imageUrl} alt={day.foodSuggestion.name} className="w-24 h-24 object-cover rounded-md shadow-sm"/>
                                <div>
                                    <h5 className="font-bold text-md text-orange-900">{day.foodSuggestion.name}</h5>
                                    <p className="text-sm text-orange-700 mt-1">{day.foodSuggestion.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                            <h4 className="font-bold text-lg text-teal-800 flex items-center"><CalendarIcon /> Best Time to Visit</h4>
                            <p className="text-teal-700 mt-1">{itinerary.bestTimeToVisit}</p>
                        </div>

                        {day.nearbySuggestion && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <h4 className="font-bold text-lg text-amber-800 flex items-center"><StarIcon /> Don't Miss Nearby!</h4>
                                <p className="text-amber-700 mt-1"><strong>{day.nearbySuggestion.name}:</strong> {day.nearbySuggestion.description}</p>
                            </div>
                        )}
                         <button
                            onClick={() => onKnowMore(day)}
                            className="w-full mt-4 px-6 py-3 bg-slate-800 text-white font-bold text-lg rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-400 transition-all transform hover:scale-105"
                          >
                            Know More About Your Trip
                          </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </section>
      ))}
       <button
        onClick={onGenerateStorybook}
        disabled={isGeneratingStorybook}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full p-4 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transform hover:scale-105 transition-all duration-300 ease-in-out z-30 flex items-center space-x-3 disabled:opacity-70 disabled:cursor-wait"
        aria-label="Create My Storybook"
      >
        {isGeneratingStorybook ? (
          <>
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="hidden md:inline pr-2">Crafting...</span>
          </>
        ) : (
          <>
            <StorybookIcon />
            <span className="hidden md:inline pr-2">Create My Storybook</span>
          </>
        )}
      </button>
      <Footer />
    </div>
  );
};

export default ItineraryDisplay;