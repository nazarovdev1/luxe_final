import React, { useEffect, useMemo, useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import useProductService from '../server/server';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminPromos = () => {
  const { getPromos, createPromo, updatePromoStatus, deletePromo } = useProductService();
  const { token } = useAuth();

  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPromo, setNewPromo] = useState({
    code: '',
    discountPercentage: '',
  });

  const stats = useMemo(() => {
    const active = promos.filter((promo) => promo.isActive).length;
    const passive = promos.length - active;

    return {
      total: promos.length,
      active,
      passive,
    };
  }, [promos]);

  const fetchPromos = async () => {
    try {
      setIsLoading(true);
      const result = await getPromos(token);
      if (result.success) {
        setPromos(result.data || []);
      }
    } catch (error) {
      toast.error('Promokodlarni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!newPromo.code || !newPromo.discountPercentage) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    const percentage = Number(newPromo.discountPercentage);
    if (percentage < 1 || percentage > 100) {
      toast.error("Chegirma foizi 1 dan 100 gacha bo'lishi kerak");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPromo(
        {
          code: newPromo.code.toUpperCase(),
          discountPercentage: percentage,
        },
        token
      );

      if (result.success) {
        toast.success("Promokod muvaffaqiyatli qo'shildi");
        setNewPromo({ code: '', discountPercentage: '' });
        fetchPromos();
      } else {
        toast.error(result.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Promokod saqlashda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const result = await updatePromoStatus(id, !currentStatus, token);
      if (result.success) {
        toast.success("Holat o'zgartirildi");
        fetchPromos();
      } else {
        toast.error(result.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error("Holatni o'zgartirishda xatolik");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu promokodni rostdan ham o'chirmoqchimisiz?")) {
      return;
    }

    try {
      const result = await deletePromo(id, token);
      if (result.success) {
        toast.success("Promokod o'chirildi");
        fetchPromos();
      } else {
        toast.error(result.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="admin-section-title text-xl inline-flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-300" />
            Promokodlar
          </h2>
          <p className="admin-muted text-sm mt-1">Chegirma kodlarini yaratish va nazorat qilish</p>
        </div>

        <button type="button" onClick={fetchPromos} className="admin-btn-secondary px-4 py-2.5 w-full lg:w-auto">
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="admin-card-soft p-4">
          <p className="admin-muted text-xs uppercase tracking-[0.16em]">Jami</p>
          <p className="admin-stat-value mt-2">{stats.total}</p>
        </div>

        <div className="admin-card-soft p-4">
          <p className="admin-muted text-xs uppercase tracking-[0.16em]">Faol</p>
          <p className="admin-stat-value mt-2">{stats.active}</p>
        </div>

        <div className="admin-card-soft p-4">
          <p className="admin-muted text-xs uppercase tracking-[0.16em]">Faol emas</p>
          <p className="admin-stat-value mt-2">{stats.passive}</p>
        </div>
      </div>

      <section className="admin-card-soft p-4 sm:p-5">
        <h3 className="admin-section-title text-base mb-4">Yangi promokod qo'shish</h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-sm text-slate-200 mb-2">Kod</label>
            <input
              type="text"
              value={newPromo.code}
              onChange={(event) =>
                setNewPromo((prev) => ({
                  ...prev,
                  code: event.target.value.toUpperCase(),
                }))
              }
              placeholder="YANGI20"
              className="admin-input"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-2">Chegirma (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={newPromo.discountPercentage}
              onChange={(event) =>
                setNewPromo((prev) => ({
                  ...prev,
                  discountPercentage: event.target.value,
                }))
              }
              placeholder="20"
              className="admin-input sm:w-[130px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="admin-btn-primary px-5 py-2.5 disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Saqlanmoqda...' : "Qo'shish"}
          </button>
        </form>
      </section>

      <section className="admin-card-soft overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="admin-loading-ring w-9 h-9" />
          </div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center admin-muted">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Hali hech qanday promokod qo'shilmagan</p>
          </div>
        ) : (
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full min-w-[680px] text-left">
              <thead className="admin-table-head text-xs uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Kod</th>
                  <th className="px-5 py-4 font-semibold">Chegirma</th>
                  <th className="px-5 py-4 font-semibold">Holati</th>
                  <th className="px-5 py-4 font-semibold text-right">Amallar</th>
                </tr>
              </thead>

              <tbody>
                {promos.map((promo) => (
                  <tr key={promo._id} className="admin-table-row">
                    <td className="px-5 py-4 font-mono text-base font-bold text-white">{promo.code}</td>
                    <td className="px-5 py-4 text-amber-200 font-semibold">-{promo.discountPercentage}%</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(promo._id, promo.isActive)}
                        className={promo.isActive ? 'admin-pill admin-pill-success' : 'admin-pill admin-pill-danger'}
                      >
                        {promo.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="ml-1">Faol</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="ml-1">Faol emas</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(promo._id)}
                        className="admin-btn-danger p-2"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPromos;
