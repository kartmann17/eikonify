import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, DashboardPageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    ArrowLeft,
    CreditCard,
    Download,
    ExternalLink,
    FileText,
    Image,
    Package,
    RefreshCw,
    Scissors,
    Settings,
    TrendingUp,
    X,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function Dashboard({ quota, subscription, history, invoices }: DashboardPageProps) {
    const { t } = useTranslation();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('nav.dashboard'), href: '/dashboard' }];

    const handleCancel = () => {
        setIsSubmitting(true);
        router.post('/subscription/cancel', {}, {
            onFinish: () => {
                setIsSubmitting(false);
                setCancelDialogOpen(false);
            },
        });
    };

    const handleResume = () => {
        setIsSubmitting(true);
        router.post('/subscription/resume', {}, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('dashboard.backToHome')}
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Bloc Quota */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                {t('dashboard.quota.title')}
                            </CardTitle>
                            <CardDescription>
                                {quota.plan === 'pro'
                                    ? t('dashboard.quota.descriptionPro')
                                    : t('dashboard.quota.descriptionFree')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {quota.plan === 'pro' ? (
                                <>
                                    {/* Quota Images */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Image className="h-4 w-4" />
                                            {t('dashboard.quota.imageConversions')}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{formatNumber(quota.used)} / {formatNumber(quota.quota)}</span>
                                            <span className="font-medium">{quota.percentage}%</span>
                                        </div>
                                        <Progress
                                            value={quota.percentage}
                                            className={quota.is_exceeded ? 'bg-red-100' : quota.is_warning ? 'bg-yellow-100' : ''}
                                        />
                                    </div>

                                    {/* Quota Background Removal */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Scissors className="h-4 w-4" />
                                            {t('dashboard.quota.bgRemovals')}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{formatNumber(quota.bg_used)} / {formatNumber(quota.bg_quota)}</span>
                                            <span className="font-medium">{quota.bg_percentage}%</span>
                                        </div>
                                        <Progress value={quota.bg_percentage} />
                                    </div>

                                    {quota.is_exceeded && (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                {t('dashboard.quota.exceeded', { count: formatNumber(quota.surplus), cost: formatCurrency(quota.surplus_cost) })}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {quota.is_warning && !quota.is_exceeded && (
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                {t('dashboard.quota.warning')}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                                        <span>{t('dashboard.quota.nextRenewal')}</span>
                                        <span>{quota.reset_date} ({t('dashboard.quota.days', { count: quota.days_remaining })})</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground mb-4">
                                        {t('dashboard.quota.freePlanInfo')}
                                    </p>
                                    <Link href="/billing">
                                        <Button>
                                            <Package className="mr-2 h-4 w-4" />
                                            {t('dashboard.quota.upgradeToPro')}
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bloc Abonnement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                {t('dashboard.subscription.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('dashboard.subscription.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{t('dashboard.subscription.currentPlan')}</span>
                                <Badge variant={subscription.plan === 'pro' ? 'default' : 'secondary'}>
                                    {subscription.plan === 'pro' ? t('common.pro') : t('common.free')}
                                </Badge>
                            </div>

                            {subscription.plan === 'pro' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{t('dashboard.subscription.status')}</span>
                                        <Badge
                                            variant={
                                                subscription.status === 'active'
                                                    ? 'default'
                                                    : subscription.status === 'canceling'
                                                        ? 'outline'
                                                        : 'destructive'
                                            }
                                        >
                                            {subscription.status === 'active' && t('dashboard.subscription.active')}
                                            {subscription.status === 'canceling' && t('dashboard.subscription.canceling')}
                                            {subscription.status === 'canceled' && t('dashboard.subscription.canceled')}
                                            {subscription.status === 'past_due' && t('dashboard.subscription.pastDue')}
                                        </Badge>
                                    </div>

                                    {subscription.started_at && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('dashboard.subscription.subscribedSince')}</span>
                                            <span>{subscription.started_at}</span>
                                        </div>
                                    )}

                                    {subscription.renews_at && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('dashboard.subscription.nextRenewal')}</span>
                                            <span>{subscription.renews_at}</span>
                                        </div>
                                    )}

                                    {subscription.ends_at && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('dashboard.subscription.endsAt')}</span>
                                            <span>{subscription.ends_at}</span>
                                        </div>
                                    )}

                                    {subscription.payment_method && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('dashboard.subscription.card')}</span>
                                            <span className="font-mono">
                                                {subscription.payment_method.brand.toUpperCase()} •••• {subscription.payment_method.last4}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Link href="/billing/portal" className="flex-1">
                                            <Button variant="outline" className="w-full" size="sm">
                                                <Settings className="mr-2 h-4 w-4" />
                                                {t('dashboard.subscription.manage')}
                                            </Button>
                                        </Link>

                                        {subscription.is_on_grace_period ? (
                                            <Button
                                                onClick={handleResume}
                                                disabled={isSubmitting}
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                {t('dashboard.subscription.resume')}
                                            </Button>
                                        ) : subscription.status === 'active' ? (
                                            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" className="flex-1">
                                                        <X className="mr-2 h-4 w-4" />
                                                        {t('dashboard.subscription.cancelSubscription')}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>{t('dashboard.subscription.cancelTitle')}</DialogTitle>
                                                        <DialogDescription>
                                                            {t('dashboard.subscription.cancelDescription')}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                                            {t('dashboard.subscription.keepSubscription')}
                                                        </Button>
                                                        <Button variant="destructive" onClick={handleCancel} disabled={isSubmitting}>
                                                            {isSubmitting ? t('dashboard.subscription.canceling_') : t('dashboard.subscription.confirmCancel')}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        ) : null}
                                    </div>
                                </>
                            )}

                            {subscription.plan === 'free' && (
                                <Link href="/billing">
                                    <Button className="w-full">
                                        <Package className="mr-2 h-4 w-4" />
                                        {t('dashboard.subscription.upgradePrice')}
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bloc Historique */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5" />
                                {t('dashboard.history.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('dashboard.history.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    {t('dashboard.history.empty')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {item.images_count} image{item.images_count > 1 ? 's' : ''} • {item.output_format.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.date}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.status}
                                                </Badge>
                                                {item.can_download && (
                                                    <a href={`/api/optiseo/export/${item.id}/zip`}>
                                                        <Button size="sm" variant="ghost">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bloc Factures */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {t('dashboard.invoices.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('dashboard.invoices.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    {t('dashboard.invoices.empty')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{invoice.total}</span>
                                                <span className="text-xs text-muted-foreground">{invoice.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                    {invoice.status === 'paid' ? t('dashboard.invoices.paid') : t('dashboard.invoices.pending')}
                                                </Badge>
                                                <a href={invoice.download_url} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="ghost">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            </div>
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
