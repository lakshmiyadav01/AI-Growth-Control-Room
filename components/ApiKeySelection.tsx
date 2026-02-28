
import React from 'react';

interface ApiKeySelectionProps {
    onSelectKey: () => void;
    error: string | null;
}

export const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ onSelectKey, error }) => {
    return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-2xl w-full">
                <h2 className="text-2xl font-bold mb-4 text-white">Project Configuration Required</h2>
                <p className="mb-6 text-gray-300">To use the Veo and Imagen models, your Google Cloud project must have two things enabled:</p>
                <div className="text-left my-6 space-y-4">
                    <div className="flex items-start">
                        <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">1</span>
                        <p className="text-gray-300"><strong>Billing:</strong> Your project must be linked to an active billing account. Learn more at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI billing</a>.</p>
                    </div>
                    <div className="flex items-start">
                        <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">2</span>
                        <p className="text-gray-300"><strong>Vertex AI API:</strong> You must enable the "Vertex AI API" in your project's API Library.</p>
                    </div>
                </div>
                <p className="mb-6 text-gray-400 text-sm">Once confirmed, click below to select your API key.</p>
                {error && <div className="mb-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}
                <button onClick={onSelectKey} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">Select API Key</button>
            </div>
        </div>
    );
};
