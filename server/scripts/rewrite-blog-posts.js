// Applies the plain-language blog rewrite in ./data/blog-rewrite-2026-10.js.
//
//   node scripts/rewrite-blog-posts.js          # dry run: shows what would change
//   node scripts/rewrite-blog-posts.js --apply  # writes to the database in MONGO_URL
//
// Posts are matched by slug and only the Uzbek title, excerpt, content, SEO
// fields and read time are touched. Nothing is created or deleted.
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Blog from '../models/blog.model.js'
import { calculateReadTime } from '../services/blog.service.js'
import posts from './data/blog-rewrite-2026-10.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const apply = process.argv.includes('--apply')

const run = async () => {
	if (!process.env.MONGO_URL) throw new Error('MONGO_URL is not set')
	await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 30000 })

	let changed = 0
	for (const post of posts) {
		const blog = await Blog.findOne({ slug: post.slug })
		if (!blog) {
			console.log(`SKIP  ${post.slug} (not found)`)
			continue
		}

		const readTime = calculateReadTime(post.content)
		console.log(`${apply ? 'WRITE' : 'PLAN '} ${post.slug}`)
		console.log(`      title: "${blog.title?.uz}" -> "${post.title}"`)
		console.log(`      read time: ${blog.readTime} -> ${readTime} min`)
		if (!apply) continue

		blog.set('title.uz', post.title)
		blog.set('excerpt.uz', post.excerpt)
		blog.set('content.uz', post.content)
		blog.seoTitle = post.seoTitle
		blog.seoDescription = post.seoDescription
		blog.readTime = readTime
		await blog.save()
		changed += 1
	}

	console.log(apply ? `\n${changed} post(s) updated.` : '\nDry run only. Re-run with --apply to write.')
}

run()
	.catch((error) => {
		console.error(error.message)
		process.exitCode = 1
	})
	.finally(() => mongoose.disconnect())
