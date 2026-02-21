import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { ConversionSettings as ConversionSettingsType, FaviconUsage, OutputFormat } from '@/types/optiseo';
import { Image as ImageIcon } from 'lucide-react';

interface ConversionSettingsProps {
    settings: ConversionSettingsType;
    onChange: (settings: ConversionSettingsType) => void;
    faviconUsage?: FaviconUsage;
    disabled?: boolean;
    className?: string;
}

export function ConversionSettings({
    settings,
    onChange,
    faviconUsage,
    disabled = false,
    className,
}: ConversionSettingsProps) {
    const updateSetting = <K extends keyof ConversionSettingsType>(
        key: K,
        value: ConversionSettingsType[K]
    ) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Output Format */}
            <div className="space-y-2">
                <Label htmlFor="format">Format de sortie</Label>
                <Select
                    value={settings.format}
                    onValueChange={(value: OutputFormat) => updateSetting('format', value)}
                    disabled={disabled}
                >
                    <SelectTrigger id="format">
                        <SelectValue placeholder="Sélectionnez un format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="webp">
                            <div className="flex flex-col">
                                <span>WebP</span>
                                <span className="text-xs text-muted-foreground">
                                    Excellent support navigateurs, bonne compression
                                </span>
                            </div>
                        </SelectItem>
                        <SelectItem value="avif">
                            <div className="flex flex-col">
                                <span>AVIF</span>
                                <span className="text-xs text-muted-foreground">
                                    Meilleure compression, support croissant
                                </span>
                            </div>
                        </SelectItem>
                        <SelectItem value="both">
                            <div className="flex flex-col">
                                <span>WebP + AVIF</span>
                                <span className="text-xs text-muted-foreground">
                                    Les deux formats pour une compatibilité maximale
                                </span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Quality Slider */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Qualité de compression</Label>
                    <span className="text-sm font-medium">{settings.quality}%</span>
                </div>
                <Slider
                    value={[settings.quality]}
                    onValueChange={([value]) => updateSetting('quality', value)}
                    min={1}
                    max={100}
                    step={1}
                    disabled={disabled}
                    className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Petite taille</span>
                    <span>Haute qualité</span>
                </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
                <Label>Dimensions maximales (optionnel)</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="max-width" className="text-xs text-muted-foreground">
                            Largeur max (px)
                        </Label>
                        <Input
                            id="max-width"
                            type="number"
                            placeholder="Ex: 1920"
                            value={settings.max_width ?? ''}
                            onChange={(e) => updateSetting(
                                'max_width',
                                e.target.value ? parseInt(e.target.value) : null
                            )}
                            min={1}
                            max={4096}
                            disabled={disabled}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="max-height" className="text-xs text-muted-foreground">
                            Hauteur max (px)
                        </Label>
                        <Input
                            id="max-height"
                            type="number"
                            placeholder="Ex: 1080"
                            value={settings.max_height ?? ''}
                            onChange={(e) => updateSetting(
                                'max_height',
                                e.target.value ? parseInt(e.target.value) : null
                            )}
                            min={1}
                            max={4096}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            {/* Maintain Aspect Ratio */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="maintain-ratio"
                    checked={settings.maintain_aspect_ratio}
                    onCheckedChange={(checked) =>
                        updateSetting('maintain_aspect_ratio', checked as boolean)
                    }
                    disabled={disabled}
                />
                <Label htmlFor="maintain-ratio" className="cursor-pointer">
                    Conserver les proportions
                </Label>
            </div>

            {/* Generate Favicons */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="generate-favicons"
                        checked={settings.generate_favicons ?? false}
                        onCheckedChange={(checked) =>
                            updateSetting('generate_favicons', checked as boolean)
                        }
                        disabled={disabled || (faviconUsage?.plan === 'free' && faviconUsage?.remaining === 0)}
                    />
                    <Label htmlFor="generate-favicons" className="cursor-pointer flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Générer les favicons & icônes app
                    </Label>
                    {faviconUsage?.plan === 'free' && (
                        <Badge variant="outline" className="text-xs">
                            {faviconUsage.remaining}/{faviconUsage.limit} restant
                        </Badge>
                    )}
                    {faviconUsage?.plan === 'pro' && (
                        <Badge variant="secondary" className="text-xs">
                            Pro
                        </Badge>
                    )}
                </div>
                {settings.generate_favicons && (
                    <p className="text-xs text-muted-foreground ml-6">
                        Génère 6 tailles : 16×16, 32×32, 180×180 (Apple), 192×192 & 512×512 (Android), 150×150 (Windows)
                    </p>
                )}
            </div>

            {/* Settings Summary */}
            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p className="font-medium">Résumé des paramètres :</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Format : {settings.format.toUpperCase()}</li>
                    <li>• Qualité : {settings.quality}%</li>
                    {(settings.max_width || settings.max_height) && (
                        <li>
                            • Dimensions max : {settings.max_width || '∞'} × {settings.max_height || '∞'} px
                            {settings.maintain_aspect_ratio && ' (proportions conservées)'}
                        </li>
                    )}
                    {settings.generate_favicons && (
                        <li>• Favicons : 6 tailles générées</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
