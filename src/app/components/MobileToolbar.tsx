import React from 'react';
import { FaPlay, FaDownload, FaCode, FaTerminal, FaDesktop, FaCamera } from 'react-icons/fa';

interface MobileToolbarProps {
  onExecute: () => void;
  onDownload: () => void;
  isExecuting: boolean;
  toggleView: () => void;
  currentView: 'editor' | 'output' | 'preview';
  hasPreview?: boolean;
  onScanImage?: () => void;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({
  onExecute,
  onDownload,
  isExecuting,
  toggleView,
  currentView,
  hasPreview = false,
  onScanImage
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 mobile-toolbar bg-card-bg/80 border-t border-border-color/30 p-3 flex justify-around sm:hidden z-10">
      <button
        onClick={toggleView}
        className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-accent-color"
      >
        {currentView === 'editor' ? (
          <>
            <FaTerminal className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Output</span>
          </>
        ) : currentView === 'output' && hasPreview ? (
          <>
            <FaDesktop className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Preview</span>
          </>
        ) : (
          <>
            <FaCode className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Editor</span>
          </>
        )}
      </button>
      
      <button
        onClick={onExecute}
        disabled={isExecuting}
        className={`flex flex-col items-center justify-center ${
          isExecuting ? 'text-gray-400' : 'text-accent-color hover:text-accent-color/80'
        }`}
      >
        <div className={`rounded-full p-2 ${isExecuting ? 'bg-gray-200 dark:bg-gray-700' : 'bg-accent-color/10'}`}>
          <FaPlay className={`h-4 w-4 ${isExecuting ? 'animate-pulse' : ''}`} />
        </div>
        <span className="text-xs font-medium mt-1">{isExecuting ? 'Running...' : 'Run'}</span>
      </button>
      
      <button
        onClick={onScanImage}
        className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-accent-color"
      >
        <FaCamera className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">Scan</span>
      </button>
      
      <button
        onClick={onDownload}
        className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-accent-color"
      >
        <FaDownload className="h-5 w-5 mb-1" />
        <span className="text-xs font-medium">Save</span>
      </button>
    </div>
  );
};

export default MobileToolbar; 