
import React, { memo } from 'react';
import type { AspectRatio } from '../types';
import { Info } from './IconComponents';

interface SettingsPanelProps {
    selectedAspectRatio: AspectRatio;
    onAspectRatioChange: (ratio: AspectRatio) => void;
    isMultiCharacter: boolean;
    strictFacialConsistency: boolean;
    onStrictFacialConsistencyChange: (enabled: boolean) => void;
}

const aspectRatios: { value: AspectRatio; label: string, icon: React.ReactNode }[] = [
    { value: '9:16', label: 'Vertical', icon: <div className="w-4 h-6 border-2 border-current rounded-sm"></div> },
    { value: '1:1', label: 'Square', icon: <div className="w-5 h-5 border-2 border-current rounded-sm"></div> },
    { value: '16:9', label: 'Widescreen', icon: <div className="w-6 h-4 border-2 border-current rounded-sm"></div> },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = memo(({ selectedAspectRatio, onAspectRatioChange, strictFacialConsistency, onStrictFacialConsistencyChange }) => {
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
            <div>
                <h2 className="text-lg font-semibold mb-3">3. Choose Format</h2>
                <div className="grid grid-cols-3 gap-3">
                    {aspectRatios.map(({ value, label, icon }) => (
                        <button
                            key={value}
                            onClick={() => onAspectRatioChange(value)}
                            className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors duration-200 ${
                                selectedAspectRatio === value
                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                                    : 'border-gray-600 hover:border-indigo-400 text-gray-400 hover:text-white'
                            }`}
                        >
                            {icon}
                            <span className="text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                 <h2 className="text-lg font-semibold mb-3">4. Generation Settings</h2>
                 <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <label htmlFor="facial-consistency" className="font-medium text-white">Strict Facial Consistency</label>
                        <div className="group relative">
                            <Info className="w-4 h-4 text-gray-400" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-950 text-gray-300 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Enforces strict preservation of facial features from reference images. May increase generation time.
                            </div>
                        </div>
                    </div>
                    <button
                        id="facial-consistency"
                        onClick={() => onStrictFacialConsistencyChange(!strictFacialConsistency)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                            strictFacialConsistency ? 'bg-indigo-600' : 'bg-gray-600'
                        }`}
                    >
                        <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                strictFacialConsistency ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
});