export type AdminKpis = {
    active_pro_subscribers: number;
    mrr: string;
    images_today: number;
    images_this_month: number;
};

export type ApiCostsSummary = {
    calls_today: number;
    calls_this_month: number;
    cost_today_eur: number;
    cost_this_month_eur: number;
};

export type FreeUsageSummary = {
    unique_users_today: number;
    images_today: number;
    top_ips: Array<{
        ip: string;
        images: number;
    }>;
};

export type ChartDataPoint = {
    date: string;
    count: number;
};

export type DistributionDataPoint = {
    name: string;
    value: number;
};

export type AdminChartsData = {
    subscribers_evolution: ChartDataPoint[];
    images_per_day: ChartDataPoint[];
    distribution: DistributionDataPoint[];
};

export type AdminDashboardProps = {
    kpis: AdminKpis;
    apiCosts: ApiCostsSummary;
    freeUsage: FreeUsageSummary;
    charts: AdminChartsData;
};

export type AdminUserItem = {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    plan: 'free' | 'pro';
    subscription_status: string;
    images_this_month: number;
    registered_at: string;
};

export type AdminUsersPageProps = {
    users: {
        data: AdminUserItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        filter: string;
        search: string | null;
    };
};

export type AdminUserDetailProps = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        registered_at: string;
        email_verified_at: string | null;
    };
    subscription: {
        plan: string;
        status: string;
        started_at: string;
        ends_at: string | null;
    } | null;
    usage: {
        images_this_month: number;
        total_images: number;
        api_calls_this_month: number;
    };
    invoices: Array<{
        id: string;
        date: string;
        total: string;
        status: string;
    }>;
};

export type ApiCostsPageProps = {
    today: {
        calls: number;
        input_tokens: number;
        output_tokens: number;
        cost_usd: number;
        cost_eur: number;
    };
    month: {
        calls: number;
        input_tokens: number;
        output_tokens: number;
        cost_usd: number;
        cost_eur: number;
    };
    dailyCosts: Array<{
        date: string;
        cost_eur: number;
        calls: number;
    }>;
};
