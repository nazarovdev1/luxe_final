import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, BookOpen, Search, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import './Blog.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CATEGORIES = [
  { slug: 'Barchasi',        labelKey: 'blogPage.allCategories' },
  { slug: 'Trendlar',        labelKey: 'blogPage.categories.Trendlar' },
  { slug: 'Maslahatlar',     labelKey: 'blogPage.categories.Maslahatlar' },
  { slug: 'Kombinatsiyalar', labelKey: 'blogPage.categories.Kombinatsiyalar' },
  { slug: 'Parvarish',       labelKey: 'blogPage.categories.Parvarish' },
  { slug: 'Aksessuarlar',    labelKey: 'blogPage.categories.Aksessuarlar' },
];

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
  const pageRef = useRef(null);

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

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
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

  useGSAP(() => {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('.blog-intro-eyebrow', { y: 18, opacity: 0, duration: 0.55 })
      .from('.blog-intro-title span', { yPercent: 118, rotate: 2, stagger: 0.11, duration: 1.1 }, '-=0.18')
      .from('.blog-intro-copy', { y: 20, opacity: 0, duration: 0.62 }, '-=0.66')
      .from('.blog-intro-tools', { y: 18, opacity: 0, duration: 0.58 }, '-=0.38');

    gsap.utils.toArray('.blog-reveal').forEach((element) => {
      gsap.from(element, {
        y: 46,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 87%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  }, { scope: pageRef, dependencies: [loading, blogs.length], revertOnUpdate: true });

  return (
    <div ref={pageRef} className="blog-page min-h-screen bg-[#07080c] pt-20 sm:pt-24 pb-24 overflow-hidden">
      <SEO
        title="Blog | Luxx.uz"
        description="Eng so'nggi moda yangiliklari, uslub maslahatlari, trendlar va kombinatsiyalar. Luxx.uz blogi — premium fashion haqida hamma narsa."
        keywords="moda blogi, fashion blog, uslub maslahatlari, trendlar, ayollar kiyimlari, luxx.uz blog"
        canonicalPath="/blog"
      />
      <div className="blog-page-noise pointer-events-none fixed inset-0 z-0" />
      <div className="blog-orb blog-orb-left pointer-events-none" />
      <div className="blog-orb blog-orb-right pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <section className="blog-intro">
          <div className="blog-intro-issue">ISSUE <span>01</span> — 2026</div>
          <div className="blog-intro-eyebrow">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('blog.journalLabel')}</span>
          </div>
          <h1 className="blog-intro-title" aria-label={`${t('blog.fashion')} ${t('blog.blog')}`}>
            <span>{t('blog.fashion')}</span>
            <span className="blog-intro-gold">{t('blog.blog')}</span>
          </h1>
          <p className="blog-intro-copy">{t('blog.subtitle')}</p>
          <div className="blog-intro-bottom">
            <p>Har bir obrazning o‘z hikoyasi bor. Uni o‘qish, his qilish va o‘zingizniki qilish uchun.</p>
            <div className="blog-intro-count"><span>{String(total).padStart(2, '0')}</span> maqola</div>
          </div>
        </section>

        <section className="blog-intro-tools">
          <div className="blog-search-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t('blog.searchPlaceholder')}
              aria-label={t('blog.searchPlaceholder')}
            />
            <Sparkles className="blog-search-sparkle w-4 h-4" />
          </div>
          <div className="blog-category-list" aria-label="Blog categories">
            {CATEGORIES.map((cat, index) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={activeCategory === cat.slug ? 'is-active' : ''}
              >
                <span className="blog-category-index">0{index + 1}</span>{t(cat.labelKey)}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

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
                className="blog-featured blog-reveal block mb-14 group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <img
                      src={featuredPost.coverImage || '/placeholder.jpg'}
                      alt={featuredPost.title?.uz || featuredPost.title?.en || ''}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-5 left-5">
                      <span className="blog-featured-badge">
                        {t('blog.featured')}
                      </span>
                    </div>
                  </div>
                  <div className="blog-featured-copy p-8 flex flex-col justify-center">
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
                    <h2 className="blog-featured-title text-2xl font-semibold text-[#f4f1eb] mb-3 group-hover:text-[#d6b47c] transition-colors">
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
              <div className="blog-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gridPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/blog/${post.slug}`}
                    className="blog-card blog-reveal group"
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
              <div className="blog-empty blog-reveal text-center py-20">
                <div className="blog-empty-icon"><BookOpen className="w-6 h-6" /></div>
                <p className="blog-empty-kicker">LUXX JOURNAL</p>
                <h3>{t('blog.noArticlesFound')}</h3>
                <p>{t('blog.noArticlesHint')}</p>
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
