export type QuotaData = {
    plan: 'free' | 'pro';
    used: number;
    quota: number;
    percentage: number;
    days_remaining: number;
    reset_date: string | null;
    surplus: number;
    surplus_cost: number;
    is_warning: boolean;
    is_exceeded: boolean;
    // Background removal
    bg_used: number;
    bg_quota: number;
    bg_percentage: number;
};

export type PaymentMethod = {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
};

export type SubscriptionData = {
    plan: 'free' | 'pro';
    status: 'none' | 'active' | 'canceling' | 'canceled' | 'past_due';
    started_at: string | null;
    renews_at: string | null;
    ends_at: string | null;
    payment_method: PaymentMethod | null;
    is_on_grace_period: boolean;
};

export type ConversionHistoryItem = {
    id: string;
    date: string;
    images_count: number;
    output_format: string;
    keywords: string[];
    status: string;
    can_download: boolean;
};

export type InvoiceItem = {
    id: string;
    date: string;
    total: string;
    status: 'paid' | 'pending';
    download_url: string;
};

export type DashboardPageProps = {
    quota: QuotaData;
    subscription: SubscriptionData;
    history: ConversionHistoryItem[];
    invoices: InvoiceItem[];
};

export type BillingPageProps = {
    is_subscribed: boolean;
    subscription: unknown;
    plan: {
        name: string;
        price: string;
        quota: string;
        overage: string;
        features: string[];
    };
};
