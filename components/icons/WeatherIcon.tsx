import React from 'react';

interface WeatherIconProps {
  icon: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rain' | 'storm';
  className?: string;
}

const SunnyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const CloudyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
);

const PartlyCloudyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.558A8.003 8.003 0 0118.04 8.002a8.004 8.004 0 01-1.09 3.998 5.002 5.002 0 00-6.95-3.44A5.002 5.002 0 005.96 12a8.002 8.002 0 016.04-6.442zM3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.002 5.002 0 108.9 9.002a4 4 0 00-5.9 6z" />
    </svg>
);

const RainyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zm7-2l.414-.414M11 15l.414-.414M13 13l.414-.414M15 15l.414-.414" />
    </svg>
);

const StormIcon = ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, className = 'w-12 h-12' }) => {
    switch(icon) {
        case 'sunny':
            return <SunnyIcon className={`${className} text-yellow-400`} />;
        case 'cloudy':
            return <CloudyIcon className={`${className} text-gray-400`} />;
        case 'partly-cloudy':
            return <PartlyCloudyIcon className={`${className} text-sky-400`} />;
        case 'rain':
            return <RainyIcon className={`${className} text-blue-500`} />;
        case 'storm':
            return <StormIcon className={`${className} text-slate-500`} />;
        default:
            return <CloudyIcon className={`${className} text-gray-400`} />;
    }
};

export default WeatherIcon;
