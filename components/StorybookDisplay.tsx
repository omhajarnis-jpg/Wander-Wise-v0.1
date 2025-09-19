import React from 'react';
import type { Storybook } from '../types';

interface StorybookDisplayProps {
    storybook: Storybook | null;
    onBack: () => void;
}

// --- ICONS ---
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const StorybookDisplay: React.FC<StorybookDisplayProps> = ({ storybook, onBack }) => {

    const handleDownload = () => {
        window.print();
    };

    if (!storybook) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-600">Could not find your storybook.</p>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');
                    .font-serif { font-family: 'Playfair Display', serif; }
                    .font-sans { font-family: 'Raleway', sans-serif; }
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .page-break {
                            page-break-after: always;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                `}
            </style>

            <div className="bg-gray-100 font-sans">
                <header className="no-print fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-50 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Your Travel Storybook</h1>
                    <div className="flex items-center space-x-4">
                        <button onClick={onBack} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                            <BackIcon /> Back to Itinerary
                        </button>
                        <button onClick={handleDownload} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors">
                            <DownloadIcon /> Download as PDF
                        </button>
                    </div>
                </header>

                <main className="printable-area pt-24 pb-12">
                    {/* Cover Page */}
                    <div className="page-break w-full h-screen flex flex-col items-center justify-center text-white bg-cover bg-center" style={{ backgroundImage: `url(${storybook.coverImage})` }}>
                         <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative z-10 text-center p-8 animate-fade-in-up-fast">
                            <h2 className="font-serif text-5xl md:text-7xl font-bold">{storybook.title}</h2>
                            <p className="mt-4 text-lg text-gray-200">A Wander Wise Memory Capsule</p>
                        </div>
                    </div>

                    {/* Content Pages */}
                    {storybook.pages.map((page) => (
                        <div key={page.day} className="page-break container mx-auto max-w-4xl p-8 my-8 bg-white shadow-lg">
                            <div className="border-b-2 border-gray-200 pb-4 mb-6">
                                <h3 className="font-serif text-4xl font-bold text-teal-700">Day {page.day}: {page.title}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                <div className="md:col-span-1">
                                    <img src={page.image} alt={`View from Day ${page.day}`} className="rounded-lg shadow-md w-full object-cover aspect-square" />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="prose prose-lg max-w-none text-gray-700 font-serif leading-relaxed whitespace-pre-wrap">
                                        <p>{page.narrative}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </>
    );
};

export default StorybookDisplay;
