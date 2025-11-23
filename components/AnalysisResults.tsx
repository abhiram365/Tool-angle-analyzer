import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { WarningIcon } from './icons/WarningIcon';
import { InfoIcon } from './icons/InfoIcon';
import { DesignRecommender } from './DesignRecommender';
import { AnnotatedImage } from './AnnotatedImage';
import { ThreeDView } from './ThreeDView';
import { ThreeDIcon } from './icons/ThreeDIcon';


interface AnalysisResultsProps {
  results: AnalysisResult[] | null;
  error: string | null;
  imagePreviewUrl: string | null;
  threeDModelUrl: string | null; // New prop for 3D model URL
}

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-orange-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
    <InfoIcon />
    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-4">Awaiting Analysis</h3>
    <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">Upload a 2D drawing of a single-point cutting tool and click "Analyze" to see the AI-powered inspection results here.</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 rounded-2xl">
      <WarningIcon className="text-red-500 dark:text-red-400" />
      <h3 className="text-2xl font-semibold text-red-600 dark:text-red-300 mt-4">Analysis Failed</h3>
      <p className="text-red-500 dark:text-red-400 mt-2 max-w-md">{message}</p>
    </div>
);

const ConfidencePill: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-semibold";
    const styles = {
        High: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
        Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
        Low: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    };
    return <span className={`${baseClasses} ${styles[level]}`}>{level}</span>;
}


export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, error, imagePreviewUrl, threeDModelUrl }) => {
  const [highlightedAngle, setHighlightedAngle] = useState<string | null>(null);

  if (error) {
    return <ErrorState message={error} />;
  }
  if (!results && !threeDModelUrl) { // Show initial state if no results AND no 3D model
    return <InitialState />;
  }

  const recommendationResults = results ? results.filter(r => r.recommendation && r.recommendation.length > 0) : [];

  return (
    <div className="space-y-8" id="analysis-report">
       {imagePreviewUrl && results && (
        <div>
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Visual Explainability (2D)</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4 max-w-2xl">Hover over a result in the table below to highlight the corresponding measurement on the image. This provides a clear visual link between the data and the drawing.</p>
          <AnnotatedImage src={imagePreviewUrl} results={results} highlightedAngle={highlightedAngle} />
        </div>
      )}

      {(results || threeDModelUrl) && (
         <div className="mt-12">
             <div className="flex items-center gap-3 mb-4">
                <ThreeDIcon />
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Interactive 3D View</h3>
             </div>
             {threeDModelUrl ? (
                 <p className="text-zinc-500 dark:text-zinc-400 mb-4 max-w-2xl">
                    This is your uploaded 3D model. Rotate, pan, and zoom to explore its geometry. Note: Angle annotations are only available for the generic model (when no custom 3D model is uploaded).
                 </p>
             ) : (
                <p className="text-zinc-500 dark:text-zinc-400 mb-4 max-w-2xl">
                    Rotate, pan, and zoom the generic 3D model to explore the tool's geometry. The measured angles from your 2D image are visualized with colored annotations. Hover over the table to highlight specific angles.
                </p>
             )}
             <ThreeDView results={results || []} highlightedAngle={highlightedAngle} modelUrl={threeDModelUrl} />
         </div>
      )}

      {results && results.length > 0 && (
         <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Analysis Report (2D)</h3>
            </div>
            
            <div className="overflow-x-auto bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Angle Name</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Measured</th>
                    <th scope="col" className="px-6 py-4 font-semibold">ASME Standard</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 transition-colors duration-200 hover:bg-orange-100/50 dark:hover:bg-zinc-800/50 cursor-pointer"
                      onMouseEnter={() => setHighlightedAngle(result.angleName)}
                      onMouseLeave={() => setHighlightedAngle(null)}
                    >
                      <td className="px-6 py-4">
                        {result.isCompliant ? (
                          <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckIcon /> Compliant
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-orange-500 dark:text-orange-400">
                            <WarningIcon /> Deviation
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">{result.angleName}</td>
                      <td className={`px-6 py-4 font-bold ${result.isCompliant ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                        {result.measuredValue}°
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{result.standard}</td>
                       <td className="px-6 py-4">
                        <ConfidencePill level={result.confidence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      )}
      
      {recommendationResults.length > 0 && (
        <div>
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Recommendations & Notes</h3>
          <div className="space-y-4">
            {recommendationResults.map((result, index) => (
              <div key={index} className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <WarningIcon className="text-orange-500 dark:text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-orange-600 dark:text-orange-300">{result.angleName} Note</h4>
                    <p className="text-orange-500/90 dark:text-orange-300/90">{result.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results && <DesignRecommender initialResults={results} />}
    </div>
  );
};