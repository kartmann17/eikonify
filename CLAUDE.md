# Eikonify / OptiSEO Images

Image conversion app with SEO optimization (WebP/AVIF, alt/title generation via Claude Haiku).

## Tech Stack

- **Backend**: Laravel 12, PHP 8.3
- **Frontend**: React 19, TypeScript 5, Inertia.js 2
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Build**: Vite 7
- **Payments**: Laravel Cashier (Stripe)
- **Database**: MySQL
- **AI**: Anthropic Claude Haiku (via mozex/anthropic-laravel)

## Development Commands

```bash
composer dev          # Start all services (server, queue, logs, vite)
npm run dev           # Vite dev server only
npm run build         # Production build
composer lint         # PHP linting (pint)
composer test         # Run tests
php artisan queue:work # Process jobs
```

## Project Structure

- `app/Services/` - Core business logic (ImageConversionService, SeoGeneratorService, UsageService)
- `app/Http/Controllers/Api/` - API controllers (ImageController, KeywordController, ExportController)
- `app/Models/` - Eloquent models (ConversionBatch, ConvertedImage, FreeUsage, ProUsage, ApiLog)
- `resources/js/pages/` - Inertia React pages
- `resources/js/components/optiseo/` - Image conversion UI components
- `resources/js/components/ui/` - shadcn/ui components

## Key Files

- `routes/web.php` - Inertia routes
- `routes/api.php` - API endpoints
- `config/optiseo.php` - App configuration (formats, limits, quality)

## Business Logic

### Plans
- **Free**: 5 images/day (tracked by IP + fingerprint)
- **Pro**: 2000 images/month, surplus at 0.005€/image (Stripe metered billing)

### Middleware
- `CheckImageQuota` - Validates free/pro usage limits
- `AdminMiddleware` - Protects admin routes
- `RequireProSubscription` - Requires active subscription

## Conventions

- React files: kebab-case (e.g., `image-card.tsx`)
- PHP: PSR-12, Laravel conventions
- Currency: EUR (format: 1 234,56 €)
- Language: French (UI and content)

## API Costs Tracking

All Claude API calls logged in `api_logs` table with token counts and costs.
