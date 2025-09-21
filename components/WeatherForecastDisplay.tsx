import React from 'react';
import type { WeatherForecast } from '../types';
import WeatherIcon from './icons/WeatherIcon';

interface WeatherForecastDisplayProps {
  forecast: WeatherForecast;
}

const WeatherForecastDisplay: React.FC<WeatherForecastDisplayProps> = ({ forecast }) => {
    if (!forecast || !forecast.daily || forecast.daily.length === 0) {
        return null;
    }
  
    return (
        <div className="bg-gray-800 text-white py-12 px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8">Weather Forecast for Your Trip</h2>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                    {forecast.daily.map((day, index) => (
                        <div key={index} className="flex-shrink-0 w-32 text-center bg-gray-700 rounded-lg p-4 shadow-lg animate-fade-in-up-fast" style={{animationDelay: `${index * 100}ms`}}>
                            <p className="font-bold text-lg">{day.dayOfWeek}</p>
                            <div className="my-2">
                                <WeatherIcon icon={day.icon} className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="font-semibold text-xl">{day.highTemp}°C</p>
                            <p className="text-gray-400">{day.lowTemp}°C</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherForecastDisplay;
