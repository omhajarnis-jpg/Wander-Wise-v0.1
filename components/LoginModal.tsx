
import React, { useState } from 'react';
import type { User } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onAuthenticate: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onAuthenticate }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const mockUser: User = {
        name: 'Wanderer',
        email: email,
        mobile: '123-456-7890',
      };
      onAuthenticate(mockUser);
    } else {
      if (name && email && password) {
        const newUser: User = {
          name: name,
          email: email,
          mobile: '987-654-3210',
        };
        onAuthenticate(newUser);
      }
    }
  };
  
  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'login' ? 'signup' : 'login'));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-md w-full text-gray-900 relative transform transition-all animate-fade-in-up-fast"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors" aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Join Wander Wise'}</h2>
          <p className="text-gray-500 mt-2 font-medium">Explore personalized travel experiences.</p>
        </div>
        
        <form onSubmit={handleAuthSubmit} className="space-y-6">
          {mode === 'signup' && (
             <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="James Bond"
                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium transition-all"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="wanderer@example.com"
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:bg-teal-600 transition-all duration-300 uppercase tracking-widest text-sm shadow-lg mt-4"
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
          <p className="text-center text-xs font-bold text-gray-400 tracking-wide mt-6 uppercase">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button type="button" onClick={toggleMode} className="text-teal-600 hover:text-teal-700 font-bold underline underline-offset-4 decoration-2">
              {mode === 'login' ? 'Create Account' : 'Log In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
