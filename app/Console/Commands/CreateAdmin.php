<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create {email : The email of the user to promote}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Promote an existing user to admin role';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("Utilisateur avec l'email '{$email}' non trouvé.");

            return Command::FAILURE;
        }

        if ($user->isAdmin()) {
            $this->warn("L'utilisateur '{$email}' est déjà administrateur.");

            return Command::SUCCESS;
        }

        $user->update(['role' => 'admin']);

        $this->info("L'utilisateur '{$email}' a été promu administrateur.");

        return Command::SUCCESS;
    }
}
