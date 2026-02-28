
import React, { memo } from 'react';
import { PRESET_PROMPTS } from '../constants';
import { WandIcon } from './IconComponents';

interface PromptEditorProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = memo(({ prompt, setPrompt }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">2. Describe Your Scene</h2>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cinematic shot of Person 1 walking in the rain while Person 2 watches from a cafe..."
                className="w-full h-24 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
             <p className="text-xs text-gray-400 mt-2">
                Tip: Use the character names (e.g., "Person 1") in your prompt to control their actions.
            </p>
            <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center"><WandIcon className="w-4 h-4 mr-2" /> Preset Prompts</h3>
                <div className="flex flex-wrap gap-2">
                    {PRESET_PROMPTS.map((p, index) => (
                        <button
                            key={index}
                            onClick={() => setPrompt(p)}
                            className="text-xs bg-gray-700 hover:bg-indigo-600 text-gray-200 py-1 px-3 rounded-full transition-colors"
                        >
                            {p.split(',')[0]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});