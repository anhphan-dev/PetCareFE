// src/pages/ProviderPage/AddProductPage.tsx
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Hotel,
  LayoutDashboard,
  Loader2,
  LogOut,
  PawPrint,
  PlusCircle,
  Scissors,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import httpClient from '../../services/httpClient';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/provider' },
  { icon: Calendar, label: 'Lịch đặt dịch vụ', path: '/provider/lich-dat' },
  { icon: Scissors, label: 'Dịch vụ của tôi', path: '/provider/dich-vu' },
  { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/provider/them-san-pham' },
  { icon: Hotel, label: 'Phòng / Khu vực', path: '/provider/phong-khu-vuc' },
  { icon: Star, label: 'Đánh giá & Phản hồi', path: '/provider/danh-gia' },
  { icon: DollarSign, label: 'Doanh thu & Thanh toán', path: '/provider/doanh-thu' },
  { icon: Users, label: 'Khách hàng của tôi', path: '/provider/khach-hang' },
];

interface Category {
  id: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export default function AddProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError(null);

        const response = await httpClient.get('/ProductCategories');

        let catData: Category[] = [];
        if (response.data?.success && Array.isArray(response.data.data)) {
          catData = response.data.data;
        } else if (Array.isArray(response.data)) {
          catData = response.data;
        }

        setCategories(catData);
      } catch (err: any) {
        console.error('Lỗi tải danh mục:', err);
        setCategoriesError('Không thể tải danh sách danh mục. Vui lòng kiểm tra backend.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

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

    const toastId = toast.loading('Đang tạo sản phẩm...');

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
        imageUrls: formData.imageUrls.filter((url) => url.trim() !== '') || [],
        isActive: formData.isActive,
      };

      // Log debug
      const base = httpClient.post || '';
      console.log('POST URL:', base + '/Products');
      console.log('Payload:', payload);

      let response;
      try {
        response = await httpClient.post('/Products', payload);
      } catch (postErr: any) {
        if (postErr.response?.status === 404) {
          console.log('Thử lại với /Products...');
          response = await httpClient.post('/Products', payload);
        } else {
          throw postErr;
        }
      }

      if (response?.status === 200) {
        toast.success('Tạo sản phẩm thành công!', { id: toastId });
        // Clear form sau success
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
        setTimeout(() => navigate('/provider'), 1500);
      }
    } catch (err: any) {
      console.error('Lỗi POST:', err);
      const errMsg = err.response?.data?.message || err.message || 'Tạo sản phẩm thất bại.';
      toast.error(errMsg, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b">
          <PawPrint className="w-8 h-8 text-teal-600" />
          <span className="text-xl font-bold text-teal-700">Provider Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                  item.path === '/provider/them-san-pham' ? 'bg-teal-50 text-teal-700 font-medium' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
            <p className="text-gray-500 text-sm">Tạo sản phẩm để bán trong cửa hàng / dịch vụ của bạn</p>
          </div>
          <Link
            to="/provider"
            className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại dashboard
          </Link>
        </header>

        <main className="p-8 max-w-4xl mx-auto">
          {loadingCategories ? (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
              <p className="mt-2 text-gray-600">Đang tải danh sách danh mục...</p>
            </div>
          ) : categoriesError ? (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
              {categoriesError}
            </div>
          ) : categories.length === 0 ? (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
              Không có danh mục nào khả dụng. Vui lòng thêm danh mục trước khi tạo sản phẩm.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Tên sản phẩm"
                />
                {formErrors.productName && <p className="text-red-500 text-sm mt-1">{formErrors.productName}</p>}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Mô tả sản phẩm"
                />
                {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName} {cat.description ? ` - ${cat.description}` : ''}
                      </option>
                    ))}
                </select>
                {formErrors.categoryId && <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>}
              </div>

              {/* Giá & Tồn kho */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="10000"
                  />
                  {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="0"
                  />
                  {formErrors.stockQuantity && <p className="text-red-500 text-sm mt-1">{formErrors.stockQuantity}</p>}
                </div>
              </div>

              {/* Các trường optional */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá giảm (sale)</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="SKU sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trọng lượng (gram)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước (D x R x C)</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Kích thước sản phẩm"
                />
              </div>

              {/* Ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL ảnh sản phẩm (không bắt buộc)</label>
                {formData.imageUrls.map((url, index) => (
                  <input
                    key={index}
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="https://example.com/anh-san-pham.jpg"
                    className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="mt-2 text-teal-600 hover:text-teal-800 flex items-center gap-2 font-medium"
                >
                  <PlusCircle className="w-5 h-5" />
                  Thêm URL ảnh khác
                </button>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                  className="h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <label htmlFor="isActive" className="text-gray-700 font-medium cursor-pointer">
                  Sản phẩm đang hoạt động (hiển thị cho khách hàng)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo sản phẩm...
                  </>
                ) : (
                  'Tạo sản phẩm mới'
                )}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}