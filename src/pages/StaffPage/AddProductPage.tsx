// src/pages/StaffPage/AddProductPage.tsx
import {
  ArrowLeft,
  LayoutDashboard,
  Loader2,
  LogOut,
  PackageSearch,
  PawPrint,
  PlusCircle,
  Upload,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

interface ProductFormData {
  productName: string;
  description: string;
  categoryId: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
  sku: string;
  weight: string;
  dimensions: string;
  imageUrls: string[];
  isActive: boolean;
}

interface FormErrors {
  [key: string]: string;
}

// ============ STAFF MENU (Must match Dashboard) ============
const staffMenuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
  // { icon: Calendar, label: 'Lịch đặt dịch vụ', path: '/staff/lich-dat' },
  // { icon: Scissors, label: 'Dịch vụ của tôi', path: '/staff/dich-vu' },
  { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/staff/them-san-pham' },
  { icon: PackageSearch, label: 'Quản lý sản phẩm', path: '/staff/quan-li-san-pham' },
];

// ============ COMPONENT: GlassCard ============
const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 ${className}`}>
    {children}
  </div>
);

// ============ MAIN COMPONENT ============
export default function StaffAddProductPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    description: '',
    categoryId: '',
    price: '',
    salePrice: '',
    stockQuantity: '',
    sku: '',
    weight: '',
    dimensions: '',
    imageUrls: [''],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await httpClient.get<any>('/ProductCategories');

        let catData: Category[] = [];
        if (response?.success && Array.isArray(response.data)) {
          catData = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          catData = response.data.data;
        } else if (Array.isArray(response)) {
          catData = response;
        }

        setCategories(catData.filter((c: Category) => c.isActive));
      } catch (err: any) {
        console.error('Lỗi tải danh mục:', err);
        toast.error('Không thể tải danh sách danh mục');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Form Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData((prev) => ({ ...prev, imageUrls: newUrls }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const removeImageField = (index: number) => {
    if (formData.imageUrls.length <= 1) return;
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, imageUrls: newUrls }));
  };

  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để tải ảnh lên.');
      e.target.value = '';
      return;
    }

    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    form.append('folder', 'products');

    try {
      setUploadingImages(true);

      const apiBase = import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';

      const response = await fetch(`${apiBase}/Images/upload-multiple`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || 'Upload ảnh thất bại.');
      }

      const result = (await response.json()) as { imageUrls?: string[]; message?: string };

      const uploadedUrls = result.imageUrls ?? [];
      if (uploadedUrls.length === 0) {
        throw new Error('Không nhận được URL ảnh sau khi upload.');
      }

      setFormData((prev) => {
        const existing = prev.imageUrls.filter((url) => url.trim() !== '');
        return {
          ...prev,
          imageUrls: [...existing, ...uploadedUrls],
        };
      });

      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh.`);
    } catch (err: any) {
      toast.error(err.message || 'Tải ảnh thất bại.');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.productName.trim()) errors.productName = 'Tên sản phẩm là bắt buộc';
    if (!formData.description.trim()) errors.description = 'Mô tả là bắt buộc';
    if (!formData.categoryId) errors.categoryId = 'Vui lòng chọn danh mục';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Giá bán phải lớn hơn 0';
    if (!formData.stockQuantity || Number(formData.stockQuantity) < 0)
      errors.stockQuantity = 'Số lượng tồn kho phải >= 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : 0,
        stockQuantity: Number(formData.stockQuantity),
        sku: formData.sku.trim() || undefined,
        weight: formData.weight ? Number(formData.weight) : 0,
        dimensions: formData.dimensions.trim() || undefined,
        imageUrls: formData.imageUrls.filter((url) => url.trim() !== ''),
        isActive: formData.isActive,
      };

      const response = await httpClient.post('/Products', payload);

      if (response?.success || response?.status === 200 || response?.status === 201) {
        toast.success('Tạo sản phẩm thành công!');

        // Reset form
        setFormData({
          productName: '',
          description: '',
          categoryId: '',
          price: '',
          salePrice: '',
          stockQuantity: '',
          sku: '',
          weight: '',
          dimensions: '',
          imageUrls: [''],
          isActive: true,
        });

        setFormErrors({});

        // Optionally redirect after success
        setTimeout(() => {
          navigate('/staff/quan-li-san-pham');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Lỗi POST:', err);
      const errMsg = err.response?.data?.message || err.message || 'Tạo sản phẩm thất bại.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col fixed h-full z-40">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <PawPrint className="w-8 h-8 text-teal-600" />
          <span className="text-xl font-bold text-teal-700">Staff Panel</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {staffMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/staff/them-san-pham';
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
              <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
              <p className="text-gray-500 text-sm">Tạo sản phẩm để bán trong hệ thống PetCare</p>
            </div>
            <Link
              to="/staff/quan-li-san-pham"
              className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại danh sách
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 max-w-4xl mx-auto">
          {loadingCategories ? (
            <GlassCard className="p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-3" />
              <p className="text-gray-600">Đang tải danh sách danh mục...</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tên sản phẩm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                             focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                             transition-all"
                    placeholder="Nhập tên sản phẩm"
                  />
                  {formErrors.productName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.productName}</p>
                  )}
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                             focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                             transition-all resize-none"
                    placeholder="Mô tả chi tiết sản phẩm"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Danh mục */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                             focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                             transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>
                  )}
                </div>

                {/* Giá & Tồn kho */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá bán <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.001"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                               focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                               transition-all"
                      placeholder="10000"
                    />
                    {formErrors.price && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng tồn kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                               focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                               transition-all"
                      placeholder="0"
                    />
                    {formErrors.stockQuantity && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.stockQuantity}</p>
                    )}
                  </div>
                </div>

                {/* Các trường optional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá khuyến mãi
                    </label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                               focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                               transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                               focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                               transition-all"
                      placeholder="Mã SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trọng lượng (gram)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                               focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                               transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Kích thước */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kích thước (D x R x C)
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                             focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                             transition-all"
                    placeholder="Ví dụ: 10 x 5 x 3 cm"
                  />
                </div>

                {/* Ảnh sản phẩm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hình ảnh sản phẩm
                  </label>

                  {/* Upload Button */}
                  <label
                    className={`mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed 
                             px-4 py-3 text-sm font-medium transition-all ${
                               uploadingImages
                                 ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed'
                                 : 'border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100'
                             }`}
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải ảnh lên...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Tải nhiều ảnh cùng lúc
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingImages}
                      onChange={handleImageFilesUpload}
                    />
                  </label>

                  {/* Image URL Inputs */}
                  <div className="space-y-3">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          placeholder="https://example.com/anh-san-pham.jpg"
                          className="flex-1 px-4 py-3 bg-white/50 border border-gray-200 rounded-lg 
                                   focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none 
                                   transition-all"
                        />
                        {formData.imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa ảnh"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addImageField}
                    className="mt-3 text-teal-600 hover:text-teal-800 flex items-center gap-2 
                             font-medium text-sm transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Thêm URL ảnh khác
                  </button>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 
                             cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-gray-700 font-medium cursor-pointer select-none">
                    Sản phẩm đang hoạt động (hiển thị cho khách hàng)
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/staff/quan-li-san-pham')}
                    className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 
                             rounded-lg font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-teal-600 text-white py-3.5 rounded-lg font-semibold 
                             hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed 
                             transition-all flex items-center justify-center gap-2 shadow-md 
                             hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        Tạo sản phẩm
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          )}
        </main>
      </div>
    </div>
  );
}