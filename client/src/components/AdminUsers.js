import React, { useEffect, useMemo, useState } from 'react';
import { Users, Calendar, Phone, RefreshCw, ShieldCheck } from 'lucide-react';
import useProductService from '../server/server';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { getAllUsers } = useProductService();

  const fetchUsers = async (withRefreshState = false) => {
    if (withRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    const token = localStorage.getItem('token');
    const result = await getAllUsers(token);

    if (result.success) {
      setUsers(result.data || []);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((user) => user.isAdmin).length;
    const customerCount = total - adminCount;

    return {
      total,
      adminCount,
      customerCount,
    };
  }, [users]);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="admin-loading-ring w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="admin-section-title text-xl">Foydalanuvchilar</h2>
          <p className="admin-muted text-sm mt-1">Ro'yxatdan o'tgan akkauntlar</p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(true)}
          className="admin-btn-secondary px-4 py-2.5 w-full lg:w-auto"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="admin-card-soft p-4">
          <p className="admin-muted text-xs uppercase tracking-[0.16em]">Jami</p>
          <p className="admin-stat-value mt-2">{stats.total}</p>
        </div>

        <div className="admin-card-soft p-4">
          <p className="admin-muted text-xs uppercase tracking-[0.16em]">Mijozlar</p>
          <p className="admin-stat-value mt-2">{stats.customerCount}</p>
        </div>

        <div className="admin-card-soft p-4">
          <p className="admin-muted text-xs uppercase tracking-[0.16em]">Adminlar</p>
          <p className="admin-stat-value mt-2">{stats.adminCount}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="admin-empty-state p-12 text-center">
          <Users className="w-14 h-14 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg text-white font-semibold">Foydalanuvchilar topilmadi</h3>
          <p className="admin-muted mt-2">Hali hech kim ro'yxatdan o'tmagan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => {
            const createdAtLabel = new Date(user.createdAt).toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <article key={user._id} className="admin-card-soft p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900 text-lg font-bold flex items-center justify-center flex-shrink-0">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{user.username || 'Nomaʼlum'}</h3>
                      {user.isAdmin ? (
                        <span className="admin-pill admin-pill-info mt-1 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="admin-muted text-xs">Mijoz</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="admin-muted text-sm inline-flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-300" />
                    <span className="text-slate-100">{user.phone || '-'}</span>
                  </p>

                  <p className="admin-muted text-sm inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span className="text-slate-100">{createdAtLabel}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
