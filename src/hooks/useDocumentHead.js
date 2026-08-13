import { useEffect } from 'react'

const DEFAULT_TITLE = 'WebsiteGeek Image Suite — Free Image Tools'
const DEFAULT_DESCRIPTION =
  'Free, browser-based image tools — compress, convert, crop, edit, and label photos. Nothing you upload ever leaves your browser.'

/**
 * Sets document.title and the <meta name="description"> tag for the
 * currently mounted page, restoring the previous values on unmount.
 */
export function useDocumentHead({ title, description } = {}) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title || DEFAULT_TITLE

    let meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description || DEFAULT_DESCRIPTION)

    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== null) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [title, description])
}
