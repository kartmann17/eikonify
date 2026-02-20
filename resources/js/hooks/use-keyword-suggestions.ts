import { useCallback, useState } from 'react';
import type { KeywordSuggestion, SuggestionsResponse } from '@/types/optiseo';

interface UseKeywordSuggestionsReturn {
    suggestions: KeywordSuggestion[];
    isLoading: boolean;
    error: string | null;
    fetchSuggestions: (filename?: string, existingKeywords?: string[]) => Promise<void>;
    clearSuggestions: () => void;
}

export function useKeywordSuggestions(): UseKeywordSuggestionsReturn {
    const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async (
        filename?: string,
        existingKeywords?: string[]
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/optiseo/keywords/suggest', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    filename,
                    keywords: existingKeywords,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des suggestions');
            }

            const data: SuggestionsResponse = await response.json();
            setSuggestions(data.suggestions);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setError(null);
    }, []);

    return {
        suggestions,
        isLoading,
        error,
        fetchSuggestions,
        clearSuggestions,
    };
}
