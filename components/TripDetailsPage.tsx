
import React, { useState, useEffect, useRef } from 'react';
import type { User, DayPlan } from '../types';
import Header from './Header';
import { generateStory, generateStoryAudio } from '../services/geminiService';

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center p-14 bg-white/90 backdrop-blur-xl rounded-[2rem] border-2 border-teal-100 shadow-xl animate-fade-in-up-fast">
        <svg className="animate-spin h-14 w-14 text-teal-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-900 font-bold text-xl uppercase tracking-widest">{message}</p>
    </div>
);

function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

interface TripDetailsPageProps {
  day: DayPlan | null;
  onBack: () => void;
  isLoggedIn: boolean;
  user: User | null;
  onLogout: () => void;
  onGoHome: () => void;
  onHelp: () => void;
}

type StoryType = 'Historical' | 'Local Folklore' | 'Mythological';
type Language = 'English' | 'Hindi' | 'Marathi';

const AVAILABLE_NARRATORS = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
const SUPPORTED_LANGUAGES: { name: Language; label: string }[] = [
    { name: 'English', label: 'English' },
    { name: 'Hindi', label: 'हिन्दी (Hindi)' },
    { name: 'Marathi', label: 'मराठी (Marathi)' }
];

const TripDetailsPage: React.FC<TripDetailsPageProps> = ({ day, onBack, isLoggedIn, user, onLogout, onGoHome, onHelp }) => {
    const [storyContent, setStoryContent] = useState<{ type: StoryType; text: string; language: Language } | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
    const [isListening, setIsListening] = useState<boolean>(false);
    const [lastCommand, setLastCommand] = useState<string>('');

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                setLastCommand(transcript);
                handleVoiceCommand(transcript);
            };
            recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed') { setError("Microphone access denied. Enable permissions for voice control."); }
                setIsListening(false);
            };
            recognition.onend = () => { if (isListening) recognition.start(); };
            recognitionRef.current = recognition;
        }
        return () => { stopAudio(); if (recognitionRef.current) recognitionRef.current.stop(); };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) { setError("Voice commands are not supported on this browser."); return; }
        if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
        else { setError(null); try { recognitionRef.current.start(); setIsListening(true); } catch (e) { setError("Could not access microphone."); } }
    };

    const handleVoiceCommand = (command: string) => {
        const cmd = command.trim();
        if (cmd.includes('play') || cmd.includes('start')) { playAudio(); }
        else if (cmd.includes('pause') || cmd.includes('hold')) { stopAudio(); }
        else if (cmd.includes('stop') || cmd.includes('finish')) { stopAudio(); }
        else if (cmd.includes('voice') || cmd.includes('change')) { cycleVoice(); }
    };

    const handleSelectStory = async (type: StoryType) => {
        if (!day) return;
        stopAudio(); setStoryContent(null); setIsGenerating(true); setError(null);
        try {
            const text = await generateStory(day.title, type, selectedLanguage);
            setStoryContent({ type, text, language: selectedLanguage });
        } catch (e) { setError(e instanceof Error ? e.message : 'Generation failed.'); }
        finally { setIsGenerating(false); }
    };

    const cycleVoice = () => {
        const currentIndex = AVAILABLE_NARRATORS.indexOf(selectedVoice);
        const nextIndex = (currentIndex + 1) % AVAILABLE_NARRATORS.length;
        setSelectedVoice(AVAILABLE_NARRATORS[nextIndex]);
        if (isSpeaking) { stopAudio(); setTimeout(playAudio, 150); }
    };

    const playAudio = async () => {
        if (!storyContent?.text) { setError("Select a theme to unlock the narration."); return; }
        if (isSpeaking) return;
        setError(null); setIsAudioLoading(true);
        try {
            if (!audioContextRef.current) { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); }
            const base64Audio = await generateStoryAudio(storyContent.text, selectedVoice);
            const audioData = decodeBase64(base64Audio);
            const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsSpeaking(false);
            audioSourceRef.current = source;
            source.start(); setIsSpeaking(true);
        } catch (e) { setError("Voice service unavailable. Check your connection."); }
        finally { setIsAudioLoading(false); }
    };

    const stopAudio = () => {
        if (audioSourceRef.current) { try { audioSourceRef.current.stop(); } catch (e) {} audioSourceRef.current = null; }
        setIsSpeaking(false);
    };
    
    if (!day) return null;
    
    const storyTypes: { name: StoryType, icon: string, description: string, color: string }[] = [
        { name: 'Historical', icon: '🏛️', description: 'Deep factual history.', color: 'bg-white border-gray-200 text-gray-900 hover:border-teal-500' },
        { name: 'Local Folklore', icon: '🎭', description: 'Tales from local elders.', color: 'bg-white border-gray-200 text-gray-900 hover:border-teal-500' },
        { name: 'Mythological', icon: '✨', description: 'Ancient gods and legends.', color: 'bg-white border-gray-200 text-gray-900 hover:border-teal-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans">
            <Header isLoggedIn={isLoggedIn} user={user} onLogin={() => {}} onLogout={onLogout} onGoHome={onGoHome} onHelp={onHelp} variant="dark"/>
            
            <main className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-fade-in-up-fast">
                    <button onClick={onBack} className="text-teal-600 hover:text-teal-800 font-bold flex items-center group transition-all uppercase tracking-widest text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Itinerary
                    </button>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4">
                         <div className="flex items-center bg-white px-6 py-3 rounded-full border border-gray-200 shadow-md">
                            <label htmlFor="language-select" className="text-[10px] font-bold text-gray-400 mr-3 uppercase tracking-widest">Language</label>
                            <select
                                id="language-select"
                                value={selectedLanguage}
                                onChange={(e) => { setSelectedLanguage(e.target.value as Language); if (storyContent) { setError("Language updated. Re-select a theme to generate the new story."); } }}
                                className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none uppercase"
                            >
                                {SUPPORTED_LANGUAGES.map(lang => ( <option key={lang.name} value={lang.name}>{lang.label}</option> ))}
                            </select>
                        </div>

                        <button 
                            onClick={toggleListening}
                            className={`flex items-center space-x-3 px-6 py-3 rounded-full font-bold shadow-md transition-all border-2 uppercase text-[10px] tracking-widest ${isListening ? 'bg-red-500 text-white border-red-500 ring-4 ring-red-100' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-500 hover:text-teal-600'}`}
                        >
                            <MicIcon />
                            <span>{isListening ? 'Listening' : 'Voice Controls'}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 mb-12">
                    <div className="relative h-[400px]">
                        <img src={day.dayImage} alt={day.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-12">
                            <span className="inline-block px-4 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 shadow-lg">Memory Capsule</span>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase">{day.title}</h1>
                        </div>
                    </div>

                    <div className="p-10 md:p-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight uppercase">Immersive Storytelling</h2>
                        <p className="text-xl text-gray-500 leading-relaxed mb-12 font-medium">
                            Experience the history of <span className="text-teal-600 font-bold">{day.title}</span> through curated AI narratives in <span className="text-teal-600 font-bold">{selectedLanguage}</span>.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            {storyTypes.map((type) => (
                                <button
                                    key={type.name}
                                    onClick={() => handleSelectStory(type.name)}
                                    disabled={isGenerating}
                                    className={`group relative p-8 rounded-2xl border-2 text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-wait ${type.color} ${storyContent?.type === type.name ? 'border-teal-500 ring-4 ring-teal-50' : ''}`}
                                >
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{type.icon}</div>
                                    <h3 className="font-bold text-xl mb-1 tracking-tight uppercase">{type.name}</h3>
                                    <p className="text-xs opacity-60 font-medium uppercase tracking-widest">{type.description}</p>
                                </button>
                            ))}
                        </div>

                        {isGenerating && <LoadingSpinner message={`Gathering stories in ${selectedLanguage}...`} />}
                        {isAudioLoading && <LoadingSpinner message="Preparing your AI guide..." />}
                        
                        {error && (
                            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border-2 border-red-100 flex items-center space-x-4 mb-10 animate-fade-in-up-fast">
                                <div className="text-3xl">⚠️</div>
                                <p className="font-bold text-lg">{error}</p>
                            </div>
                        )}

                        {storyContent && !isGenerating && (
                            <div className="bg-teal-50 rounded-[2.5rem] p-10 md:p-16 border-2 border-teal-100 shadow-inner relative">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center space-x-2 mb-2 justify-center md:justify-start">
                                             <span className="text-teal-600 font-bold uppercase tracking-widest text-xs">Narrator: {selectedVoice}</span>
                                             <span className="text-gray-300">•</span>
                                             <span className="text-teal-600 font-bold uppercase tracking-widest text-xs">Language: {storyContent.language}</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">A Tale of {day.title}</h3>
                                        
                                        <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                                <label htmlFor="voice-select" className="text-xs font-bold text-gray-400 mr-3 uppercase">Persona</label>
                                                <select
                                                    id="voice-select"
                                                    value={selectedVoice}
                                                    onChange={(e) => { stopAudio(); setSelectedVoice(e.target.value); }}
                                                    className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none uppercase"
                                                >
                                                    {AVAILABLE_NARRATORS.map(v => ( <option key={v} value={v}>{v}</option> ))}
                                                </select>
                                            </div>
                                            {lastCommand && (
                                                <div className="text-xs font-bold text-teal-600 bg-white px-4 py-2 rounded-full border border-teal-100 shadow-sm uppercase">
                                                    Command: "{lastCommand}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center">
                                        <button 
                                            onClick={isSpeaking ? stopAudio : playAudio} 
                                            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${isSpeaking ? 'bg-gray-800 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                                            aria-label={isSpeaking ? "Pause" : "Play"}
                                        >
                                            {isSpeaking ? <PauseIcon /> : <PlayIcon />}
                                        </button>
                                        <span className="mt-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                                            {isSpeaking ? 'Narrating...' : 'Listen to Story'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="relative font-serif">
                                    <div className="absolute -top-10 -left-6 text-9xl text-teal-500/10 opacity-30 select-none">“</div>
                                    <div className="prose prose-xl text-gray-700 max-w-none leading-relaxed italic whitespace-pre-wrap px-8 relative z-10">
                                        <p>{storyContent.text}</p>
                                    </div>
                                    <div className="absolute -bottom-16 -right-6 text-9xl text-teal-500/10 opacity-30 rotate-180 select-none">“</div>
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
