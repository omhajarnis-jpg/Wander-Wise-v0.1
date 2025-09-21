import React, { useState, useEffect } from 'react';
import type { User, DayPlan } from '../types';
import Header from './Header';
import { generateStory } from '../services/geminiService';

// --- ICONS ---
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const FolkloreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.928A9.09 9.09 0 0112 15.125a9.09 9.09 0 01-2.258 3.472m-6.32 2.685a9.09 9.09 0 003.741-.479 3 3 0 00-4.682-2.72M12 18.72a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72M12 3.75a9.094 9.094 0 013.741.479 3 3 0 01-4.682 2.72M12 3.75a9.09 9.09 0 00-3.741.479 3 3 0 004.682 2.72m6.32 2.685a9.09 9.09 0 01-3.741.479 3 3 0 014.682 2.72" />
    </svg>
);

const MythologyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border">
        <svg className="animate-spin h-8 w-8 text-teal-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-semibold">Crafting your story...</p>
    </div>
);

// --- COMPONENT ---
interface TripDetailsPageProps {
  day: DayPlan | null;
  onBack: () => void;
  isLoggedIn: boolean;
  user: User | null;
  onLogout: () => void;
  onGoHome: () => void;
}
type StoryType = 'Historical' | 'Local Folklore' | 'Mythological';

const TripDetailsPage: React.FC<TripDetailsPageProps> = ({ day, onBack, isLoggedIn, user, onLogout, onGoHome }) => {
    const [storyContent, setStoryContent] = useState<{ type: StoryType; text: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            // Load English and Hindi voices
            const filteredVoices = availableVoices.filter(voice => voice.lang.startsWith('en') || voice.lang.startsWith('hi'));
            setVoices(filteredVoices);
            if (filteredVoices.length > 0 && !selectedVoice) {
                setSelectedVoice(filteredVoices[0]); // Set a default voice
            }
        };

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices(); 

        return () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
            speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);


    const handleSelectStory = async (type: StoryType) => {
        if (!day) return;
        
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
        
        setStoryContent(null);
        setIsGenerating(true);
        setError(null);
        
        try {
            const text = await generateStory(day.title, type);
            setStoryContent({ type, text });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleSpeech = () => {
        if (!storyContent?.text) return;
        
        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            if (!selectedVoice) {
                setError("No narrator voice is selected. Please choose one from the list.");
                return;
            }
            const utterance = new SpeechSynthesisUtterance(storyContent.text);
            utterance.voice = selectedVoice;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                console.error('Speech synthesis error:', e.error);
                let userMessage = 'Sorry, an audio playback error occurred.';
                if (e.error === 'network') {
                    userMessage = 'A network error occurred while generating speech. Please check your connection.';
                } else if (e.error === 'synthesis-failed') {
                    userMessage = 'The speech synthesis failed. Try a different voice or refresh the page.';
                } else if (e.error === 'voice-unavailable') {
                    userMessage = 'The selected narrator voice is unavailable. Please choose another one.';
                }
                setError(userMessage);
                setIsSpeaking(false);
            };
            speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };
    
    if (!day) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Day details not found.</h2>
            <button onClick={onGoHome} className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600">
              Go Home
            </button>
          </div>
        );
    }
    
    const storyTypes: { name: StoryType, icon: JSX.Element, description: string, colors: string }[] = [
        { name: 'Historical', icon: <HistoryIcon />, description: 'Uncover the factual past.', colors: 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 text-amber-900'},
        { name: 'Local Folklore', icon: <FolkloreIcon />, description: 'Hear tales passed down generations.', colors: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-900'},
        { name: 'Mythological', icon: <MythologyIcon />, description: 'Explore legends and deities.', colors: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-900'},
    ];

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800">
            <Header isLoggedIn={isLoggedIn} user={user} onLogin={() => {}} onLogout={onLogout} onGoHome={onGoHome} variant="dark"/>
            <main className="container mx-auto px-4 py-12">
                 <button onClick={onBack} className="mb-8 text-teal-600 hover:text-teal-800 font-semibold flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span>Back to Itinerary</span>
                </button>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="relative">
                        <img src={day.dayImage} alt={day.title} className="w-full h-80 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{day.title}</h1>
                        </div>
                    </div>
                    <div className="p-8 md:p-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Immersive Stories</h2>
                            <p className="text-gray-600 mb-8 max-w-3xl">
                                Select a theme to generate and listen to a short, AI-powered story that brings the history and culture of {day.title} to life.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {storyTypes.map((type) => (
                                    <button
                                        key={type.name}
                                        onClick={() => handleSelectStory(type.name)}
                                        disabled={isGenerating}
                                        className={`p-6 rounded-xl border-2 text-center transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:opacity-50 disabled:cursor-wait ${type.colors}`}
                                    >
                                        {type.icon}
                                        <h3 className="font-bold text-lg">{type.name}</h3>
                                        <p className="text-sm opacity-80">{type.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isGenerating && <div className="mt-8"><LoadingSpinner /></div>}
                        
                        {error && (
                            <div className="mt-8 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                                <p><strong>Oops!</strong> {error}</p>
                            </div>
                        )}

                        {storyContent && !isGenerating && (
                            <div className="mt-8 bg-gray-50 rounded-xl p-6 border animate-fade-in-up-fast">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                                    <div className="mb-4 sm:mb-0">
                                        <h3 className="font-bold text-xl text-gray-800 mb-2">{storyContent.type} Story</h3>
                                        {voices.length > 0 && (
                                            <div className="flex items-center">
                                                <label htmlFor="voice-select" className="text-sm font-medium text-gray-600 mr-2">Narrator:</label>
                                                <select
                                                    id="voice-select"
                                                    value={selectedVoice?.name || ''}
                                                    onChange={(e) => {
                                                        const voice = voices.find(v => v.name === e.target.value);
                                                        if (voice) setSelectedVoice(voice);
                                                    }}
                                                    className="w-full sm:w-auto text-sm rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                                                >
                                                    {voices.map(voice => (
                                                        <option key={voice.name} value={voice.name}>
                                                            {voice.name} ({voice.lang})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={toggleSpeech} 
                                        className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg hover:bg-teal-600 transition-colors focus:outline-none focus:ring-4 focus:ring-teal-300 self-center sm:self-start"
                                        aria-label={isSpeaking ? "Pause story" : "Play story"}
                                    >
                                        {isSpeaking ? <PauseIcon /> : <PlayIcon />}
                                    </button>
                                </div>
                                <div className="prose prose-lg text-gray-700 max-w-none whitespace-pre-wrap leading-relaxed">
                                    <p>{storyContent.text}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TripDetailsPage;