import { Head, useForm, usePage } from '@inertiajs/react';
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
import type { Auth, BreadcrumbItem } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type ProfileForm = {
    name: string;
    email: string;
};

type DeleteForm = {
    password: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.settings'), href: '/settings/profile' },
        { title: t('nav.profile'), href: '/settings/profile' },
    ];

    const { data, setData, patch, processing, errors } = useForm<ProfileForm>({
        name: user.name,
        email: user.email,
    });

    const {
        data: deleteData,
        setData: setDeleteData,
        delete: destroy,
        processing: deleteProcessing,
        errors: deleteErrors,
        reset: resetDelete,
    } = useForm<DeleteForm>({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/profile');
    };

    const deleteAccount: FormEventHandler = (e) => {
        e.preventDefault();
        destroy('/settings/profile', {
            onFinish: () => resetDelete('password'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('settings.profile.title')}
                        description={t('settings.profile.description')}
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('settings.profile.name')}</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoComplete="name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('settings.profile.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="email"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="text-sm text-muted-foreground">
                                {t('settings.profile.emailNotVerified')}
                            </div>
                        )}

                        {status === 'profile-updated' && (
                            <p className="text-sm text-green-600">{t('settings.profile.updated')}</p>
                        )}

                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {t('settings.profile.save')}
                        </Button>
                    </form>
                </div>

                <div className="space-y-6 pt-6 border-t">
                    <HeadingSmall
                        title={t('settings.deleteAccount.title')}
                        description={t('settings.deleteAccount.description')}
                    />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">{t('settings.deleteAccount.button')}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <form onSubmit={deleteAccount}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('settings.deleteAccount.confirmTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('settings.deleteAccount.confirmDescription')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="my-4 grid gap-2">
                                    <Label htmlFor="password">{t('settings.deleteAccount.password')}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={deleteData.password}
                                        onChange={(e) => setDeleteData('password', e.target.value)}
                                        placeholder={t('settings.deleteAccount.passwordPlaceholder')}
                                    />
                                    <InputError message={deleteErrors.password} />
                                </div>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('settings.deleteAccount.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                        type="submit"
                                        disabled={deleteProcessing}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleteProcessing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('settings.deleteAccount.confirm')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </form>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
