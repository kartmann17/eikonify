import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { ApiCostsPageProps, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, DollarSign, Hash, TrendingUp } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Coûts API', href: '/admin/api-costs' },
];

export default function ApiCosts({ today, month, dailyCosts }: ApiCostsPageProps) {
    const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coûts API" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Cpu className="h-6 w-6" />
                        Coûts API Claude Haiku
                    </h1>
                </div>

                {/* Today Stats */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Aujourd'hui</h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Appels API</CardTitle>
                                <Hash className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(today.calls)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Tokens entrée</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(today.input_tokens)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Tokens sortie</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(today.output_tokens)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Coût</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(today.cost_eur)}</div>
                                <p className="text-xs text-muted-foreground">
                                    ${today.cost_usd.toFixed(4)} USD
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Month Stats */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Ce mois</h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Appels API</CardTitle>
                                <Hash className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(month.calls)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Tokens entrée</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(month.input_tokens)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Tokens sortie</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(month.output_tokens)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Coût</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(month.cost_eur)}</div>
                                <p className="text-xs text-muted-foreground">
                                    ${month.cost_usd.toFixed(4)} USD
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Daily Costs Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Évolution des coûts (30 jours)</CardTitle>
                        <CardDescription>Coûts API par jour en euros</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={dailyCosts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) =>
                                        new Date(date).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                        })
                                    }
                                    fontSize={12}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${value.toFixed(2)}€`}
                                    fontSize={12}
                                />
                                <Tooltip
                                    labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                                    formatter={(value: number, name: string) => {
                                        if (name === 'cost_eur') return [formatCurrency(value), 'Coût'];
                                        return [formatNumber(value), 'Appels'];
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cost_eur"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={true}
                                    name="cost_eur"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
