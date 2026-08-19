import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BookOpen, Calendar, Check, ChevronRight, Clock, Copy, Eye, Instagram, Send, Share2, Tag } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import SEO from '../components/SEO';
import './BlogPost.css';

const getLocalizedValue = (value, language) => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  return [value[language], value.uz, value.en, value.ru]
    .find((item) => typeof item === 'string' && item.trim())?.trim() || '';
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug, t]);

  const title = useMemo(() => getLocalizedValue(blog?.title, language), [blog, language]);
  const excerpt = useMemo(() => getLocalizedValue(blog?.excerpt, language), [blog, language]);
  const articleSource = useMemo(() => getLocalizedValue(blog?.content, language), [blog, language]);
  const articleHtml = useMemo(() => sanitizeHtml(articleSource || excerpt), [articleSource, excerpt]);
  const isExcerptFallback = !articleSource && Boolean(excerpt);

  const formatDate = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      // Clipboard can be unavailable on insecure origins; the remaining share actions still work.
    }
  };

  const shareTelegram = () => {
    const shareText = title || 'LUXX Journal';
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <div className="article-loading" aria-label="Maqola yuklanmoqda"><div /><span>LUXX JOURNAL</span></div>;
  }

  if (error || !blog) {
    return (
      <main className="article-empty">
        <BookOpen size={34} aria-hidden="true" />
        <p>LUXX JOURNAL</p>
        <h1>{t('blogPost.notFoundTitle')}</h1>
        <span>{error || t('blogPost.notFoundHint')}</span>
        <Link to="/blog"><ArrowLeft size={16} /> {t('blogPost.backToBlog')}</Link>
      </main>
    );
  }

  return (
    <main className="article-page">
      <SEO
        title={blog.seoTitle || title || 'Moda blogi'}
        description={blog.seoDescription || excerpt || title}
        image={blog.coverImage || ''}
        canonicalPath={`/blog/${slug}`}
        type="article"
        noIndex={!articleSource}
        structuredData={{
          '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title,
          description: blog.seoDescription || excerpt, image: blog.coverImage ? [blog.coverImage] : undefined,
          datePublished: blog.publishedAt || blog.createdAt || '', dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt || '',
          author: { '@type': 'Person', name: blog.author?.username || 'Luxx.uz Editorial' },
          publisher: { '@type': 'Organization', name: 'Luxx.uz' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `https://luxx.uz/blog/${slug}` },
        }}
      />

      <div className="article-page__grain" aria-hidden="true" />
      <section className="article-hero">
        <div className="article-hero__intro">
          <nav className="article-crumbs" aria-label="Breadcrumb">
            <Link to="/">Bosh sahifa</Link><ChevronRight size={13} /><Link to="/blog">Journal</Link><ChevronRight size={13} /><span>{blog.category}</span>
          </nav>
          <button className="article-back" onClick={() => navigate('/blog')}><ArrowLeft size={15} /> Blogga qaytish</button>

          <div className="article-kicker"><span>{blog.featured ? 'TAVSIYA ETILGAN' : 'LUXX JOURNAL'}</span><i /></div>
          <div className="article-hero__meta"><span>{blog.category}</span><span>{formatDate(blog.publishedAt || blog.createdAt)}</span><span>{blog.readTime || 1} daqiqa o‘qish</span></div>
          <h1>{title}</h1>
          <div className="article-hero__rule" />
          {excerpt && <p className="article-dek">{excerpt}</p>}
          <div className="article-byline">
            <div className="article-byline__avatar">{blog.author?.profileImage ? <img src={blog.author.profileImage} alt="" /> : 'L'}</div>
            <span><b>{blog.author?.username || 'LUXX Editorial'}</b><small>Moda muharririyati</small></span>
            <span className="article-byline__views"><Eye size={14} /> {blog.viewCount || 0} ko‘rish</span>
          </div>
        </div>

        <div className="article-hero__visual">
          {blog.coverImage ? <img src={blog.coverImage} alt={title} /> : <div className="article-hero__placeholder"><span>LUXX</span><small>JOURNAL / EDITION</small></div>}
          <div className="article-hero__visual-shade" />
          <span className="article-hero__issue">ISSUE <b>0{Math.max(1, String(blog.viewCount || 1).length)}</b></span>
        </div>
      </section>

      <section className="article-layout">
        <aside className="article-rail" aria-label="Maqola boshqaruvlari">
          <span>ULASHISH</span>
          <button onClick={shareTelegram} aria-label="Telegram orqali ulashish"><Send size={17} /></button>
          <button onClick={() => window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')} aria-label="Instagram"><Instagram size={17} /></button>
          <button onClick={copyLink} aria-label="Havolani nusxalash">{copied ? <Check size={17} /> : <Copy size={17} />}</button>
          <i />
          <span>{blog.readTime || 1} MIN</span>
        </aside>

        <article className="article-body">
          {isExcerptFallback && (
            <div className="article-body__note">
              <BookOpen size={18} /><div><span>EDITOR’S NOTE</span><p>Ushbu maqola uchun qisqa ta’rif kiritilgan. To‘liq matn qo‘shilganda aynan shu joyda o‘qiladigan maqola ko‘rinishida chiqadi.</p></div>
            </div>
          )}
          {articleHtml ? <div className="article-rich" dangerouslySetInnerHTML={{ __html: articleHtml }} /> : (
            <div className="article-body__empty"><BookOpen size={26} /><h2>Maqola matni tez orada</h2><p>Bu maqola uchun to‘liq matn hali kiritilmagan.</p></div>
          )}

          {blog.images?.length > 0 && (
            <div className="article-gallery">
              {blog.images.map((image, index) => <figure key={image || index}><img src={image} alt={`${title} — ${index + 1}`} loading="lazy" /></figure>)}
            </div>
          )}

          {blog.tags?.length > 0 && <div className="article-tags"><Tag size={15} />{blog.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}

          <div className="article-end"><span>LUXX JOURNAL</span><h2>Har bir detal — sizning uslubingiz uchun.</h2><Link to="/products">Kolleksiyani kashf etish <ArrowUpRight size={17} /></Link></div>
        </article>
      </section>

      {related.length > 0 && (
        <section className="article-related">
          <div><span>DAVOM ETTIRING</span><h2>Keyingi o‘qishlar</h2></div>
          <div className="article-related__grid">
            {related.map((post, index) => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="article-related__card">
                <span>0{index + 1}</span>
                {post.coverImage && <img src={post.coverImage} alt="" loading="lazy" />}
                <div><small>{post.category}</small><h3>{getLocalizedValue(post.title, language)}</h3><p>{post.readTime || 1} daqiqa o‘qish <ArrowUpRight size={14} /></p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default BlogPost;
