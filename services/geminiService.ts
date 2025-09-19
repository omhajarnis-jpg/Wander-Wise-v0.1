import { GoogleGenAI, Type } from "@google/genai";
import type { TripDetails, Itinerary, Storybook } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// A predefined "database" of food images to replace on-the-fly generation.
const foodImageDatabase: { [key: string]: string } = {
    'Vada Pav': 'https://c.ndtvimg.com/2023-01/m9i5s47o_vada-pav_625x300_20_January_23.jpg',
    'Pav Bhaji': 'https://www.vegrecipesofindia.com/wp-content/uploads/2021/10/pav-bhaji-recipe-1.jpg',
    'Bombil Fry': 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Kalyani__sweetspicy/Bombil_Fry_Recipe_Crispy_Bombay_Duck_Fry.jpg',
    'Misal Pav': 'https://www.cookwithmanali.com/wp-content/uploads/2015/11/Kolhapuri-Misal-Pav-500x500.jpg',
    'Bhakarwadi': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/bakarwadi-recipe.jpg',
    'Sabudana Khichdi': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/09/sabudana-khichdi-recipe.jpg',
    'Naan Qalia': 'https://i.ytimg.com/vi/i7N8ih_m-18/maxresdefault.jpg',
    'Puran Poli': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/02/puran-poli-recipe.jpg',
    'default': 'https://via.placeholder.com/400?text=Delicious+Food'
};

export const generateItinerary = async (details: TripDetails): Promise<Itinerary> => {
    // Schema for the text model, which should only return text data.
    const textModelSchema = {
        type: Type.OBJECT,
        properties: {
            tripTitle: {
                type: Type.STRING,
                description: "A creative and exciting title for the trip. For example, 'An Unforgettable 7-Day Journey Through Maharashtra'."
            },
            bestTimeToVisit: {
                type: Type.STRING,
                description: "Based on all planned locations, provide a single, consolidated best time to visit for the entire trip. For example, 'September to March'."
            },
            days: {
                type: Type.ARRAY,
                description: "An array of objects, where each object represents one day of the trip.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER, description: "The day number, starting from 1." },
                        title: { type: Type.STRING, description: "A short, catchy title for the day's theme. e.g., 'Mumbai's Coastal Charms'." },
                        dayImage: { type: Type.STRING, description: "A publicly accessible URL for a high-quality image representing the main attraction of the day. For example, an image of Marine Drive for a day in Mumbai." },
                        coords: {
                            type: Type.OBJECT,
                            description: "The geographic latitude and longitude of the day's main location/attraction.",
                            properties: {
                                lat: { type: Type.NUMBER, description: "Latitude of the location." },
                                lng: { type: Type.NUMBER, description: "Longitude of the location." }
                            },
                            required: ["lat", "lng"]
                        },
                        activities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "Suggested time for the activity, e.g., '9:00 AM' or 'Afternoon'." },
                                    description: { type: Type.STRING, description: "A detailed description of the activity." },
                                    location: { type: Type.STRING, description: "The specific location or address of the activity, if applicable." }
                                },
                                required: ["time", "description"]
                            }
                        },
                        foodSuggestion: {
                            type: Type.OBJECT,
                            description: "A suggestion for a local dish. Only provide the name and description.",
                            properties: {
                                name: { type: Type.STRING, description: "Name of the food, e.g., 'Vada Pav'." },
                                description: { type: Type.STRING, description: "A short, enticing description of the food." }
                            },
                            required: ["name", "description"]
                        },
                        nearbySuggestion: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Name of the suggested place." },
                                description: { type: Type.STRING, description: "A short description of why it's a must-visit." }
                            }
                        }
                    },
                    required: ["day", "title", "dayImage", "coords", "activities", "foodSuggestion"]
                }
            }
        },
        required: ["tripTitle", "days", "bestTimeToVisit"]
    };

    const researchDataForMaharashtra = `
        Here is some expert research on key destinations in Maharashtra. Use this as a primary source of information to create a high-quality, accurate, and appealing itinerary.

        ### 1. Mumbai – The City of Dreams
        *   **Region**: Western Maharashtra
        *   **Best Time to Visit**: November to February
        *   **Key Attractions**: Gateway of India (Lat: 18.9220, Lng: 72.8347), Marine Drive, Chhatrapati Shivaji Maharaj Terminus, Elephanta Caves.
        *   **Local Cuisine**: Vada Pav, Pav Bhaji, Bombil Fry.

        ### 2. Pune – The Cultural Capital
        *   **Region**: Western Maharashtra
        *   **Best Time to Visit**: September to February
        *   **Key Attractions**: Shaniwar Wada (Lat: 18.5196, Lng: 73.8554), Aga Khan Palace, Osho Ashram, Pataleshwar Cave Temple.
        *   **Local Cuisine**: Misal Pav, Bhakarwadi, Sabudana Khichdi.

        ### 3. Aurangabad – The Heritage Hub
        *   **Region**: Marathwada
        *   **Best Time to Visit**: October to March
        *   **Key Attractions**: Ajanta Caves, Ellora Caves (Lat: 20.0259, Lng: 75.1773), Bibi Ka Maqbara, Daulatabad Fort.
        *   **Local Cuisine**: Naan Qalia, Puran Poli.
    `;
    
    const prompt = `
        You are a world-class travel planner AI named "Wander Wise". Your goal is to create a detailed, exciting, and practical travel itinerary for a trip in Maharashtra, India.

        **CONTEXT: MAHARASHTRA TRAVEL GUIDE**
        ${researchDataForMaharashtra}

        **USER REQUEST**
        A user wants to plan a trip with the following details:
        - Destination: ${details.destination}
        - Duration: ${details.duration}
        - Interests: ${details.interests}

        **INSTRUCTIONS**
        Generate a personalized itinerary based on the user's preferences and the provided research data.
        
        First, you MUST provide a single, consolidated **bestTimeToVisit** for the entire trip that covers all destinations.
        
        Then, for each day, you MUST provide:
        1.  **dayImage**: A URL to a beautiful photograph of the main location.
        2.  **coords**: The latitude and longitude for the day's main location. Use the coordinates provided in the research data for the main attraction you select for the day.
        3.  **foodSuggestion**: Suggest one famous local dish. Provide ONLY its name and a brief description. DO NOT provide an imageUrl.
        4.  **activities**: A logical sequence of activities for the day.
        5.  **nearbySuggestion**: Suggest one nearby "must-visit" place.

        Provide the output in the requested JSON format, adhering strictly to the provided schema. Do not include a bestTimeToVisit field inside each day's plan.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: textModelSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const itineraryResult = JSON.parse(jsonText);

        // Assign images for each food suggestion from the predefined database.
        for (const day of itineraryResult.days) {
            if (day.foodSuggestion && day.foodSuggestion.name) {
                const foodName = day.foodSuggestion.name;
                // Find a matching key in the database, case-insensitive, to get the correct image URL.
                const dbKey = Object.keys(foodImageDatabase).find(key => 
                    key.toLowerCase() === foodName.toLowerCase()
                );
                day.foodSuggestion.imageUrl = dbKey ? foodImageDatabase[dbKey] : foodImageDatabase['default'];
            } else if (day.foodSuggestion) {
                // If there's a suggestion object but no name, use a default placeholder.
                day.foodSuggestion.imageUrl = foodImageDatabase['default'];
            }
        }
        
        return itineraryResult as Itinerary;
        
    } catch (error) {
        console.error("Error generating itinerary:", error);
        throw new Error("Failed to communicate with the AI planner. The itinerary could not be generated.");
    }
};

export const generateStory = async (poiName: string, storyType: string): Promise<string> => {
    const prompt = `
        You are a master storyteller and travel guide.
        Generate a short, immersive story for a tourist visiting a famous landmark.
        The story should be engaging, about 1 minute long (approximately 150 words), and suitable for an audio guide.

        Landmark: ${poiName}
        Story Theme: ${storyType}

        Craft a compelling narrative. Do not include any introductory or concluding phrases like "Here is the story:" or "I hope you enjoyed this tale.". Just provide the story itself.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text.trim();

    } catch (error) {
        console.error(`Error generating story for ${poiName}:`, error);
        throw new Error(`Failed to generate a ${storyType} story. Please try again.`);
    }
};

