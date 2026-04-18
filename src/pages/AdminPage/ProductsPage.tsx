import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboardService, {
  type AdminProductCategory,
  type AdminProductSummary,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../../services/AdminDashboardService';

const normalizeRole = (roleName?: string | null) => roleName?.trim().toLowerCase() ?? '';
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

type ProductFormState = {
  productName: string;
  description: string;
  categoryId: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
  sku: string;
  isActive: boolean;
};

const defaultForm: ProductFormState = {
  productName: '',
  description: '',
  categoryId: '',
  price: '',
  salePrice: '',
  stockQuantity: '0',
  sku: '',
  isActive: true,
};

export default function ProductsPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<AdminProductSummary[]>([]);
  const [categories, setCategories] = useState<AdminProductCategory[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultForm);

  const roleName = normalizeRole(user?.roleName);
  const canViewAdmin = isLoggedIn && roleName === 'admin';

  const totalPages = useMemo(() => {
    if (totalCount <= 0) return 1;
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/dang-nhap', { replace: true, state: { from: '/admin/san-pham' } });
      return;
    }

    if (roleName && roleName !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, roleName]);

  const loadData = async (manual = false) => {
    try {
      setError(null);
      if (manual) setRefreshing(true);
      else setLoading(true);

      const [productsResult, categoriesResult] = await Promise.all([
        AdminDashboardService.getProducts(page, pageSize),
        AdminDashboardService.getProductCategories(),
      ]);

      setProducts(productsResult.items);
      setTotalCount(productsResult.totalCount);
      setCategories(categoriesResult);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu sản phẩm.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canViewAdmin) return;
    void loadData();
  }, [canViewAdmin, page]);

  const openCreateForm = () => {
    setFormMode('create');
    setEditingProductId(null);
    setForm(defaultForm);
  };

  const openEditForm = (item: AdminProductSummary) => {
    setFormMode('edit');
    setEditingProductId(item.id);
    setForm({
      productName: item.productName || '',
      description: '',
      categoryId: '',
      price: String(item.price ?? 0),
      salePrice: item.salePrice != null && item.salePrice > 0 ? String(item.salePrice) : '',
      stockQuantity: String(item.stockQuantity ?? 0),
      sku: '',
      isActive: !!item.isActive,
    });
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingProductId(null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.productName.trim() || !form.price) {
      setError('Tên sản phẩm và giá là bắt buộc.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (formMode === 'create') {
        const payload: CreateProductPayload = {
          productName: form.productName.trim(),
          description: form.description.trim() || undefined,
          categoryId: form.categoryId || undefined,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : undefined,
          stockQuantity: Number(form.stockQuantity || '0'),
          sku: form.sku.trim() || undefined,
          isActive: form.isActive,
          imageUrls: [],
        };

        await AdminDashboardService.createProduct(payload);
      } else if (formMode === 'edit' && editingProductId) {
        const payload: UpdateProductPayload = {
          productName: form.productName.trim(),
          description: form.description.trim() || undefined,
          categoryId: form.categoryId || undefined,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : undefined,
          stockQuantity: Number(form.stockQuantity || '0'),
          sku: form.sku.trim() || undefined,
          isActive: form.isActive,
        };

        await AdminDashboardService.updateProduct(editingProductId, payload);
      }

      closeForm();
      await loadData(true);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    const previous = products;
    const previousCount = totalCount;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      setError(null);
      await AdminDashboardService.deleteProduct(productId);
      await loadData(true);
    } catch (deleteError: unknown) {
      setProducts(previous);
      setTotalCount(previousCount);
      setError(deleteError instanceof Error ? deleteError.message : 'Không thể xóa sản phẩm.');
    }
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
            <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">Quản lý sản phẩm</h1>
            <p className="mt-1 text-sm text-slate-500">Tổng số sản phẩm: {totalCount}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Tạo sản phẩm
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
              onClick={() => void loadData(true)}
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
              <h2 className="text-lg font-bold text-slate-900">{formMode === 'create' ? 'Tạo sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h2>
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
                value={form.productName}
                onChange={(event) => setForm((prev) => ({ ...prev, productName: event.target.value }))}
                placeholder="Tên sản phẩm"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                placeholder="Giá"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={form.salePrice}
                onChange={(event) => setForm((prev) => ({ ...prev, salePrice: event.target.value }))}
                placeholder="Giá sale"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                type="number"
                value={form.stockQuantity}
                onChange={(event) => setForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
                placeholder="Tồn kho"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                placeholder="SKU"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={form.categoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>

              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Mô tả"
                rows={3}
                className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Đang hoạt động
              </label>
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
                    <th className="px-2 py-3">Danh mục</th>
                    <th className="px-2 py-3">Giá</th>
                    <th className="px-2 py-3">Tồn kho</th>
                    <th className="px-2 py-3">Trạng thái</th>
                    <th className="px-2 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-sm text-slate-500">
                        Chưa có sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td className="px-2 py-3 font-medium text-slate-900">{item.productName}</td>
                        <td className="px-2 py-3 text-slate-700">{item.categoryName || '-'}</td>
                        <td className="px-2 py-3 text-slate-700">
                          {item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price ? (
                            <div>
                              <span className="text-slate-400 line-through mr-2">{formatCurrency(item.price)}</span>
                              <span className="font-semibold text-emerald-700">{formatCurrency(item.salePrice)}</span>
                            </div>
                          ) : (
                            formatCurrency(item.price)
                          )}
                        </td>
                        <td className="px-2 py-3 text-slate-700">{item.stockQuantity}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(item.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Xóa
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
            <p className="text-xs text-slate-500">Tổng {totalCount} sản phẩm | Trang {page}/{totalPages}</p>
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
