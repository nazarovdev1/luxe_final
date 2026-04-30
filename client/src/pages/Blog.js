import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Tag, BookOpen, TrendingUp, Heart, Search } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    slug: 'spring-2026-trends',
    title: "Bahor 2026: Eng Trend Kiyimlar va Kombinatsiyalar",
    excerpt: "Bu mavsumda eng moda ranglar, materiallar va siluetlar. Premium fashion dunyosining yangiliklari va siz uchun eng yaxshi tavsiyalar.",
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop',
    category: 'Trendlar',
    author: 'LUXX Editorial',
    date: '2026-04-28',
    readTime: '5 daqiqalik o\'qish',
    tags: ['bahor', 'trendlar', '2026'],
    featured: true,
  },
  {
    id: 2,
    slug: 'office-style-guide',
    title: "Ofis Uchun Premium Kiyim: Zamonaviy Ayol Qo'llanmasi",
    excerpt: "Korporativ dressing code va premium kiyimlar. Ofisda ham zamonaviy, ham professional ko'rinishning sirlari.",
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=500&fit=crop',
    category: 'Maslahatlar',
    author: 'LUXX Style Team',
    date: '2026-04-25',
    readTime: '7 daqiqalik o\'qish',
    tags: ['ofis', 'maslahatlar', 'professional'],
    featured: false,
  },
  {
    id: 3,
    slug: 'silk-guide',
    title: "Ipak Kiyim Parvarishi: Premium Matnni To'g'ri Parvarish Qilish",
    excerpt: "Ipak, kashmir va boshqa premium materiallarni qanday to'g'ri parvarish qilish. Uzoq vaqt davomida sifatini saqlash sirlari.",
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=500&fit=crop',
    category: 'Qayg\'i',
    author: 'LUXX Care',
    date: '2026-04-22',
    readTime: '4 daqiqalik o\'qish',
    tags: ['ipak', 'parvarish', 'premium'],
    featured: false,
  },
  {
    id: 4,
    slug: 'color-matching',
    title: "Ranglar Uyg'unligi: Qanday Qilib To'g'ri Rang Tanlash",
    excerpt: "Ranglar nazariyasi va moda. Sizning rang turingizga mos keladigan ranglarni topish va kombinatsiya qilish.",
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=500&fit=crop',
    category: 'Kombinatsiyalar',
    author: 'LUXX Style Team',
    date: '2026-04-18',
    readTime: '6 daqiqalik o\'qish',
    tags: ['ranglar', 'kombinatsiya', 'maslahatlar'],
    featured: false,
  },
  {
    id: 5,
    slug: 'accessory-guide',
    title: "Aksessuarlar: Kiyimingizni To'liqlashtiruvchi Detallar",
    excerpt: "Soat, zargarlik buyumlari, sumka va boshqa aksessuarlar bilan kiyimingizni yangi darajaga olib chiqing.",
    image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800&h=500&fit=crop',
    category: 'Aksessuarlar',
    author: 'LUXX Editorial',
    date: '2026-04-15',
    readTime: '5 daqiqalik o\'qish',
    tags: ['aksessuarlar', 'sumka', 'zargarlik'],
    featured: false,
  },
  {
    id: 6,
    slug: 'evening-look',
    title: "Kechki Ko'rinish: Maxsus Kechalar Uchun Premium Stil",
    excerpt: "Tungi hayot, maxsus tadbirlar va kechki chiqishlar uchun eng yaxshi kiyim kombinatsiyalari.",
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=500&fit=crop',
    category: 'Kombinatsiyalar',
    author: 'LUXX Style Team',
    date: '2026-04-10',
    readTime: '4 daqiqalik o\'qish',
    tags: ['kechki', 'maxsus', 'kombinatsiya'],
    featured: false,
  },
];

const CATEGORIES = ['Barchasi', 'Trendlar', 'Maslahatlar', 'Kombinatsiyalar', 'Qayg\'i', 'Aksessuarlar'];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = activeCategory === 'Barchasi' || post.category === activeCategory;
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = BLOG_POSTS.find((p) => p.featured);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d6b47c]">LUXX Journal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight mb-4">
            Moda <span className="font-brilliant bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-gray-400 font-light text-lg max-w-xl mx-auto">
            Premium moda dunyosining eng so'nggi trendlari, maslahatlari va ilhomlantiruvchi kontent
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3f4658]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Maqola qidirish..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#11131e] border border-white/5 text-white text-sm placeholder:text-[#3f4658] focus:outline-none focus:border-[#d6b47c]/30 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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

        {/* Featured Post */}
        {featuredPost && activeCategory === 'Barchasi' && !searchQuery && (
          <Link
            to={`/blog/${featuredPost.slug}`}
            className="block mb-10 rounded-[2rem] overflow-hidden border border-white/5 bg-[#11131e]/50 hover:border-white/10 transition-all group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-[#d6b47c] text-black text-xs font-semibold uppercase tracking-wider">
                    🔥 Tavsiya etiladi
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
                    <span className="text-xs">{formatDate(featuredPost.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{featuredPost.readTime}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-[#f4f1eb] mb-3 group-hover:text-[#d6b47c] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-[#9aa3b2] leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-2 text-[#d6b47c] text-sm font-medium">
                  O'qishni davom etish <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.filter((p) => !p.featured || activeCategory !== 'Barchasi' || searchQuery).map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group rounded-[2rem] overflow-hidden border border-white/5 bg-[#11131e]/50 hover:border-white/10 transition-all"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11131e] via-transparent to-transparent opacity-60" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/15 text-[#d6b47c] text-[10px] font-medium">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-[#9aa3b2]">{formatDate(post.date)}</span>
                </div>
                <h3 className="text-base font-semibold text-[#f4f1eb] mb-2 line-clamp-2 group-hover:text-[#d6b47c] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[#9aa3b2] leading-relaxed line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px]">{post.readTime}</span>
                  </div>
                  <span className="text-xs text-[#d6b47c] font-medium flex items-center gap-1">
                    O'qish <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-[#3f4658] mx-auto mb-4" />
            <h3 className="text-xl text-[#f4f1eb] mb-2">Maqolalar topilmadi</h3>
            <p className="text-sm text-[#9aa3b2]">Qidiruv so'zini yoki kategoriyani o'zgartirib ko'ring</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
