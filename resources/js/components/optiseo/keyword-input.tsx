import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { KeywordSuggestion } from '@/types/optiseo';
import { Plus, Sparkles, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface KeywordInputProps {
    keywords: string[];
    onChange: (keywords: string[]) => void;
    suggestions?: KeywordSuggestion[];
    onFetchSuggestions?: () => void;
    maxKeywords?: number;
    disabled?: boolean;
    className?: string;
}

export function KeywordInput({
    keywords,
    onChange,
    suggestions = [],
    onFetchSuggestions,
    maxKeywords = 10,
    disabled = false,
    className,
}: KeywordInputProps) {
    const [inputValue, setInputValue] = useState('');

    const addKeyword = useCallback((keyword: string) => {
        const trimmed = keyword.trim().toLowerCase();
        if (trimmed && !keywords.includes(trimmed) && keywords.length < maxKeywords) {
            onChange([...keywords, trimmed]);
            setInputValue('');
        }
    }, [keywords, onChange, maxKeywords]);

    const removeKeyword = useCallback((index: number) => {
        onChange(keywords.filter((_, i) => i !== index));
    }, [keywords, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
            removeKeyword(keywords.length - 1);
        }
    }, [inputValue, addKeyword, keywords.length, removeKeyword]);

    const handleSuggestionClick = useCallback((suggestion: KeywordSuggestion) => {
        addKeyword(suggestion.keyword);
    }, [addKeyword]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Input field */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Entrez un mot-clé et appuyez sur Entrée..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || keywords.length >= maxKeywords}
                        className="pr-10"
                    />
                    {inputValue && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                            onClick={() => addKeyword(inputValue)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {onFetchSuggestions && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onFetchSuggestions}
                        disabled={disabled}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Suggestions
                    </Button>
                )}
            </div>

            {/* Keywords list */}
            {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1 pr-1"
                        >
                            {keyword}
                            <button
                                type="button"
                                onClick={() => removeKeyword(index)}
                                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Counter */}
            <p className="text-xs text-muted-foreground">
                {keywords.length} / {maxKeywords} mots-clés
            </p>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.keyword}
                                <span className="ml-1 text-xs opacity-60">
                                    {suggestion.relevance}%
                                </span>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
