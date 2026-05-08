import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
  title: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  excerpt: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  content: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  coverImage: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['Trendlar', 'Maslahatlar', 'Kombinatsiyalar', 'Parvarish', 'Aksessuarlar'],
    required: true,
    index: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  readTime: {
    type: Number,
    default: 1,
    min: 1
  },
  publishedAt: {
    type: Date,
    default: null
  },
  seoTitle: {
    type: String,
    default: ''
  },
  seoDescription: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for text search
blogSchema.index({
  'title.uz': 'text',
  'title.ru': 'text',
  'title.en': 'text',
  'excerpt.uz': 'text',
  'excerpt.ru': 'text',
  'excerpt.en': 'text',
  tags: 'text'
})

// Index for published blogs listing
blogSchema.index({ status: 1, publishedAt: -1 })
blogSchema.index({ status: 1, category: 1, publishedAt: -1 })

const Blog = mongoose.model('Blog', blogSchema)

export default Blog
