import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboardService, {
  type AdminVoucher,
  type CreateVoucherPayload,
  type UpdateVoucherPayload,
} from '../../services/AdminDashboardService';

type VoucherFormState = {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscountAmount: string;
  usageLimit: string;
  validFrom: string;
  validTo: string;
};

const defaultFormState: VoucherFormState = {
  code: '',
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrderAmount: '',
  maximumDiscountAmount: '',
  usageLimit: '',
  validFrom: '',
  validTo: '',
};

const formatCurrencyVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const normalizeRole = (roleName?: string | null) => roleName?.trim().toLowerCase() ?? '';

const toPayload = (form: VoucherFormState): CreateVoucherPayload => ({
  code: form.code.trim().toUpperCase(),
  name: form.name.trim(),
  description: form.description.trim() || undefined,
  discountType: form.discountType,
  discountValue: Number(form.discountValue),
  minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined,
  maximumDiscountAmount: form.maximumDiscountAmount ? Number(form.maximumDiscountAmount) : undefined,
  usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
  validFrom: new Date(form.validFrom).toISOString(),
  validTo: new Date(form.validTo).toISOString(),
});

const toUpdatePayload = (form: VoucherFormState): UpdateVoucherPayload => ({
  name: form.name.trim(),
  description: form.description.trim() || undefined,
  discountType: form.discountType,
  discountValue: Number(form.discountValue),
  minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined,
  maximumDiscountAmount: form.maximumDiscountAmount ? Number(form.maximumDiscountAmount) : undefined,
  usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
  validFrom: new Date(form.validFrom).toISOString(),
  validTo: new Date(form.validTo).toISOString(),
});

const validateForm = (form: VoucherFormState, isEdit: boolean): string | null => {
  if (!isEdit && !form.code.trim()) return 'Mã voucher là bắt buộc.';
  if (!form.name.trim()) return 'Tên voucher là bắt buộc.';
  if (!form.discountValue || Number(form.discountValue) <= 0) return 'Giá trị giảm phải lớn hơn 0.';
  if (!form.validFrom || !form.validTo) return 'Thời gian hiệu lực là bắt buộc.';

  const validFrom = new Date(form.validFrom).getTime();
  const validTo = new Date(form.validTo).getTime();
  if (Number.isNaN(validFrom) || Number.isNaN(validTo) || validTo <= validFrom) {
    return 'Ngày kết thúc phải lớn hơn ngày bắt đầu.';
  }

  return null;
};

