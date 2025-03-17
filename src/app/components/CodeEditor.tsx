import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FaPlay, FaSync, FaDownload, FaTerminal, FaDesktop, FaCamera } from 'react-icons/fa';
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

// Define a proper type for the Monaco editor
interface MonacoEditor {
  getSelection: () => any;
  executeEdits: (source: string, edits: any[]) => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onExecute, isExecuting, output }) => {
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, World!");');
  const [language, setLanguage] = useState<string>('javascript');
  const [currentView, setCurrentView] = useState<'editor' | 'output' | 'preview'>('editor');
  const [preview, setPreview] = useState<JavaAWTPreviewType | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const editorRef = useRef<MonacoEditor | null>(null);

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

  const handleEditorDidMount = (editor: MonacoEditor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setPreview(null);
    
    // Set default code for each language
    let newCode = '';
    switch (newLang) {
      case 'javascript':
        newCode = '// Write your JavaScript code here\nconsole.log("Hello, World!");';
        break;
      case 'python':
        newCode = '# Write your Python code here\nprint("Hello, World!")';
        break;
      case 'java':
        if (e.target.options[e.target.selectedIndex].text === 'Java (AWT)') {
          newCode = `// Java AWT Example
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
}`;
        } else {
          newCode = '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}';
        }
        break;
      case 'c':
        newCode = '// Write your C code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}';
        break;
      default:
        newCode = '// Write your code here';
    }
    
    setCode(newCode);
    
    // Also update the editor directly if it's mounted
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
  };

  const handleExecute = async () => {
    // Get the latest code from the editor if available
    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    
    setPreview(null);
    onExecute(currentCode, language);
    
    // For Java AWT, we'll get the preview data from the API response
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: currentCode, language }),
      });
      
      const data = await response.json();
      
      if (data.preview) {
        setPreview(data.preview);
        
        // On mobile, switch to preview view if it's a Java AWT app
        if (isMobile && (currentCode.includes('java.awt') || currentCode.includes('javax.swing'))) {
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
    // Get the latest code from the editor if available
    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    
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
    
    const file = new Blob([currentCode], { type: 'text/plain' });
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
      const editor = editorRef.current;
      const selection = editor.getSelection();
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: selection, text: generatedCode, forceMoveMarkers: true };
      editor.executeEdits("my-source", [op]);
      
      // Also update our state
      setCode(editor.getValue());
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
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="font-bold text-base bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Powered By NamTech</span>
          </div>
          <div className="relative">
            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              className="appearance-none block w-44 pl-4 pr-10 py-2 text-sm font-medium bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="java">Java (AWT)</option>
              <option value="c">C</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden sm:flex space-x-3">
          <button
            onClick={handleScanImage}
            className="btn inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
          >
            <FaCamera className="mr-2 -ml-0.5 h-4 w-4" />
            Scan
          </button>
          <button
            onClick={downloadCode}
            className="btn inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
          >
            <FaDownload className="mr-2 -ml-0.5 h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium shadow-sm ${
              isExecuting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
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
              onChange={handleEditorChange}
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
          <div className="output-container p-3 h-[calc(100vh-220px)] overflow-auto border-t border-border-color/50">
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
          <div className="h-[calc(100vh-220px)] overflow-auto p-3 border-t border-border-color/50">
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
            onChange={handleEditorChange}
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
        
        <div className="output-container p-3 border-t border-border-color/50">
          <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
            <FaTerminal className="mr-2 h-3 w-3" />
            Output
          </h3>
          <pre className="output-text p-3 overflow-auto h-[100px] md:h-[120px] text-sm whitespace-pre-wrap">
            {output || 'Run your code to see the output here...'}
          </pre>
        </div>
        
        {/* Java AWT Preview for desktop */}
        {hasJavaAWTImports && preview && (
          <div className="mt-3">
            <JavaAWTPreview preview={preview} />
          </div>
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