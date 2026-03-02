import {
  Search,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ProductCard from "../../components/ProductCard";
import { productService } from "../../services/ProductService/productService";
import { Product } from "../../types";

// Swiper imports
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination as SwiperPagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const categories = [
  { id: "all", label: "Tất cả sản phẩm" },
  { id: "75805fdd-c08c-4648-a343-0ac435979448", label: "Thức ăn" },
  { id: "fec1fb2e-fbeb-45d6-852a-212ba8da4279", label: "Đồ chơi" },
  { id: "80647ffa-cc53-4216-8176-940f3ec460e3", label: "Vệ sinh" },
  { id: "54c43f9d-dd67-4006-bfb5-aa2573f95c55", label: "Phụ kiện" },
  { id: "a05a54c0-44c4-4476-841f-961273c6775f", label: "Quần áo" },
  { id: "a845248b-9299-4a5d-8c86-fed3afcb2a3b", label: "Thuốc & Vitamin" },
];

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadProducts(1, true);
  }, [selectedCategoryId, debouncedSearch, sortBy]);

  useEffect(() => {
    let sorted = [...products];

    if (sortBy === "price-asc") {
      sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
      );
    }

    if (JSON.stringify(sorted) !== JSON.stringify(products)) {
      setProducts(sorted);
    }
  }, [products, sortBy]);

  const loadProducts = async (page: number = 1, reset = false) => {
    if (reset) {
      setProducts([]);
      setCurrentPage(page);
      setTotalCount(0);
      setTotalPages(1);
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (debouncedSearch.trim()) {
        result = await productService.searchProducts(debouncedSearch, page, PAGE_SIZE);
      } else if (selectedCategoryId === "all") {
        result = await productService.getAllProducts(page, PAGE_SIZE);
      } else {
        result = await productService.getProductsByCategory(
          selectedCategoryId,
          page,
          PAGE_SIZE
        );
      }

      if (result && result.items) {
        setProducts(reset ? result.items : [...products, ...result.items]);
        setTotalCount(result.totalCount || result.items.length);
        setCurrentPage(result.page || page);
        setTotalPages(
          result.totalPages ||
            Math.ceil((result.totalCount || result.items.length) / PAGE_SIZE)
        );
      } else {
        setProducts([]);
        if (selectedCategoryId !== "all") {
          setError("Danh mục này hiện chưa có sản phẩm nào.");
        }
      }
    } catch (err: any) {
      console.error("Load products error:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    loadProducts(newPage, true);
    window.scrollTo({ top: 300, behavior: "smooth" }); // scroll mượt lên đầu danh sách
  };

  const handleSearch = () => {
    loadProducts(1, true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategoryId("all");
    setSortBy("newest");
    loadProducts(1, true);
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="bg-white/90 rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse backdrop-blur-sm"
        >
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
          <div className="p-5 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-4/5" />
            <div className="h-5 bg-gray-200 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-10 w-24 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
      }}
    >
      <div className="min-h-screen bg-gradient-to-b from-white/85 via-white/80 to-white/75 backdrop-blur-[1px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-16">

          {/* Hero Swiper */}
          <div className="mb-12 md:mb-16 rounded-3xl overflow-hidden shadow-2xl border border-white/30">
            <Swiper
              modules={[Navigation, SwiperPagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop
              className="h-[380px] sm:h-[480px] lg:h-[560px]"
            >
              <SwiperSlide>
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1600"
                    alt="Thú cưng vui vẻ"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end pb-16">
                    <div className="container mx-auto px-8 text-white">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                        Sản phẩm handmade 100% cotton
                      </h2>
                      <p className="text-xl md:text-2xl max-w-2xl drop-shadow-md">
                        Dành riêng cho những chú cún/mèo yêu quý của bạn
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600"
                    alt="Quần áo thú cưng"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center text-center">
                    <div className="text-white px-6">
                      <h2 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl">
                        Bộ sưu tập mới nhất
                      </h2>
                      <p className="text-2xl md:text-3xl drop-shadow-lg">
                        Đang chờ bạn khám phá!
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1600"
                    alt="Đồ chơi cho thú cưng"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end pb-16">
                    <div className="container mx-auto px-8 text-white">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                        Đồ chơi an toàn & thú vị
                      </h2>
                      <p className="text-xl md:text-2xl max-w-2xl drop-shadow-md">
                        Giúp bé yêu vận động và vui chơi cả ngày
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>

          {/* Search & Filter */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/40 p-6 md:p-8 mb-10 md:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#5DD3B6]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm cho cún/mèo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-14 pr-14 py-4 text-base md:text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-500 transition-all shadow-inner bg-white/80"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5DD3B6] transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-5 py-4 text-base md:text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-inner bg-white/80"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-5 py-4 text-base md:text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-inner bg-white/80"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-center py-8 text-red-600 bg-red-50/80 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Product Grid */}
          {isLoading && products.length === 0 ? (
            renderSkeleton()
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-600 text-xl bg-white/70 rounded-2xl backdrop-blur-sm">
              Không tìm thấy sản phẩm nào phù hợp
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {products.map((product, index) => (
                  <div
                    key={product.id || `product-${index}`}
                    className="transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition font-medium"
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={`px-5 py-3 rounded-xl font-medium min-w-[44px] transition ${
                        currentPage === page
                          ? "bg-[#5DD3B6] text-white shadow-md"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition font-medium"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}