import { AnalysisReport } from '../types';

const STORAGE_KEY = 'cutting_tool_inspector_history';

export const historyService = {
  saveReport: (report: Omit<AnalysisReport, 'id' | 'timestamp'>): AnalysisReport | null => {
    try {
      const history = historyService.getHistory();
      
      // Create new item
      const newItem: AnalysisReport = {
        ...report,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      // Prepend to history (newest first)
      const updatedHistory = [newItem, ...history];
      
      // Limit history to last 50 items to save space (localStorage has ~5MB limit)
      if (updatedHistory.length > 50) {
        updatedHistory.pop();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return newItem;
    } catch (error) {
      console.error("Failed to save history:", error);
      return null;
    }
  },

  getHistory: (): AnalysisReport[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to read history:", error);
      return [];
    }
  },

  deleteItem: (id: string): AnalysisReport[] => {
    try {
      const history = historyService.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (error) {
      console.error("Failed to delete item:", error);
      return [];
    }
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
