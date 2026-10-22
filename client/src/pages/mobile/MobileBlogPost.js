import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2, ChevronRight, BookOpen, Tag, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { useLanguage } from '../../contexts/LanguageContext';
import SEO from '../../components/SEO';
import { formatUzDate } from '../../utils/formatDate';

const localized = (value, language) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.uz || value.ru || value.en || '';
};

const MobileBlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/blogs/${slug}`);
        if (res.data.success) {
          setBlog(res.data.data);
          setRelated(res.data.related || []);
        } else {
          setError(t('mobileBlogPost.notFound'));
        }
      } catch (err) {
        setError(err.response?.data?.message || t('mobileBlogPost.loadError'));
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
    window.scrollTo(0, 0);
  }, [slug, t]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return formatUzDate(dateStr);
  };

  const title = localized(blog?.title, language);
  const content = localized(blog?.content, language);

  const handleShare = async (platform) => {
    const url = window.location.href;
    if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Havola nusxalandi');
    } catch (_) {
      // Clipboard is unavailable on insecure origins; Telegram sharing still works.
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] pt-4 pb-20">
        <div className="w-full h-56 bg-[#11131e] animate-pulse mb-4" />
        <div className="px-4">
          <div className="h-8 bg-[#11131e] rounded-xl animate-pulse mb-3 w-3/4" />
          <div className="h-4 bg-[#11131e] rounded-lg animate-pulse mb-6 w-1/2" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 bg-[#11131e] rounded-lg animate-pulse mb-2" style={{ width: `${80 + Math.random() * 20}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#07080c] pt-4 pb-20 px-4 text-center py-20">
        <BookOpen className="w-12 h-12 text-[#3f4658] mx-auto mb-4" />
        <h2 className="text-lg font-light text-[#f4f1eb] mb-2">{t('mobileBlogPost.notFound')}</h2>
        <p className="text-sm text-[#9aa3b2] mb-6">{error}</p>
        <Link
          to="/mobile/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/30 text-[#d6b47c] text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('mobileBlogPost.backToBlog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] pt-4 pb-24">
      <SEO
        title={blog.seoTitle || title || 'Moda blogi'}
        description={blog.seoDescription || localized(blog.excerpt, language)}
        image={blog.coverImage}
        canonicalPath={`/blog/${slug}`}
        type="article"
        noIndex={!content.trim()}
      />
      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative w-full h-56 overflow-hidden">
          <img
            src={blog.coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/50 to-transparent" />
        </div>
      )}

      <div className="px-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/mobile/blog')}
          className="inline-flex items-center gap-1.5 text-[#9aa3b2] hover:text-[#d6b47c] transition-colors mb-3 text-sm mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('mobileBlogPost.back')}
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[10px] mb-4">
          <Link to="/mobile" className="text-[#9aa3b2]">{t('mobileBlogPost.breadcrumbHome')}</Link>
          <ChevronRight className="w-3 h-3 text-[#3f4658]" />
          <Link to="/mobile/blog" className="text-[#9aa3b2]">{t('mobileBlogPost.breadcrumbBlog')}</Link>
          <ChevronRight className="w-3 h-3 text-[#3f4658]" />
          <span className="text-[#d6b47c] truncate max-w-[120px]">{blog.category}</span>
        </nav>

        {/* Category & Featured */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-[10px] font-medium">
            {blog.category}
          </span>
          {blog.featured && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
              {t('mobileBlogPost.featured')}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-light text-[#f4f1eb] leading-tight mb-3">
          {title}
        </h1>

        {/* Gold accent */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-[#d6b47c] to-transparent mb-4" />

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-xs">
          <span className="text-[#f4f1eb] font-medium">{t('mobileBlogPost.authorFallback')}</span>
          <div className="flex items-center gap-1 text-[#9aa3b2]">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-[#9aa3b2]">
            <Clock className="w-3 h-3" />
            <span>{blog.readTime} {t('mobileBlogPost.minutesShort')}</span>
          </div>
        </div>

        {/* Content */}
        <article
          className="prose prose-invert prose-base max-w-none mb-8
            prose-headings:text-[#f4f1eb] prose-headings:font-light
            prose-h1:text-2xl prose-h1:mb-3 prose-h1:mt-6
            prose-h2:text-xl prose-h2:mb-2 prose-h2:mt-5
            prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
            prose-p:text-[#9aa3b2] prose-p:leading-relaxed prose-p:mb-3 prose-p:text-sm
            prose-a:text-[#d6b47c] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#f4f1eb]
            prose-blockquote:border-l-[#d6b47c] prose-blockquote:border-l-4 prose-blockquote:bg-[#d6b47c]/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
            prose-img:rounded-xl prose-img:my-4
            prose-li:text-[#9aa3b2] prose-li:text-sm
            prose-code:text-[#d6b47c] prose-code:bg-[#11131e] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-[#11131e] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl
          "
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />

        {/* Share — inline so it never covers the app's bottom navigation */}
        <div className="mb-8 flex items-center gap-6 border-y border-white/5 py-4 text-xs text-[#9aa3b2]">
          <span className="uppercase tracking-[0.2em] text-[10px]">Ulashish</span>
          <button
            type="button"
            onClick={() => handleShare('telegram')}
            className="flex min-h-[44px] items-center gap-2 text-[#f4f1eb]"
          >
            <Send className="w-4 h-4" strokeWidth={1.5} /> Telegram
          </button>
          <button
            type="button"
            onClick={() => handleShare('copy')}
            className="flex min-h-[44px] items-center gap-2 text-[#f4f1eb]"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.5} /> Havola
          </button>
        </div>

        {/* Image Gallery */}
        {blog.images && blog.images.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base font-semibold text-[#f4f1eb] mb-3">{t('mobileBlogPost.gallery')}</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {blog.images.map((img, idx) => (
                <div key={idx} className="flex-shrink-0 w-40 h-40 rounded-xl overflow-hidden border border-white/5">
                  <img src={img} alt={`${title} — ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-[#d6b47c]" />
              <span className="text-xs text-[#9aa3b2]">{t('mobileBlogPost.tags')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {blog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[#9aa3b2] text-[10px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-[#d6b47c]/10 via-[#11131e]/50 to-[#d6b47c]/5 border border-[#d6b47c]/15 text-center">
          <h3 className="text-base font-light text-[#f4f1eb] mb-4">Maqoladagi maslahatlarni kolleksiyada sinab ko‘ring.</h3>
          <Link
            to="/mobile/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6b47c] text-black text-xs font-semibold"
          >
            Kolleksiyani ko‘rish
          </Link>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-light text-[#f4f1eb] mb-4">{t('mobileBlogPost.related')}</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {related.map((post) => (
                <Link
                  key={post._id}
                  to={`/mobile/blog/${post.slug}`}
                  className="flex-shrink-0 w-56 rounded-2xl overflow-hidden border border-white/5 bg-[#11131e]/50"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.coverImage || '/editorial/journal-feature-2026.webp'}
                      alt={localized(post.title, language)}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#d6b47c]/10 text-[#d6b47c] text-[9px] font-medium">
                      {post.category}
                    </span>
                    <h4 className="text-xs font-semibold text-[#f4f1eb] mt-1.5 mb-1 line-clamp-2">
                      {localized(post.title, language)}
                    </h4>
                    <div className="flex items-center gap-1 text-[9px] text-[#9aa3b2]">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{post.readTime} {t('mobileBlogPost.minutesShort')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default MobileBlogPost;
