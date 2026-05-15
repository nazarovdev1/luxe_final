const BLOCKED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style'])
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'formaction'])

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

export const sanitizeHtml = (html = '') => {
  if (!html || typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return escapeHtml(html || '')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(String(html), 'text/html')

  doc.body.querySelectorAll('*').forEach((node) => {
    const tagName = node.tagName.toLowerCase()

    if (BLOCKED_TAGS.has(tagName)) {
      node.remove()
      return
    }

    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()

      if (name.startsWith('on')) {
        node.removeAttribute(attr.name)
        return
      }

      if (URL_ATTRS.has(name) && (value.startsWith('javascript:') || value.startsWith('data:text/html'))) {
        node.removeAttribute(attr.name)
      }
    })
  })

  return doc.body.innerHTML
}
