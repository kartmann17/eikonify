import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Wand2, Plus, Lock, Crown } from 'lucide-react';
import type { KeywordSuggestion } from '@/types/optiseo';

interface ActivityKeywordDialogProps {
    onKeywordsGenerated: (keywords: string[]) => void;
    disabled?: boolean;
    isPro?: boolean;
}

export function ActivityKeywordDialog({ onKeywordsGenerated, disabled, isPro = false }: ActivityKeywordDialogProps) {
    const [open, setOpen] = useState(false);
    const [activity, setActivity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSuggestions = async () => {
        if (activity.trim().length < 10) {
            setError('Veuillez décrire votre activité en au moins 10 caractères.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        setSelectedKeywords([]);

        try {
            const response = await fetch('/api/optiseo/keywords/suggest-from-activity', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    activity: activity.trim(),
                    language: 'fr',
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors de la génération');
            }

            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setSelectedKeywords([]);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords(prev =>
            prev.includes(keyword)
                ? prev.filter(k => k !== keyword)
                : [...prev, keyword]
        );
    };

    const handleConfirm = () => {
        onKeywordsGenerated(selectedKeywords);
        setOpen(false);
        // Reset state
        setActivity('');
        setSuggestions([]);
        setSelectedKeywords([]);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'produit':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'service':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'adjectif':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'lieu':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
                    {isPro ? (
                        <Wand2 className="h-4 w-4" />
                    ) : (
                        <Lock className="h-4 w-4" />
                    )}
                    Suggérer par IA
                    {!isPro && (
                        <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            <Crown className="mr-1 h-3 w-3" />
                            Pro
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Génération de mots-clés par IA
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            <Crown className="mr-1 h-3 w-3" />
                            Pro
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Décrivez votre activité et l'IA vous suggérera des mots-clés SEO pertinents pour vos images.
                    </DialogDescription>
                </DialogHeader>

                {!isPro ? (
                    <div className="py-8 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Fonctionnalité Pro</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                La génération de mots-clés par IA est réservée aux abonnés Pro.
                            </p>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>Avec le plan Pro à 9,99€/mois :</p>
                            <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                                <li>500 images par mois</li>
                                <li>500 suppressions d'arrière-plan</li>
                                <li>Suggestions IA personnalisées</li>
                                <li>Historique des conversions</li>
                                <li>Export ZIP, CSV, JSON, HTML</li>
                            </ul>
                        </div>
                        <Link href="/billing">
                            <Button className="gap-2">
                                <Crown className="h-4 w-4" />
                                Passer au plan Pro
                            </Button>
                        </Link>
                    </div>
                ) : (
                <>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="activity">Décrivez votre activité</Label>
                        <Textarea
                            id="activity"
                            placeholder="Ex: Je suis photographe de mariage spécialisé dans les cérémonies en plein air dans le sud de la France. Je propose également des séances photo de couple et des portraits..."
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            rows={4}
                            className="resize-none"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Plus votre description est détaillée, plus les suggestions seront pertinentes.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <Button
                        onClick={handleGenerateSuggestions}
                        disabled={isLoading || activity.trim().length < 10}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Génération en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Générer les suggestions
                            </>
                        )}
                    </Button>

                    {suggestions.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Sélectionnez les mots-clés à utiliser</Label>
                                <span className="text-xs text-muted-foreground">
                                    {selectedKeywords.length} sélectionné{selectedKeywords.length > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-48 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className={`cursor-pointer transition-all ${
                                            selectedKeywords.includes(suggestion.keyword)
                                                ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                                                : getCategoryColor(suggestion.category || 'general')
                                        }`}
                                        onClick={() => toggleKeyword(suggestion.keyword)}
                                    >
                                        {selectedKeywords.includes(suggestion.keyword) && (
                                            <Plus className="mr-1 h-3 w-3 rotate-45" />
                                        )}
                                        {suggestion.keyword}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedKeywords.length === 0}
                    >
                        Ajouter {selectedKeywords.length} mot{selectedKeywords.length > 1 ? 's' : ''}-clé{selectedKeywords.length > 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
                </>
                )}
            </DialogContent>
        </Dialog>
    );
}
