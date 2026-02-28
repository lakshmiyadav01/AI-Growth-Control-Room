
import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { Header } from './components/Header';
import { ApiKeySelection } from './components/ApiKeySelection';
import { EditorLayout } from './components/EditorLayout';
import { FACIAL_CONSISTENCY_INSTRUCTIONS } from './constants';
import type { AspectRatio, Character } from './types';
import { generateVideo, generateCharacterImage } from './services/geminiService';
import { validateGenerationConfig, validateFileSize } from './utils/validation';

// Lazy-load the modal component to improve initial page load performance.
const CharacterCreatorModal = React.lazy(() => import('./components/CharacterCreatorModal'));

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

// NOTE: This client-side check is a UX enhancement to prevent obvious prompt-related failures.
// It is NOT a replacement for robust, server-side content moderation, which is handled
// by the Gemini API's built-in safety filters.
const BLOCKED_KEYWORDS = ['celebrity', 'political', 'violent', 'explicit', 'blood', 'fight', 'gun', 'nsfw', 'hate speech', 'unsafe'];

function validatePrompt(prompt: string): { isValid: boolean; message: string | null } {
    const lowerCasePrompt = prompt.toLowerCase();
    for (const keyword of BLOCKED_KEYWORDS) {
        if (lowerCasePrompt.includes(keyword)) {
            return { isValid: false, message: `Prompt may violate safety guidelines due to the word '${keyword}'. Please revise.` };
        }
    }
    return { isValid: true, message: null };
}

// Helper to convert a File to a base64 string for the API
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


