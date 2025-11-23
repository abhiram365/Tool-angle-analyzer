
import React, { useState, useEffect } from 'react';

const LatheLoadingAnimation: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Initializing Secure Connection...");

    useEffect(() => {
        const timeouts: number[] = [];
        
        // Simulation of the Enterprise Architecture Workflow
        
        // Phase 1: Upload to Cloud Storage (0-30%)
        for (let i = 1; i <= 30; i++) {
            timeouts.push(window.setTimeout(() => {
                setProgress(i);
                if (i === 5) setStatusText("Encrypting and Uploading to Cloud Storage...");
            }, (i / 30) * 2000));
        }

        // Phase 2: Pub/Sub Queue (30-45%)
        for (let i = 31; i <= 45; i++) {
            timeouts.push(window.setTimeout(() => {
                setProgress(i);
                if (i === 31) setStatusText("Queuing Job in Cloud Pub/Sub...");
            }, 2000 + ((i - 30) / 15) * 1500));
        }

        // Phase 3: Cloud Run Processing (45-85%)
        for (let i = 46; i <= 85; i++) {
            timeouts.push(window.setTimeout(() => {
                setProgress(i);
                if (i === 46) setStatusText("Cloud Run: Provisioning Instance (2 vCPU)...");
                if (i === 60) setStatusText("Cloud Run: Executing OpenCV Angle Detection...");
                if (i === 75) setStatusText("Gemini API: Verifying Geometry...");
            }, 3500 + ((i - 45) / 40) * 5000));
        }
        
        // Phase 4: Data Persistence (85-95%)
        for (let i = 86; i <= 95; i++) {
            timeouts.push(window.setTimeout(() => {
                setProgress(i);
                if (i === 86) setStatusText("Saving Report to Cloud Firestore...");
            }, 8500 + ((i - 85) / 10) * 1000));
        }

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/30 w-[500px]">
      <div className="w-64 h-32 mb-6">
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          {/* Stationary part: workpiece and chuck */}
          <g>
            {/* Workpiece */}
            <rect x="50" y="40" width="120" height="20" className="fill-zinc-400 dark:fill-zinc-500" />
            {/* Chuck */}
            <rect x="170" y="35" width="20" height="30" className="fill-zinc-500 dark:fill-zinc-600" />
          </g>

          {/* Rotating handle on the chuck */}
          <line x1="180" y1="50" x2="180" y2="38" className="stroke-orange-500 dark:stroke-orange-400" strokeWidth="2.5" strokeLinecap="round">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 180 50"
              to="360 180 50"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </line>
          
          {/* Lathe Tool */}
          <path d="M 40 65 L 40 75 L 20 75 L 20 60 L 30 60 L 40 65 Z" className="fill-zinc-600 dark:fill-zinc-400">
             <animate attributeName="d"
              values="M 40 65 L 40 75 L 20 75 L 20 60 L 30 60 L 40 65 Z; M 160 65 L 160 75 L 140 75 L 140 60 L 150 60 L 160 65 Z; M 40 65 L 40 75 L 20 75 L 20 60 L 30 60 L 40 65 Z"
              dur="4s"
              repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Processing Pipeline</h3>
      <p className="text-zinc-600 dark:text-zinc-300 mb-6 text-sm font-mono h-6">{statusText}</p>
       {/* Progress Bar */}
       <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-1">
          <div 
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300 ease-linear" 
              style={{ width: `${progress}%` }}
          ></div>
      </div>
      <div className="flex justify-between w-full text-xs text-zinc-400">
        <span>Upload</span>
        <span>Queue</span>
        <span>Process</span>
        <span>Save</span>
      </div>
    </div>
    );
};

export const LoadingPopup: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <LatheLoadingAnimation />
    </div>
  );
};
