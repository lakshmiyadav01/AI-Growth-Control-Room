
import React from 'react';
import type { Character } from '../types';
import { CharacterCard } from './CharacterCard';

interface MultiCharacterUploaderProps {
    characters: Character[];
    onAdd: () => void;
    onRemove: (id: number) => void;
    onImageUpload: (id: number, file: File) => void;
    onNameChange: (id: number, name: string) => void;
    onLaunchCreator: (id: number) => void;
}

const MAX_CHARACTERS = 3;

export const MultiCharacterUploader: React.FC<MultiCharacterUploaderProps> = ({
    characters, onAdd, onRemove, onImageUpload, onNameChange, onLaunchCreator
}) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">1. Add Your Characters</h2>
            <div className="flex flex-col gap-3">
                {characters.map((char) => (
                    <CharacterCard 
                        key={char.id}
                        character={char}
                        onImageUpload={onImageUpload}
                        onNameChange={onNameChange}
                        onRemove={onRemove}
                        onLaunchCreator={onLaunchCreator}
                        canRemove={characters.length > 1}
                    />
                ))}
            </div>
             {characters.length < MAX_CHARACTERS && (
                <button 
                    onClick={onAdd}
                    className="w-full mt-3 bg-indigo-500/20 text-indigo-300 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500/40 transition-colors duration-300"
                >
                    + Add Character
                </button>
            )}
        </div>
    );
};