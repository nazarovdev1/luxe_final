import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Tag, BookOpen, TrendingUp, Heart, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const CATEGORIES_UZ = ['Barchasi', 'Trendlar', 'Maslahatlar', 'Kombinatsiyalar', 'Parvarish', 'Aksessuarlar'];

const Blog = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const allLabel = t('blog.categoriesAll');

  const fetchBlogs = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: pageNum,
        limit: 9,
      };
      if (activeCategory !== 'Barchasi') {
        params.category = activeCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await axios.get('/api/blogs', { params });

      if (res.data.success) {
        const newBlogs = res.data.data;
        if (append) {
          setBlogs(prev => [...prev, ...newBlogs]);
        } else {
          setBlogs(newBlogs);
          const featured = newBlogs.find(p => p.featured);
          setFeaturedPost(featured || null);
        }
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchBlogs(1, false);
  }, [fetchBlogs]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogs(nextPage, true);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const gridPosts = blogs.filter((p) => {
    if (featuredPost && activeCategory === 'Barchasi' && !searchQuery) {
      return p._id !== featuredPost._id;
    }
    return true;
  });

  const SkeletonCard = () => (
    <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-[#11131e]/50">
      <div className="aspect-[16/10] bg-[#11131e] animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-[#1a1d2e] rounded-full animate-pulse" />
          <div className="h-4 w-20 bg-[#1a1d2e] rounded-full animate-pulse" />
        </div>
        <div className="h-5 w-3/4 bg-[#1a1d2e] rounded-lg animate-pulse" />
        <div className="h-3 w-full bg-[#1a1d2e] rounded-lg animate-pulse" />
        <div className="h-3 w-2/3 bg-[#1a1d2e] rounded-lg animate-pulse" />
      </div>
    </div>
  );

  const FeaturedSkeleton = () => (
    <div className="mb-10 rounded-[2rem] overflow-hidden border border-white/5 bg-[#11131e]/50">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="aspect-[16/10] lg:aspect-auto bg-[#11131e] animate-pulse" />
        <div className="p-8 space-y-4">
          <div className="flex gap-3">
            <div className="h-5 w-20 bg-[#1a1d2e] rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-[#1a1d2e] rounded-full animate-pulse" />
          </div>
          <div className="h-8 w-3/4 bg-[#1a1d2e] rounded-xl animate-pulse" />
          <div className="h-4 w-full bg-[#1a1d2e] rounded-lg animate-pulse" />
          <div className="h-4 w-2/3 bg-[#1a1d2e] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07080c] pt-28 pb-16">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#d6b47c]/[0.08] px-4 py-1.5 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-[#d6b47c]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d6b47c]">{t('blog.journalLabel')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight mb-4">
            {t('blog.fashion')} <span className="font-brilliant bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent">{t('blog.blog')}</span>
          </h1>
          <p className="text-gray-400 font-light text-lg max-w-xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3f4658]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t('blog.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#11131e] border border-white/5 text-white text-sm placeholder:text-[#3f4658] focus:outline-none focus:border-[#d6b47c]/30 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES_UZ.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#d6b47c]/10 border border-[#d6b47c]/30 text-[#d6b47c]'
                  : 'bg-white/[0.02] border border-white/5 text-[#9aa3b2] hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <>
            <FeaturedSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && activeCategory === 'Barchasi' && !searchQuery && (
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="block mb-10 rounded-[2rem] overflow-hidden border border-white/5 bg-[#11131e]/50 hover:border-white/10 transition-all group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <img
                      src={featuredPost.coverImage || '/placeholder.jpg'}
                      alt={featuredPost.title?.uz || featuredPost.title?.en || ''}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full bg-[#d6b47c] text-black text-xs font-semibold uppercase tracking-wider">
                        {t('blog.featured')}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-xs font-medium">
                        {featuredPost.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{featuredPost.readTime} {t('blog.minRead')}</span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#f4f1eb] mb-3 group-hover:text-[#d6b47c] transition-colors">
                      {featuredPost.title?.uz || featuredPost.title?.en || ''}
                    </h2>
                    <p className="text-sm text-[#9aa3b2] leading-relaxed mb-6">
                      {featuredPost.excerpt?.uz || featuredPost.excerpt?.en || ''}
                    </p>
                    <div className="flex items-center gap-2 text-[#d6b47c] text-sm font-medium">
                      {t('blog.continueReading')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Blog Grid */}
            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/blog/${post.slug}`}
                    className="group rounded-[2rem] overflow-hidden border border-white/5 bg-[#11131e]/50 hover:border-white/10 transition-all"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={post.coverImage || '/placeholder.jpg'}
                        alt={post.title?.uz || post.title?.en || ''}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#11131e] via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/15 text-[#d6b47c] text-[10px] font-medium">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-[#9aa3b2]">{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-[#f4f1eb] mb-2 line-clamp-2 group-hover:text-[#d6b47c] transition-colors">
                        {post.title?.uz || post.title?.en || ''}
                      </h3>
                      <p className="text-xs text-[#9aa3b2] leading-relaxed line-clamp-2 mb-3">
                        {post.excerpt?.uz || post.excerpt?.en || ''}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px]">{post.readTime} {t('blog.minRead')}</span>
                        </div>
                        <span className="text-xs text-[#d6b47c] font-medium flex items-center gap-1">
                          {t('blog.read')} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-[#3f4658] mx-auto mb-4" />
                <h3 className="text-xl text-[#f4f1eb] mb-2">{t('blog.noArticlesFound')}</h3>
                <p className="text-sm text-[#9aa3b2]">{t('blog.noArticlesHint')}</p>
              </div>
            )}

            {/* Load More */}
            {page < totalPages && gridPosts.length > 0 && (
              <div className="text-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#11131e] border border-white/5 text-[#f4f1eb] text-sm font-medium hover:border-[#d6b47c]/30 hover:text-[#d6b47c] transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('blog.loadMore')}
                    </>
                  ) : (
                    <>
                      {t('blog.loadMore')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-[#3f4658] mt-2">
                  {blogs.length} / {total} {t('blog.articles')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
