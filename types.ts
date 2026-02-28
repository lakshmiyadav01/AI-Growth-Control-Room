
export type AspectRatio = '9:16' | '1:1' | '16:9';

export type ProgressCallback = (progress: number, message: string) => void;

export interface Character {
    id: number;
    file: File | null;
    base64: string | null; // Stores generated or pre-loaded base64
    previewUrl: string | null; // For efficient rendering of uploaded files
    name: string;
}
