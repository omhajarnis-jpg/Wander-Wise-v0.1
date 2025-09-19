
import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import UserIcon from './icons/UserIcon';

// FIX: Add optional variant prop to support different color schemes
interface HeaderProps {
  isLoggedIn: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  variant?: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, user, onLogin, onLogout, onGoHome, variant = 'light' }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDark = variant === 'dark';

  return (
    <header className={`py-6 px-4 sm:px-6 lg:px-8 ${isDark ? 'text-gray-800' : 'text-white'}`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Section: Profile (when logged in) */}
        <div className="w-1/3">
          {isLoggedIn && user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
              >
                <UserIcon className={`w-8 h-8 rounded-full p-1 ${isDark ? 'bg-gray-200 text-gray-600' : 'bg-white bg-opacity-20 text-white'}`} />
                <span className="hidden sm:inline font-semibold">{user.name}</span>
              </button>
              {isProfileOpen && (
                <div className={`absolute left-0 mt-2 w-64 rounded-lg shadow-xl py-2 animate-fade-in-up-fast ${isDark ? 'bg-white' : 'bg-gray-800 bg-opacity-90'}`}>
                  <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-200' : 'border-gray-700'}`}>
                    <p className={`font-bold ${isDark ? 'text-gray-800' : 'text-white'}`}>{user.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.mobile}</p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsProfileOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${isDark ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Section: Title */}
        <div className="w-1/3 text-center">
          <button onClick={onGoHome} className="focus:outline-none">
            <h2 className="text-4xl font-bold tracking-wider cursor-pointer">
              Wander Wise
            </h2>
            <p className={`text-sm tracking-widest italic transition-colors duration-300 ${isDark ? 'text-gray-500 hover:text-gray-900' : 'text-gray-300 hover:text-white'}`}>Miles Brings Smiles...</p>
          </button>
        </div>

        {/* Right Section: Login (when logged out) */}
        <div className="w-1/3 text-right">
          {!isLoggedIn && (
            <button
              onClick={onLogin}
              className={`font-semibold py-2 px-6 rounded-full border transition-colors duration-300 ${isDark ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300' : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white border-white border-opacity-30'}`}
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
