'use client';

import { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import axios from 'axios';

export default function Home() {
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const executeCode = async (code: string, language: string) => {
    setIsExecuting(true);
    setOutput('Executing code...');

    try {
      const response = await axios.post('/api/execute', { code, language });
      setOutput(response.data.output);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'axios' in (error as object) 
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error 
          : 'Failed to execute code';
      
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <main className="flex-1 container mx-auto px-4 py-4 sm:px-6 lg:px-8 pb-16 sm:pb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Code Sandbox
          </h1>
          
          <div className="code-editor-container bg-card-bg overflow-hidden">
            <CodeEditor 
              onExecute={executeCode}
              isExecuting={isExecuting}
              output={output}
            />
          </div>
          
         
        </div>
      </main>
      
      <footer className="py-4 border-t border-border-color/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Code Sandbox</span> — A Powered by NamTech
          </p>
        </div>
      </footer>
    </div>
  );
}
