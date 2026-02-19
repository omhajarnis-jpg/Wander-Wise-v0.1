
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { TripDetails, Itinerary, Storybook, TravelBuddy, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const foodImageDatabase: { [key: string]: string } = {
    'Vada Pav': 'https://c.ndtvimg.com/2023-01/m9i5s47o_vada-pav_625x300_20_January_23.jpg',
    'Pav Bhaji': 'https://www.vegrecipesofindia.com/wp-content/uploads/2021/10/pav-bhaji-recipe-1.jpg',
    'Bombil Fry': 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Kalyani__sweetspicy/Bombil_Fry_Recipe_Crispy_Bombay_Duck_Fry.jpg',
    'Misal Pav': 'https://www.cookwithmanali.com/wp-content/uploads/2015/11/Kolhapuri-Misal-Pav-500x500.jpg',
    'Bhakarwadi': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/bakarwadi-recipe.jpg',
    'Sabudana Khichdi': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/09/sabudana-khichdi-recipe.jpg',
    'Naan Qalia': 'https://i.ytimg.com/vi/i7N8ih_m-18/maxresdefault.jpg',
    'Puran Poli': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/02/puran-poli-recipe.jpg',
    'Solkadhi': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/sol-kadhi-recipe.jpg',
    'Konkani seafood curry': 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/shaheen_ali/Goan_Prawn_Curry_Recipe_with_Coconut.jpg',
    'Malvani Fish Curry': 'https://www.whiskaffair.com/wp-content/uploads/2020/07/Malvani-Fish-Curry-2-3.jpg',
    'Kombdi Vade': 'https://static.toiimg.com/thumb/63445862.cms?width=1200&height=900',
    'default': 'https://via.placeholder.com/400?text=Delicious+Food'
};

export const generateItinerary = async (details: TripDetails): Promise<Itinerary> => {
    const textModelSchema = {
        type: Type.OBJECT,
        properties: {
            tripTitle: { type: Type.STRING },
            bestTimeToVisit: { type: Type.STRING },
            climate: { type: Type.STRING },
            days: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        dayImage: { type: Type.STRING },
                        coords: {
                            type: Type.OBJECT,
                            properties: {
                                lat: { type: Type.NUMBER },
                                lng: { type: Type.NUMBER }
                            },
                            required: ["lat", "lng"]
                        },
                        activities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ["time", "description"]
                            }
                        },
                        foodSuggestion: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ["name", "description"]
                        }
                    },
                    required: ["day", "title", "summary", "dayImage", "coords", "activities", "foodSuggestion"]
                }
            },
            suggestedBuddies: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        age: { type: Type.INTEGER },
                        bio: { type: Type.STRING },
                        avatar: { type: Type.STRING },
                        interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                        compatibility: { type: Type.INTEGER }
                    },
                    required: ["id", "name", "age", "bio", "avatar", "interests", "compatibility"]
                }
            }
        },
        required: ["tripTitle", "days", "bestTimeToVisit", "climate"]
    };

    const prompt = `
        You are "Wander Wise", a creative travel concierge. Create a high-quality ${details.duration} itinerary for ${details.destination}.
        User Interests: ${details.interests}. 
        Buddy Preference: ${details.buddyPreference}.
        
        INSTRUCTIONS:
        1. Use your integrated Google Search tool to find up-to-date information on local festivals, weather trends, and current travel advice for ${details.destination}.
        2. Ensure the itinerary reflects current reality (e.g., if a place is closed or a new attraction is trending).
        3. Return valid JSON only matching the requested schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: textModelSchema,
                thinkingConfig: { thinkingBudget: 0 },
                tools: [{ googleSearch: {} }]
            },
        });
        
        const itineraryResult: Itinerary = JSON.parse(response.text.trim());

        // Extract Search Grounding metadata
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            const sources: GroundingSource[] = groundingChunks
                .filter(chunk => chunk.web)
                .map(chunk => ({
                    title: chunk.web.title,
                    uri: chunk.web.uri
                }));
            itineraryResult.sources = sources;
        }

        for (const day of itineraryResult.days) {
            if (day.foodSuggestion?.name) {
                const dbKey = Object.keys(foodImageDatabase).find(key => 
                    day.foodSuggestion.name.toLowerCase().includes(key.toLowerCase())
                );
                day.foodSuggestion.imageUrl = dbKey ? foodImageDatabase[dbKey] : foodImageDatabase['default'];
            }
        }
        
        return itineraryResult;
    } catch (error) {
        console.error("Itinerary generation failed:", error);
        throw new Error("Failed to craft your journey. Please try again.");
    }
};

export const generateStory = async (poiName: string, storyType: string, language: string = 'English'): Promise<string> => {
    const prompt = `
        You are a master storyteller. Tell a compelling 150-word story about ${poiName} with a ${storyType} theme.
        Language: ${language}.
        Tone: Immersive, evocative, and educational.
        IMPORTANT: Use the requested language (${language}) for the story content. 
        If the landmark is in Maharashtra or India, include local cultural flavor. 
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        return response.text.trim();
    } catch (error) {
        throw new Error(`The storytellers are resting. We couldn't generate the ${storyType} tale in ${language}.`);
    }
};

export const generateStoryAudio = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Please narrate this text naturally: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("Audio generation failed.");
        return base64Audio;
    } catch (error) {
        console.error("TTS generation failed:", error);
        throw new Error("Voice narration service is temporarily unavailable.");
    }
};

export const generateStorybook = async (itinerary: Itinerary, tripDetails: TripDetails): Promise<Storybook> => {
    const storybookSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            coverImage: { type: Type.STRING },
            pages: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        narrative: { type: Type.STRING },
                        image: { type: Type.STRING }
                    },
                    required: ["day", "title", "narrative", "image"]
                }
            }
        },
        required: ["title", "coverImage", "pages"]
    };

    const prompt = `Create a poetic travel storybook for a trip called "${itinerary.tripTitle}". Itinerary Data: ${JSON.stringify(itinerary)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storybookSchema,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw new Error("Storybook creation failed.");
    }
};
