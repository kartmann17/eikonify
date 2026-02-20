# 🖼️ OptiSEO Images

**Convertisseur d'images en masse avec optimisation SEO automatique.**

Outil open source permettant de convertir des images en WebP/AVIF, de réécrire automatiquement les noms de fichiers pour le SEO, et de générer les métadonnées optimisées (alt, title, meta description) à partir de mots-clés personnalisés.

![Laravel](https://img.shields.io/badge/Laravel-12-red?logo=laravel)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Problème résolu

Aujourd'hui, optimiser ses images pour le web et le SEO nécessite plusieurs outils et beaucoup de travail manuel :

- Convertir les images en formats modernes (WebP, AVIF)
- Renommer chaque fichier avec des noms SEO-friendly
- Rédiger les attributs `alt` et `title` pour chaque image
- Générer les meta descriptions associées
- Trouver les bons mots-clés pour chaque image

**OptiSEO Images** fait tout cela en une seule étape.

---

## ✨ Fonctionnalités

### Conversion d'images

- Upload multiple (drag & drop ou sélection de fichiers)
- Formats d'entrée : JPG, PNG, GIF, BMP, TIFF, SVG
- Formats de sortie : **WebP**, **AVIF**, ou les deux simultanément
- Compression intelligente avec contrôle de qualité (0-100)
- Redimensionnement optionnel (largeur max, hauteur max, ratio préservé)
- Traitement par lot (batch processing)

### Réécriture SEO des noms de fichiers

- Réécriture complète du nom de fichier basée sur les mots-clés saisis
- Génération de noms en slug : `pension-chat-lille-garde-feline.webp`
- Ajout automatique d'un suffixe numérique pour éviter les doublons
- Suppression des caractères spéciaux, accents et espaces
- Prévisualisation du nom avant conversion

### Génération de métadonnées SEO

- **Attribut `alt`** : description optimisée générée à partir des mots-clés
- **Attribut `title`** : titre pertinent et naturel pour chaque image
- **Meta description** : texte descriptif optimisé pour les moteurs de recherche
- **Nom de fichier** : slug SEO-friendly dérivé des mots-clés
- Personnalisation possible avant export

### Suggestion de mots-clés

- Suggestions automatiques basées sur les mots-clés saisis
- Variantes longue traîne (long-tail keywords)
- Mots-clés sémantiquement proches
- Suggestions basées sur Google Autocomplete
- Score de pertinence pour chaque suggestion

### Export

- Téléchargement individuel ou en lot (archive ZIP)
- Fichier **CSV** récapitulatif avec toutes les métadonnées SEO
- Fichier **JSON** structuré pour intégration CMS
- Snippet **HTML** prêt à copier-coller (`<img>` ou `<picture>`)
- Snippet **Markdown** pour documentation

---

## 🏗️ Architecture technique

### Stack

| Couche       | Technologie                                     |
|--------------|--------------------------------------------------|
| Backend      | Laravel 12 (PHP 8.2+)                            |
| Frontend     | React 19 + TypeScript 5 + Inertia.js 2           |
| UI           | Tailwind CSS 4 + shadcn/ui                       |
| Build        | Vite                                             |
| Conversion   | Intervention Image 3 + cwebp + cavif             |
| File storage | Local / S3 compatible                            |
| Queue        | Laravel Queue (Redis / Database)                 |
| API          | RESTful JSON                                     |

### Structure du projet

```
optiseo-images/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── ImageController.php         # Upload & conversion
│   │   │   ├── KeywordController.php       # Suggestions mots-clés
│   │   │   └── ExportController.php        # Export ZIP/CSV/JSON
│   │   ├── Requests/
│   │   │   ├── ImageUploadRequest.php      # Validation upload
│   │   │   └── ConversionRequest.php       # Validation conversion
│   │   └── Resources/
│   │       └── ImageResource.php           # API Resource
│   ├── Jobs/
│   │   ├── ConvertImageJob.php             # Conversion async
│   │   └── GenerateMetadataJob.php         # Génération SEO
│   ├── Services/
│   │   ├── ImageConversionService.php      # Logique de conversion
│   │   ├── SeoGeneratorService.php         # Génération métadonnées
│   │   ├── KeywordSuggestionService.php    # Suggestions mots-clés
│   │   ├── FileNamingService.php           # Réécriture noms fichiers
│   │   └── ExportService.php               # Export ZIP/CSV/JSON/HTML
│   └── Models/
│       ├── ConversionBatch.php             # Lot de conversion
│       └── ConvertedImage.php              # Image convertie
├── resources/
│   ├── js/
│   │   ├── app.tsx                          # Point d'entrée React + Inertia
│   │   ├── pages/
│   │   │   ├── home.tsx                     # Page d'accueil / upload
│   │   │   ├── convert.tsx                  # Page de conversion
│   │   │   └── result.tsx                   # Page résultats / export
│   │   ├── components/
│   │   │   ├── drop-zone.tsx                # Zone d'upload drag & drop
│   │   │   ├── image-preview.tsx            # Prévisualisation image
│   │   │   ├── keyword-input.tsx            # Saisie mots-clés + suggestions
│   │   │   ├── conversion-settings.tsx      # Paramètres (format, qualité)
│   │   │   ├── seo-preview.tsx              # Aperçu métadonnées SEO
│   │   │   ├── batch-progress.tsx           # Barre de progression
│   │   │   ├── export-panel.tsx             # Options d'export
│   │   │   └── image-card.tsx               # Carte image individuelle
│   │   ├── hooks/
│   │   │   ├── use-image-upload.ts          # Logique upload
│   │   │   ├── use-conversion.ts            # Logique conversion
│   │   │   └── use-keyword-suggestions.ts   # Logique suggestions
│   │   ├── types/
│   │   │   └── index.ts                     # Types TypeScript
│   │   ├── layouts/
│   │   │   └── app-layout.tsx               # Layout principal
│   │   └── lib/
│   │       ├── seo.ts                       # Helpers SEO côté client
│   │       └── utils.ts                     # Utilitaires (cn, filesize...)
│   └── css/
│       └── app.css                          # Tailwind CSS 4
├── routes/
│   ├── web.php                              # Routes Inertia (pages)
│   └── api.php                              # Routes API (AJAX)
├── database/
│   └── migrations/
│       ├── create_conversion_batches_table.php
│       └── create_converted_images_table.php
├── config/
│   └── optiseo.php                          # Configuration app
├── tests/
│   ├── Feature/
│   │   ├── ImageConversionTest.php
│   │   ├── SeoGenerationTest.php
│   │   └── ExportTest.php
│   └── Unit/
│       ├── FileNamingServiceTest.php
│       └── KeywordSuggestionServiceTest.php
├── components.json                          # Config shadcn/ui
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── README.md
└── LICENSE
```

---

## 🔄 Workflow utilisateur

```
1. UPLOAD          L'utilisateur dépose ses images (drag & drop)
      │
      ▼
2. MOTS-CLÉS      Saisie des mots-clés cibles + suggestions auto
      │
      ▼
3. PARAMÈTRES     Choix du format (WebP/AVIF), qualité, dimensions
      │
      ▼
4. PRÉVISUALISATION  Aperçu des noms de fichiers et métadonnées SEO
      │
      ▼
5. CONVERSION     Traitement en arrière-plan (queue Laravel)
      │
      ▼
6. EXPORT         Téléchargement ZIP + fichier récapitulatif SEO
```

---

## 📡 API Endpoints

### Images

| Méthode | Endpoint                   | Description                          |
|---------|----------------------------|--------------------------------------|
| POST    | `/api/images/upload`       | Upload d'images (multipart)          |
| POST    | `/api/images/convert`      | Lancer la conversion d'un batch      |
| GET     | `/api/images/batch/{id}`   | Statut d'un batch de conversion      |
| GET     | `/api/images/{id}`         | Détails d'une image convertie        |
| DELETE  | `/api/images/{id}`         | Supprimer une image                  |

### SEO & Mots-clés

| Méthode | Endpoint                        | Description                          |
|---------|---------------------------------|--------------------------------------|
| POST    | `/api/keywords/suggest`         | Suggestions de mots-clés             |
| POST    | `/api/seo/generate`             | Générer les métadonnées SEO          |
| PUT     | `/api/seo/{imageId}`            | Modifier les métadonnées manuellement|

### Export

| Méthode | Endpoint                        | Description                          |
|---------|---------------------------------|--------------------------------------|
| GET     | `/api/export/batch/{id}/zip`    | Télécharger le ZIP du batch          |
| GET     | `/api/export/batch/{id}/csv`    | Télécharger le CSV récapitulatif     |
| GET     | `/api/export/batch/{id}/json`   | Télécharger le JSON structuré        |
| GET     | `/api/export/batch/{id}/html`   | Obtenir les snippets HTML            |

---

## 🗄️ Modèle de données

### conversion_batches

| Colonne         | Type      | Description                          |
|-----------------|-----------|--------------------------------------|
| id              | UUID      | Identifiant unique                   |
| session_id      | string    | Session utilisateur (pas de compte)  |
| keywords        | json      | Mots-clés saisis par l'utilisateur   |
| output_format   | enum      | webp, avif, both                     |
| quality         | integer   | Qualité de compression (1-100)       |
| max_width       | integer   | Largeur max (nullable)               |
| max_height      | integer   | Hauteur max (nullable)               |
| status          | enum      | pending, processing, completed, failed |
| total_images    | integer   | Nombre total d'images                |
| processed_count | integer   | Nombre d'images traitées             |
| created_at      | timestamp |                                      |
| expires_at      | timestamp | Expiration auto (nettoyage)          |

### converted_images

| Colonne              | Type      | Description                          |
|----------------------|-----------|--------------------------------------|
| id                   | UUID      | Identifiant unique                   |
| batch_id             | UUID      | Référence au batch                   |
| original_filename    | string    | Nom du fichier original              |
| original_path        | string    | Chemin du fichier original           |
| converted_filename   | string    | Nom SEO réécrit                      |
| converted_path       | string    | Chemin du fichier converti           |
| format               | enum      | webp, avif                           |
| original_size        | integer   | Taille originale (bytes)             |
| converted_size       | integer   | Taille après conversion (bytes)      |
| width                | integer   | Largeur finale                       |
| height               | integer   | Hauteur finale                       |
| alt_text             | text      | Attribut alt généré                  |
| title_text           | text      | Attribut title généré                |
| meta_description     | text      | Meta description générée             |
| keywords_used        | json      | Mots-clés utilisés                   |
| compression_ratio    | float     | Taux de compression                  |
| status               | enum      | pending, converted, failed           |

---

## 🔧 Logique de réécriture des noms de fichiers

La réécriture se fait en plusieurs étapes dans `FileNamingService.php` :

```
Entrée :  "IMG_20240315_142356.jpg"
Mots-clés : ["pension chat", "Lille", "garde féline"]

1. Slugification des mots-clés
   → "pension-chat", "lille", "garde-feline"

2. Construction du nom
   → "pension-chat-lille-garde-feline"

3. Ajout du suffixe numérique (si batch > 1 image)
   → "pension-chat-lille-garde-feline-01"

4. Ajout de l'extension cible
   → "pension-chat-lille-garde-feline-01.webp"
```

**Règles de nommage :**

- Tout en minuscules
- Espaces remplacés par des tirets
- Accents supprimés (translittération)
- Caractères spéciaux supprimés
- Tirets multiples fusionnés
- Longueur max : 80 caractères (hors extension)
- Suffixe numérique séquentiel pour les lots

---

## 🤖 Génération des métadonnées SEO

### Attribut `alt`

Phrase descriptive naturelle intégrant les mots-clés.

```
Mots-clés : ["pension chat", "Lille", "garde féline"]
Image 1/3 → alt="Pension pour chat à Lille - Service de garde féline professionnelle"
Image 2/3 → alt="Espace de garde féline dans notre pension pour chat à Lille"
Image 3/3 → alt="Pension chat Lille - Hébergement et garde féline de qualité"
```

### Attribut `title`

Titre court et accrocheur.

```
title="Pension chat Lille | Garde féline professionnelle"
```

### Meta description

Description entre 120 et 160 caractères intégrant les mots-clés.

```
meta="Découvrez notre pension pour chat à Lille. Service de garde féline professionnel avec suivi personnalisé. Réservez dès maintenant."
```

---

## 💡 Suggestions de mots-clés

Le système propose des mots-clés via plusieurs sources :

1. **Google Autocomplete** — Requêtes populaires associées
2. **Variantes sémantiques** — Synonymes et termes proches
3. **Longue traîne** — Combinaisons de mots-clés étendues
4. **Contextuelles** — Basées sur le type d'image détecté

Exemple pour le mot-clé `"pension chat"` :

```json
{
  "suggestions": [
    { "keyword": "pension chat pas cher",       "score": 92 },
    { "keyword": "garderie pour chat",          "score": 88 },
    { "keyword": "hébergement chat vacances",   "score": 85 },
    { "keyword": "pension féline",              "score": 82 },
    { "keyword": "garde chat à domicile",       "score": 78 },
    { "keyword": "chatterie pension",           "score": 75 },
    { "keyword": "pension chat avis",           "score": 72 },
    { "keyword": "meilleure pension chat lille", "score": 70 }
  ]
}
```

---

## 📦 Formats d'export

### Snippet HTML (`<picture>`)

```html
<picture>
  <source srcset="pension-chat-lille-garde-feline-01.avif" type="image/avif">
  <source srcset="pension-chat-lille-garde-feline-01.webp" type="image/webp">
  <img
    src="pension-chat-lille-garde-feline-01.webp"
    alt="Pension pour chat à Lille - Service de garde féline professionnelle"
    title="Pension chat Lille | Garde féline professionnelle"
    width="800"
    height="600"
    loading="lazy"
  >
</picture>
```

### JSON structuré

```json
{
  "images": [
    {
      "filename": "pension-chat-lille-garde-feline-01.webp",
      "alt": "Pension pour chat à Lille - Service de garde féline professionnelle",
      "title": "Pension chat Lille | Garde féline professionnelle",
      "meta_description": "Découvrez notre pension pour chat à Lille...",
      "width": 800,
      "height": 600,
      "size_bytes": 45230,
      "compression_ratio": 0.72,
      "keywords": ["pension chat", "lille", "garde féline"]
    }
  ]
}
```

### CSV

```csv
filename,alt,title,meta_description,width,height,original_size,converted_size,compression
pension-chat-lille-01.webp,"Pension pour chat à Lille...","Pension chat Lille...","Découvrez...",800,600,158000,45230,71%
```

---

## 🚀 Installation

### Prérequis

- PHP 8.2+ (8.3 ou 8.4 recommandé)
- Composer 2.7+
- Node.js 20+
- npm ou yarn
- Redis (recommandé pour les queues)
- Extensions PHP : `gd`, `imagick`, `fileinfo`
- Binaires : `cwebp`, `cavif` (optionnels, fallback sur GD/Imagick)

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/kreyatik-studio/optiseo-images.git
cd optiseo-images

# Installer les dépendances PHP
composer install

# Installer les dépendances JS
npm install

# Configurer l'environnement
cp .env.example .env
php artisan key:generate

# Migrer la base de données
php artisan migrate

# Installer les composants shadcn/ui nécessaires
npx shadcn@latest add button card input badge progress dialog dropdown-menu

# Compiler les assets
npm run dev

# Lancer le serveur
php artisan serve

# Lancer le worker de queue (dans un autre terminal)
php artisan queue:work
```

### Docker

```bash
docker-compose up -d
```

---

## 🐳 Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www/html
    depends_on:
      - redis
    environment:
      - QUEUE_CONNECTION=redis

  queue:
    build: .
    command: php artisan queue:work --tries=3
    volumes:
      - .:/var/www/html
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

---

## ⚙️ Configuration

Fichier `config/optiseo.php` :

```php
return [
    // Formats de sortie disponibles
    'formats' => ['webp', 'avif'],

    // Qualité par défaut
    'default_quality' => 80,

    // Taille max d'upload (en Mo)
    'max_upload_size' => 20,

    // Nombre max d'images par batch
    'max_batch_size' => 50,

    // Longueur max du nom de fichier (hors extension)
    'max_filename_length' => 80,

    // Durée de rétention des fichiers (en heures)
    'retention_hours' => 24,

    // Dimensions max autorisées
    'max_dimensions' => [
        'width' => 4096,
        'height' => 4096,
    ],

    // Suggestions de mots-clés
    'keywords' => [
        'max_suggestions' => 10,
        'sources' => ['autocomplete', 'semantic', 'longtail'],
    ],
];
```

---

## 🧪 Tests

```bash
# Tous les tests
php artisan test

# Tests unitaires uniquement
php artisan test --testsuite=Unit

# Tests fonctionnels uniquement
php artisan test --testsuite=Feature

# Avec couverture de code
php artisan test --coverage
```

---

## 🗺️ Roadmap

- [x] Upload multiple avec drag & drop
- [x] Conversion WebP
- [x] Conversion AVIF
- [x] Réécriture SEO des noms de fichiers
- [x] Génération des attributs alt et title
- [x] Génération des meta descriptions
- [x] Export ZIP avec récapitulatif
- [ ] Suggestions de mots-clés via Google Autocomplete
- [ ] Intégration IA pour suggestions contextuelles
- [ ] Détection automatique du contenu de l'image (IA vision)
- [ ] API publique avec clé d'authentification
- [ ] Plugin WordPress
- [ ] Plugin Laravel (package Composer)
- [ ] Mode CLI (ligne de commande)
- [ ] PWA (Progressive Web App)
- [ ] Comparaison visuelle avant/après
- [ ] Statistiques de compression par batch
- [ ] Support des formats d'entrée RAW (CR2, NEF, ARW)
- [ ] Filigrane (watermark) optionnel
- [ ] Profils de conversion sauvegardés

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez le fichier [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'feat: ajout de ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Auteur

**Kreyatik Studio**
- Site : [kreyatikstudio.fr](https://kreyatikstudio.fr)
- GitHub : [@kreyatik-studio](https://github.com/kreyatik-studio)

---

> *OptiSEO Images — Parce que chaque image mérite d'être trouvée.*
