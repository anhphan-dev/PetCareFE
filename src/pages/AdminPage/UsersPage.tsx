import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboardService, { type AdminUserSummary } from '../../services/AdminDashboardService';

const normalizeRole = (roleName?: string | null) => roleName?.trim().toLowerCase() ?? '';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export default function UsersPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleName = normalizeRole(user?.roleName);
  const canViewAdmin = isLoggedIn && roleName === 'admin';

  const totalPages = useMemo(() => {
    if (totalCount <= 0) return 1;
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/dang-nhap', { replace: true, state: { from: '/admin/khach-hang' } });
      return;
    }

    if (roleName && roleName !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, roleName]);

  const loadUsers = async (manual = false) => {
    try {
      setError(null);
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await AdminDashboardService.getUsers(page, pageSize);
      setUsers(result.items);
      setTotalCount(result.totalCount);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu người dùng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canViewAdmin) return;
    void loadUsers();
  }, [canViewAdmin, page]);

  if (!canViewAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">Tổng số người dùng trong hệ thống: {totalCount}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Về dashboard
            </Link>
            <button
              type="button"
              onClick={() => void loadUsers(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Làm mới
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-2 py-3">Tên</th>
                    <th className="px-2 py-3">Email</th>
                    <th className="px-2 py-3">Vai trò</th>
                    <th className="px-2 py-3">Trạng thái</th>
                    <th className="px-2 py-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-center text-sm text-slate-500">
                        Chưa có người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id}>
                        <td className="px-2 py-3 font-medium text-slate-900">{item.fullName}</td>
                        <td className="px-2 py-3 text-slate-700">{item.email}</td>
                        <td className="px-2 py-3 text-slate-700">{item.roleName || 'User'}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-slate-600">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Users className="h-3.5 w-3.5" />
              Tổng người dùng: {totalCount}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-xs text-slate-500">Trang {page}/{totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
