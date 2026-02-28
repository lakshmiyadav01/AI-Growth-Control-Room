
import React from 'react';
import { MultiCharacterUploader } from './MultiCharacterUploader';
import { PromptEditor } from './PromptEditor';
import { SettingsPanel } from './SettingsPanel';
import { Loader } from './Loader';
import { VideoPlayer } from './VideoPlayer';
import type { AspectRatio, Character } from '../types';

interface EditorLayoutProps {
    characters: Character[];
    prompt: string;
    aspectRatio: AspectRatio;
    isGenerating: boolean;
    progress: number;
    loadingMessage: string;
    generatedVideoUrl: string | null;
    error: string | null;
    canGenerate: boolean;
    isMultiCharacter: boolean;
    strictFacialConsistency: boolean;
    onAddCharacter: () => void;
    onRemoveCharacter: (id: number) => void;
    onCharacterImageUpload: (id: number, file: File) => void;
    onCharacterNameChange: (id: number, name: string) => void;
    onLaunchCreator: (id: number) => void;
    onPromptChange: (prompt: string) => void;
    onAspectRatioChange: (ratio: AspectRatio) => void;
    onStrictFacialConsistencyChange: (enabled: boolean) => void;
    onGenerateClick: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = (props) => {
    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                <div className="flex flex-col gap-6">
                    <MultiCharacterUploader 
                        characters={props.characters} 
                        onAdd={props.onAddCharacter} 
                        onRemove={props.onRemoveCharacter} 
                        onImageUpload={props.onCharacterImageUpload} 
                        onNameChange={props.onCharacterNameChange} 
                        onLaunchCreator={props.onLaunchCreator} 
                    />
                    <PromptEditor prompt={props.prompt} setPrompt={props.onPromptChange} />
                    <SettingsPanel 
                        selectedAspectRatio={props.aspectRatio} 
                        onAspectRatioChange={props.onAspectRatioChange} 
                        isMultiCharacter={props.isMultiCharacter} 
                        strictFacialConsistency={props.strictFacialConsistency}
                        onStrictFacialConsistencyChange={props.onStrictFacialConsistencyChange}
                    />
                    <button 
                        onClick={props.onGenerateClick} 
                        disabled={props.isGenerating || !props.canGenerate} 
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 flex items-center justify-center text-lg shadow-lg"
                    >
                        {props.isGenerating ? 'Generating...' : 'Generate Video'}
                    </button>
                    {props.error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{props.error}</div>}
                </div>
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[300px] lg:min-h-0">
                    {props.isGenerating ? (
                        <Loader progress={props.progress} message={props.loadingMessage} />
                    ) : props.generatedVideoUrl ? (
                        <VideoPlayer src={props.generatedVideoUrl} aspectRatio={props.aspectRatio} />
                    ) : (
                        <div className="text-center text-gray-400">
                            <p className="text-lg">Your generated video will appear here.</p>
                            <p className="text-sm">Add characters and a prompt to start.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};