// NEW: Function to generate a storybook
export const generateStorybook = async (itinerary: Itinerary, tripDetails: TripDetails): Promise<Storybook> => {
    const storybookSchema = {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "A beautiful, evocative title for the storybook, based on the original trip title."
            },
            coverImage: {
                type: Type.STRING,
                description: "The URL of the image from the first day of the itinerary to be used as the cover."
            },
            pages: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        narrative: {
                            type: Type.STRING,
                            description: "A short, emotional, diary-style story (2-3 paragraphs) summarizing the day's events. The tone should be engaging, poetic, and reflective. It must be personalized based on the user's interests."
                        },
                        image: { type: Type.STRING, description: "The URL of the image for that specific day." }
                    },
                    required: ["day", "title", "narrative", "image"]
                }
            }
        },
        required: ["title", "coverImage", "pages"]
    };

    const prompt = `
        You are an AI-powered storyteller named "Wander Wise". Your task is to transform a travel itinerary into a beautiful, personalized digital storybook.

        **USER'S PREFERENCES**
        - Main Interest: ${tripDetails.interests}

        **TRIP ITINERARY**
        \`\`\`json
        ${JSON.stringify(itinerary, null, 2)}
        \`\`\`

        **INSTRUCTIONS**
        1.  Create an evocative **title** for the storybook based on the itinerary's trip title.
        2.  Use the image from Day 1 as the **coverImage**.
        3.  For each day in the itinerary, write a **narrative**. This narrative should be:
            -   **Emotional and Reflective:** Write it like a personal travel diary entry.
            -   **Personalized:** Emphasize aspects that align with the user's stated interests. For example, if they like history, focus on the historical significance of the places. If they are a foodie, highlight the culinary experiences.
            -   **Summarizing:** Weave the day's title and key activities into a flowing story.
            -   **Concise:** Keep it to 2-3 paragraphs per day.
        4.  For each page, include the day number, the day's original title, the newly generated narrative, and the day's original image URL.
        5.  Structure the final output in the requested JSON format, strictly following the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storybookSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Storybook;
    } catch (error) {
        console.error("Error generating storybook:", error);
        throw new Error("Failed to create your trip storybook. The AI storyteller might be busy dreaming up other adventures.");
    }
};
