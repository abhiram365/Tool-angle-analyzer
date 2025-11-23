
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { ImagePreview } from './components/ImagePreview';
import { AnalyzeIcon } from './components/icons/AnalyzeIcon';
import { LoadingPopup } from './components/LoadingPopup';
import { AIBotPopup } from './components/AIBotPopup';
import ResultsPage from './components/ResultsPage';
import { DatabasePage } from './components/DatabasePage';
import { ArchitectureView } from './components/ArchitectureView';
import { analyzeToolImage } from './services/geminiService';
import { historyService } from './services/historyService';
import type { AnalysisReport } from './types';

type ViewState = 'home' | 'results' | 'database' | 'architecture';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [analysisTime, setAnalysisTime] = useState(0);
  const [showBot, setShowBot] = useState(true);
  const [threeDModelUrl, setThreeDModelUrl] = useState<string | null>(null);

  const handleFilesSelect = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    const modelFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.obj') || f.name.toLowerCase().endsWith('.stl'));

    // Handle Image Files (Max 3)
    if (imageFiles.length > 0) {
        setFiles(prev => [...prev, ...imageFiles].slice(0, 3));
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, reader.result as string].slice(0, 3));
            };
            reader.readAsDataURL(file);
        });
    }

    // Handle 3D Model File (Max 1, replaces existing)
    if (modelFiles.length > 0) {
         const modelFile = modelFiles[0];
         const objectUrl = URL.createObjectURL(modelFile);
         setThreeDModelUrl(objectUrl);
    }

  }, []);

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0 && !threeDModelUrl) return;

    setIsAnalyzing(true);
    const startTime = performance.now();
    const newReports: AnalysisReport[] = [];

    try {
        // Only analyze images with AI
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const base64 = previews[i].split(',')[1];
            
            try {
                const results = await analyzeToolImage(base64);
                const report: Omit<AnalysisReport, 'id' | 'timestamp'> = {
                    results,
                    error: null,
                    imagePreviewUrl: previews[i],
                    fileName: file.name
                };
                // Save to history immediately
                const savedReport = historyService.saveReport(report);
                if (savedReport) newReports.push(savedReport);
            } catch (e) {
                const errorReport: Omit<AnalysisReport, 'id' | 'timestamp'> = {
                    results: null,
                    error: (e as Error).message,
                    imagePreviewUrl: previews[i],
                    fileName: file.name
                };
                const savedReport = historyService.saveReport(errorReport);
                if (savedReport) newReports.push(savedReport);
            }
        }

        // If only a 3D model is uploaded, create a dummy report for viewing it
        if (files.length === 0 && threeDModelUrl) {
             newReports.push({
                 id: crypto.randomUUID(),
                 timestamp: Date.now(),
                 results: [],
                 error: null,
                 imagePreviewUrl: null,
                 fileName: '3D Model'
             });
        }

        setReports(newReports);
        setAnalysisTime(performance.now() - startTime);
        setView('results');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviews([]);
    setReports([]);
    setThreeDModelUrl(null);
    setView('home');
  };

  const handleLoadHistory = (report: AnalysisReport) => {
      setReports([report]);
      setView('results');
  };

  if (view === 'architecture') {
      return <ArchitectureView onBack={() => setView('home')} />;
  }

  if (view === 'database') {
      return <DatabasePage onLoadReport={handleLoadHistory} onGoHome={() => setView('home')} />;
  }

  if (view === 'results') {
    return (
        <ResultsPage 
            reports={reports} 
            analysisTime={analysisTime} 
            onReset={handleReset}
            threeDModelUrl={threeDModelUrl}
            onShowHistory={() => setView('database')}
        />
    );
  }

  return (
    <div className="min-h-screen font-sans text-zinc-800 dark:text-zinc-200 flex flex-col">
      <Header 
        onShowHistory={() => setView('database')} 
        onShowArchitecture={() => setView('architecture')} 
        onGoHome={handleReset} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center flex-grow my-auto max-w-3xl">
            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
                    Precision <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Tool Inspection</span>
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
                    Upload images of single-point cutting tools for automated geometric analysis. Powered by Google Cloud Run and Gemini.
                </p>
            </div>

            <div className="w-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
                <FileUploader onFilesSelect={handleFilesSelect} />
                
                {previews.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-4 animate-fadeIn">
                        {previews.map((src, idx) => (
                            <ImagePreview key={idx} src={src} alt={`Upload ${idx + 1}`} onRemove={() => handleRemoveFile(idx)} />
                        ))}
                    </div>
                )}

                {threeDModelUrl && (
                    <div className="mt-6 p-4 bg-orange-50 dark:bg-zinc-800/50 rounded-lg border border-orange-200 dark:border-zinc-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 text-white p-2 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-6-6m6 6v-4.5m0 4.5h-4.5" /><path d="M3 11.5 9 5l6 6.5" /><path d="M12.5 3 18 9l-6.5 6" /><path d="M3 21v-4.5m0 4.5H8" /></svg>
                            </div>
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">3D Model Loaded</span>
                        </div>
                         <button onClick={() => setThreeDModelUrl(null)} className="text-zinc-400 hover:text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleAnalyze}
                        disabled={files.length === 0 && !threeDModelUrl}
                        className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                        <AnalyzeIcon />
                        {threeDModelUrl && files.length === 0 ? 'View 3D Model' : 'Analyze Geometry'}
                    </button>
                </div>
            </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-zinc-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Cutting Tool Inspector AI. All rights reserved.</p>
      </footer>

      {isAnalyzing && <LoadingPopup />}
      {showBot && <AIBotPopup onClose={() => setShowBot(false)} />}
    </div>
  );
}
