import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { LoaderCircle } from 'lucide-react';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title={t('auth.register.title')} description={t('auth.register.description', 'Inscrivez-vous pour accéder à toutes les fonctionnalités')}>
            <Head title={t('auth.register.title')} />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">{t('auth.register.name')}</Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('auth.register.namePlaceholder', 'Votre nom')}
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">{t('auth.register.email')}</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="email@exemple.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">{t('auth.register.password')}</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">{t('auth.register.confirmPassword')}</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.register.submit')}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    {t('auth.register.hasAccount')}{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        {t('auth.register.loginLink')}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
