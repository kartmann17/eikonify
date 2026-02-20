import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { LoaderCircle, Shield, Key } from 'lucide-react';
import AuthLayout from '@/layouts/auth-layout';

export default function TwoFactorChallenge() {
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/two-factor-challenge', {
            onFinish: () => reset(),
        });
    };

    return (
        <AuthLayout
            title="Vérification en deux étapes"
            description={
                useRecoveryCode
                    ? 'Entrez un de vos codes de récupération pour accéder à votre compte.'
                    : 'Entrez le code de votre application d\'authentification pour continuer.'
            }
        >
            <Head title="Authentification à deux facteurs" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {useRecoveryCode ? (
                    <div className="grid gap-2">
                        <Label htmlFor="recovery_code">Code de récupération</Label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="recovery_code"
                                type="text"
                                value={data.recovery_code}
                                onChange={(e) => setData('recovery_code', e.target.value)}
                                placeholder="xxxxx-xxxxx"
                                className="pl-10"
                                autoComplete="one-time-code"
                                autoFocus
                            />
                        </div>
                        <InputError message={errors.recovery_code} />
                    </div>
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor="code">Code d'authentification</Label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="pl-10"
                                autoComplete="one-time-code"
                                autoFocus
                            />
                        </div>
                        <InputError message={errors.code} />
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Vérifier
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setUseRecoveryCode(!useRecoveryCode);
                        reset();
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                    {useRecoveryCode
                        ? 'Utiliser le code d\'authentification'
                        : 'Utiliser un code de récupération'}
                </button>
            </form>
        </AuthLayout>
    );
}
