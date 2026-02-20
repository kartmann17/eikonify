import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    BatchResponse,
    ConversionBatch,
    ConversionResponse,
    ConversionSettings,
} from '@/types/optiseo';

interface UseConversionReturn {
    batch: ConversionBatch | null;
    isConverting: boolean;
    progress: number;
    error: string | null;
    startConversion: (batchId: string, settings: ConversionSettings, keywords?: string[]) => Promise<void>;
    pollProgress: (batchId: string) => void;
    stopPolling: () => void;
    reset: () => void;
}

const POLL_INTERVAL = 1000; // 1 second

export function useConversion(): UseConversionReturn {
    const [batch, setBatch] = useState<ConversionBatch | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    const fetchBatchStatus = useCallback(async (batchId: string): Promise<ConversionBatch | null> => {
        try {
            const response = await fetch(`/api/optiseo/batches/${batchId}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du statut');
            }

            const data: BatchResponse = await response.json();
            return data.batch;
        } catch {
            return null;
        }
    }, []);

    const pollProgress = useCallback((batchId: string) => {
        stopPolling();

        const poll = async () => {
            const updatedBatch = await fetchBatchStatus(batchId);
            if (updatedBatch) {
                setBatch(updatedBatch);
                setProgress(updatedBatch.progress_percentage);

                if (updatedBatch.is_completed || updatedBatch.status === 'failed') {
                    stopPolling();
                    setIsConverting(false);

                    if (updatedBatch.status === 'failed') {
                        setError('La conversion a échoué');
                    }
                }
            }
        };

        // Initial poll
        poll();

        // Set up interval
        pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);
    }, [fetchBatchStatus, stopPolling]);

    const startConversion = useCallback(async (
        batchId: string,
        settings: ConversionSettings,
        keywords?: string[]
    ): Promise<void> => {
        setIsConverting(true);
        setError(null);
        setProgress(0);

        try {
            const response = await fetch('/api/optiseo/images/convert', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    batch_id: batchId,
                    ...settings,
                    keywords,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors du démarrage de la conversion');
            }

            const data: ConversionResponse = await response.json();
            setBatch(data.batch);

            // Start polling for progress
            pollProgress(batchId);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            setIsConverting(false);
            throw err;
        }
    }, [pollProgress]);

    const reset = useCallback(() => {
        stopPolling();
        setBatch(null);
        setIsConverting(false);
        setProgress(0);
        setError(null);
    }, [stopPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        batch,
        isConverting,
        progress,
        error,
        startConversion,
        pollProgress,
        stopPolling,
        reset,
    };
}
