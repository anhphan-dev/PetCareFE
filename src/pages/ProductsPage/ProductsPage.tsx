// src/pages/ProductsPage.tsx
import { Filter, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { productService } from '../../services/ProductService/productService';
import { Product } from '../../types';

const categories = [
  { id: 'all', label: 'Tất cả' },
  // Thay bằng id GUID thực tế từ API /ProductCategories
  // Ví dụ từ log Swagger trước của bạn
  { id: '75805fdd-c08c-4648-a343-0ac435979448', label: 'Thức ăn' },
  { id: 'fec1fb2e-fbeb-45d6-852a-212ba8da4279', label: 'Đồ chơi' },
  { id: '80647ffa-cc53-4216-8176-940f3ec460e3', label: 'Vệ sinh' },
  { id: '54c43f9d-dd67-4006-bfb5-aa2573f95c55', label: 'Phụ kiện' },
  { id: 'a05a54c0-44c4-4476-841f-961273c6775f', label: 'Quần áo' },
  { id: 'a845248b-9299-4a5d-8c86-fed3afcb2a3b', label: 'Thuốc & Vitamin' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [selectedCategoryId]); // reload khi thay đổi category

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (selectedCategoryId === 'all') {
        const data = await productService.getAllProducts();
        setProducts(data);
      } else {
        const data = await productService.getProductsByCategory(selectedCategoryId);
        setProducts(data);
      }
    } catch (err) {
      console.error('Lỗi load sản phẩm:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      filtered = filtered.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {
        const results = await productService.searchProducts(searchTerm);
        setProducts(results);
      } catch (err) {
        setError('Không tìm thấy sản phẩm phù hợp.');
      } finally {
        setIsLoading(false);
      }
    } else {
      loadProducts();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategoryId('all');
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-12 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Sản phẩm</h1>
            </div>
            <p className="text-white/90 text-lg">
              Khám phá các sản phẩm chất lượng cao dành cho thú cưng của bạn
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Tìm kiếm
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Danh mục:</span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-600">
                <p>{error}</p>
                <button
                  onClick={loadProducts}
                  className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="mb-6 text-gray-600">
                  Hiển thị <span className="font-semibold text-teal-600">{filteredProducts.length}</span> sản phẩm
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500 mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                </p>
                <button
                  onClick={clearSearch}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-semibold shadow-sm"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}