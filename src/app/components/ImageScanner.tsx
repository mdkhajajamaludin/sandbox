import React, { useState, useRef } from 'react';
import { FaCamera, FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import Image from 'next/image';

interface ImageScannerProps {
  onClose: () => void;
  onScanComplete: (generatedCode: string) => void;
}

const ImageScanner: React.FC<ImageScannerProps> = ({ onClose, onScanComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 4MB to avoid payload issues)
      if (file.size > 4 * 1024 * 1024) {
        setError('Image is too large. Please select an image under 4MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setError(null);
        setWarning(null);
      };
      reader.onerror = () => {
        setError('Failed to read the selected file. Please try another image.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsScanning(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: selectedImage 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.generatedCode || data.generatedCode.trim() === '') {
        throw new Error('No code could be generated from this image. Please try another image.');
      }

      // Check for warnings
      if (data.warning) {
        setWarning(data.warning);
      }

      onScanComplete(data.generatedCode);
      onClose();
    } catch (err) {
      console.error('Error scanning image:', err);
      setError((err as Error).message || 'Failed to scan image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 scanner-modal">
      <div className="bg-card-bg rounded-lg w-full max-w-md overflow-hidden scanner-modal-content border-2 border-accent-color">
        <div className="p-4 border-b border-border-color/30 flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h3 className="text-lg font-medium">Scan Your Image </h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Upload an image of code or a diagram to generate code automatically using Nam Tech Vision AI.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-200 rounded-md text-sm font-medium">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {warning && (
            <div className="mb-4 p-3 bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 rounded-md text-sm flex items-start font-medium">
              <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <span>{warning}</span>
            </div>
          )}
          
          <div 
            className={`image-drop-zone mb-4 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all hover:border-accent-color ${selectedImage ? 'border-accent-color bg-accent-color/5' : 'border-gray-300 dark:border-gray-600'}`}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {selectedImage ? (
              <div className="relative">
                <Image 
                  src={selectedImage} 
                  alt="Selected" 
                  className="max-h-48 mx-auto rounded-md shadow-md"
                  width={200}
                  height={150}
                  style={{ objectFit: 'contain', maxHeight: '12rem' }}
                />
                <div className="mt-2 text-sm text-accent-color font-medium text-center">
                  Click to change image
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <FaCamera className="mx-auto h-12 w-12 text-accent-color mb-3" />
                <p className="text-sm font-medium text-accent-color">
                  Click to select an image
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border-color/50 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleScan}
              disabled={!selectedImage || isScanning}
              className={`px-4 py-2 text-sm rounded-md text-white font-medium shadow-md ${
                !selectedImage || isScanning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isScanning ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                'Scan Image'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageScanner; 