
import React from 'react';
import ReactDOM from 'react-dom/client';
import ResultsPage from './components/ResultsPage';
import { ThemeProvider } from './contexts/ThemeContext';
import type { AnalysisReport } from './types';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// FIX: Provide mock props to ResultsPage to resolve type error. This allows this entrypoint to be used for development/testing.
const mockReports: AnalysisReport[] = [
  {
    id: 'mock-1',
    timestamp: Date.now(),
    results: [
      {
        angleName: 'Rake Angle',
        measuredValue: 16,
        standard: '5° to 15°',
        isCompliant: false,
        recommendation: 'Decrease rake angle by 1-4°. High rake angle can lead to a weaker cutting edge.',
        coordinates: {
          vertex: { x: 150, y: 200 },
          point1: { x: 250, y: 190 },
          point2: { x: 150, y: 100 },
        },
        confidence: 'High',
      },
      {
        angleName: 'Relief Angle',
        measuredValue: 7.5,
        standard: '8° to 12°',
        isCompliant: false,
        recommendation: 'Increase relief angle by 0.5-2.5° to reduce friction and wear. Confidence is Medium due to slight blur on the tool tip.',
        coordinates: {
          vertex: { x: 300, y: 250 },
          point1: { x: 400, y: 240 },
          point2: { x: 300, y: 150 },
        },
        confidence: 'Medium',
      },
      {
        angleName: 'Clearance Angle',
        measuredValue: 13,
        standard: '12° to 15°',
        isCompliant: true,
        recommendation: '',
        coordinates: {
          vertex: { x: 50, y: 50 },
          point1: { x: 150, y: 70 },
          point2: { x: 50, y: 150 },
        },
        confidence: 'High',
      },
       {
        angleName: 'Lip Angle',
        measuredValue: 65,
        standard: '60° to 80°',
        isCompliant: true,
        recommendation: '',
        coordinates: {
          vertex: { x: 200, y: 100 },
          point1: { x: 250, y: 50 },
          point2: { x: 150, y: 150 },
        },
        confidence: 'High',
      },
    ],
    error: null,
    imagePreviewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNTI1MjViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjYTFiYWIxIj5Nb2NrIEltYWdlIDE8L3RleHQ+PC9zdmc+',
  },
  {
    id: 'mock-2',
    timestamp: Date.now(),
    results: null,
    error: 'Analysis failed. The AI could not confidently identify a cutting tool in the provided image.',
    imagePreviewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNTI1MjViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjYTFiYWIxIj5Nb2NrIEltYWdlIDIgKEVycm9yKTwvdGV4dD48L3N2Zz4=',
  }
];
const mockAnalysisTime = 4321;
const mockOnReset = () => console.log('Reset button clicked.');
const mockThreeDModelUrl = 'https://threejs.org/examples/models/obj/male02/male02.obj'; // Example OBJ model for testing 3D view

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ResultsPage 
        reports={mockReports} 
        analysisTime={mockAnalysisTime} 
        onReset={mockOnReset} 
        threeDModelUrl={mockThreeDModelUrl} 
        onShowHistory={() => console.log('Show history clicked')}
      />
    </ThemeProvider>
  </React.StrictMode>
);
