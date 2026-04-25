import React, { useEffect, useState } from 'react';
import {
  Send,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const TYPES = ['info', 'success', 'warning'];

const typeMeta = {
  info: {
    icon: Info,
    label: 'Info',
    className: 'admin-pill admin-pill-info',
  },
  success: {
    icon: CheckCircle,
    label: 'Success',
    className: 'admin-pill admin-pill-success',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    className: 'admin-pill admin-pill-warning',
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    className: 'admin-pill admin-pill-danger',
  },
};

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/announcements`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim(), type }),
      });

      if (response.ok) {
        setMessage('');
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu xabarni o'chirmoqchimisiz?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnouncements((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/announcements/${id}/toggle`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="admin-section-title text-xl">Announcement boshqaruvi</h2>
          <p className="admin-muted text-sm mt-1">Banner xabarlar va active status nazorati</p>
        </div>

        <button
          type="button"
          onClick={fetchAnnouncements}
          className="admin-btn-secondary px-4 py-2.5 w-full lg:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </button>
      </div>

      <section className="admin-card-soft p-4 sm:p-5">
        <h3 className="admin-section-title text-base mb-4">Yangi xabar yaratish</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-200 mb-2">Xabar matni</label>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Masalan: Barcha mahsulotlarga 20% chegirma"
              className="admin-input"
            />
          </div>

          <div>
            <p className="block text-sm text-slate-200 mb-2">Xabar turi</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((item) => {
                const meta = typeMeta[item];
                const Icon = meta.icon;
                const isActive = item === type;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setType(item)}
                    className={isActive ? 'admin-btn-primary px-3.5 py-2 text-sm' : 'admin-btn-secondary px-3.5 py-2 text-sm'}
                  >
                    <Icon className="w-4 h-4" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="admin-btn-primary px-5 py-2.5 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Joylanmoqda...' : 'Joylash'}
          </button>
        </form>
      </section>

      <section className="admin-card-soft overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="admin-section-title text-base">Xabarlar tarixi</h3>
          <span className="admin-muted text-xs sm:text-sm">{announcements.length} ta yozuv</span>
        </div>

        {isLoading ? (
          <div className="py-14 flex justify-center">
            <div className="admin-loading-ring w-9 h-9" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-10 text-center admin-muted">Hozircha xabarlar yo'q</div>
        ) : (
          <div className="divide-y divide-slate-700/45">
            {announcements.map((item) => {
              const meta = typeMeta[item.type] || typeMeta.info;
              const Icon = meta.icon;

              return (
                <article key={item._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0 flex items-start gap-3">
                    <span className={meta.className}>
                      <Icon className="w-4 h-4" />
                      <span className="ml-1">{meta.label}</span>
                    </span>

                    <div className="min-w-0">
                      <p className="text-slate-100 font-medium break-words">{item.message}</p>
                      <p className="admin-muted text-xs mt-1">
                        {new Date(item.createdAt).toLocaleDateString('uz-UZ')} •{' '}
                        {new Date(item.createdAt).toLocaleTimeString('uz-UZ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(item._id)}
                      className={item.isActive ? 'admin-btn-secondary p-2 text-emerald-300' : 'admin-btn-soft p-2'}
                      title={item.isActive ? "O'chirish" : 'Yoqish'}
                    >
                      {item.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="admin-btn-danger p-2"
                      title="Xabarni o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAnnouncements;
