import { useCallback, useState } from 'react';
import type {
    ConversionBatch,
    ImagePreview,
    UploadResponse,
} from '@/types/optiseo';

export interface PlanLimits {
    maxFilesPerBatch: number;
    maxFileSizeMb: number;
    maxBatchSizeMb: number;
    maxWidth: number;
    maxHeight: number;
}

export const FREE_PLAN_LIMITS: PlanLimits = {
    maxFilesPerBatch: 5,
    maxFileSizeMb: 10,
    maxBatchSizeMb: 25,
    maxWidth: 4096,
    maxHeight: 4096,
};

export const PRO_PLAN_LIMITS: PlanLimits = {
    maxFilesPerBatch: 20,
    maxFileSizeMb: 10,
    maxBatchSizeMb: 100,
    maxWidth: 8192,
    maxHeight: 8192,
};

interface UseImageUploadOptions {
    isPro?: boolean;
    limits?: Partial<PlanLimits>;
}

interface UseImageUploadReturn {
    files: File[];
    previews: ImagePreview[];
    isUploading: boolean;
    progress: number;
    errors: string[];
    batch: ConversionBatch | null;
    limits: PlanLimits;
    totalSize: number;
    addFiles: (files: FileList | File[]) => void;
    removeFile: (index: number) => void;
    clearFiles: () => void;
    upload: (keywords?: string[]) => Promise<ConversionBatch>;
    reset: () => void;
}

const ACCEPTED_MIMES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    'image/webp',
];

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
    const { isPro = false, limits: customLimits } = options;

    // Get plan limits
    const baseLimits = isPro ? PRO_PLAN_LIMITS : FREE_PLAN_LIMITS;
    const limits: PlanLimits = { ...baseLimits, ...customLimits };

    const maxFileSize = limits.maxFileSizeMb * 1024 * 1024;
    const maxBatchSize = limits.maxBatchSizeMb * 1024 * 1024;

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<ImagePreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);
    const [batch, setBatch] = useState<ConversionBatch | null>(null);

    // Calculate total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    const validateFile = useCallback((file: File, currentTotalSize: number): string | null => {
        if (!ACCEPTED_MIMES.includes(file.type)) {
            return `Format non supporté: ${file.name}`;
        }
        if (file.size > maxFileSize) {
            return `Fichier trop volumineux: ${file.name} (max ${limits.maxFileSizeMb} Mo)`;
        }
        if (currentTotalSize + file.size > maxBatchSize) {
            return `Taille totale du lot dépassée (max ${limits.maxBatchSizeMb} Mo)`;
        }
        return null;
    }, [maxFileSize, maxBatchSize, limits.maxFileSizeMb, limits.maxBatchSizeMb]);

    const createPreview = useCallback((file: File): ImagePreview => {
        return {
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type,
        };
    }, []);

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);
        const newErrors: string[] = [];
        const validFiles: File[] = [];
        let runningTotalSize = totalSize;

        fileArray.forEach(file => {
            if (files.length + validFiles.length >= limits.maxFilesPerBatch) {
                newErrors.push(`Nombre maximum de fichiers atteint (${limits.maxFilesPerBatch})`);
                return;
            }

            const error = validateFile(file, runningTotalSize);
            if (error) {
                newErrors.push(error);
            } else {
                validFiles.push(file);
                runningTotalSize += file.size;
            }
        });

        // Deduplicate errors
        const uniqueErrors = [...new Set(newErrors)];
        if (uniqueErrors.length > 0) {
            setErrors(prev => [...prev, ...uniqueErrors]);
        }

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            setPreviews(prev => [...prev, ...validFiles.map(createPreview)]);
        }
    }, [files.length, totalSize, limits.maxFilesPerBatch, validateFile, createPreview]);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            // Revoke the URL to free memory
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const clearFiles = useCallback(() => {
        // Revoke all preview URLs
        previews.forEach(p => URL.revokeObjectURL(p.preview));
        setFiles([]);
        setPreviews([]);
        setErrors([]);
    }, [previews]);

    const upload = useCallback(async (keywords: string[] = []): Promise<ConversionBatch> => {
        if (files.length === 0) {
            throw new Error('Aucun fichier à uploader');
        }

        setIsUploading(true);
        setProgress(0);
        setErrors([]);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images[]', file);
        });
        keywords.forEach(keyword => {
            formData.append('keywords[]', keyword);
        });

        try {
            const response = await fetch('/api/optiseo/images/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'upload');
            }

            const data: UploadResponse = await response.json();
            setBatch(data.batch);
            setProgress(100);
            return data.batch;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur inconnue';
            setErrors(prev => [...prev, message]);
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, [files]);

    const reset = useCallback(() => {
        clearFiles();
        setBatch(null);
        setProgress(0);
    }, [clearFiles]);

    return {
        files,
        previews,
        isUploading,
        progress,
        errors,
        batch,
        limits,
        totalSize,
        addFiles,
        removeFile,
        clearFiles,
        upload,
        reset,
    };
}
