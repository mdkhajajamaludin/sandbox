# Code Sandbox - Online Code Editor

A responsive web application that provides an online code editor with support for multiple programming languages. This application is designed to work well on both mobile phones and desktop computers.

## Features

- **Code Editor**: Monaco Editor integration for a powerful coding experience
- **Multiple Language Support**: JavaScript, Python, Java, and C
- **Responsive Design**: Works well on both mobile and desktop devices
- **Code Execution**: Simulated code execution for demonstration purposes
- **Download Code**: Save your code to your local machine

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd code-sandbox
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Select a programming language from the dropdown menu
2. Write your code in the editor
3. Click the "Run" button to execute the code
4. View the output in the output panel below the editor
5. Use the "Download" button to save your code to your local machine

## Code Execution

This demo uses simulated code execution for demonstration purposes. In a production environment, a secure sandboxed execution environment would be required.

The current implementation:
- JavaScript: Uses Function constructor to evaluate code (not secure for production)
- Python, Java, C: Simulates execution by parsing print statements

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Axios](https://axios-http.com/) - HTTP client

## Mobile Responsiveness

The application is designed to be fully responsive:
- Adapts to different screen sizes
- Optimized touch interactions for mobile devices
- Flexible layout that works well on both portrait and landscape orientations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the powerful code editing capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
