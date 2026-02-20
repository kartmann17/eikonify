import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';
import { LoaderCircle, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Two-Factor Auth', href: '/settings/two-factor' },
];

export default function TwoFactor({
    twoFactorEnabled,
    requiresConfirmation,
}: {
    twoFactorEnabled: boolean;
    requiresConfirmation: boolean;
}) {
    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    const enableTwoFactor = () => {
        setEnabling(true);
        router.post('/user/two-factor-authentication', {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Fetch QR code
                fetch('/user/two-factor-qr-code')
                    .then((res) => res.json())
                    .then((data) => setQrCode(data.svg));

                // Fetch recovery codes
                fetch('/user/two-factor-recovery-codes')
                    .then((res) => res.json())
                    .then((data) => setRecoveryCodes(data));
            },
            onFinish: () => setEnabling(false),
        });
    };

    const confirmTwoFactor: FormEventHandler = (e) => {
        e.preventDefault();
        post('/user/confirmed-two-factor-authentication', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setQrCode(null);
            },
        });
    };

    const disableTwoFactor = () => {
        setDisabling(true);
        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,
            onFinish: () => {
                setDisabling(false);
                setQrCode(null);
                setRecoveryCodes([]);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Authentification à deux facteurs"
                        description="Ajoutez une couche de sécurité supplémentaire à votre compte"
                    />

                    {twoFactorEnabled ? (
                        <Alert className="border-green-200 bg-green-50">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                L'authentification à deux facteurs est activée.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert>
                            <ShieldOff className="h-4 w-4" />
                            <AlertDescription>
                                L'authentification à deux facteurs n'est pas activée.
                            </AlertDescription>
                        </Alert>
                    )}

                    {qrCode && !twoFactorEnabled && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
                            </p>
                            <div
                                className="inline-block bg-white p-4 rounded-lg"
                                dangerouslySetInnerHTML={{ __html: qrCode }}
                            />

                            {requiresConfirmation && (
                                <form onSubmit={confirmTwoFactor} className="space-y-4">
                                    <div className="grid gap-2 max-w-xs">
                                        <Label htmlFor="code">Code de confirmation</Label>
                                        <Input
                                            id="code"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                        <InputError message={errors.code} />
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirmer
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}

                    {recoveryCodes.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Conservez ces codes de récupération dans un endroit sûr. Ils vous permettront de récupérer l'accès à votre compte si vous perdez votre appareil.
                            </p>
                            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                                {recoveryCodes.map((code, i) => (
                                    <div key={i}>{code}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {twoFactorEnabled ? (
                            <Button variant="destructive" onClick={disableTwoFactor} disabled={disabling}>
                                {disabling && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Désactiver
                            </Button>
                        ) : (
                            <Button onClick={enableTwoFactor} disabled={enabling}>
                                {enabling && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                <Shield className="mr-2 h-4 w-4" />
                                Activer
                            </Button>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
