// src/pages/ShopPage.tsx
import { Loader2, Package, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import shopService from '../../services/shopServices/shopService';
import { Product, ProductCategory } from '../../types';

export default function ShopPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy danh mục
        const catsResponse = await shopService.getProductCategories(true, false);
        const safeCategories = Array.isArray(catsResponse) ? catsResponse : [];
        setCategories(safeCategories);

        // Lấy sản phẩm
        let prodsResponse;
        if (selectedCategoryId === 'all') {
          prodsResponse = await shopService.getAllProducts();
        } else {
          prodsResponse = await shopService.getProductsByCategory(selectedCategoryId);
        }

        // Bảo vệ: luôn là mảng
        const safeProducts = Array.isArray(prodsResponse) ? prodsResponse : (prodsResponse?.data || []);
        setProducts(safeProducts);

        // Debug (xem trong console F12)
        console.log('Products response raw:', prodsResponse);
        console.log('Safe products after fix:', safeProducts);
      } catch (err: any) {
        console.error('Lỗi tải shop:', err);
        setError('Không thể tải dữ liệu cửa hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategoryId]);

  const handleCategoryClick = (catId: number | 'all') => {
    setSelectedCategoryId(catId);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Đang tải cửa hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-2xl font-bold text-red-600 mb-4">Có lỗi xảy ra</p>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Package className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">
              CỬA HÀNG THÚ CƯNG
            </h1>
          </div>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Thức ăn cao cấp, phụ kiện xịn, thuốc men chính hãng – tất cả vì boss nhà bạn!
          </p>
        </div>
      </div>

      {/* Filter danh mục */}
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả sản phẩm
            </button>

            {Array.isArray(categories) && categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.description || cat.name || 'Danh mục'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="container mx-auto px-6 py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              Chưa có sản phẩm trong danh mục này
            </h2>
            <p className="text-gray-500">
              Vui lòng chọn danh mục khác hoặc kiểm tra lại sau
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.isArray(products) && products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="h-56 bg-gray-50 flex items-center justify-center p-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full object-contain hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Package className="w-20 h-20 text-gray-300" />
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-14">
                    {product.name || 'Sản phẩm không tên'}
                  </h3>

                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-2xl font-bold text-teal-600">
                      {Number(product.price || 0).toLocaleString('vi-VN')} ₫
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {Number(product.originalPrice).toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}