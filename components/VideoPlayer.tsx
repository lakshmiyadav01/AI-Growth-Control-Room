
import React from 'react';
import type { AspectRatio } from '../types';

interface VideoPlayerProps {
    src: string;
    aspectRatio: AspectRatio;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, aspectRatio }) => {
    const aspectRatioClass = {
        '9:16': 'aspect-[9/16]',
        '16:9': 'aspect-[16/9]',
        '1:1': 'aspect-square',
    }[aspectRatio];

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">
            <div className={`w-full rounded-lg shadow-2xl shadow-indigo-900/40 overflow-hidden ${aspectRatioClass}`}>
                <video
                    key={src} // Force re-render on new video
                    src={src}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
             <a
                href={src}
                download="cinematic_ai_video.mp4"
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 text-center"
            >
                Download MP4
            </a>
        </div>
    );
};