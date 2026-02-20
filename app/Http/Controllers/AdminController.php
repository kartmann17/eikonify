<?php

namespace App\Http\Controllers;

use App\Models\ApiLog;
use App\Models\ConvertedImage;
use App\Models\FreeUsage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display admin dashboard.
     */
    public function index(): Response
    {
        // KPIs
        $kpis = $this->getKpis();

        // API costs summary
        $apiCosts = $this->getApiCostsSummary();

        // Free usage summary
        $freeUsage = $this->getFreeUsageSummary();

        // Charts data
        $charts = $this->getChartsData();

        return Inertia::render('admin/dashboard', [
            'kpis' => $kpis,
            'apiCosts' => $apiCosts,
            'freeUsage' => $freeUsage,
            'charts' => $charts,
        ]);
    }

    /**
     * Display users list.
     */
    public function users(Request $request): Response
    {
        $query = User::query();

        // Filter by plan
        $filter = $request->get('filter', 'all');
        if ($filter === 'pro') {
            $query->whereHas('subscriptions', function ($q) {
                $q->where('stripe_status', 'active');
            });
        } elseif ($filter === 'free') {
            $query->whereDoesntHave('subscriptions');
        } elseif ($filter === 'canceled') {
            $query->whereHas('subscriptions', function ($q) {
                $q->where('stripe_status', 'canceled');
            });
        }

        // Search by email
        if ($search = $request->get('search')) {
            $query->where('email', 'like', "%{$search}%");
        }

        $users = $query->orderByDesc('created_at')
            ->paginate(20)
            ->through(function ($user) {
                $subscription = $user->subscription('pro');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'plan' => $subscription && $subscription->active() ? 'pro' : 'free',
                    'subscription_status' => $subscription?->stripe_status ?? 'none',
                    'images_this_month' => $this->getUserMonthlyImages($user),
                    'registered_at' => $user->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => [
                'filter' => $filter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display user detail.
     */
    public function userDetail(User $user): Response
    {
        $subscription = $user->subscription('pro');

        return Inertia::render('admin/user-detail', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'registered_at' => $user->created_at->format('d/m/Y H:i'),
                'email_verified_at' => $user->email_verified_at?->format('d/m/Y H:i'),
            ],
            'subscription' => $subscription ? [
                'plan' => 'pro',
                'status' => $subscription->stripe_status,
                'started_at' => $subscription->created_at->format('d/m/Y'),
                'ends_at' => $subscription->ends_at?->format('d/m/Y'),
            ] : null,
            'usage' => [
                'images_this_month' => $this->getUserMonthlyImages($user),
                'total_images' => ConvertedImage::whereHas('batch', fn ($q) => $q->where('user_id', $user->id))->count(),
                'api_calls_this_month' => ApiLog::where('user_id', $user->id)->thisMonth()->count(),
            ],
            'invoices' => $this->getUserInvoices($user),
        ]);
    }

    /**
     * Display API costs page.
     */
    public function apiCosts(): Response
    {
        $today = ApiLog::today()->get();
        $thisMonth = ApiLog::thisMonth()->get();

        $todayStats = [
            'calls' => $today->count(),
            'input_tokens' => $today->sum('input_tokens'),
            'output_tokens' => $today->sum('output_tokens'),
            'cost_usd' => $today->sum('cost_usd'),
            'cost_eur' => $today->sum('cost_usd') * 0.92,
        ];

        $monthStats = [
            'calls' => $thisMonth->count(),
            'input_tokens' => $thisMonth->sum('input_tokens'),
            'output_tokens' => $thisMonth->sum('output_tokens'),
            'cost_usd' => $thisMonth->sum('cost_usd'),
            'cost_eur' => $thisMonth->sum('cost_usd') * 0.92,
        ];

        // Daily costs for the last 30 days
        $dailyCosts = ApiLog::selectRaw('DATE(created_at) as date, SUM(cost_usd) as cost_usd, COUNT(*) as calls')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'cost_eur' => round($row->cost_usd * 0.92, 4),
                'calls' => $row->calls,
            ]);

        return Inertia::render('admin/api-costs', [
            'today' => $todayStats,
            'month' => $monthStats,
            'dailyCosts' => $dailyCosts,
        ]);
    }

    /**
     * Get KPIs for dashboard.
     */
    private function getKpis(): array
    {
        // Active Pro subscribers
        $activeProSubscribers = User::whereHas('subscriptions', function ($q) {
            $q->where('stripe_status', 'active');
        })->count();

        // MRR (Monthly Recurring Revenue)
        $mrr = $activeProSubscribers * config('optiseo.plans.pro.price', 9.99);

        // Images converted today
        $imagesToday = ConvertedImage::whereDate('created_at', now()->toDateString())->count();

        // Images converted this month
        $imagesThisMonth = ConvertedImage::thisMonth()->count();

        return [
            'active_pro_subscribers' => $activeProSubscribers,
            'mrr' => number_format($mrr, 2, ',', ' ').' €',
            'images_today' => $imagesToday,
            'images_this_month' => $imagesThisMonth,
        ];
    }

    /**
     * Get API costs summary.
     */
    private function getApiCostsSummary(): array
    {
        return [
            'calls_today' => ApiLog::today()->count(),
            'calls_this_month' => ApiLog::thisMonth()->count(),
            'cost_today_eur' => round(ApiLog::today()->sum('cost_usd') * 0.92, 2),
            'cost_this_month_eur' => round(ApiLog::thisMonth()->sum('cost_usd') * 0.92, 2),
        ];
    }

    /**
     * Get free usage summary.
     */
    private function getFreeUsageSummary(): array
    {
        $todayUsage = FreeUsage::today()->get();

        $topIps = FreeUsage::today()
            ->orderByDesc('images_count')
            ->limit(10)
            ->get()
            ->map(fn ($usage) => [
                'ip' => $usage->ip_address,
                'images' => $usage->images_count,
            ]);

        return [
            'unique_users_today' => $todayUsage->count(),
            'images_today' => $todayUsage->sum('images_count'),
            'top_ips' => $topIps,
        ];
    }

    /**
     * Get charts data.
     */
    private function getChartsData(): array
    {
        // Pro subscribers evolution (last 30 days)
        // Simplified: just count active at each day end
        $subscribersEvolution = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $subscribersEvolution[] = [
                'date' => $date,
                'count' => User::whereHas('subscriptions', function ($q) use ($date) {
                    $q->where('created_at', '<=', $date)
                        ->where(function ($q2) use ($date) {
                            $q2->whereNull('ends_at')
                                ->orWhere('ends_at', '>', $date);
                        });
                })->count(),
            ];
        }

        // Images converted per day (last 30 days)
        $imagesPerDay = ConvertedImage::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'count' => $row->count,
            ]);

        // Free vs Pro distribution this month
        $proImages = ConvertedImage::whereHas('batch', function ($q) {
            $q->whereHas('user', function ($q2) {
                $q2->whereHas('subscriptions', fn ($q3) => $q3->where('stripe_status', 'active'));
            });
        })->thisMonth()->count();

        $freeImages = FreeUsage::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('images_count');

        return [
            'subscribers_evolution' => $subscribersEvolution,
            'images_per_day' => $imagesPerDay,
            'distribution' => [
                ['name' => 'Pro', 'value' => $proImages],
                ['name' => 'Free', 'value' => $freeImages],
            ],
        ];
    }

    /**
     * Get user's monthly images count.
     */
    private function getUserMonthlyImages(User $user): int
    {
        return ConvertedImage::whereHas('batch', fn ($q) => $q->where('user_id', $user->id))
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
    }

    /**
     * Get user invoices.
     */
    private function getUserInvoices(User $user): array
    {
        try {
            return $user->invoices()->map(fn ($invoice) => [
                'id' => $invoice->id,
                'date' => $invoice->date()->format('d/m/Y'),
                'total' => number_format($invoice->total() / 100, 2, ',', ' ').' €',
                'status' => $invoice->paid ? 'paid' : 'pending',
            ])->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }
}
