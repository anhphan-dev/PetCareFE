import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home, Loader2, Plus, RefreshCw, Trash2, UserCog, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboardService, {
  type AdminUserSummary,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '../../services/AdminDashboardService';

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    password: '',
    newPassword: '',
    roleName: 'Customer',
  });

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

  const openCreateForm = () => {
    setFormMode('create');
    setEditingUserId(null);
    setForm({
      email: '',
      fullName: '',
      phone: '',
      password: '',
      newPassword: '',
      roleName: 'Customer',
    });
  };

  const openEditForm = (item: AdminUserSummary) => {
    setError(null);
    setFormMode('edit');
    setEditingUserId(item.id);
    setForm({
      email: item.email || '',
      fullName: item.fullName || '',
      phone: item.phone || '',
      password: '',
      newPassword: '',
      roleName: item.roleName || 'Customer',
    });
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingUserId(null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      setError('Tên người dùng là bắt buộc.');
      return;
    }

    if (formMode === 'create' && (!form.email.trim() || !form.password.trim())) {
      setError('Email và mật khẩu là bắt buộc khi tạo user.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (formMode === 'create') {
        const payload: CreateUserPayload = {
          email: form.email.trim(),
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
          roleName: form.roleName,
        };
        await AdminDashboardService.createUser(payload);
      } else if (formMode === 'edit' && editingUserId) {
        const updatePayload: UpdateUserPayload = {
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || undefined,
          newPassword: form.newPassword.trim() || undefined,
        };

        await AdminDashboardService.updateUser(editingUserId, updatePayload);
        await AdminDashboardService.setUserRole(editingUserId, { roleName: form.roleName });
      }

      closeForm();
      await loadUsers(true);
    } catch (saveError: unknown) {
      const message = saveError instanceof Error ? saveError.message : 'Không thể lưu user.';
      if (message.toLowerCase().includes('forbidden')) {
        setError('API hiện tại từ chối quyền CRUD users (403). Bạn cần deploy backend mới với quyền Admin,admin cho UsersController.');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;

    const previousUsers = users;
    const previousTotal = totalCount;

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      setError(null);
      setSubmitting(true);
      await AdminDashboardService.deleteUser(userId);
      await loadUsers(true);
    } catch (deleteError: unknown) {
      setUsers(previousUsers);
      setTotalCount(previousTotal);

      const message = deleteError instanceof Error ? deleteError.message : 'Không thể xóa user.';
      if (message.toLowerCase().includes('forbidden')) {
        setError('API hiện tại từ chối quyền xóa user (403). Bạn cần deploy backend mới với quyền Admin,admin cho UsersController.');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
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
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Tạo user
            </button>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Về dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Home className="h-4 w-4" />
              Trang chủ
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

        {formMode && (
          <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{formMode === 'create' ? 'Tạo user mới' : 'Chỉnh sửa user'}</h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                disabled={formMode === 'edit'}
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
              />
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="Họ và tên"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Số điện thoại"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              {formMode === 'create' ? (
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Mật khẩu"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              ) : (
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  placeholder="Mật khẩu mới (không bắt buộc)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              )}

              <select
                value={form.roleName}
                onChange={(event) => setForm((prev) => ({ ...prev, roleName: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="staff">staff</option>
                <option value="service_provider">service_provider</option>
              </select>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? 'Đang xử lý...' : 'Lưu'}
              </button>
            </div>
          </form>
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
                    <th className="px-2 py-3">Membership</th>
                    <th className="px-2 py-3">Trạng thái</th>
                    <th className="px-2 py-3">Ngày tạo</th>
                    <th className="px-2 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-sm text-slate-500">
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
                          {item.membershipStatus ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                {item.membershipStatus}
                              </span>
                              <p className="text-xs text-slate-500">{item.membershipPackageName || 'N/A'}</p>
                              {item.membershipEndDate && (
                                <p className="text-xs text-slate-500">Hết hạn: {formatDate(item.membershipEndDate)}</p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                              No membership
                            </span>
                          )}
                        </td>
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
                        <td className="px-2 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <UserCog className="h-3.5 w-3.5" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(item.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Xóa
                            </button>
                          </div>
                        </td>
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
