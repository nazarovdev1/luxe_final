import express from 'express'
import Product from '../models/product.model.js'
import Blog from '../models/blog.model.js'

const router = express.Router()

router.get('/sitemap.xml', async (req, res) => {
    try {
        const [products, blogs] = await Promise.all([
            Product.find({}, '_id updatedAt').lean(),
            Blog.find({ status: 'published' }, 'slug updatedAt publishedAt').lean()
        ])
        const baseUrl = 'https://luxx.uz'
        const toDate = (value) => value ? new Date(value).toISOString().split('T')[0] : null
        const xmlEscape = (value) => String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
        const addUrl = ({ path, lastmod, changefreq, priority }) => {
            xml += '<url>'
            xml += `<loc>${xmlEscape(`${baseUrl}${path}`)}</loc>`
            if (lastmod) xml += `<lastmod>${toDate(lastmod)}</lastmod>`
            xml += `<changefreq>${changefreq}</changefreq>`
            xml += `<priority>${priority}</priority>`
            xml += '</url>'
        }

        let xml = '<?xml version="1.0" encoding="UTF-8"?>'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

        // Static pages
        const staticPages = [
            { url: '/', changefreq: 'daily', priority: '1.0' },
            { url: '/products', changefreq: 'daily', priority: '0.8' },
            { url: '/lookbooks', changefreq: 'weekly', priority: '0.8' },
            { url: '/blog', changefreq: 'weekly', priority: '0.8' },
            { url: '/gift-cards', changefreq: 'monthly', priority: '0.6' },
            { url: '/vip-club', changefreq: 'monthly', priority: '0.6' },
            { url: '/eco-impact', changefreq: 'monthly', priority: '0.5' },
            { url: '/faq', changefreq: 'weekly', priority: '0.7' },
            { url: '/contact', changefreq: 'monthly', priority: '0.7' },
            { url: '/privacy-policy', changefreq: 'yearly', priority: '0.4' },
            { url: '/terms', changefreq: 'yearly', priority: '0.4' },
        ]

        staticPages.forEach(({ url, ...page }) => addUrl({ path: url, ...page }))

        // Dynamic product pages
        products.forEach(product => addUrl({
            path: `/product/${encodeURIComponent(product._id)}`,
            lastmod: product.updatedAt,
            changefreq: 'weekly',
            priority: '0.7'
        }))

        blogs.forEach(blog => addUrl({
            path: `/blog/${encodeURIComponent(blog.slug)}`,
            lastmod: blog.updatedAt || blog.publishedAt,
            changefreq: 'monthly',
            priority: '0.7'
        }))

        xml += '</urlset>'

        res.set({
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        })
        res.send(xml)
    } catch (error) {
        console.error('Sitemap generation error:', error)
        res.status(500).send('Error generating sitemap')
    }
})

export default router
