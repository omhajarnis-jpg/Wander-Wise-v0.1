
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
      // Simulate login with a mock user
      const mockUser: User = {
        name: 'Wanderer',
        email: email, // use entered email for display
        mobile: '123-456-7890',
      };
      onAuthenticate(mockUser);
    } else {
      // Simulate signup with the entered details
      if (name && email && password) {
        const newUser: User = {
          name: name,
          email: email,
          mobile: '987-654-3210', // dummy mobile
        };
        onAuthenticate(newUser);
      }
    }
  };
  
  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'login' ? 'signup' : 'login'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-gray-800 relative transform transition-all animate-fade-in-up-fast"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{mode === 'login' ? 'Log In to Continue' : 'Create Your Account'}</h2>
          <p className="text-gray-500 mt-1">Start planning your next adventure with Wander Wise.</p>
        </div>
        
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
             <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Wanderer"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-colors"
          >
            {mode === 'login' ? 'Log In & Start Planning' : 'Sign Up & Start Planning'}
          </button>
          <p className="text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button type="button" onClick={toggleMode} className="font-medium text-teal-600 hover:underline focus:outline-none">
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
