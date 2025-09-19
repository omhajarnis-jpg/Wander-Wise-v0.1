
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex justify-center items-center space-x-6 md:space-x-10 text-gray-300 text-sm">
        <a href="#" className="hover:text-white transition-colors">Contact Support</a>
        <a href="#" className="hover:text-white transition-colors">FAQs</a>
        <a href="#" className="hover:text-white transition-colors">Help</a>
      </div>
    </footer>
  );
};

export default Footer;
