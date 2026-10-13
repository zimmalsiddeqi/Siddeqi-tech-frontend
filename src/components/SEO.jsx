// ============================================
// SEO Component — Production-Ready Metadata & Schema
// Manages document head, canonicals, Open Graph, and JSON-LD
// ============================================

import { useEffect } from 'react'

const SITE_URL = 'https://shawkattech.vercel.app'
const DEFAULT_BRAND = 'Shawkat Siddeqi Tech'
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`
const DEFAULT_DESCRIPTION = 'Master modern Web Development through AI, autonomous AI Agents with n8n, and full-stack engineering. Live interactive online courses in Pakistan with HD cloud recordings.'

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  schema = null,
  publishedTime = null,
  modifiedTime = null
}) {
  const fullTitle = title
    ? (title.includes(DEFAULT_BRAND) ? title : `${title} | ${DEFAULT_BRAND}`)
    : `Online Courses in Pakistan | ${DEFAULT_BRAND}`

  const canonicalUrl = canonical
    ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`)
    : `${SITE_URL}${typeof window !== 'undefined' ? window.location.pathname : '/'}`

  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle

    // Helper to create or update meta tags
    const setMeta = (attr, key, content) => {
      if (!content) return
      let tag = document.querySelector(`meta[${attr}="${key}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attr, key)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    // Helper to create or update link tags
    const setLink = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', rel)
        document.head.appendChild(link)
      }
      link.setAttribute('href', href)
    }

    // 2. Standard Metadata
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

    // 3. Canonical Link
    setLink('canonical', canonicalUrl)

    // 4. Open Graph Tags
    setMeta('property', 'og:site_name', DEFAULT_BRAND)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:locale', 'en_PK')

    // 5. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', imageUrl)

    // 6. JSON-LD Structured Data
    const scriptId = 'structured-data-jsonld'
    let scriptTag = document.getElementById(scriptId)
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.id = scriptId
        scriptTag.type = 'application/ld+json'
        document.head.appendChild(scriptTag)
      }
      scriptTag.textContent = JSON.stringify(schema)
    } else if (scriptTag) {
      scriptTag.remove()
    }

    return () => {
      // Clean up dynamic schema when unmounting
      const tag = document.getElementById(scriptId)
      if (tag) tag.remove()
    }
  }, [fullTitle, description, canonicalUrl, imageUrl, type, noindex, schema])

  return null
}
