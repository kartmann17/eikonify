import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { LoaderCircle, Lock } from 'lucide-react';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/user/confirm-password', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirmation du mot de passe"
            description="Ceci est une zone sécurisée. Veuillez confirmer votre mot de passe avant de continuer."
        >
            <Head title="Confirmer le mot de passe" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Votre mot de passe"
                            className="pl-10"
                            autoFocus
                        />
                    </div>
                    <InputError message={errors.password} />
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmer
                </Button>
            </form>
        </AuthLayout>
    );
}
