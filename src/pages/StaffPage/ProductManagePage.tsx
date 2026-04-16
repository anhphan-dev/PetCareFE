// src/pages/StaffPage/ProductManagePage.tsx
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    LayoutDashboard,
    Loader2,
    LogOut,
    Package,
    PackageSearch,
    PawPrint,
    Pencil,
    PlusCircle,
    Scissors,
    Search,
    Trash2,
    X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import httpClient from '../../services/httpClient';

// ============ TYPES ============
interface Category {
  id: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
}

interface Product {
  id: string;
  productName: string;
  description: string;
  category?: { id: string; categoryName: string };
  categoryId: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  categoryId: string;
  status: 'all' | 'active' | 'inactive';
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// ============ STAFF MENU ITEMS ============
const staffMenuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
  { icon: Calendar, label: 'Lịch đặt dịch vụ', path: '/staff/lich-dat' },
  { icon: Scissors, label: 'Dịch vụ của tôi', path: '/staff/dich-vu' },
  { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/staff/them-san-pham' },
  { icon: PackageSearch, label: 'Quản lý sản phẩm', path: '/staff/quan-li-san-pham' },
];

// ============ UTILITY: Debounce ============
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============ COMPONENT: GlassCard ============
const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 ${className}`}>
    {children}
  </div>
);

// ============ COMPONENT: FilterBar ============
interface FilterBarProps {
  filters: FilterState;
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  onRefresh: () => void;
  loading: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  categories,
  onFilterChange,
  onRefresh,
  loading,
}) => {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ ...filters, search: e.target.value });
    },
    [filters, onFilterChange]
  );

  return (
    <GlassCard className="p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg 
                     focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                     transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-48">
          <select
            value={filters.categoryId}
            onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg 
                     focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                     transition-all appearance-none cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories
              .filter((cat) => cat.isActive)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-40">
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value as FilterState['status'] })
            }
            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg 
                     focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                     transition-all appearance-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 
                   bg-teal-600 hover:bg-teal-700 text-white rounded-lg 
                   font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-sm hover:shadow-md"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Filter className="w-4 h-4" />
          )}
          Lọc
        </button>
      </div>
    </GlassCard>
  );
};

// ============ COMPONENT: ProductModal ============
interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Chi tiết sản phẩm</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image */}
          {product.imageUrls?.[0] && (
            <div className="flex justify-center">
              <img
                src={product.imageUrls[0]}
                alt={product.productName}
                className="w-48 h-48 object-cover rounded-xl shadow-md border border-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/192?text=No+Image';
                }}
              />
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tên sản phẩm</span>
              <p className="font-medium text-gray-800 mt-1">{product.productName}</p>
            </div>
            <div>
              <span className="text-gray-500">SKU</span>
              <p className="font-medium text-gray-800 mt-1">{product.sku || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Danh mục</span>
              <p className="font-medium text-gray-800 mt-1">{category?.categoryName || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Trạng thái</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                product.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {product.isActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Hoạt động
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" /> Ngừng hoạt động
                  </>
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Giá bán</span>
              <p className="font-semibold text-teal-600 mt-1">
                {product.price.toLocaleString('vi-VN')}₫
              </p>
            </div>
            <div>
              <span className="text-gray-500">Giá khuyến mãi</span>
              <p className="font-medium text-gray-800 mt-1">
                {product.salePrice ? `${product.salePrice.toLocaleString('vi-VN')}₫` : '—'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Tồn kho</span>
              <p className={`font-medium mt-1 ${
                product.stockQuantity <= 0 ? 'text-red-600' : 
                product.stockQuantity < 10 ? 'text-orange-600' : 'text-gray-800'
              }`}>
                {product.stockQuantity} sản phẩm
              </p>
            </div>
            <div>
              <span className="text-gray-500">Trọng lượng</span>
              <p className="font-medium text-gray-800 mt-1">
                {product.weight ? `${product.weight}g` : '—'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-gray-500 text-sm">Mô tả</span>
            <p className="text-gray-700 mt-2 leading-relaxed">{product.description}</p>
          </div>

          {/* Dimensions */}
          {product.dimensions && (
            <div>
              <span className="text-gray-500 text-sm">Kích thước</span>
              <p className="text-gray-700 mt-1">{product.dimensions}</p>
            </div>
          )}

          {/* Additional Images */}
          {product.imageUrls?.length > 1 && (
            <div>
              <span className="text-gray-500 text-sm block mb-2">Ảnh bổ sung</span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.imageUrls.slice(1).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Product ${idx + 2}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>Tạo: {new Date(product.createdAt).toLocaleString('vi-VN')}</p>
            <p>Cập nhật: {new Date(product.updatedAt).toLocaleString('vi-VN')}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-teal-600 hover:bg-teal-700 text-white rounded-lg 
                     font-medium transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-red-50 hover:bg-red-100 text-red-600 rounded-lg 
                     font-medium transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 
                     rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

// ============ COMPONENT: ConfirmModal ============
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 
                     rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 
                     text-white rounded-lg font-medium transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

// ============ COMPONENT: ProductCard (Mobile) ============
interface ProductCardProps {
  product: Product;
  category?: Category;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <GlassCard className="p-4 hover:shadow-xl transition-shadow">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 flex-shrink-0">
          {product.imageUrls?.[0] ? (
            <img
              src={product.imageUrls[0]}
              alt={product.productName}
              className="w-full h-full object-cover rounded-lg border border-gray-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-gray-800 truncate">{product.productName}</h4>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
              product.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">{category?.categoryName}</p>
          
          <div className="flex items-center gap-3 mt-2">
            <span className="font-semibold text-teal-600">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            {product.salePrice && product.salePrice < product.price && (
              <span className="text-sm text-gray-400 line-through">
                {product.salePrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Kho: <span className={product.stockQuantity <= 0 ? 'text-red-600 font-medium' : ''}>
              {product.stockQuantity}
            </span>
          </p>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onView(product)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 
                       bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg 
                       text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Xem
            </button>
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 
                       bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg 
                       text-sm font-medium transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Sửa
            </button>
            <button
              onClick={() => onDelete(product)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 
                       bg-red-50 hover:bg-red-100 text-red-600 rounded-lg 
                       text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// ============ COMPONENT: ProductTable (Desktop) ============
interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  onView,
  onEdit,
  onDelete,
}) => {
  // ✅ Fix: Ensure products is an array
  const productsArray = Array.isArray(products) ? products : [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sản phẩm</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Danh mục</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Giá</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">Tồn kho</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 hidden xl:table-cell">SKU</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {productsArray.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);
            return (
              <tr
                key={product.id}
                className="border-b border-gray-50 hover:bg-teal-50/30 transition-colors"
              >
                {/* Product */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {product.imageUrls?.[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.productName}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{product.productName}</p>
                      <p className="text-xs text-gray-400 md:hidden">{category?.categoryName}</p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-4 px-4 text-gray-600 hidden md:table-cell">
                  {category?.categoryName}
                </td>

                {/* Price */}
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-teal-600">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.salePrice.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </td>

                {/* Stock */}
                <td className="py-4 px-4 hidden lg:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stockQuantity <= 0
                      ? 'bg-red-100 text-red-700'
                      : product.stockQuantity < 10
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {product.stockQuantity}
                  </span>
                </td>

                {/* SKU */}
                <td className="py-4 px-4 text-gray-500 text-sm hidden xl:table-cell">
                  {product.sku || '—'}
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {product.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Hoạt động
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" /> Ngừng HĐ
                      </>
                    )}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(product)}
                      title="Xem chi tiết"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-teal-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      title="Chỉnh sửa"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-teal-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      title="Xóa sản phẩm"
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ============ COMPONENT: Pagination ============
interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} sản phẩm
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (pagination.page <= 3) {
            pageNum = i + 1;
          } else if (pagination.page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = pagination.page - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-lg font-medium transition-colors ${
                pagination.page === pageNum
                  ? 'bg-teal-600 text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === totalPages}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ============ MAIN PAGE COMPONENT ============
export default function ProductManagePage() {
  const navigate = useNavigate();

  // States
  const [products, setProducts] = useState<Product[]>([]); // ✅ Initialized as empty array
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: '',
    status: 'all',
  });
  const debouncedSearch = useDebounce(filters.search, 300);

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; product?: Product }>({
    isOpen: false,
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await httpClient.get<{ success: boolean; data: Category[] }>('/ProductCategories');
      
      if (response?.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh mục:', err);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (filters.categoryId) {
        params.categoryId = filters.categoryId;
      }
      if (filters.status !== 'all') {
        params.isActive = filters.status === 'active';
      }

      const response = await httpClient.get<any>('/Products', { params });

      // ✅ Fix: Handle different API response structures
      let productsData: Product[] = [];
      let total = 0;

      if (response?.success) {
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          productsData = response.data.items;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        }
        
        total = response.pagination?.total || response.data?.total || response.data?.pagination?.total || productsData.length;
      }

      setProducts(productsData);
      setPagination((prev) => ({
        ...prev,
        total: total,
      }));
    } catch (err: any) {
      console.error('Lỗi tải sản phẩm:', err);
      toast.error(err.message || 'Không thể tải danh sách sản phẩm');
      setProducts([]); // ✅ Ensure products is an array on error
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, filters.categoryId, filters.status]);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, filters.categoryId, filters.status]);

  // Handlers
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    navigate(`/staff/products/edit/${product.id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((product: Product) => {
    setConfirmDelete({ isOpen: true, product });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete.product) return;

    try {
      setDeleting(true);
      await httpClient.delete(`/Products/${confirmDelete.product.id}`);
      
      toast.success('Đã xóa sản phẩm thành công');
      fetchProducts();
      setConfirmDelete({ isOpen: false });
    } catch (err: any) {
      console.error('Lỗi xóa sản phẩm:', err);
      toast.error(err.message || 'Không thể xóa sản phẩm');
    } finally {
      setDeleting(false);
    }
  }, [confirmDelete.product, fetchProducts]);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Filtered categories for display
  const activeCategories = useMemo(() => 
    categories.filter((c) => c.isActive), 
    [categories]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col fixed h-full z-40">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <PawPrint className="w-8 h-8 text-teal-600" /> {/* ✅ PawPrint is imported */}
          <span className="text-xl font-bold text-teal-700">Staff Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {staffMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/staff/products';
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 
                         hover:bg-teal-50 hover:text-teal-700 transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700 font-medium shadow-sm' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 
                     hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
              <p className="text-gray-500 text-sm">Quản lý danh sách sản phẩm trong hệ thống</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/staff"
                className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/staff/them-san-pham"
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 
                         text-white rounded-lg font-medium transition-colors shadow-sm 
                         hover:shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                Thêm sản phẩm
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {/* Loading Categories */}
          {loadingCategories ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onRefresh={handleRefresh}
                loading={loading}
              />

              {/* Product List */}
              {loading ? (
                // Skeleton Loading
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-20" />
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ) : products.length === 0 ? (
                // Empty State
                <GlassCard className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {filters.search || filters.categoryId || filters.status !== 'all'
                      ? 'Thử điều chỉnh bộ lọc để tìm sản phẩm'
                      : 'Chưa có sản phẩm nào trong hệ thống'}
                  </p>
                  <Link
                    to="/staff/products/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 
                             hover:bg-teal-700 text-white rounded-lg font-medium 
                             transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Thêm sản phẩm đầu tiên
                  </Link>
                </GlassCard>
              ) : (
                <>
                  {/* Desktop Table */}
                  <GlassCard className="hidden md:block">
                    <ProductTable
                      products={products}
                      categories={categories}
                      onView={handleViewProduct}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteClick}
                    />
                  </GlassCard>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        category={categories.find((c) => c.id === product.categoryId)}
                        onView={handleViewProduct}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <GlassCard className="mt-6 p-4">
                    <Pagination
                      pagination={pagination}
                      onPageChange={handlePageChange}
                    />
                  </GlassCard>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => setSelectedProduct(null)}
          onEdit={handleEditProduct}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${confirmDelete.product?.productName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ isOpen: false })}
        loading={deleting}
      />
    </div>
  );
}