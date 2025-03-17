import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FaPlay, FaSync, FaDownload, FaTerminal, FaDesktop } from 'react-icons/fa';
import MobileToolbar from './MobileToolbar';
import JavaAWTPreview from './JavaAWTPreview';
import ImageScanner from './ImageScanner';

interface JavaAWTPreviewType {
  title: string;
  width: number;
  height: number;
  layout: string;
  components: Array<{
    type: string;
    text: string;
    name: string;
    size?: number;
  }>;
}

interface CodeEditorProps {
  onExecute: (code: string, language: string) => void;
  isExecuting: boolean;
  output: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onExecute, isExecuting, output }) => {
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, World!");');
  const [language, setLanguage] = useState<string>('javascript');
  const [currentView, setCurrentView] = useState<'editor' | 'output' | 'preview'>('editor');
  const [preview, setPreview] = useState<JavaAWTPreviewType | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const editorRef = useRef<unknown>(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setPreview(null);
    
    // Set default code for each language
    switch (newLang) {
      case 'javascript':
        setCode('// Write your JavaScript code here\nconsole.log("Hello, World!");');
        break;
      case 'python':
        setCode('# Write your Python code here\nprint("Hello, World!")');
        break;
      case 'java':
        if (newLang === 'java' && e.target.options[e.target.selectedIndex].text === 'Java (AWT)') {
          setCode(`// Java AWT Example
import java.awt.*;
import java.awt.event.*;

public class SimpleGUI {
    public static void main(String[] args) {
        Frame frame = new Frame("My First GUI");
        frame.setSize(300, 200);
        
        Button button = new Button("Click Me");
        Label label = new Label("Hello, AWT World!");
        TextField textField = new TextField("", 15);
        
        frame.setLayout(new FlowLayout());
        frame.add(label);
        frame.add(textField);
        frame.add(button);
        
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                label.setText("Button clicked!");
            }
        });
        
        frame.setVisible(true);
    }
}`);
        } else {
          setCode('// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}');
        }
        break;
      case 'c':
        setCode('// Write your C code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}');
        break;
      default:
        setCode('// Write your code here');
    }
  };

  const handleExecute = async () => {
    setPreview(null);
    onExecute(code, language);
    
    // For Java AWT, we'll get the preview data from the API response
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      
      const data = await response.json();
      
      if (data.preview) {
        setPreview(data.preview);
        
        // On mobile, switch to preview view if it's a Java AWT app
        if (isMobile && (code.includes('java.awt') || code.includes('javax.swing'))) {
          setCurrentView('preview');
        } else {
          // Otherwise switch to output view
          if (isMobile) {
            setCurrentView('output');
          }
        }
      } else if (isMobile) {
        // If no preview, switch to output view on mobile
        setCurrentView('output');
      }
    } catch (error) {
      console.error('Error executing code:', error);
      if (isMobile) {
        setCurrentView('output');
      }
    }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    let extension = '';
    
    switch (language) {
      case 'javascript':
        extension = '.js';
        break;
      case 'python':
        extension = '.py';
        break;
      case 'java':
        extension = '.java';
        break;
      case 'c':
        extension = '.c';
        break;
      default:
        extension = '.txt';
    }
    
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleView = () => {
    // For Java AWT, cycle through editor -> output -> preview
    if (hasJavaAWTImports && preview) {
      if (currentView === 'editor') {
        setCurrentView('output');
      } else if (currentView === 'output') {
        setCurrentView('preview');
      } else {
        setCurrentView('editor');
      }
    } else {
      // For other languages, just toggle between editor and output
      setCurrentView(currentView === 'editor' ? 'output' : 'editor');
    }
  };

  const handleScanImage = () => {
    setShowScanner(true);
  };

  const handleScanComplete = (generatedCode: string) => {
    // Insert the generated code at the cursor position or replace selected text
    if (editorRef.current) {
      const editor = editorRef.current as unknown;
      // Use type assertion for the editor methods we need
      const editorWithMethods = editor as {
        getSelection: () => unknown;
        executeEdits: (source: string, edits: unknown[]) => void;
      };
      const selection = editorWithMethods.getSelection();
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: selection, text: generatedCode, forceMoveMarkers: true };
      editorWithMethods.executeEdits("my-source", [op]);
    } else {
      // If editor ref is not available, just set the entire code
      setCode(generatedCode);
    }
    
    // Switch to editor view to show the generated code
    setCurrentView('editor');
  };

  // Check if the code contains Java AWT/Swing imports
  const hasJavaAWTImports = language === 'java' && (code.includes('java.awt') || code.includes('javax.swing'));

  return (
    <div className="w-full h-full">
      <div className="bg-card-bg p-3 rounded-t-lg border-b border-border-color/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="block w-36 pl-3 pr-10 py-1.5 text-sm border border-border-color/50 rounded-md bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="java">Java (AWT)</option>
            <option value="c">C</option>
          </select>
        </div>
        
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden sm:flex space-x-2">
          <button
            onClick={downloadCode}
            className="btn inline-flex items-center px-3 py-1.5 border border-border-color/50 text-sm font-medium rounded-md bg-card-bg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color transition-all"
          >
            <FaDownload className="mr-2 -ml-0.5 h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`btn btn-primary inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              isExecuting ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent-color hover:bg-accent-color/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color'
            } transition-all`}
          >
            {isExecuting ? (
              <>
                <FaSync className="animate-spin mr-2 -ml-1 h-4 w-4" />
                Running
              </>
            ) : (
              <>
                <FaPlay className="mr-2 -ml-1 h-4 w-4" />
                Run
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile view switcher */}
      <div className="sm:hidden">
        {currentView === 'editor' ? (
          <div className="code-editor-container h-[calc(100vh-220px)]">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        ) : currentView === 'output' ? (
          <div className="output-container p-3 h-[calc(100vh-220px)] overflow-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
              <FaTerminal className="mr-2 h-3 w-3" />
              Output
            </h3>
            <pre className="output-text p-3 rounded-md overflow-auto h-[calc(100%-32px)] text-sm whitespace-pre-wrap">
              {output || 'Run your code to see the output here...'}
            </pre>
            
            {/* Show a button to view preview if available */}
            {hasJavaAWTImports && preview && (
              <div className="mt-3 text-center">
                <button 
                  onClick={() => setCurrentView('preview')}
                  className="btn inline-flex items-center px-3 py-1.5 border border-border-color/50 text-sm font-medium rounded-md bg-card-bg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color transition-all"
                >
                  <FaDesktop className="mr-2 h-3 w-3" />
                  View UI Preview
                </button>
              </div>
            )}
          </div>
        ) : (
          // Preview view for mobile
          <div className="h-[calc(100vh-220px)] overflow-auto p-3">
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
              <FaDesktop className="mr-2 h-3 w-3" />
              Java AWT Preview
            </h3>
            {preview ? (
              <JavaAWTPreview preview={preview} />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
                No preview available
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Desktop view - both editor and output visible */}
      <div className="hidden sm:block">
        <div className="code-editor-container h-[300px] md:h-[400px] lg:h-[500px]">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>
        
        <div className="mt-3 output-container p-3">
          <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
            <FaTerminal className="mr-2 h-3 w-3" />
            Output
          </h3>
          <pre className="output-text p-3 rounded-md overflow-auto h-[100px] md:h-[120px] text-sm whitespace-pre-wrap">
            {output || 'Run your code to see the output here...'}
          </pre>
        </div>
        
        {/* Java AWT Preview for desktop */}
        {hasJavaAWTImports && preview && (
          <JavaAWTPreview preview={preview} />
        )}
      </div>
      
      {/* Mobile toolbar */}
      <MobileToolbar 
        onExecute={handleExecute}
        onDownload={downloadCode}
        isExecuting={isExecuting}
        toggleView={toggleView}
        currentView={currentView}
        hasPreview={hasJavaAWTImports && preview !== null}
        onScanImage={handleScanImage}
      />
      
      {/* Image Scanner Modal */}
      {showScanner && (
        <ImageScanner 
          onClose={() => setShowScanner(false)} 
          onScanComplete={handleScanComplete}
        />
      )}
      
      {/* Add padding at the bottom for mobile to account for the fixed toolbar */}
      <div className="h-14 sm:hidden"></div>
    </div>
  );
};

export default CodeEditor; 