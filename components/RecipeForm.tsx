
import React, { useState } from 'react';
import { AnalyzeIcon } from './icons/AnalyzeIcon'; // Reusing generic icon or we could rename
import { Spinner } from './DesignRecommender'; // Reuse spinner

interface RecipeFormProps {
  onGenerate: (ingredients: string, cuisine: string) => void;
  isLoading: boolean;
}

const CUISINES = [
  "Italian", "Mexican", "Thai", "Indian", "Japanese", "Chinese", 
  "French", "Mediterranean", "American", "Vegetarian", "Vegan"
];

export const RecipeForm: React.FC<RecipeFormProps> = ({ onGenerate, isLoading }) => {
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('Italian');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onGenerate(ingredients, cuisine);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="ingredients" className="block text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            What ingredients do you have?
          </label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. Chicken breast, spinach, garlic, lemon..."
            className="w-full h-32 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none text-lg"
            required
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Enter 3-5 ingredients for best results.</p>
        </div>

        <div>
          <label htmlFor="cuisine" className="block text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Select Cuisine Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CUISINES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCuisine(c)}
                className={`py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                  cuisine === c
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !ingredients.trim()}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          {isLoading ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h10" /><path d="M9 4v16" /><path d="m3 9-3 3 3 3" /><path d="M12 6A7 7 0 0 1 12 18" />
            </svg>
          )}
          {isLoading ? 'Creating Recipe...' : 'Generate Recipe'}
        </button>
      </form>
    </div>
  );
};
