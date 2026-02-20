import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import AppearanceToggleTab from '@/components/appearance-tabs';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Appearance', href: '/settings/appearance' },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Apparence"
                        description="Personnalisez l'apparence de l'application"
                    />

                    <AppearanceToggleTab />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
