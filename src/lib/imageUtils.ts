/**
 * Image compression utilities for reducing file size before upload.
 * Converts images to WebP format and resizes to max 1200px width.
 * Target: <500KB per image to reduce Supabase Storage egress.
 */

export interface CompressionResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}

/**
 * Compress and convert image to WebP format.
 * @param file - Original image file
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param quality - WebP quality 0-1 (default: 0.8)
 * @returns Promise with compressed file and stats
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1200,
    quality: number = 0.8
): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
        // Skip if not an image
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            // Set canvas size
            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to WebP blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Could not compress image'));
                        return;
                    }

                    // Create new file with WebP extension
                    const originalName = file.name.replace(/\.[^/.]+$/, '');
                    const compressedFile = new File(
                        [blob],
                        `${originalName}.webp`,
                        { type: 'image/webp' }
                    );

                    resolve({
                        file: compressedFile,
                        originalSize: file.size,
                        compressedSize: compressedFile.size,
                        compressionRatio: Math.round((1 - compressedFile.size / file.size) * 100)
                    });
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Could not load image'));
        };

        // Load image from file
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            reject(new Error('Could not read file'));
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
