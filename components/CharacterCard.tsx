
import React, { useState, useCallback, memo } from 'react';
import type { Character } from '../types';
import { UploadIcon, TrashIcon, WandIcon } from './IconComponents';

interface CharacterCardProps {
    character: Character;
    onImageUpload: (id: number, file: File) => void;
    onNameChange: (id: number, name: string) => void;
    onRemove: (id: number) => void;
    onLaunchCreator: (id: number) => void;
    canRemove: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = memo(({ character, onImageUpload, onNameChange, onRemove, onLaunchCreator, canRemove }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback((files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            onImageUpload(character.id, file);
        }
    }, [onImageUpload, character.id]);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);

    return (
        <div className="bg-gray-700/50 p-3 rounded-lg flex gap-4 items-center">
            <div className="relative w-24 h-24">
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-indigo-400'}`}
                    onClick={() => document.getElementById(`file-upload-${character.id}`)?.click()}
                >
                    <input id={`file-upload-${character.id}`} type="file" className="hidden" accept="image/jpeg, image/png" onChange={(e) => handleFileChange(e.target.files)} />
                    {character.previewUrl ? (
                        <img src={character.previewUrl} alt={character.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 scale-75">
                            <UploadIcon className="w-8 h-8 mb-1" />
                            <p className="text-xs font-semibold">Add Image</p>
                        </div>
                    )}
                </div>
                 {!character.previewUrl && (
                     <button 
                        onClick={() => onLaunchCreator(character.id)}
                        className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                        title="Create with AI"
                    >
                        <WandIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex-grow">
                <input
                    type="text"
                    value={character.name}
                    onChange={(e) => onNameChange(character.id, e.target.value)}
                    placeholder="Character Name"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>
            {canRemove && (
                 <button onClick={() => onRemove(character.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <TrashIcon className="w-6 h-6" />
                </button>
            )}
        </div>
    );
});