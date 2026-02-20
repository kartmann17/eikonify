import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { AdminDashboardProps, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    CreditCard,
    Image,
    TrendingUp,
    Users,
    Cpu,
    Globe,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Dashboard', href: '/admin' },
];

const COLORS = ['#8884d8', '#82ca9d'];

export default function AdminDashboard({ kpis, apiCosts, freeUsage, charts }: AdminDashboardProps) {
    const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Dashboard Admin</h1>
                    <Badge variant="outline">Temps réel</Badge>
                </div>

                {/* KPIs */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Abonnés Pro</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(kpis.active_pro_subscribers)}</div>
                            <p className="text-xs text-muted-foreground">abonnements actifs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">MRR</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.mrr}</div>
                            <p className="text-xs text-muted-foreground">revenu mensuel récurrent</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Images aujourd'hui</CardTitle>
                            <Image className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(kpis.images_today)}</div>
                            <p className="text-xs text-muted-foreground">conversions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Images ce mois</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(kpis.images_this_month)}</div>
                            <p className="text-xs text-muted-foreground">conversions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* API Costs + Free Usage */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="h-5 w-5" />
                                Coûts API Claude
                            </CardTitle>
                            <CardDescription>Consommation de l'API Haiku</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Appels aujourd'hui</p>
                                    <p className="text-xl font-bold">{formatNumber(apiCosts.calls_today)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Coût aujourd'hui</p>
                                    <p className="text-xl font-bold">{formatCurrency(apiCosts.cost_today_eur)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Appels ce mois</p>
                                    <p className="text-xl font-bold">{formatNumber(apiCosts.calls_this_month)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Coût ce mois</p>
                                    <p className="text-xl font-bold">{formatCurrency(apiCosts.cost_this_month_eur)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Utilisation Free
                            </CardTitle>
                            <CardDescription>Utilisateurs non connectés</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Utilisateurs uniques</p>
                                    <p className="text-xl font-bold">{formatNumber(freeUsage.unique_users_today)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Images converties</p>
                                    <p className="text-xl font-bold">{formatNumber(freeUsage.images_today)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-2">Top IPs</p>
                                <div className="space-y-1 max-h-32 overflow-auto">
                                    {freeUsage.top_ips.map((ip, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="font-mono">{ip.ip}</span>
                                            <span className="text-muted-foreground">{ip.images} imgs</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Images converties (30 jours)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts.images_per_day}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                        fontSize={12}
                                    />
                                    <YAxis fontSize={12} />
                                    <Tooltip
                                        labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                                        formatter={(value: number) => [formatNumber(value), 'Images']}
                                    />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition Free/Pro</CardTitle>
                            <CardDescription>Ce mois</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={charts.distribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {charts.distribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatNumber(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscribers Evolution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Évolution des abonnés Pro (30 jours)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={charts.subscribers_evolution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                    fontSize={12}
                                />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                                    formatter={(value: number) => [formatNumber(value), 'Abonnés']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
