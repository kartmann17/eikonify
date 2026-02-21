import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { LoaderCircle } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <AuthLayout
            title={t('auth.forgotPassword.title')}
            description={t('auth.forgotPassword.description')}
        >
            <Head title={t('auth.forgotPassword.title')} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">{t('auth.login.email')}</Label>
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

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.forgotPassword.submit')}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary hover:underline">
                        {t('auth.forgotPassword.backToLogin')}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
