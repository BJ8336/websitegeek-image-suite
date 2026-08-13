// Base URL of the companion Stripe/Google-verification backend, shared with
// the SEO Suite, File Suite, and WebTools Suite (see websitegeek-seo-suite-api/) —
// one backend, four independent one-time Pro products, told apart by a
// `product` param. VITE_API_BASE_URL (set via a gitignored
// .env.development.local, never committed) overrides this for pointing
// local dev at `vercel dev` — the production build always falls back to the
// real deployed URL below.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://websitegeek-seo-suite-api.vercel.app'

export const PRODUCT = 'image-suite'