const App: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([{ id: Date.now(), file: null, base64: null, name: 'Person 1', previewUrl: null }]);
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [creatorModalOpen, setCreatorModalOpen] = useState<boolean>(false);
    const [editingCharacterId, setEditingCharacterId] = useState<number | null>(null);
    const [strictFacialConsistency, setStrictFacialConsistency] = useState<boolean>(true);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio) {
            setApiKeySelected(await window.aistudio.hasSelectedApiKey());
        } else {
            setApiKeySelected(true); // Default to true in environments without aistudio
        }
    }, []);

    useEffect(() => { checkApiKey(); }, [checkApiKey]);

    // Effect to clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            characters.forEach(character => {
                if (character.previewUrl) {
                    URL.revokeObjectURL(character.previewUrl);
                }
            });
        };
    }, [characters]);

    const handleAddCharacter = useCallback(() => {
        setCharacters(prev => [...prev, { id: Date.now(), file: null, base64: null, name: `Person ${prev.length + 1}`, previewUrl: null }]);
    }, []);

    const handleRemoveCharacter = useCallback((id: number) => {
        setCharacters(prev => prev.filter(char => char.id !== id));
    }, []);

    const handleCharacterImageUpload = useCallback((id: number, file: File) => {
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            setError('Please upload a valid image file (JPG or PNG).');
            return;
        }
        const validation = validateFileSize(file);
        if (!validation.isValid) {
            setError(validation.message);
            return;
        }
        setError(null);

        const previewUrl = URL.createObjectURL(file);
        setCharacters(prev => prev.map(char => char.id === id ? { ...char, file, previewUrl, base64: null } : char));
        setGeneratedVideoUrl(null);
    }, []);


    const handleCharacterNameChange = useCallback((id: number, name: string) => {
        setCharacters(prev => prev.map(char => char.id === id ? { ...char, name } : char));
    }, []);

    const handleLaunchCreator = useCallback((id: number) => {
        setEditingCharacterId(id);
        setCreatorModalOpen(true);
    }, []);

    const handleGenerateCharacter = useCallback(async (imagePrompt: string) => {
        if (!editingCharacterId) return;
        try {
            const base64 = await generateCharacterImage(imagePrompt);
            const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
            const previewUrl = URL.createObjectURL(blob);

            setCharacters(prev => prev.map(char => char.id === editingCharacterId ? { ...char, file: null, base64, previewUrl } : char));
            setCreatorModalOpen(false);
            setEditingCharacterId(null);
            setGeneratedVideoUrl(null);
        } catch (e: unknown) {
            console.error("Character generation failed:", e);
            throw e; // Re-throw to be caught by the modal
        }
    }, [editingCharacterId]);

    const handleGenerateClick = useCallback(async () => {
        const promptValidation = validatePrompt(prompt);
        if (!promptValidation.isValid) { setError(promptValidation.message); return; }

        const charactersWithImages = characters.filter(c => c.file || c.base64);
        if (charactersWithImages.length === 0 || !prompt) { setError('Please upload at least one character image and enter a prompt.'); return; }

        const configValidation = validateGenerationConfig(charactersWithImages.length, aspectRatio);
        if (!configValidation.isValid) { setError(configValidation.message); return; }

        setError(null);
        setIsGenerating(true);
        setGeneratedVideoUrl(null);
        setProgress(0);
        setLoadingMessage('Initializing AI pipeline...');

        try {
            if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
                await window.aistudio.openSelectKey();
            }

            // Convert files to base64 on-demand right before the API call
            // Prepend facial consistency instructions if the setting is enabled.
            const finalPrompt = strictFacialConsistency
                ? `${FACIAL_CONSISTENCY_INSTRUCTIONS}\n\n${prompt}`
                : prompt;

            const imagePromises = charactersWithImages.map(c => c.base64 ? Promise.resolve(c.base64) : fileToBase64(c.file!));
            const characterImagesBase64 = await Promise.all(imagePromises);

            const videoUrl = await generateVideo(characterImagesBase64, finalPrompt, aspectRatio, (p, m) => { setProgress(p); setLoadingMessage(m); });
            setGeneratedVideoUrl(videoUrl);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            if (errorMessage.toLowerCase().includes('permission denied')) {
                setApiKeySelected(false);
            }
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
            setProgress(100);
        }
    }, [characters, prompt, aspectRatio, strictFacialConsistency]);

    const handleSelectKey = useCallback(async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
            setError(null);
        } else {
            setError("API Key selection is not available in this environment.");
        }
    }, []);

    const canGenerate = useMemo(() => characters.some(c => c.file || c.base64) && prompt.length > 0, [characters, prompt]);
    const isMultiCharacter = useMemo(() => characters.filter(c => c.file || c.base64).length > 1, [characters]);

    const renderContent = () => {
        if (apiKeySelected === null) {
            return <div className="flex justify-center items-center h-screen"><p>Checking API Key...</p></div>;
        }
        if (!apiKeySelected) {
            return <ApiKeySelection onSelectKey={handleSelectKey} error={error} />;
        }
        return (
            <EditorLayout
                characters={characters}
                prompt={prompt}
                aspectRatio={aspectRatio}
                isGenerating={isGenerating}
                progress={progress}
                loadingMessage={loadingMessage}
                generatedVideoUrl={generatedVideoUrl}
                error={error}
                canGenerate={canGenerate}
                isMultiCharacter={isMultiCharacter}
                strictFacialConsistency={strictFacialConsistency}
                onAddCharacter={handleAddCharacter}
                onRemoveCharacter={handleRemoveCharacter}
                onCharacterImageUpload={handleCharacterImageUpload}
                onCharacterNameChange={handleCharacterNameChange}
                onLaunchCreator={handleLaunchCreator}
                onPromptChange={setPrompt}
                onAspectRatioChange={setAspectRatio}
                onStrictFacialConsistencyChange={setStrictFacialConsistency}
                onGenerateClick={handleGenerateClick}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            {/* FIX: Corrected typo from <Suspes> to </Suspense>. */}
            <Suspense fallback={<div />}>
                {creatorModalOpen && <CharacterCreatorModal onClose={() => setCreatorModalOpen(false)} onGenerate={handleGenerateCharacter} />}
            </Suspense>
            {renderContent()}
        </div>
    );
};

export default App;