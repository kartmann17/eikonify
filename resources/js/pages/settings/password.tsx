import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';
import { LoaderCircle } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

type PasswordForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export default function Password() {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.settings'), href: '/settings/profile' },
        { title: t('settings.password.title'), href: '/settings/password' },
    ];

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm<PasswordForm>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/settings/password', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('settings.password.title')}
                        description={t('settings.password.description')}
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">{t('settings.password.currentPassword')}</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                autoComplete="current-password"
                            />
                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('settings.password.newPassword')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">{t('settings.password.confirmPassword')}</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {recentlySuccessful && (
                            <p className="text-sm text-green-600">{t('settings.password.updated')}</p>
                        )}

                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {t('settings.password.submit')}
                        </Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
