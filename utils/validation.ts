
import type { AspectRatio } from '../types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates the size of an uploaded file.
 * @param file The file to validate.
 * @returns An object indicating if the file is valid and an error message if not.
 */
export function validateFileSize(file: File): { isValid: boolean; message: string | null } {
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            message: `File size cannot exceed ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
        };
    }
    return { isValid: true, message: null };
}

/**
 * Validates the video generation configuration before sending it to the API.
 * @param characterCount The number of characters to be included in the video.
 * @param aspectRatio The desired aspect ratio of the video.
 * @returns An object indicating if the configuration is valid and an error message if not.
 */
export function validateGenerationConfig(characterCount: number, aspectRatio: AspectRatio): { isValid: boolean; message: string | null } {
    // Multi-character aspect ratio constraint removed as per user request.
    // The underlying model may still have preferences, but the UI will not block the user.
    return { isValid: true, message: null };
}