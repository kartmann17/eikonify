import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import AppearanceToggleTab from '@/components/appearance-tabs';
import type { BreadcrumbItem } from '@/types';

export default function Appearance() {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.settings'), href: '/settings/profile' },
        { title: t('settings.appearance.title'), href: '/settings/appearance' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.appearance.title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('settings.appearance.title')}
                        description={t('settings.appearance.description')}
                    />

                    <AppearanceToggleTab />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
