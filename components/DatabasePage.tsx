import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { historyService } from '../services/historyService';
import { AnalysisReport } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CheckIcon } from './icons/CheckIcon';
import { WarningIcon } from './icons/WarningIcon';

interface DatabasePageProps {
    onLoadReport: (report: AnalysisReport) => void;
    onGoHome: () => void;
}

export const DatabasePage: React.FC<DatabasePageProps> = ({ onLoadReport, onGoHome }) => {
    const [history, setHistory] = useState<AnalysisReport[]>([]);

    useEffect(() => {
        setHistory(historyService.getHistory());
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this report?')) {
            const updated = historyService.deleteItem(id);
            setHistory(updated);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getComplianceSummary = (report: AnalysisReport) => {
        if (report.error) return { status: 'Error', color: 'text-red-500' };
        if (!report.results) return { status: 'No Data', color: 'text-zinc-500' };
        
        const nonCompliantCount = report.results.filter(r => !r.isCompliant).length;
        if (nonCompliantCount === 0) return { status: 'Passed', color: 'text-green-500' };
        return { status: `${nonCompliantCount} Issues`, color: 'text-orange-500' };
    };

    return (
        <div className="min-h-screen font-sans text-zinc-800 dark:text-zinc-200">
            <Header onGoHome={onGoHome} />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Inspection History</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                            Archive of past tool geometry analyses.
                        </p>
                    </div>
                    <button 
                        onClick={onGoHome}
                        className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg font-medium transition-colors"
                    >
                        Back to Inspector
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                        <InfoIcon />
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-4">No History Found</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">
                            Upload and analyze tool images to save reports here.
                        </p>
                        <button 
                            onClick={onGoHome}
                            className="mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-transform hover:scale-105"
                        >
                            Start New Analysis
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => {
                            const summary = getComplianceSummary(item);
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => onLoadReport(item)}
                                    className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-500 rounded-xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col"
                                >
                                    <div className="relative h-48 bg-zinc-100 dark:bg-black/50 border-b border-zinc-100 dark:border-zinc-800">
                                        {item.imagePreviewUrl ? (
                                            <img 
                                                src={item.imagePreviewUrl} 
                                                alt="Tool Preview" 
                                                className="w-full h-full object-contain p-2" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                <InfoIcon />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                             <button 
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="p-1.5 bg-black/50 hover:bg-red-600 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold text-zinc-900 dark:text-white truncate flex-1 mr-2">
                                                {item.fileName || `Report #${item.id.slice(0,4)}`}
                                            </h4>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 ${summary.color}`}>
                                                {summary.status}
                                            </span>
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatDate(item.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
