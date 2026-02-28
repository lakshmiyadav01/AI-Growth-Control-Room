
import React, { useState } from 'react';
import { CloseIcon, WandIcon } from './IconComponents';

interface CharacterCreatorModalProps {
    onClose: () => void;
    onGenerate: (prompt: string) => Promise<void>;
}

const PRESET_PROMPTS = [
    { name: "Photorealistic", prompt: "Ultra-realistic photograph of a person, cinematic lighting, 50mm lens, shallow depth of field." },
    { name: "Sci-Fi", prompt: "A person in a futuristic suit, neon lights, cyberpunk aesthetic, high detail." },
    { name: "Fantasy", prompt: "Portrait of an elven person, fantasy setting, magical atmosphere, detailed armor." },
    { name: "Art Studio", prompt: "Ultra-realistic live-action photograph inside a modern resin art studio. A female artist with long curly hair and glasses, working on a gray panel, sketching a tree. Soft studio lighting." }
];

const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({ onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateClick = async () => {
        if (!prompt) {
            setError("Please enter a prompt to describe your character.");
            return;
        }
        setError(null);
        setIsGenerating(true);
        try {
            await onGenerate(prompt);
        } catch (e: any) {
            setError(e.message || "Failed to generate character.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mb-4 text-white">AI Character Creator</h2>
                <p className="text-sm text-gray-400 mb-4">Describe the character you want to create. Be as specific as you like.</p>
                
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A firefighter with a determined expression, soot on her face, cinematic portrait..."
                    className="w-full h-28 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    disabled={isGenerating}
                />

                <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center"><WandIcon className="w-4 h-4 mr-2" /> Get Inspired</h3>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_PROMPTS.map(({ name, prompt: presetPrompt }) => (
                            <button
                                key={name}
                                onClick={() => setPrompt(presetPrompt)}
                                disabled={isGenerating}
                                className="text-xs bg-gray-700 hover:bg-indigo-600 text-gray-200 py-1 px-3 rounded-full transition-colors disabled:opacity-50"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-center text-sm">{error}</div>}

                <button
                    onClick={handleGenerateClick}
                    disabled={isGenerating || !prompt}
                    className="w-full mt-6 bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 flex items-center justify-center text-base"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : 'Generate Character'}
                </button>
            </div>
        </div>
    );
};

export default CharacterCreatorModal;
