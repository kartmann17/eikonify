<?php

namespace App\Console\Commands;

use App\Models\ConvertedImage;
use App\Models\User;
use Illuminate\Console\Command;

class ReportSurplus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'surplus:report {--dry-run : Show what would be reported without actually reporting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Report surplus images to Stripe for metered billing';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $quota = config('optiseo.plans.pro.monthly_quota', 2000);

        $this->info('Recherche des utilisateurs Pro avec surplus...');

        $proUsers = User::whereHas('subscriptions', function ($q) {
            $q->where('stripe_status', 'active');
        })->get();

        $reported = 0;

        foreach ($proUsers as $user) {
            $subscription = $user->subscription('pro');

            if (! $subscription) {
                continue;
            }

            // Calculate billing period
            $startOfPeriod = $subscription->created_at->copy();
            while ($startOfPeriod->copy()->addMonth()->lte(now())) {
                $startOfPeriod->addMonth();
            }

            // Count images in current period
            $imagesCount = ConvertedImage::whereHas('batch', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
                ->where('created_at', '>=', $startOfPeriod)
                ->count();

            $surplus = max(0, $imagesCount - $quota);

            if ($surplus > 0) {
                $this->line("- {$user->email}: {$imagesCount} images ({$surplus} surplus)");

                if (! $isDryRun) {
                    try {
                        $subscription->reportUsage($surplus);
                        $reported++;
                    } catch (\Exception $e) {
                        $this->error("  Erreur: {$e->getMessage()}");
                    }
                }
            }
        }

        if ($isDryRun) {
            $this->warn('Mode dry-run: aucun rapport envoyé à Stripe.');
        } else {
            $this->info("Surplus reporté pour {$reported} utilisateur(s).");
        }

        return Command::SUCCESS;
    }
}
