import React from 'react';
import { FaCode } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaCode className="h-8 w-8 text-blue-500" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              Code Sandbox
            </h1>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Online Code Editor
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 