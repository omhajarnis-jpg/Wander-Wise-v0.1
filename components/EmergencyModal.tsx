
import React, { useState } from 'react';

interface EmergencyModalProps {
  onClose: () => void;
}

interface Location {
    lat: number;
    lng: number;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose }) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetLocation = () => {
        setIsLoading(true);
        setError(null);
        setLocation(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setIsLoading(false);
            },
            () => {
                setError("Unable to retrieve your location. Please ensure location services are enabled.");
                setIsLoading(false);
            }
        );
    };
    
    const emergencyContacts = [
        { name: 'Police', number: '100' },
        { name: 'Ambulance', number: '108' },
        { name: 'General Emergency', number: '112' },
    ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-gray-800 relative transform transition-all animate-fade-in-up-fast"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-600">Emergency Assistance</h2>
          <p className="text-gray-500 mt-1">Use these resources for immediate help.</p>
        </div>
        
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg mb-2">My Current Location</h3>
                <button
                    onClick={handleGetLocation}
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 flex items-center justify-center transition-colors"
                >
                     {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Getting Location...
                        </>
                    ) : 'Get My GPS Coordinates'}
                </button>
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                {location && (
                     <div className="mt-2 text-center bg-gray-100 p-2 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Latitude:</strong> {location.lat.toFixed(5)} | <strong>Longitude:</strong> {location.lng.toFixed(5)}
                        </p>
                    </div>
                )}
            </div>
             <div>
                <h3 className="font-semibold text-lg mb-2">Emergency Hotlines</h3>
                <div className="space-y-2">
                    {emergencyContacts.map(contact => (
                        <a 
                            key={contact.name} 
                            href={`tel:${contact.number}`}
                            className="w-full block text-center bg-red-100 text-red-700 font-bold py-3 px-4 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-4 focus:ring-red-300 transition-colors"
                        >
                            Call {contact.name} ({contact.number})
                        </a>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;