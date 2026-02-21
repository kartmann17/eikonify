import { cn } from '@/lib/utils';
import { CloudUpload, Image, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DropZoneProps {
    onFilesAdded: (files: File[]) => void;
    acceptedFormats?: string[];
    maxFiles?: number;
    maxFileSizeMb?: number;
    disabled?: boolean;
    className?: string;
}

const DEFAULT_ACCEPTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_FILE_SIZE_MB = 10;

export function DropZone({
    onFilesAdded,
    acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
    maxFiles = DEFAULT_MAX_FILES,
    maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
    disabled = false,
    className,
}: DropZoneProps) {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFilesAdded(files);
        }
    }, [disabled, onFilesAdded]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesAdded(Array.from(e.target.files));
            e.target.value = ''; // Reset input
        }
    }, [onFilesAdded]);

    const formatMaxSize = useCallback(() => {
        return `${maxFileSizeMb} Mo`;
    }, [maxFileSizeMb]);

    return (
        <div
            className={cn(
                'relative rounded-lg border-2 border-dashed transition-colors',
                isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled && 'cursor-not-allowed opacity-50',
                className
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                multiple
                accept={acceptedFormats.join(',')}
                onChange={handleFileInput}
                disabled={disabled}
                className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />

            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className={cn(
                    'mb-4 rounded-full p-4',
                    isDragging ? 'bg-primary/10' : 'bg-muted'
                )}>
                    {isDragging ? (
                        <CloudUpload className="h-10 w-10 text-primary" />
                    ) : (
                        <Image className="h-10 w-10 text-muted-foreground" />
                    )}
                </div>

                <h3 className="mb-2 text-lg font-semibold">
                    {isDragging ? t('home.dropzone.titleDragging') : t('home.dropzone.title')}
                </h3>

                <p className="mb-4 text-sm text-muted-foreground">
                    {t('home.dropzone.subtitle')}
                </p>

                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-1">
                        {acceptedFormats.map(f => f.replace('.', '').toUpperCase()).join(', ')}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1">
                        {t('home.dropzone.maxFiles', { count: maxFiles })}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1">
                        {t('home.dropzone.maxSizePerFile', { size: maxFileSizeMb })}
                    </span>
                </div>
            </div>
        </div>
    );
}
