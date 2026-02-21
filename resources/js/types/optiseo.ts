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
    generate_favicons?: boolean;
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

// Performance metadata for advanced SEO features
export interface PerformanceMetadata {
    blur_hash: string | null;
    lqip_data_uri: string | null;
    dominant_color: string | null;
    color_palette: string[] | null;
    has_transparency: boolean;
    aspect_ratio: string | null;
}

// Responsive image variant
export interface ImageVariant {
    id: string;
    size_name: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge';
    breakpoint: number;
    width: number;
    height: number;
    format: 'webp' | 'avif';
    file_size: number;
    url: string;
}

// Code generation types
export type CodeType = 'picture' | 'img' | 'img_srcset' | 'react' | 'vue' | 'nextjs' | 'css' | 'lazy';

export interface CodeTypeInfo {
    label: string;
    language: 'html' | 'jsx' | 'vue' | 'css';
    description: string;
}

export interface GeneratedCode {
    image_id: string;
    types: Record<CodeType, CodeTypeInfo>;
    code: Record<CodeType, string>;
}

// Performance analysis types
export interface PerformanceAnalysis {
    score: number;
    rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    lcp_impact: {
        estimated_ms: number;
        rating: 'good' | 'needs-improvement' | 'poor';
        threshold_good: number;
        threshold_poor: number;
    };
    cls_impact: {
        score: number;
        rating: 'good' | 'needs-improvement' | 'poor';
        reason: string;
    };
    load_times: {
        '3g': { label: string; time_ms: number };
        '4g': { label: string; time_ms: number };
        'wifi': { label: string; time_ms: number };
    };
    recommendations: Array<{
        priority: 'high' | 'medium' | 'low';
        type: string;
        title: string;
        description: string;
        action: string;
    }>;
    metrics: {
        file_size: number;
        compression_ratio: number | null;
        has_dimensions: boolean;
        has_alt_text: boolean;
        has_responsive_variants: boolean;
        has_performance_data: boolean;
        format: string;
    };
}

// Schema markup types
export interface ImageSchema {
    json_ld: object;
    json_ld_script: string;
    open_graph: Record<string, string>;
    open_graph_html: string;
    twitter_card: Record<string, string>;
    twitter_card_html: string;
}

// Favicon types
export interface ImageFavicon {
    id: string;
    size_name: string;
    size: number;
    file_size: number;
    url: string;
}

export interface FaviconUsage {
    plan: 'free' | 'pro';
    remaining: number | null;
    limit: number | null;
}

export interface ConvertedImage {
    id: string;
    batch_id: string;
    status: ImageStatus;
    original: OriginalFileInfo;
    converted?: ConvertedFileInfo;
    seo: SeoMetadata;
    performance?: PerformanceMetadata;
    variants?: ImageVariant[];
    favicons?: ImageFavicon[];
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
