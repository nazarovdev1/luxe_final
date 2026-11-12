import logger from './logger.js'

// The storefront on Vercel is pre-rendered: every product and article gets its own
// HTML page and a sitemap entry at build time. Without a rebuild, a product added in
// the admin stays invisible to Google until the next code deploy. This pings a Vercel
// Deploy Hook (VERCEL_DEPLOY_HOOK_URL) after catalogue changes.
//
// Calls are throttled so a burst of edits does not queue a build per click; the daily
// GitHub Actions rebuild (.github/workflows/daily-rebuild.yml) catches anything skipped.

export const MIN_INTERVAL_MS = 2 * 60 * 1000

let lastTriggeredAt = 0

export const resetSiteRebuildThrottle = () => { lastTriggeredAt = 0 }

export const requestSiteRebuild = async (reason, {
    hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL,
    now = Date.now(),
    fetchImpl = globalThis.fetch,
} = {}) => {
    if (!hookUrl) return { triggered: false, why: 'no-hook' }
    if (now - lastTriggeredAt < MIN_INTERVAL_MS) return { triggered: false, why: 'throttled' }
    lastTriggeredAt = now
    try {
        const response = await fetchImpl(hookUrl, { method: 'POST', signal: AbortSignal.timeout(5000) })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        logger.info?.(`[site-rebuild] requested after ${reason}`)
        return { triggered: true }
    } catch (error) {
        // A failed ping must never fail the admin's save; allow a retry on the next change.
        lastTriggeredAt = 0
        logger.warn?.(`[site-rebuild] ${reason}: ${error.message}`)
        return { triggered: false, why: 'error' }
    }
}
