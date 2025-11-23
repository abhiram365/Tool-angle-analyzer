
export interface Point {
  x: number;
  y: number;
}

export interface AnalysisResult {
  angleName: string;
  measuredValue: number;
  originalValue?: number; // Store original AI value before calibration
  standard: string;
  isCompliant: boolean;
  recommendation?: string;
  coordinates?: {
    vertex: Point;
    point1: Point;
    point2: Point;
  };
  confidence: 'High' | 'Medium' | 'Low';
}

export interface AnalysisReport {
  id: string;
  timestamp: number;
  results: AnalysisResult[] | null;
  error: string | null;
  imagePreviewUrl: string | null;
  fileName?: string;
}

export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cuisine: string;
  calories?: string | number;
  ingredients: Ingredient[];
  instructions: string[];
}