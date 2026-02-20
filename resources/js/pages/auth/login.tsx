import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { LoaderCircle } from 'lucide-react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Connexion" description="Connectez-vous à votre compte Eikonify">
            <Head title="Connexion" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="email"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="email@exemple.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                        Se souvenir de moi
                    </Label>
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Créer un compte
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
