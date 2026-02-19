
import React, { useState, useRef, useEffect } from 'react';
import type { Itinerary, User, DayPlan, TripDetails, TravelBuddy } from '../types';
import Footer from './Footer';
import Header from './Header';

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

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

interface ItineraryDisplayProps {
  itinerary: Itinerary | null;
  tripDetails: TripDetails | null;
  onKnowMore: (day: DayPlan) => void;
  onBackToPlanner: () => void;
  isLoggedIn: boolean;
  user: User | null;
  onLogout: () => void;
  onGoHome: () => void;
  onGenerateStorybook: () => void;
  isGeneratingStorybook: boolean;
  onHelp: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ 
  itinerary, 
  tripDetails, 
  onKnowMore, 
  onBackToPlanner, 
  isLoggedIn, 
  user, 
  onLogout, 
  onGoHome, 
  onGenerateStorybook, 
  isGeneratingStorybook,
  onHelp
}) => {
  const [heroImageUrl, setHeroImageUrl] = useState(itinerary?.days[0]?.dayImage || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop');
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  const daySectionsRef = useRef<(HTMLElement | null)[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!itinerary) return;
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
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
    currentRefs.forEach(ref => { if (ref) observer.observe(ref); });
    return () => { currentRefs.forEach(ref => { if (ref) observer.unobserve(ref); }); };
  }, [itinerary]);
  
  useEffect(() => {
    if (isMapVisible && mapContainerRef.current && itinerary && !mapRef.current) {
        const L = (window as any).L;
        if (!L) return;
        const map = L.map(mapContainerRef.current).setView([19.7515, 75.7139], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        const markers: any[] = [];
        itinerary.days.forEach((day, index) => {
            const marker = L.marker([day.coords.lat, day.coords.lng]).addTo(map)
                .bindPopup(`
                  <div class="text-gray-900 p-2">
                    <p class="font-bold text-teal-600 mb-1">Day ${day.day}: ${day.title}</p>
                    <p class="text-sm">${day.summary || 'Exploring this beautiful destination.'}</p>
                    <p class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Click to scroll to day</p>
                  </div>
                `);
            marker.on('click', () => {
                const element = daySectionsRef.current[index];
                if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
            markers.push(marker);
        });
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.5));
        }
        mapRef.current = map;
    }
  }, [isMapVisible, itinerary]);

  if (!itinerary) return null;

  const buddies = itinerary.suggestedBuddies || [];
  const sources = itinerary.sources || [];

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans">
      <div className="relative h-[65vh] overflow-hidden hero-background shadow-inner">
        <img 
          src={heroImageUrl} 
          alt="Destination" 
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <Header 
          isLoggedIn={isLoggedIn} 
          user={user} 
          onLogin={() => {}} 
          onLogout={onLogout} 
          onGoHome={onGoHome} 
          onHelp={onHelp} 
          variant="light" 
        />
        
        <div className="absolute bottom-16 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl tracking-tighter leading-tight">{itinerary.tripTitle}</h1>
            <div className="flex flex-wrap items-center gap-5 text-white/90 text-sm md:text-base">
                <span className="flex items-center bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/20 shadow-xl font-bold uppercase tracking-widest text-xs">
                    <CalendarIcon /> {tripDetails?.duration}
                </span>
                <span className="flex items-center bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/20 shadow-xl font-bold uppercase tracking-widest text-xs">
                    <StarIcon /> {tripDetails?.primaryInterest}
                </span>
                {tripDetails?.buddyPreference === 'strangers' && (
                   <span className="flex items-center bg-pink-500/20 backdrop-blur-xl px-5 py-2 rounded-full border border-pink-500/30 shadow-xl font-bold uppercase tracking-widest text-xs">
                      <HeartIcon /> Buddy Matching Active
                   </span>
                )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-8">
              {tripDetails?.buddyPreference === 'strangers' && buddies.length > 0 && (
                <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-pink-100 relative overflow-hidden">
                  <h3 className="text-xl font-black mb-6 flex items-center text-pink-600 uppercase tracking-widest">
                      <HeartIcon />
                      Travel Buddies
                  </h3>
                  <div className="space-y-5">
                    {buddies.map(buddy => (
                      <div key={buddy.id} className="flex items-center space-x-4 p-4 bg-pink-50 rounded-2xl border border-pink-100 hover:shadow-lg transition-all cursor-pointer">
                        <img src={buddy.avatar} alt={buddy.name} className="w-14 h-14 rounded-full object-cover border-2 border-pink-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{buddy.name}, {buddy.age}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-pink-500 font-bold">{buddy.compatibility}% Match</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-200">
                <h3 className="text-xl font-black mb-6 flex items-center uppercase tracking-widest">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Trip Essentials
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Best Time to Visit</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{itinerary.bestTimeToVisit}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Climate</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{itinerary.climate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-200">
                <h3 className="text-xl font-black mb-6 uppercase tracking-widest">Navigation</h3>
                <div className="flex flex-col space-y-4">
                   <button 
                    onClick={() => setIsMapVisible(!isMapVisible)}
                    className="flex items-center justify-center w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
                   >
                     <MapIcon /> {isMapVisible ? 'Hide Route Map' : 'View Route Map'}
                   </button>
                   <button 
                    onClick={onGenerateStorybook}
                    disabled={isGeneratingStorybook}
                    className="flex items-center justify-center w-full px-6 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-md hover:bg-teal-600 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                   >
                     {isGeneratingStorybook ? (
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        </svg>
                     ) : <StorybookIcon />}
                     <span className="ml-2">Create My Storybook</span>
                   </button>
                   <button onClick={onBackToPlanner} className="text-teal-600 hover:underline text-center font-medium mt-2">
                     Edit Preferences
                   </button>
                </div>
              </div>

              {sources.length > 0 && (
                <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100 shadow-sm">
                  <h3 className="text-xs font-black text-teal-800 uppercase tracking-widest mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verified Sources
                  </h3>
                  <ul className="space-y-4">
                    {sources.slice(0, 5).map((source, idx) => (
                      <li key={idx}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-start group">
                          <span className="truncate max-w-[200px]">{source.title}</span>
                          <ExternalLinkIcon />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isMapVisible && (
                <div className="bg-white rounded-[2rem] shadow-lg p-3 border border-gray-100 animate-fade-in-up-fast">
                   <div ref={mapContainerRef} className="rounded-xl overflow-hidden h-72 w-full"></div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-16">
            {itinerary.days.map((day, index) => (
              <section 
                key={day.day} 
                // FIX: Ref callback should return void to satisfy TypeScript in newer React versions
                ref={el => { daySectionsRef.current[index] = el; }}
                className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-lg scroll-mt-24"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-72 md:h-auto overflow-hidden">
                    <img 
                      src={day.dayImage} 
                      alt={day.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                  <div className="p-10 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Day {day.day}</span>
                      <h2 className="text-3xl font-bold mb-6 text-gray-900 leading-tight">{day.title}</h2>
                      <div className="space-y-4 mb-8">
                        {day.activities.slice(0, 3).map((act, i) => (
                          <div key={i} className="flex items-start">
                            <span className="text-teal-500 font-bold text-xs mt-1 w-20 flex-shrink-0 uppercase tracking-widest">{act.time}</span>
                            <p className="text-gray-600 text-sm font-medium">{act.description}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 mb-8 shadow-inner">
                        <div className="flex items-center mb-2">
                            <FoodIcon />
                            <h4 className="font-bold text-sm text-orange-800 uppercase tracking-widest">Local Taste</h4>
                        </div>
                        <p className="text-orange-900 font-bold text-lg mb-1">{day.foodSuggestion.name}</p>
                        <p className="text-xs text-orange-700 italic">{day.foodSuggestion.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onKnowMore(day)}
                      className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold hover:bg-teal-600 transition-all flex items-center justify-center space-x-2 shadow-md uppercase tracking-widest text-xs"
                    >
                      <span>Explore Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItineraryDisplay;
