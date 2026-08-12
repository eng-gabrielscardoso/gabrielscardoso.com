# gabrielscardoso.com

Modern personal portfolio built with Nuxt 4, replacing the legacy Laravel/Livewire/Filament site.

## Stack

- **Nuxt 4** with SSR on Vercel
- **Nuxt Content v3** — Git-based CMS with per-locale collections
- **Nuxt Studio** — visual admin panel at `/_studio`
- **Nuxt UI v4** + Tailwind CSS 4 — dark-first design system
- **@nuxtjs/i18n** — English (default) and Portuguese (`/pt`)
- **Resend** — contact form email delivery
- **Vitest + Playwright** — unit, component, runtime, and e2e tests

## Pages

| Route              | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `/`                | Home — hero, skills, featured projects                   |
| `/about`           | Biography, experience, education, volunteering timelines |
| `/projects`        | Project grid with stats                                  |
| `/projects/[slug]` | Project detail page                                      |
| `/blog`            | Blog listing                                             |
| `/blog/[slug]`     | Blog post                                                |
| `/contact`         | Contact form + social links                              |
| `/_studio`         | Nuxt Studio admin (production, requires GitHub OAuth)    |

All routes are available in Portuguese under `/pt/*`.

## Make It Yours

The project is white-label: no personal data is hardcoded in components. To rebrand it you only touch three places.

**1. [`shared/site.config.ts`](shared/site.config.ts)** — every identity value lives here:

| Field                           | What it controls                                                 |
| ------------------------------- | ---------------------------------------------------------------- |
| `name`, `shortName`, `nickname` | Footer/SEO name, header brand, highlighted word in the hero      |
| `description`, `url`            | Default SEO metadata and canonical URL                           |
| `avatar.gravatarHash`           | Hero and about-page avatar                                       |
| `repository`                    | Header source link and Nuxt Studio commit target                 |
| `socials[]`                     | Footer icons, and contact page buttons when `featured: true`     |
| `documents[]`                   | CV / cover letter entries in the navigation menu                 |
| `donations[]`                   | Support modal entries — leave the array empty to hide the button |

**2. `content/{en,pt}/`** — localised copy: `profile.yml` (headline, location, biography) plus your `projects/`, `blog/`, `skills/`, `experiences/`, `education/` and `volunteering/` entries.

**3. `i18n/locales/{en,pt}.json`** — interface strings, including `site.role` (job title in the footer) and the whole `support.*` block used by the donation modal.

Then set your environment variables (see below) and update `package.json` `name`.

## Getting Started

Requires **Node.js 22.19+** (see `.nvmrc`). With [nvm](https://github.com/nvm-sh/nvm): `nvm use`.

```bash
npm ci
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable                      | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `NUXT_RESEND_API_KEY`         | Resend API key for contact form                         |
| `NUXT_CONTACT_EMAIL`          | Destination email for contact submissions               |
| `NUXT_CONTACT_FROM_EMAIL`     | Sender address; must belong to a Resend-verified domain |
| `STUDIO_GITHUB_CLIENT_ID`     | GitHub OAuth app client ID for Nuxt Studio              |
| `STUDIO_GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret                          |
| `NUXT_PUBLIC_SITE_URL`        | Overrides `url` from `shared/site.config.ts`            |

## Content

Content lives in `content/{en,pt}/` as Markdown and YAML files. Collections are defined in [`content.config.ts`](content.config.ts) with Zod schemas.

`profile.yml` holds only localised copy — headline, location and biography. Names, links, avatar and donation addresses come from `shared/site.config.ts` so they are never duplicated across locales.

Each entry should exist under both `content/en/` and `content/pt/` using the **same filename**; when a Portuguese file is missing, the English one is served as a fallback. For page collections the filename becomes the URL, so `content/en/blog/hello.md` is served at `/blog/hello`.

### Templates

Every folder ships an annotated `_example` file documenting each field, its format and the accepted enum values:

| Collection      | Template       | Notes                             |
| --------------- | -------------- | --------------------------------- |
| `blog/`         | `_example.md`  | Front matter + Markdown body      |
| `projects/`     | `_example.md`  | Front matter + Markdown body      |
| `experiences/`  | `_example.yml` | `employmentType` is an enum       |
| `education/`    | `_example.yml` |                                   |
| `skills/`       | `_example.yml` | `icons` are Iconify `logos` slugs |
| `volunteering/` | `_example.yml` | `cause` is an enum                |

Copy a template, rename it and fill it in. Files prefixed with `_` are excluded from indexing in [`content.config.ts`](content.config.ts), so the templates never appear on the site.

Two gotchas worth repeating: **quote every date** (`'2025-01'`), otherwise YAML parses it into a `Date` and schema validation fails; and **delete `endDate`** entirely for anything ongoing so the UI renders "Present" instead.

**Local editing:** Nuxt Studio shows a floating edit button in dev mode.

**Production editing:** Configure GitHub OAuth and visit `/_studio` on the deployed site. Changes commit directly to the repository.

## Testing

```bash
npm run test:unit        # Pure unit tests
npm run test:nuxt        # Component tests (browser)
npm run test -- --project runtime  # Server/API runtime tests
npm run test:e2e         # Playwright e2e + accessibility
npm run test:coverage    # All tests with coverage
```

## Deployment

Push to `main` on GitHub. Vercel handles SSR deployment automatically.

Set environment variables in the Vercel dashboard before going live.

## License

Private — personal portfolio site.
