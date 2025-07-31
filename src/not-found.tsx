

import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./hooks/useTheme";



const NotFound: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen relative overflow-hidden transition-colors duration-300
        ${isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-100 to-blue-300 text-gray-800'}
      `}
    >
      {/* Animated floating icon */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={isDarkMode ? "text-blue-300 drop-shadow-xl" : "text-blue-500 drop-shadow-xl"}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="z-10 flex flex-col items-center">
        <div className={`text-8xl font-extrabold mb-4 drop-shadow-lg animate-pulse ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>404</div>
        <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Oops! Page Not Found</h1>
        <p className={`mb-6 text-lg max-w-md text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.<br />
          <span className={isDarkMode ? "text-blue-400 font-semibold" : "text-blue-500 font-semibold"}>Let's get you back on track!</span>
        </p>
        <Link
          to="/"
          className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-200 hover:scale-105
            ${isDarkMode
              ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:from-blue-800 hover:to-blue-600'
              : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'}
          `}
        >
          Go Home
        </Link>
      </div>
      {/* Decorative blurred circles */}
      <div className={`absolute w-72 h-72 rounded-full blur-3xl opacity-30 -top-32 -left-32 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-400'}`}></div>
      <div className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 -bottom-40 -right-40 ${isDarkMode ? 'bg-blue-800' : 'bg-blue-200'}`}></div>
    </div>
  );
};

export default NotFound;
