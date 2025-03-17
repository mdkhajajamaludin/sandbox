import React, { useEffect, useState, useRef, useCallback } from 'react';

interface JavaAWTComponent {
  type: string;
  text: string;
  name: string;
  size?: number;
}

interface JavaAWTPreview {
  title: string;
  width: number;
  height: number;
  layout: string;
  components: JavaAWTComponent[];
}

interface JavaAWTPreviewProps {
  preview: JavaAWTPreview | null;
}

const JavaAWTPreview: React.FC<JavaAWTPreviewProps> = ({ preview }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  // Only calculate these if preview exists
  const width = preview?.width || 0;
  const height = preview?.height || 0;
  const title = preview?.title || '';
  const layout = preview?.layout || 'flow';
  const components = preview?.components || [];
  
  // Calculate the appropriate scale based on container width
  const calculateScale = useCallback((containerWidth: number) => {
    if (containerWidth < 640) {
      // Mobile: use 90% of available width
      return Math.min(containerWidth * 0.9 / width, 1);
    } else {
      // Desktop: cap at 600px
      const maxWidth = Math.min(containerWidth, 600);
      return Math.min(maxWidth / width, 1);
    }
  }, [width]);
  
  // Update scale when container width changes or on window resize
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        setScale(calculateScale(newWidth));
      }
    };
    
    // Initial calculation
    updateScale();
    
    // Add resize listener
    window.addEventListener('resize', updateScale);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateScale);
  }, [calculateScale]);
  
  // Calculate scaled dimensions
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  // If no preview, return null
  if (!preview) return null;

  return (
    <div className="mt-3 p-3 bg-card-bg rounded-lg border border-border-color/50 overflow-hidden" ref={containerRef}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Java AWT/Swing Preview
      </h3>
      
      <div className="w-full overflow-auto">
        <div 
          className="awt-preview"
          style={{ 
            width: scaledWidth, 
            height: scaledHeight,
            margin: '0 auto',
            minWidth: Math.min(280, scaledWidth)
          }}
        >
          {/* Window title bar */}
          <div className="awt-titlebar">
            <div className="flex space-x-1 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-medium truncate">
              {title}
            </div>
          </div>
          
          {/* Window content */}
          <div 
            className={`p-4 ${
              layout === 'grid' 
                ? 'grid grid-cols-2 gap-2' 
                : layout === 'border' 
                  ? 'flex flex-col space-y-2' 
                  : 'flex flex-wrap gap-2'
            }`}
          >
            {components.map((component: JavaAWTComponent, index: number) => {
              switch (component.type) {
                case 'button':
                  return (
                    <button
                      key={index}
                      className="awt-button"
                    >
                      {component.text}
                    </button>
                  );
                case 'label':
                  return (
                    <div
                      key={index}
                      className="awt-label"
                    >
                      {component.text}
                    </div>
                  );
                case 'textfield':
                  return (
                    <input
                      key={index}
                      type="text"
                      defaultValue={component.text}
                      className="awt-textfield"
                      style={{ 
                        width: `${Math.min((component.size || 10) * 8, scaledWidth - 40)}px`,
                        maxWidth: '100%'
                      }}
                      readOnly
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JavaAWTPreview; 