import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from '../types';
import { getDesignRecommendations } from '../services/geminiService';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { WarningIcon } from './icons/WarningIcon';

// Export Spinner component for reuse
export const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface DesignRecommenderProps {
  initialResults: AnalysisResult[];
}

export const DesignRecommender: React.FC<DesignRecommenderProps> = ({ initialResults }) => {
  const [material, setMaterial] = useState('');
  const [outcome, setOutcome] = useState('');
  const [hardness, setHardness] = useState('');
  const [ductility, setDuctility] = useState('');
  const [thermalConductivity, setThermalConductivity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!material || !outcome) {
      setError('Please fill out both material and desired outcome fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const resultText = await getDesignRecommendations(
        initialResults, 
        material, 
        outcome, 
        hardness, 
        ductility, 
        thermalConductivity
      );
      setRecommendations(resultText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [initialResults, material, outcome, hardness, ductility, thermalConductivity]);

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
        if (line.startsWith('## ')) {
            return <h3 key={index} className="text-xl font-semibold text-orange-500 dark:text-orange-400 mt-6 mb-2">{line.substring(3)}</h3>;
        }
        if (line.startsWith('* ')) {
            return (
                <div key={index} className="flex items-start gap-3">
                    <span className="text-orange-500 dark:text-orange-400 mt-1.5 leading-none">●</span>
                    <p className="text-zinc-700 dark:text-zinc-300 flex-1">{line.substring(2)}</p>
                </div>
            );
        }
        if (line.trim() === '') return null;

        const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        const renderedParts = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-orange-600 dark:text-orange-300">{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        return <p key={index} className="text-zinc-700 dark:text-zinc-300 mb-2">{renderedParts}</p>;
    });
};

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Design Recommendation Engine</h2>
      <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-2xl">
          Get AI-powered suggestions to optimize your tool's geometry. Describe the material you're cutting and your desired outcome to receive tailored recommendations.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="material" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Material to be Machined</label>
              <input
                type="text"
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g., Aluminum 6061, Titanium Grade 5"
                className="w-full bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="outcome" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Desired Machining Outcome</label>
              <input
                type="text"
                id="outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g., Smooth surface finish, aggressive removal"
                className="w-full bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                aria-required="true"
              />
            </div>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
              For more precise recommendations, provide the material's key properties below (optional).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label htmlFor="hardness" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Hardness</label>
                <input
                  type="text"
                  id="hardness"
                  value={hardness}
                  onChange={(e) => setHardness(e.target.value)}
                  placeholder="e.g., 95 HRB, 250 HB"
                  className="w-full bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                />
              </div>
              <div>
                <label htmlFor="ductility" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Ductility</label>
                <input
                  type="text"
                  id="ductility"
                  value={ductility}
                  onChange={(e) => setDuctility(e.target.value)}
                  placeholder="e.g., High, 25% elongation"
                  className="w-full bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                />
              </div>
              <div>
                <label htmlFor="thermalConductivity" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Thermal Conductivity</label>
                <input
                  type="text"
                  id="thermalConductivity"
                  value={thermalConductivity}
                  onChange={(e) => setThermalConductivity(e.target.value)}
                  placeholder="e.g., 167 W/m·K"
                  className="w-full bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !material || !outcome}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? <Spinner /> : <LightbulbIcon />}
            {isLoading ? 'Generating...' : 'Generate Recommendations'}
          </button>
        </div>
        
        {error && (
          <div className="mt-6 flex items-start gap-3 text-red-600 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500 rounded-lg">
            <WarningIcon className="flex-shrink-0 mt-1" />
            <p>{error}</p>
          </div>
        )}

        {recommendations && (
          <div className="mt-6 p-6 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-orange-100/50 dark:bg-black/30">
            {renderMarkdown(recommendations)}
          </div>
        )}
      </div>
    </div>
  );
};