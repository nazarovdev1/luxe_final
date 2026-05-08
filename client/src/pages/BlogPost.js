import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, ArrowLeft, Share2, ChevronRight, BookOpen, Tag, Send, Instagram } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
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
          setError(t('blogPost.notFound'));
        }
      } catch (err) {
        setError(err.response?.data?.message || t('blogPost.loadError'));
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
    window.scrollTo(0, 0);
  }, [slug, t]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = blog?.title?.uz || blog?.title?.en || '';
    if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(url);
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] pt-28 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero skeleton */}
          <div className="w-full h-[400px] rounded-[2rem] bg-[#11131e] animate-pulse mb-8" />
          {/* Title skeleton */}
          <div className="h-10 bg-[#11131e] rounded-xl animate-pulse mb-4 w-3/4" />
          <div className="h-6 bg-[#11131e] rounded-xl animate-pulse mb-8 w-1/2" />
          {/* Content skeleton */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-[#11131e] rounded-lg animate-pulse mb-3" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#07080c] pt-28 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
          <BookOpen className="w-16 h-16 text-[#3f4658] mx-auto mb-6" />
          <h2 className="text-2xl font-light text-[#f4f1eb] mb-4">{t('blogPost.notFoundTitle')}</h2>
          <p className="text-[#9aa3b2] mb-8">{error || t('blogPost.notFoundHint')}</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/30 text-[#d6b47c] text-sm font-medium hover:bg-[#d6b47c]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blogPost.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] pt-28 pb-16">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
      </div>

      <div className="relative z-10">
        {/* Hero Cover Image */}
        {blog.coverImage && (
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
            <img
              src={blog.coverImage}
              alt={blog.title?.uz || blog.title?.en || ''}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/40 to-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 mt-6">
            <Link to="/" className="text-[#9aa3b2] hover:text-[#d6b47c] transition-colors">{t('blogPost.home')}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#3f4658]" />
            <Link to="/blog" className="text-[#9aa3b2] hover:text-[#d6b47c] transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#3f4658]" />
            <span className="text-[#d6b47c] truncate max-w-[200px]">{blog.category}</span>
          </nav>

          {/* Back button */}
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 text-[#9aa3b2] hover:text-[#d6b47c] transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blogPost.backToBlog')}
          </button>

          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-3 py-1.5 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-xs font-medium">
              {blog.category}
            </span>
            {blog.featured && (
              <span className="ml-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                {t('blog.featured')}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#f4f1eb] leading-tight mb-4">
            {blog.title?.uz || blog.title?.en || blog.title?.ru || ''}
          </h1>

          {/* Gold accent underline */}
          <div className="w-24 h-0.5 bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-transparent mb-6" />

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
            {blog.author && (
              <div className="flex items-center gap-2">
                <img
                  src={blog.author.profileImage || '/placeholder-user.jpg'}
                  alt={blog.author.username}
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
                <span className="text-[#f4f1eb] font-medium">{blog.author.username || t('blogPost.editorial')}</span>
              </div>
            )}
            {!blog.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#d6b47c]/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#d6b47c]" />
                </div>
                <span className="text-[#f4f1eb] font-medium">{t('blogPost.editorial')}</span>
              </div>
            )}
            <div className="w-1 h-1 rounded-full bg-[#3f4658]" />
            <div className="flex items-center gap-1.5 text-[#9aa3b2]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#3f4658]" />
            <div className="flex items-center gap-1.5 text-[#9aa3b2]">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.readTime} {t('blog.minRead')}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#3f4658]" />
            <div className="flex items-center gap-1.5 text-[#9aa3b2]">
              <Eye className="w-3.5 h-3.5" />
              <span>{blog.viewCount} {t('blogPost.views')}</span>
            </div>
          </div>

          {/* Content */}
          <article
            className="prose prose-invert prose-lg max-w-none mb-12
              prose-headings:text-[#f4f1eb] prose-headings:font-light
              prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
              prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
              prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-5
              prose-p:text-[#9aa3b2] prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-[#d6b47c] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#f4f1eb]
              prose-blockquote:border-l-[#d6b47c] prose-blockquote:border-l-4 prose-blockquote:bg-[#d6b47c]/5 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
              prose-img:rounded-2xl prose-img:my-6
              prose-li:text-[#9aa3b2]
              prose-code:text-[#d6b47c] prose-code:bg-[#11131e] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-[#11131e] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-2xl
            "
            dangerouslySetInnerHTML={{ __html: blog.content?.uz || blog.content?.en || blog.content?.ru || '' }}
          />

          {/* Image Gallery */}
          {blog.images && blog.images.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-[#f4f1eb] mb-4">{t('blogPost.gallery')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {blog.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-white/5">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#d6b47c]" />
                <span className="text-sm text-[#9aa3b2]">{t('blogPost.tags')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[#9aa3b2] text-xs hover:border-[#d6b47c]/20 hover:text-[#d6b47c] transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share bar */}
          <div className="flex items-center gap-3 mb-12 p-4 rounded-2xl bg-[#11131e]/50 border border-white/5">
            <Share2 className="w-4 h-4 text-[#9aa3b2]" />
            <span className="text-sm text-[#9aa3b2] mr-2">{t('blogPost.share')}</span>
            <button
              onClick={() => handleShare('telegram')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2AABEE]/10 border border-[#2AABEE]/20 text-[#2AABEE] text-xs font-medium hover:bg-[#2AABEE]/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Telegram
            </button>
            <button
              onClick={() => handleShare('instagram')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E4405F]/10 border border-[#E4405F]/20 text-[#E4405F] text-xs font-medium hover:bg-[#E4405F]/20 transition-all"
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[#9aa3b2] text-xs font-medium hover:border-white/10 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              {t('blogPost.copy')}
            </button>
          </div>

          {/* CTA Section */}
          <div className="mb-12 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-r from-[#d6b47c]/10 via-[#11131e]/50 to-[#d6b47c]/5 border border-[#d6b47c]/15 text-center">
            <h3 className="text-xl font-light text-[#f4f1eb] mb-3">{t('blogPost.ctaTitle')}</h3>
            <p className="text-sm text-[#9aa3b2] mb-6 max-w-md mx-auto">
              {t('blogPost.ctaDescription')}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d6b47c] text-black text-sm font-semibold hover:bg-[#c9a96e] transition-colors"
            >
              {t('blogPost.goToProducts')}
            </Link>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-light text-[#f4f1eb] mb-6">{t('blogPost.relatedArticles')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((post) => (
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
                    <div className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/15 text-[#d6b47c] text-[10px] font-medium">
                        {post.category}
                      </span>
                      <h4 className="text-sm font-semibold text-[#f4f1eb] mt-2 mb-1 line-clamp-2 group-hover:text-[#d6b47c] transition-colors">
                        {post.title?.uz || post.title?.en || ''}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#9aa3b2]">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime} daqiqa</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
