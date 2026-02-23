// src/pages/ShopPage/ShopPage.tsx  (hoặc ShopPage.tsx)
import { AlertCircle, Loader2, Package, ShoppingCart } from 'lucide-react';
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
      setLoading(true);
      setError(null);

      try {
        // 1. Lấy danh mục
        const cats = await shopService.getProductCategories(true, false);
        setCategories(cats);

        // 2. Lấy sản phẩm theo filter
        let prods: Product[] = [];
        if (selectedCategoryId === 'all') {
          prods = await shopService.getAllProducts();
        } else if (typeof selectedCategoryId === 'number') {
          prods = await shopService.getProductsByCategory(selectedCategoryId);
        }

        setProducts(prods);
      } catch (err: any) {
        console.error('Lỗi tải shop:', err);
        setError(err.message || 'Không thể tải dữ liệu cửa hàng. Vui lòng thử lại sau.');
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
        <p className="text-lg text-gray-600">Đang tải cửa hàng thú cưng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-800 mb-3">Có lỗi xảy ra</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <Package className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            CỬA HÀNG THÚ CƯNG
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Thức ăn dinh dưỡng, phụ kiện thời trang, đồ chơi an toàn – tất cả dành cho boss!
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-20 bg-white shadow-md border-b">
        <div className="container mx-auto px-6 py-4 overflow-x-auto">
          <div className="flex gap-3 justify-start md:justify-center whitespace-nowrap">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-6 py-2.5 rounded-full font-medium text-sm md:text-base transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm md:text-base transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name || cat.description || 'Danh mục'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-12">
        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow">
            <Package className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold text-gray-700 mb-4">
              Chưa có sản phẩm nào
            </h2>
            <p className="text-lg text-gray-500">
              Danh mục này đang trống hoặc đang cập nhật. Hãy thử danh mục khác nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="h-64 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6 relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-pet.jpg'; // fallback image
                      }}
                    />
                  ) : (
                    <Package className="w-24 h-24 text-gray-300" />
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-end gap-3 mb-5">
                    <span className="text-3xl font-extrabold text-teal-600">
                      {product.price.toLocaleString('vi-VN')} ₫
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-base text-gray-500 line-through">
                        {product.originalPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-3 shadow-md hover:shadow-lg">
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ hàng
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