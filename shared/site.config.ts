/**
 * Single source of truth for everything that identifies the owner of this portfolio.
 *
 * Forking this project? Edit this file and the Markdown/YAML under `content/` — that is
 * enough to make the whole site yours. Nothing here is localised: translatable copy lives
 * in `i18n/locales/*.json` and `content/{en,pt}/`.
 */

export interface SiteSocial {
  id: string
  label: string
  /** Iconify name, e.g. `i-lucide-github`. */
  icon: string
  href: string
  /** Show in the contact page action row. */
  featured?: boolean
}

export interface SiteDocument {
  id: string
  /** i18n key resolved at render time, e.g. `nav.cv`. */
  labelKey: string
  icon: string
  href: string
}

export interface SiteDonation {
  id: string
  /** Currency names are universal, so this is plain text rather than an i18n key. */
  label: string
  /** i18n key for the blurb shown when the entry is expanded. */
  descriptionKey: string
  icon: string
  address: string
}

export interface SiteRepository {
  owner: string
  name: string
  branch: string
}

export const siteConfig = {
  /** Full legal name, used for SEO and the footer. */
  name: 'Gabriel Santos Cardoso',
  /** Compact name for the header brand. */
  shortName: 'Gabriel S. Cardoso',
  /** Highlighted in the hero headline. */
  nickname: 'Gabe',
  /** i18n key for the job title shown in the footer. */
  roleKey: 'site.role',
  description: 'The Gabriel Santos Cardoso personal web portfolio.',
  /** Overridable at deploy time with `NUXT_PUBLIC_SITE_URL`. Must match the production domain (Vercel serves `www`, the apex 308-redirects to it). */
  url: 'https://www.gabrielscardoso.com',

  /**
   * Avatar is served by Gravatar. Generate the hash with:
   * `echo -n "you@example.com" | shasum -a 256`
   */
  avatar: {
    gravatarHash: '155573459f38b755aef7215ac4cc56ac',
  },

  /** Powers the header link, Nuxt Studio commits and the "view source" button. */
  repository: {
    owner: 'eng-gabrielscardoso',
    name: 'gabrielscardoso.com',
    branch: 'main',
  } satisfies SiteRepository,

  socials: [
    {
      id: 'github',
      label: 'GitHub',
      icon: 'i-lucide-github',
      href: 'https://github.com/eng-gabrielscardoso',
      featured: true,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'i-lucide-linkedin',
      href: 'https://www.linkedin.com/in/eng-gabrielscardoso',
      featured: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: 'i-lucide-instagram',
      href: 'https://www.instagram.com/antianthropic',
    },
  ] satisfies SiteSocial[],

  documents: [
    {
      id: 'coverLetter',
      labelKey: 'nav.coverLetter',
      icon: 'i-lucide-file-text',
      href: 'https://docs.google.com/document/d/1EvVSbMeTdvUtCpKST2wvGxHHWQGqKc-jENxbGqKA1j4',
    },
    {
      id: 'cv',
      labelKey: 'nav.cv',
      icon: 'i-lucide-id-card',
      href: 'https://docs.google.com/document/d/1k-huyj7Ao5NEy0reBUe9AI8PXiiT-w4Z5NsdiJkEIrg',
    },
  ] satisfies SiteDocument[],

  /** Leave empty to hide the support button entirely. */
  donations: [
    {
      id: 'bitcoin',
      label: 'Bitcoin',
      descriptionKey: 'support.bitcoinDesc',
      icon: 'i-lucide-bitcoin',
      address: 'bc1qahqnyd4pajevve8ksp45nh7c4zceymeg5lxq2z',
    },
    {
      id: 'ethereum',
      label: 'Ethereum',
      descriptionKey: 'support.ethereumDesc',
      icon: 'i-lucide-hexagon',
      address: '0xddf0d86f79007b1ab2b545b710126edb546c498a',
    },
  ] satisfies SiteDonation[],
}

export type SiteConfig = typeof siteConfig

export const repositoryUrl = `https://github.com/${siteConfig.repository.owner}/${siteConfig.repository.name}`

export function getFeaturedSocials(): SiteSocial[] {
  return siteConfig.socials.filter((social) => social.featured)
}

export function getDocument(id: string): SiteDocument | undefined {
  return siteConfig.documents.find((document) => document.id === id)
}
