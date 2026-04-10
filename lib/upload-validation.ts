/** Allowed image MIME types for upload */
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
]);

/** Maximum file size in bytes (5 MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate a file before uploading. Returns null if valid, or an error message string.
 */
export function validateImageFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return `Invalid file type "${file.type}". Only JPEG, PNG, GIF, and WebP images are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        return `File is too large (${sizeMB} MB). Maximum size is 5 MB.`;
    }
    return null;
}

/**
 * Validate multiple files. Returns null if all valid, or the first error message.
 */
export function validateImageFiles(files: FileList | File[]): string | null {
    for (const file of Array.from(files)) {
        const error = validateImageFile(file);
        if (error) return error;
    }
    return null;
}
