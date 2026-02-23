// src/pages/ShopPage/ShopCategoryProducts.tsx
import { AlertCircle, ChevronLeft, Loader2, Package, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import shopService from '../../services/shopServices/shopService';
import { Product } from '../../types';

const categoryMap: Record<string, string> = {
  'thuc-an': 'Thức ăn',
  'do-choi': 'Đồ chơi',
  've-sinh': 'Vệ sinh',
};

export default function ShopCategoryProducts() {
  const { category } = useParams<{ category: string }>();
  const categoryName = categoryMap[category || ''] || 'Danh mục';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      if (!category) return;

      setLoading(true);
      setError(null);

      try {
        // Giả sử bạn có mapping từ key slug → categoryId thực tế từ API
        // Nếu backend dùng slug, bạn cần điều chỉnh logic
        // Ở đây tạm giả định bạn có hàm lấy categoryId từ slug (hoặc hardcode tạm)
        const categoryIdMap: Record<string, number> = {
          'thuc-an': 1,    // thay bằng ID thật từ API
          'do-choi': 2,
          've-sinh': 3,
        };

        const catId = categoryIdMap[category];

        if (!catId) {
          throw new Error('Danh mục không hợp lệ');
        }

        const prods = await shopService.getProductsByCategory(catId);
        setProducts(prods);
      } catch (err: any) {
        setError(err.message || 'Không thể tải sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với nút quay lại */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <Link to="/cua-hang" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ChevronLeft className="w-5 h-5" />
            Quay lại cửa hàng
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{categoryName}</h1>
              <p className="text-white/90 mt-1">Khám phá các sản phẩm chất lượng cao trong danh mục này</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Thử lại
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Package className="w-20 h-20 mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Chưa có sản phẩm trong danh mục này
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Chúng tôi đang cập nhật thêm sản phẩm mới. Hãy quay lại sau nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
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
                      {product.name}
                    </h3>

                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-bold text-teal-600">
                        {Number(product.price).toLocaleString('vi-VN')} ₫
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
      </section>
    </div>
  );
}