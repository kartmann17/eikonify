<?php

namespace App\Console\Commands;

use App\Models\FreeUsage;
use Illuminate\Console\Command;

class CleanupFreeUsage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'free-usage:cleanup {--days=30 : Number of days to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Purge free_usages records older than specified days';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $deleted = FreeUsage::where('date', '<', $cutoff->toDateString())->delete();

        $this->info("Supprimé {$deleted} enregistrements de plus de {$days} jours.");

        return Command::SUCCESS;
    }
}
