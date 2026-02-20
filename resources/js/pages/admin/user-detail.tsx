import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { AdminUserDetailProps, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    Image,
    Mail,
    Shield,
    User,
} from 'lucide-react';

export default function AdminUserDetail({ user, subscription, usage, invoices }: AdminUserDetailProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Utilisateurs', href: '/admin/users' },
        { title: user.email, href: `/admin/users/${user.id}` },
    ];

    const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Utilisateur - ${user.email}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    {user.role === 'admin' && (
                        <Badge variant="destructive">
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                        </Badge>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* User Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </span>
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Inscrit le
                                </span>
                                <span>{user.registered_at}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Email vérifié</span>
                                <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                                    {user.email_verified_at ? `Oui (${user.email_verified_at})` : 'Non'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Rôle</span>
                                <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                                    {user.role}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Abonnement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subscription ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Plan</span>
                                        <Badge>{subscription.plan}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Statut</span>
                                        <Badge
                                            variant={
                                                subscription.status === 'active'
                                                    ? 'default'
                                                    : subscription.status === 'canceled'
                                                        ? 'destructive'
                                                        : 'outline'
                                            }
                                        >
                                            {subscription.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Début</span>
                                        <span>{subscription.started_at}</span>
                                    </div>
                                    {subscription.ends_at && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Fin</span>
                                            <span>{subscription.ends_at}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-center py-4 text-muted-foreground">
                                    Aucun abonnement
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5" />
                                Utilisation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Images ce mois</span>
                                <span className="font-mono font-bold">
                                    {formatNumber(usage.images_this_month)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total images</span>
                                <span className="font-mono">{formatNumber(usage.total_images)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Appels API ce mois</span>
                                <span className="font-mono">{formatNumber(usage.api_calls_this_month)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Factures
                            </CardTitle>
                            <CardDescription>Dernières factures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">
                                    Aucune facture
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{invoice.total}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {invoice.date}
                                                </span>
                                            </div>
                                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