export default function VouchersPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(null);
  const [form, setForm] = useState<VoucherFormState>(defaultFormState);

  const roleName = normalizeRole(user?.roleName);
  const canViewAdmin = isLoggedIn && roleName === 'admin';

  const totalPages = useMemo(() => {
    if (totalCount <= 0) return 1;
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  const openCreateForm = () => {
    setEditingVoucher(null);
    setForm(defaultFormState);
    setShowForm(true);
  };

  const openEditForm = (voucher: AdminVoucher) => {
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      discountType: voucher.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: String(voucher.discountValue),
      minimumOrderAmount: voucher.minimumOrderAmount ? String(voucher.minimumOrderAmount) : '',
      maximumDiscountAmount: voucher.maximumDiscountAmount ? String(voucher.maximumDiscountAmount) : '',
      usageLimit: voucher.usageLimit ? String(voucher.usageLimit) : '',
      validFrom: voucher.validFrom.slice(0, 16),
      validTo: voucher.validTo.slice(0, 16),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVoucher(null);
    setForm(defaultFormState);
  };

  const loadVouchers = async (isManualRefresh = false) => {
    try {
      setError(null);
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await AdminDashboardService.getVouchers(page, pageSize, searchKeyword);
      setVouchers(result.items);
      setTotalCount(result.totalCount);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/dang-nhap', { replace: true, state: { from: '/admin/vouchers' } });
      return;
    }

    if (roleName && roleName !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, roleName]);

  useEffect(() => {
    if (!canViewAdmin) return;
    void loadVouchers();
  }, [canViewAdmin, page, pageSize, searchKeyword]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm(form, !!editingVoucher);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingVoucher) {
        await AdminDashboardService.updateVoucher(editingVoucher.id, toUpdatePayload(form));
      } else {
        await AdminDashboardService.createVoucher(toPayload(form));
      }

      closeForm();
      await loadVouchers(true);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể lưu voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVoucher = async (voucherId: string) => {
    try {
      setError(null);
      await AdminDashboardService.toggleVoucher(voucherId);
      await loadVouchers(true);
    } catch (toggleError: unknown) {
      setError(toggleError instanceof Error ? toggleError.message : 'Không thể cập nhật trạng thái voucher.');
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearchKeyword(searchInput.trim());
  };

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
            <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">Quản trị Voucher</h1>
            <p className="mt-1 text-sm text-slate-500">Tạo, cập nhật và bật/tắt voucher trực tiếp từ admin.</p>
          </div>

          <div className="flex items-center gap-2">
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
              onClick={() => void loadVouchers(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Làm mới
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Tạo voucher
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{editingVoucher ? 'Cập nhật voucher' : 'Tạo voucher mới'}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {!editingVoucher && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mã voucher</label>
                  <input
                    value={form.code}
                    onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="VD: PET10"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên voucher</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Loại giảm giá</label>
                <select
                  value={form.discountType}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, discountType: event.target.value as 'percentage' | 'fixed' }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VND)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Giá trị giảm</label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(event) => setForm((prev) => ({ ...prev, discountValue: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Đơn hàng tối thiểu</label>
                <input
                  type="number"
                  value={form.minimumOrderAmount}
                  onChange={(event) => setForm((prev) => ({ ...prev, minimumOrderAmount: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Giảm tối đa</label>
                <input
                  type="number"
                  value={form.maximumDiscountAmount}
                  onChange={(event) => setForm((prev) => ({ ...prev, maximumDiscountAmount: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Giới hạn lượt dùng</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(event) => setForm((prev) => ({ ...prev, usageLimit: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Bắt đầu</label>
                <input
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(event) => setForm((prev) => ({ ...prev, validFrom: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Kết thúc</label>
                <input
                  type="datetime-local"
                  value={form.validTo}
                  onChange={(event) => setForm((prev) => ({ ...prev, validTo: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? 'Đang lưu...' : editingVoucher ? 'Lưu cập nhật' : 'Tạo voucher'}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 sm:w-[380px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Tìm theo mã hoặc tên voucher"
                className="w-full border-none text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Tìm kiếm
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-2 py-3">Mã</th>
                    <th className="px-2 py-3">Tên</th>
                    <th className="px-2 py-3">Giảm giá</th>
                    <th className="px-2 py-3">Hiệu lực</th>
                    <th className="px-2 py-3">Sử dụng</th>
                    <th className="px-2 py-3">Trạng thái</th>
                    <th className="px-2 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-sm text-slate-500">
                        Chưa có voucher nào.
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((voucher) => (
                      <tr key={voucher.id}>
                        <td className="px-2 py-3 font-semibold text-slate-900">{voucher.code}</td>
                        <td className="px-2 py-3 text-slate-700">{voucher.name}</td>
                        <td className="px-2 py-3 text-slate-700">
                          {voucher.discountType === 'percentage'
                            ? `${voucher.discountValue}%`
                            : formatCurrencyVnd(voucher.discountValue)}
                        </td>
                        <td className="px-2 py-3 text-slate-600">{formatDateTime(voucher.validTo)}</td>
                        <td className="px-2 py-3 text-slate-600">
                          {voucher.usedCount}
                          {voucher.usageLimit ? ` / ${voucher.usageLimit}` : ''}
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              voucher.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {voucher.isActive ? 'Đang bật' : 'Đang tắt'}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(voucher)}
                              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleToggleVoucher(voucher.id)}
                              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              {voucher.isActive ? 'Tắt' : 'Bật'}
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
            <p className="text-xs text-slate-500">
              Tổng {totalCount} voucher | Trang {page}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
              >
                Trước
              </button>
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
