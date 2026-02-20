import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Profile', href: '/settings/profile' },
];

type ProfileForm = {
    name: string;
    email: string;
};

type DeleteForm = {
    password: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

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
                        title="Informations du profil"
                        description="Mettez à jour votre nom et votre adresse email"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoComplete="name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
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
                                Votre adresse email n'est pas vérifiée.
                            </div>
                        )}

                        {status === 'profile-updated' && (
                            <p className="text-sm text-green-600">Profil mis à jour.</p>
                        )}

                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </form>
                </div>

                <div className="space-y-6 pt-6 border-t">
                    <HeadingSmall
                        title="Supprimer le compte"
                        description="Supprimez définitivement votre compte et toutes vos données"
                    />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Supprimer mon compte</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <form onSubmit={deleteAccount}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Toutes vos données seront supprimées.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="my-4 grid gap-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={deleteData.password}
                                        onChange={(e) => setDeleteData('password', e.target.value)}
                                        placeholder="Entrez votre mot de passe pour confirmer"
                                    />
                                    <InputError message={deleteErrors.password} />
                                </div>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                        type="submit"
                                        disabled={deleteProcessing}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleteProcessing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Supprimer
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
