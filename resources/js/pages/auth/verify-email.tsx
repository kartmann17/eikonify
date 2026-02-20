import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <AuthLayout
            title="Vérifiez votre email"
            description="Cliquez sur le lien envoyé à votre adresse email pour vérifier votre compte"
        >
            <Head title="Vérification email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Un nouveau lien de vérification a été envoyé à votre adresse email.
                </div>
            )}

            <div className="flex flex-col gap-4">
                <p className="text-center text-sm text-muted-foreground">
                    Avant de continuer, veuillez vérifier votre email en cliquant sur le lien que nous vous avons envoyé.
                    Si vous n'avez pas reçu l'email, nous pouvons vous en envoyer un autre.
                </p>

                <form onSubmit={submit}>
                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Renvoyer l'email de vérification
                    </Button>
                </form>

                <div className="text-center">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="text-sm text-muted-foreground hover:text-primary"
                    >
                        Se déconnecter
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
