import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { AdminUsersPageProps, BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ExternalLink, Search, Users } from 'lucide-react';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Utilisateurs', href: '/admin/users' },
];

export default function AdminUsers({ users, filters }: AdminUsersPageProps) {
    const [search, setSearch] = useState(filters.search || '');

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            router.get('/admin/users', { filter: filters.filter, search: value || undefined }, {
                preserveState: true,
                replace: true,
            });
        }, 300),
        [filters.filter]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleFilterChange = (value: string) => {
        router.get('/admin/users', { filter: value, search: filters.search || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Utilisateurs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Utilisateurs
                    </h1>
                    <Badge variant="secondary">{formatNumber(users.total)} total</Badge>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Liste des utilisateurs</CardTitle>
                                <CardDescription>Gérez les comptes et abonnements</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Rechercher par email..."
                                        className="pl-8 w-[250px]"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                <Select value={filters.filter} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Filtrer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="canceled">Annulés</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Images/mois</TableHead>
                                    <TableHead>Inscrit le</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Aucun utilisateur trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.email}</span>
                                                    <span className="text-xs text-muted-foreground">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'}>
                                                    {user.plan === 'pro' ? 'Pro' : 'Free'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.subscription_status === 'active'
                                                            ? 'default'
                                                            : user.subscription_status === 'canceled'
                                                                ? 'destructive'
                                                                : 'outline'
                                                    }
                                                >
                                                    {user.subscription_status === 'active' && 'Actif'}
                                                    {user.subscription_status === 'canceled' && 'Annulé'}
                                                    {user.subscription_status === 'none' && '-'}
                                                    {!['active', 'canceled', 'none'].includes(user.subscription_status) &&
                                                        user.subscription_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(user.images_this_month)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.registered_at}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Button size="sm" variant="ghost">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {users.current_page} sur {users.last_page}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={users.current_page === 1}
                                        onClick={() => router.get('/admin/users', {
                                            ...filters,
                                            page: users.current_page - 1,
                                        })}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={users.current_page === users.last_page}
                                        onClick={() => router.get('/admin/users', {
                                            ...filters,
                                            page: users.current_page + 1,
                                        })}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
