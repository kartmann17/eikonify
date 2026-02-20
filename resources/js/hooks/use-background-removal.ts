import { useCallback, useRef, useState } from 'react';
import { removeBackground as removeBg, Config } from '@imgly/background-removal';

interface BgRemovalResult {
    url: string;
    filename: string;
    blob: Blob;
}

interface BgRemovalUsage {
    plan: 'free' | 'pro';
    used: number;
    quota: number;
    remaining: number;
    period: 'day' | 'month';
}

interface UseBgRemovalReturn {
    isProcessing: boolean;
    progress: number;
    error: string | null;
    result: BgRemovalResult | null;
    usage: BgRemovalUsage | null;
    removeBackground: (file: File) => Promise<BgRemovalResult | null>;
    fetchUsage: () => Promise<void>;
    incrementUsage: () => Promise<boolean>;
    reset: () => void;
}

export function useBackgroundRemoval(): UseBgRemovalReturn {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<BgRemovalResult | null>(null);
    const [usage, setUsage] = useState<BgRemovalUsage | null>(null);
    const resultUrlRef = useRef<string | null>(null);

    const fetchUsage = useCallback(async (): Promise<void> => {
        try {
            const response = await fetch('/api/optiseo/bg-remove/usage', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsage(data);
            }
        } catch (err) {
            console.error('Failed to fetch bg removal usage:', err);
        }
    }, []);

    const incrementUsage = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/optiseo/bg-remove/increment', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                await fetchUsage();
                return true;
            }

            const data = await response.json();
            setError(data.message || 'Quota dépassé');
            return false;
        } catch (err) {
            console.error('Failed to increment usage:', err);
            return false;
        }
    }, [fetchUsage]);

    const removeBackground = useCallback(async (file: File): Promise<BgRemovalResult | null> => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setResult(null);

        // Revoke previous URL to prevent memory leaks
        if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
            resultUrlRef.current = null;
        }

        // Check quota first
        const canProceed = await incrementUsage();
        if (!canProceed) {
            setIsProcessing(false);
            return null;
        }

        try {
            const config: Config = {
                progress: (key, current, total) => {
                    if (total > 0) {
                        const percent = Math.round((current / total) * 100);
                        setProgress(percent);
                    }
                },
                output: {
                    format: 'image/png',
                    quality: 1,
                },
            };

            // Process the image using the client-side library
            const blob = await removeBg(file, config);

            // Create object URL for display
            const url = URL.createObjectURL(blob);
            resultUrlRef.current = url;

            // Generate filename
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const filename = `${originalName}-no-bg.png`;

            const resultData: BgRemovalResult = {
                url,
                filename,
                blob,
            };

            setResult(resultData);
            return resultData;

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur lors du traitement';
            setError(message);
            return null;
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    }, [incrementUsage]);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setProgress(0);
        setError(null);
        setResult(null);

        if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
            resultUrlRef.current = null;
        }
    }, []);

    return {
        isProcessing,
        progress,
        error,
        result,
        usage,
        removeBackground,
        fetchUsage,
        incrementUsage,
        reset,
    };
}
