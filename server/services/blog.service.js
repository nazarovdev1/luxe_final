import Blog from '../models/blog.model.js'
import logger from '../utils/logger.js'

// Uzbek/Russian transliteration map for slug generation
const transliterationMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h', 'к': 'k',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'Ў': 'O', 'Қ': 'Q', 'Ғ': 'G', 'Ҳ': 'H'
}

/**
 * Generate a URL-friendly slug from a title
 * Supports Uzbek, Russian, and English characters
 */
export const generateSlug = (title) => {
  if (!title) return ''

  let slug = title

  // Transliterate Cyrillic characters
  for (const [cyrillic, latin] of Object.entries(transliterationMap)) {
    slug = slug.replace(new RegExp(cyrillic, 'g'), latin)
  }

  // Convert to lowercase
  slug = slug.toLowerCase()

  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-')

  // Remove special characters except hyphens
  slug = slug.replace(/[^a-z0-9-]/g, '')

  // Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-')

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '')

  return slug
}

/**
 * Generate a unique slug by appending a number if needed
 */
export const generateUniqueSlug = async (title, excludeId = null) => {
  let baseSlug = generateSlug(title)

  if (!baseSlug) {
    baseSlug = 'blog-post'
  }

  let slug = baseSlug
  let counter = 1

  const query = excludeId ? { _id: { $ne: excludeId } } : {}

  while (await Blog.findOne({ slug, ...query })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
export const calculateReadTime = (content) => {
  if (!content) return 1

  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '')

  // Count words (split by whitespace)
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const wordCount = words.length

  // Calculate minutes, minimum 1
  const minutes = Math.max(1, Math.ceil(wordCount / 200))

  return minutes
}

/**
 * Get blog categories with count
 */
export const getBlogCategories = async () => {
  const categories = await Blog.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])

  return categories.map(cat => ({
    name: cat._id,
    count: cat.count
  }))
}

/**
 * Get related blogs based on category and tags
 */
export const getRelatedBlogs = async (blogId, limit = 3) => {
  const blog = await Blog.findById(blogId)
  if (!blog) return []

  const related = await Blog.find({
    _id: { $ne: blogId },
    status: 'published',
    $or: [
      { category: blog.category },
      { tags: { $in: blog.tags } }
    ]
  })
    .select('title slug excerpt coverImage category readTime publishedAt createdAt')
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)

  return related
}

export default {
  generateSlug,
  generateUniqueSlug,
  calculateReadTime,
  getBlogCategories,
  getRelatedBlogs
}
