import { NextRequest, NextResponse } from 'next/server';

// This is a mock implementation for demonstration purposes
// In a real-world scenario, you would use a secure sandboxed environment
// or a third-party API for code execution

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Simulate code execution with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let output = '';
    let preview = null;

    // Mock execution results based on language
    switch (language) {
      case 'javascript':
        try {
          // This is not secure for production use
          // In a real app, use a sandboxed environment or a third-party service
          output = mockJavaScriptExecution(code);
        } catch (error: unknown) {
          output = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
        break;
      case 'python':
        output = mockPythonExecution(code);
        break;
      case 'java':
        // Check if code contains AWT/Swing imports
        if (code.includes('java.awt') || code.includes('javax.swing')) {
          const result = mockJavaAWTExecution(code);
          output = result.output;
          preview = result.preview;
        } else {
          output = mockJavaExecution(code);
        }
        break;
      case 'c':
        output = mockCExecution(code);
        break;
      default:
        output = 'Unsupported language';
    }

    return NextResponse.json({ output, preview });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: `Failed to execute code: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Mock execution functions
function mockJavaScriptExecution(code: string): string {
  try {
    // For demonstration only - this is not secure!
    // In a real app, use a sandboxed environment
    const consoleOutput: string[] = [];
    const originalConsoleLog = console.log;
    
    // Override console.log to capture output
    console.log = (...args) => {
      consoleOutput.push(args.map(arg => String(arg)).join(' '));
    };
    
    // Execute the code
    const result = new Function(code)();
    
    // Restore console.log
    console.log = originalConsoleLog;
    
    return consoleOutput.join('\n') + (result !== undefined ? `\nReturn value: ${result}` : '');
  } catch (error: unknown) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function mockPythonExecution(code: string): string {
  // Check for print statements and extract their content
  const printRegex = /print\s*\(\s*["'](.+?)["']\s*\)/g;
  const matches = [...code.matchAll(printRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1]).join('\n');
  }
  
  return "# Python code execution is simulated\n# Only simple print statements are supported in this demo";
}

function mockJavaExecution(code: string): string {
  // Check for System.out.println statements and extract their content
  const printRegex = /System\.out\.println\s*\(\s*["'](.+?)["']\s*\)/g;
  const matches = [...code.matchAll(printRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1]).join('\n');
  }
  
  return "// Java code execution is simulated\n// Only simple System.out.println statements are supported in this demo";
}

function mockJavaAWTExecution(code: string): { output: string, preview: Record<string, unknown> } {
  let output = "// Java AWT/Swing execution is simulated\n";
  const components: Array<Record<string, unknown>> = [];
  
  // Parse frame/window creation
  const frameRegex = /(?:JFrame|Frame)\s+(\w+)\s*=\s*new\s+(?:JFrame|Frame)\s*\(\s*(?:"([^"]+)")?\s*\)/g;
  const frameMatches = [...code.matchAll(frameRegex)];
  
  let frameTitle = "Java AWT Window";
  let frameWidth = 400;
  let frameHeight = 300;
  
  if (frameMatches.length > 0) {
    const frameName = frameMatches[0][1];
    if (frameMatches[0][2]) {
      frameTitle = frameMatches[0][2];
    }
    
    // Look for size setting
    const sizeRegex = new RegExp(`${frameName}\\.setSize\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)`, 'g');
    const sizeMatches = [...code.matchAll(sizeRegex)];
    
    if (sizeMatches.length > 0) {
      frameWidth = parseInt(sizeMatches[0][1]);
      frameHeight = parseInt(sizeMatches[0][2]);
    }
    
    output += `// Created frame: ${frameTitle} (${frameWidth}x${frameHeight})\n`;
  }
  
  // Parse button creation
  const buttonRegex = /(?:JButton|Button)\s+(\w+)\s*=\s*new\s+(?:JButton|Button)\s*\(\s*"([^"]+)"\s*\)/g;
  const buttonMatches = [...code.matchAll(buttonRegex)];
  
  buttonMatches.forEach(match => {
    const buttonName = match[1];
    const buttonText = match[2];
    
    components.push({
      type: 'button',
      text: buttonText,
      name: buttonName
    });
    
    output += `// Created button: ${buttonText}\n`;
  });
  
  // Parse label creation
  const labelRegex = /(?:JLabel|Label)\s+(\w+)\s*=\s*new\s+(?:JLabel|Label)\s*\(\s*"([^"]+)"\s*\)/g;
  const labelMatches = [...code.matchAll(labelRegex)];
  
  labelMatches.forEach(match => {
    const labelName = match[1];
    const labelText = match[2];
    
    components.push({
      type: 'label',
      text: labelText,
      name: labelName
    });
    
    output += `// Created label: ${labelText}\n`;
  });
  
  // Parse text field creation
  const textFieldRegex = /(?:JTextField|TextField)\s+(\w+)\s*=\s*new\s+(?:JTextField|TextField)\s*\(\s*(?:"([^"]+)")?\s*(?:,\s*(\d+))?\s*\)/g;
  const textFieldMatches = [...code.matchAll(textFieldRegex)];
  
  textFieldMatches.forEach(match => {
    const textFieldName = match[1];
    const textFieldText = match[2] || '';
    const textFieldSize = match[3] ? parseInt(match[3]) : 10;
    
    components.push({
      type: 'textfield',
      text: textFieldText,
      size: textFieldSize,
      name: textFieldName
    });
    
    output += `// Created text field${textFieldText ? ': ' + textFieldText : ''} (size: ${textFieldSize})\n`;
  });
  
  // Parse layout manager
  let layout = 'flow';
  if (code.includes('new GridLayout')) {
    layout = 'grid';
  } else if (code.includes('new BorderLayout')) {
    layout = 'border';
  }
  
  output += `// Using ${layout} layout\n`;
  
  // Check for action listeners
  const actionListenerRegex = /(\w+)\.addActionListener/g;
  const actionListenerMatches = [...code.matchAll(actionListenerRegex)];
  
  if (actionListenerMatches.length > 0) {
    output += "// Action listeners detected (simulated only)\n";
  }
  
  // Check for visibility
  if (code.includes('.setVisible(true)')) {
    output += "// Window set to visible\n";
  }
  
  const preview = {
    title: frameTitle,
    width: frameWidth,
    height: frameHeight,
    layout,
    components
  };
  
  return { output, preview };
}

function mockCExecution(code: string): string {
  // Check for printf statements and extract their content
  const printfRegex = /printf\s*\(\s*["'](.+?)["']/g;
  const matches = [...code.matchAll(printfRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1].replace('\\n', '\n')).join('');
  }
  
  return "// C code execution is simulated\n// Only simple printf statements are supported in this demo";
} 