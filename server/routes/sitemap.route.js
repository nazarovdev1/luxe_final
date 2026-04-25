import express from 'express'
import Product from '../models/product.model.js'

const router = express.Router()

router.get('/sitemap.xml', async (req, res) => {
    try {
        const products = await Product.find({}, '_id updatedAt')
        const baseUrl = 'https://luxx.uz'
        const today = new Date().toISOString().split('T')[0]

        let xml = '<?xml version="1.0" encoding="UTF-8"?>'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

        // Static pages
        const staticPages = [
            { url: '/', changefreq: 'daily', priority: '1.0' },
            { url: '/products', changefreq: 'daily', priority: '0.8' },
            { url: '/lookbooks', changefreq: 'weekly', priority: '0.8' },
            { url: '/faq', changefreq: 'weekly', priority: '0.7' },
            { url: '/contact', changefreq: 'monthly', priority: '0.7' },
            { url: '/privacy-policy', changefreq: 'yearly', priority: '0.4' },
            { url: '/terms', changefreq: 'yearly', priority: '0.4' },
        ]

        staticPages.forEach(page => {
            xml += '<url>'
            xml += `<loc>${baseUrl}${page.url}</loc>`
            xml += `<changefreq>${page.changefreq}</changefreq>`
            xml += `<priority>${page.priority}</priority>`
            xml += `<lastmod>${today}</lastmod>`
            xml += '</url>'
        })

        // Dynamic product pages
        products.forEach(product => {
            xml += '<url>'
            xml += `<loc>${baseUrl}/product/${product._id}</loc>`
            xml += `<lastmod>${product.updatedAt ? product.updatedAt.toISOString().split('T')[0] : today}</lastmod>`
            xml += '<changefreq>weekly</changefreq>'
            xml += '<priority>0.7</priority>'
            xml += '</url>'
        })

        xml += '</urlset>'

        res.header('Content-Type', 'application/xml')
        res.send(xml)
    } catch (error) {
        console.error('Sitemap generation error:', error)
        res.status(500).send('Error generating sitemap')
    }
})

export default router
