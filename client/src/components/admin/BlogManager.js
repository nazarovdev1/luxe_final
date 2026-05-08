import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Star, StarOff, Eye, Search, Plus, Loader2, BookOpen } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import BlogForm from './BlogForm';

const STATUS_MAP = {
  draft: { label: 'Qoralama', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  published: { label: 'Chop etilgan', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  archived: { label: 'Arxivlangan', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const BlogManager = () => {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchBlogs = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await axios.get('/api/blogs/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (res.data.success) {
        setBlogs(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      toast.error('Maqolalarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchBlogs(page);
  }, [page, fetchBlogs]);

  const handleDelete = async (id) => {
    if (!window.confirm('Haqiqatan ham bu maqolani o\'chirmoqchimisiz?')) return;
    try {
      await axios.delete(`/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Maqola o\'chirildi');
      fetchBlogs(page);
    } catch (err) {
      toast.error('O\'chirishda xato yuz berdi');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await axios.patch(`/api/blogs/${id}/feature`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Featured holati o\'zgartirildi');
      fetchBlogs(page);
    } catch (err) {
      toast.error('Featured o\'zgartirishda xato');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingBlog(null);
    setShowForm(true);
  };

  const handleFormClose = (saved) => {
    setShowForm(false);
    setEditingBlog(null);
    if (saved) fetchBlogs(page);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (showForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="admin-section-title flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            {editingBlog ? 'Maqolani tahrirlash' : 'Yangi maqola yaratish'}
          </h2>
          <button
            type="button"
            onClick={() => handleFormClose(false)}
            className="admin-btn-secondary px-4 py-2"
          >
            Bekor qilish
          </button>
        </div>
        <BlogForm blog={editingBlog} onClose={handleFormClose} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="admin-section-title flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-300" />
          Blog boshqaruvi
          <span className="text-xs text-gray-500 font-normal">({total} maqola)</span>
        </h2>
        <button
          type="button"
          onClick={handleAddNew}
          className="admin-btn-primary px-4 py-2.5"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi maqola</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-400/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/30"
        >
          <option value="">Barcha statuslar</option>
          <option value="draft">Qoralama</option>
          <option value="published">Chop etilgan</option>
          <option value="archived">Arxivlangan</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/30"
        >
          <option value="">Barcha kategoriyalar</option>
          <option value="Trendlar">Trendlar</option>
          <option value="Maslahatlar">Maslahatlar</option>
          <option value="Kombinatsiyalar">Kombinatsiyalar</option>
          <option value="Parvarish">Parvarish</option>
          <option value="Aksessuarlar">Aksessuarlar</option>
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="admin-empty-state p-10 text-center">
          <BookOpen className="w-14 h-14 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Maqolalar topilmadi</h3>
          <p className="admin-muted mt-2 mb-6">Hali hech qanday maqola yaratilmagan</p>
          <button
            type="button"
            onClick={handleAddNew}
            className="admin-btn-primary px-5 py-2.5"
          >
            <Plus className="w-5 h-5" />
            Birinchi maqolani yaratish
          </button>
        </div>
      ) : (
        <>
          {/* Mobile view */}
          <div className="md:hidden divide-y divide-slate-700/40">
            {blogs.map((blog) => (
              <article key={blog._id} className="p-4">
                <div className="flex gap-3">
                  <img
                    src={blog.coverImage || '/placeholder.jpg'}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover border border-slate-600/60 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white leading-tight line-clamp-2">
                          {blog.title?.uz || blog.title?.en || ''}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{blog.category}</p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_MAP[blog.status]?.color}`}>
                        {STATUS_MAP[blog.status]?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.viewCount}</span>
                        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        {blog.featured && <span className="text-amber-400">⭐</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleToggleFeatured(blog._id)} className="admin-btn-soft p-1.5" title="Toggle featured">
                          {blog.featured ? <Star className="w-3.5 h-3.5 text-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleEdit(blog)} className="admin-btn-soft p-1.5">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(blog._id)} className="admin-btn-danger p-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto admin-scroll">
            <table className="w-full min-w-[900px]">
              <thead className="admin-table-head text-xs uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Maqola</th>
                  <th className="px-6 py-4 text-left font-semibold">Kategoriya</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Ko'rishlar</th>
                  <th className="px-6 py-4 text-left font-semibold">Sana</th>
                  <th className="px-6 py-4 text-left font-semibold">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="admin-table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={blog.coverImage || '/placeholder.jpg'}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-slate-600/70 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-[250px]">
                            {blog.title?.uz || blog.title?.en || ''}
                          </p>
                          <p className="text-xs text-gray-500">/{blog.slug}</p>
                        </div>
                        {blog.featured && <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">{blog.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${STATUS_MAP[blog.status]?.color}`}>
                        {STATUS_MAP[blog.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{blog.viewCount}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFeatured(blog._id)}
                          className="admin-btn-soft p-2"
                          title={blog.featured ? 'Featured olib tashlash' : 'Featured qilish'}
                        >
                          {blog.featured ? <Star className="w-4 h-4 text-amber-400" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleEdit(blog)} className="admin-btn-soft p-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(blog._id)} className="admin-btn-danger p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="admin-btn-secondary px-3 py-2 text-sm disabled:opacity-30"
              >
                Oldingi
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="admin-btn-secondary px-3 py-2 text-sm disabled:opacity-30"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogManager;
