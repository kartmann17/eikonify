/**
 * OptiSEO Images - TypeScript Types
 */

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type OutputFormat = 'webp' | 'avif' | 'both';

export interface ConversionSettings {
    format: OutputFormat;
    quality: number;
    max_width?: number | null;
    max_height?: number | null;
    maintain_aspect_ratio: boolean;
}

export interface SeoMetadata {
    filename: string | null;
    alt_text: string | null;
    title_text: string | null;
    meta_description: string | null;
}

export interface OriginalFileInfo {
    name: string;
    format: string;
    size: number;
    width: number | null;
    height: number | null;
    url: string | null;
}

export interface ConvertedFileInfo {
    filename: string;
    format: string;
    size: number;
    width: number;
    height: number;
    url: string | null;
}

export interface ConvertedImage {
    id: string;
    batch_id: string;
    status: ImageStatus;
    original: OriginalFileInfo;
    converted?: ConvertedFileInfo;
    seo: SeoMetadata;
    compression_ratio: number | null;
    size_saved: number | null;
    error_message?: string;
    created_at: string;
    updated_at: string;
}

export interface ConversionBatch {
    id: string;
    status: BatchStatus;
    settings: ConversionSettings;
    keywords: string[];
    total_images: number;
    processed_images: number;
    progress_percentage: number;
    is_completed: boolean;
    is_processing: boolean;
    expires_at: string;
    created_at: string;
    images: ConvertedImage[];
}

export interface KeywordSuggestion {
    keyword: string;
    source: 'filename' | 'semantic' | 'longtail';
    relevance: number;
}

export interface ImagePreview {
    file: File;
    preview: string;
    name: string;
    size: number;
    type: string;
}

export interface UploadResponse {
    message: string;
    batch: ConversionBatch;
}

export interface ConversionResponse {
    message: string;
    batch: ConversionBatch;
}

export interface BatchResponse {
    batch: ConversionBatch;
}

export interface ImageResponse {
    image: ConvertedImage;
}

export interface SuggestionsResponse {
    suggestions: KeywordSuggestion[];
}

// Helper type for the conversion workflow step
export type WorkflowStep = 'upload' | 'keywords' | 'settings' | 'preview' | 'convert' | 'result';

// Props for components
export interface DropZoneProps {
    onFilesAdded: (files: File[]) => void;
    acceptedFormats?: string[];
    maxFiles?: number;
    maxFileSize?: number;
    disabled?: boolean;
    className?: string;
}

export interface ImageCardProps {
    image: ConvertedImage;
    onRemove?: () => void;
    onSeoEdit?: (seo: Partial<SeoMetadata>) => void;
    showComparison?: boolean;
}

export interface ConversionSettingsProps {
    settings: ConversionSettings;
    onChange: (settings: ConversionSettings) => void;
    disabled?: boolean;
}

export interface KeywordInputProps {
    keywords: string[];
    onChange: (keywords: string[]) => void;
    suggestions?: KeywordSuggestion[];
    onFetchSuggestions?: (filename?: string) => void;
    disabled?: boolean;
}

export interface BatchProgressProps {
    batch: ConversionBatch;
    showDetails?: boolean;
}

export interface ExportPanelProps {
    batch: ConversionBatch;
    onExport: (format: 'zip' | 'csv' | 'json' | 'html') => void;
}

// Utility functions types
export type FormatFileSize = (bytes: number) => string;
export type FormatPercentage = (value: number) => string;
