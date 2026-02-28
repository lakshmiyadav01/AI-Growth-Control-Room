
import React from 'react';

interface LoaderProps {
    progress: number;
    message: string;
}

export const Loader: React.FC<LoaderProps> = ({ progress, message }) => {
    return (
        <div className="w-full max-w-md text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Generating Your Video...</h3>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm text-gray-400 mt-3 h-5">{message}</p>
        </div>
    );
};
