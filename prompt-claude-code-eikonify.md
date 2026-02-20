# Prompt Claude Code — Eikonify : Système d'abonnement, Admin & Espace utilisateur

## Contexte du projet

Eikonify est une application Laravel 12 + React 19 (Inertia.js 2, TypeScript, Tailwind CSS 4, shadcn/ui) qui permet de convertir des images en WebP/AVIF avec optimisation SEO automatique (réécriture des noms de fichiers, génération alt/title/meta description via l'API Claude Haiku).

Le projet utilise Laravel Cashier (Stripe) pour la gestion des abonnements.

La base de données est MySQL sur HestiaCP :
- DB_CONNECTION=mysql
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_DATABASE=eikonify_29805
- DB_USERNAME=eikonify_app

---

## Ce que tu dois implémenter

### 1. Système de plans et limites

Deux plans :

**Free (sans compte) :**
- 5 images par jour maximum
- Limite trackée par IP + fingerprint navigateur (pour éviter le contournement facile)
- Toutes les fonctionnalités accessibles (conversion, SEO, export)
- Aucune inscription requise
- Stocker les usages dans une table `free_usages` avec colonnes : id, ip_address, fingerprint, images_count, date, created_at, updated_at
- Reset automatique du compteur chaque jour à minuit

**Pro (9,99€/mois, compte obligatoire) :**
- 2 000 images par mois
- Surplus facturé à 0,005€ par image au-delà du quota via Stripe metered billing
- Accès à l'historique des conversions
- Dashboard utilisateur avec suivi du quota
- Reset du compteur chaque mois à la date anniversaire de l'abonnement

---

### 2. Authentification

Utiliser le starter kit Laravel 12 avec React (Inertia.js 2) qui inclut déjà :
- Inscription (email + mot de passe)
- Connexion
- Réinitialisation mot de passe
- Vérification email

Ajouter :
- Un champ `role` dans la table users : `user` (défaut) ou `admin`
- Un middleware `admin` qui vérifie que l'utilisateur a le rôle admin
- Créer un seeder pour le compte admin initial

---

### 3. Espace utilisateur (route /dashboard)

Page React accessible après connexion avec les éléments suivants :

**Bloc quota :**
- Barre de progression visuelle (ex: 847 / 2 000 images utilisées ce mois)
- Pourcentage d'utilisation
- Nombre de jours restants avant le reset du quota
- Alerte visuelle quand le quota dépasse 80% puis 100%
- Afficher le surplus consommé et son coût si quota dépassé

**Bloc abonnement :**
- Plan actuel (Free ou Pro)
- Date de début d'abonnement
- Date du prochain renouvellement
- Moyen de paiement enregistré (derniers 4 chiffres de la carte)
- Bouton "Modifier le moyen de paiement" → redirige vers le Stripe Customer Portal
- Bouton "Annuler l'abonnement" → annulation via Stripe avec confirmation modale
- Bouton "Reprendre l'abonnement" si annulation en cours (grace period)
- Afficher le statut : actif, annulation en cours, expiré

**Bloc historique :**
- Liste paginée des conversions passées (date, nombre d'images, format de sortie, mots-clés utilisés)
- Pouvoir re-télécharger les exports ZIP des 7 derniers jours

**Bloc factures :**
- Liste des factures Stripe avec lien de téléchargement PDF
- Utiliser `$user->invoices()` de Laravel Cashier

---

### 4. Dashboard Admin (route /admin)

Protégé par le middleware `admin`. Page React avec les sections suivantes :

**Bloc KPIs (en haut, 4 cartes) :**
- Nombre total d'abonnés Pro actifs
- Revenu mensuel récurrent (MRR) calculé depuis Stripe
- Nombre total d'images converties aujourd'hui (free + pro)
- Nombre total d'images converties ce mois

**Bloc coûts API Claude Haiku :**
- Nombre d'appels API Haiku aujourd'hui
- Nombre d'appels API Haiku ce mois
- Estimation du coût en € (basé sur le nombre de tokens consommés)
- Stocker chaque appel API dans une table `api_logs` avec colonnes : id, user_id (nullable pour free), type (seo_generation, keyword_suggestion), model (haiku-4.5), input_tokens, output_tokens, cost_usd, created_at
- Graphique d'évolution des coûts API sur les 30 derniers jours (utiliser Recharts)

**Bloc utilisateurs :**
- Liste paginée de tous les utilisateurs avec : email, plan, images utilisées ce mois, date d'inscription, statut abonnement
- Filtres : tous, free, pro, annulés
- Recherche par email
- Pouvoir cliquer sur un utilisateur pour voir son détail (quota, historique, factures)

**Bloc utilisation Free :**
- Nombre d'utilisateurs free uniques aujourd'hui (par IP)
- Nombre total d'images converties par les free aujourd'hui
- Top 10 des IPs les plus actives (pour détecter les abus)

**Bloc graphiques :**
- Évolution du nombre d'abonnés Pro sur les 30 derniers jours (Recharts, LineChart)
- Évolution du nombre d'images converties par jour sur les 30 derniers jours (Recharts, BarChart)
- Répartition free vs pro des conversions (Recharts, PieChart)

---

### 5. Intégration Stripe avec Laravel Cashier

Installer et configurer Laravel Cashier pour Stripe :

```bash
composer require laravel/cashier
php artisan vendor:publish --tag="cashier-migrations"
php artisan migrate
```

**Configurer dans .env :**
```
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CASHIER_CURRENCY=eur
```

**Implémenter :**
- Ajouter le trait `Billable` au modèle User
- Créer un produit et un prix dans Stripe pour le plan Pro (9,99€/mois)
- Créer un metered price dans Stripe pour le surplus (0,005€/image)
- Page de souscription avec Stripe Checkout (`$user->newSubscription('pro', $priceId)->checkout()`)
- Webhooks Stripe pour gérer : paiement réussi, paiement échoué, abonnement annulé, abonnement repris
- Route pour le Stripe Customer Portal (`$user->redirectToBillingPortal()`)
- Reporter le surplus mensuel via `$user->subscription('pro')->reportUsage($surplusImages)`

---

### 6. Middleware de vérification des quotas

Créer un middleware `CheckImageQuota` qui :
- Pour les utilisateurs non connectés (free) : vérifie dans la table `free_usages` que l'IP n'a pas dépassé 5 images aujourd'hui
- Pour les utilisateurs Pro : vérifie dans la table `converted_images` le nombre d'images converties ce mois
- Si quota free dépassé : retourner une erreur 429 avec un message invitant à souscrire au plan Pro
- Si quota Pro dépassé : laisser passer MAIS flagger que c'est du surplus (pour le metered billing Stripe)
- Appliquer ce middleware sur la route de conversion d'images

---

### 7. Migrations à créer

**Table `free_usages` :**
```php
Schema::create('free_usages', function (Blueprint $table) {
    $table->id();
    $table->string('ip_address', 45);
    $table->string('fingerprint')->nullable();
    $table->integer('images_count')->default(0);
    $table->date('date');
    $table->timestamps();
    $table->unique(['ip_address', 'date']);
    $table->index('date');
});
```

**Table `api_logs` :**
```php
Schema::create('api_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('type'); // seo_generation, keyword_suggestion
    $table->string('model'); // haiku-4.5
    $table->integer('input_tokens');
    $table->integer('output_tokens');
    $table->decimal('cost_usd', 10, 6);
    $table->timestamps();
    $table->index('created_at');
    $table->index(['user_id', 'created_at']);
});
```

**Ajouter à la table `users` :**
```php
$table->string('role')->default('user'); // user, admin
```

**S'assurer que les tables `conversion_batches` et `converted_images` existent** (voir le README du projet pour le schéma).

---

### 8. Routes

```php
// routes/web.php

// Pages publiques (free, pas de connexion)
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::post('/convert', [ImageController::class, 'convert'])->middleware('check.quota');

// Authentification (starter kit Laravel 12)
// Déjà configuré par le starter kit

// Espace utilisateur (connecté)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/billing', [BillingController::class, 'index'])->name('billing');
    Route::post('/subscribe', [BillingController::class, 'subscribe'])->name('subscribe');
    Route::get('/billing/portal', [BillingController::class, 'portal'])->name('billing.portal');
});

// Admin
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/users/{user}', [AdminController::class, 'userDetail'])->name('admin.user.detail');
    Route::get('/api-costs', [AdminController::class, 'apiCosts'])->name('admin.api-costs');
});

// Webhooks Stripe
Route::post('/stripe/webhook', [WebhookController::class, 'handleWebhook']);
```

---

### 9. Règles importantes

- Utiliser Inertia.js pour toutes les pages (pas de Blade sauf le layout racine)
- Composants React avec shadcn/ui (Card, Button, Progress, Badge, Table, Dialog, Alert)
- Graphiques avec Recharts (LineChart, BarChart, PieChart)
- TypeScript strict partout côté React
- Respecter la convention kebab-case pour les noms de fichiers React
- Toutes les données sensibles (clés Stripe, etc.) dans le .env, jamais dans le code
- Valider toutes les entrées côté serveur avec des Form Requests Laravel
- Les montants sont en euros (€)
- Formatage des nombres à la française (1 234,56 €)

---

### 10. Commandes artisan utiles à créer

- `php artisan free-usage:cleanup` — Purger les `free_usages` de plus de 30 jours (à scheduler quotidiennement)
- `php artisan surplus:report` — Reporter le surplus d'images de tous les users Pro à Stripe (à scheduler en fin de mois)
- `php artisan admin:create {email}` — Promouvoir un utilisateur existant en admin
