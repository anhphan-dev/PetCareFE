// ProductsPage.tsx
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import ProductCard from '../../components/ProductCard/ProductCard';
import { productService } from '../../services/ProductService/productService';
import { Product } from '../../types';
import styles from './ProductsPage.module.css';

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const CATEGORIES = [
  { id: '',           emoji: '🐾', label: 'Tất cả' },
  { id: '75805fdd-c08c-4648-a343-0ac435979448', emoji: '🍖', label: 'Thức ăn' },
  { id: 'fec1fb2e-fbeb-45d6-852a-212ba8da4279', emoji: '🎾', label: 'Đồ chơi' },
  { id: '54c43f9d-dd67-4006-bfb5-aa2573f95c55', emoji: '🧣', label: 'Phụ kiện' },
  { id: 'a05a54c0-44c4-4476-841f-961273c6775f', emoji: '👕', label: 'Quần áo' },
  { id: 'a845248b-9299-4a5d-8c86-fed3afcb2a3b', emoji: '💊', label: 'Thuốc & Vitamin' },
  { id: '80647ffa-cc53-4216-8176-940f3ec460e3', emoji: '🧼', label: 'Vệ sinh' },
];

const PAGE_SIZE = 8;
const FEATURED_COUNT = 6;

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '40%', height: 12 }} />
        <div className={styles.skeletonLine} style={{ width: '90%', height: 16 }} />
        <div className={styles.skeletonLine} style={{ width: '60%', height: 16 }} />
        <div className={styles.skeletonLine} style={{ width: '100%', height: 36, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Product> | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ── Featured products (first load) ── */
  useEffect(() => {
    (async () => {
      setFeaturedLoading(true);
      const res = await productService.getAllProducts(1, FEATURED_COUNT);
      if (res?.items) setFeaturedProducts(res.items);
      setFeaturedLoading(false);
    })();
  }, []);

  /* ── Debounce search ── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  /* ── Fetch products ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let res: PaginatedResponse<Product> | null = null;

    if (searchTerm.trim()) {
      res = await productService.searchProducts(searchTerm.trim(), currentPage, PAGE_SIZE);
    } else if (activeCategory) {
      res = await productService.getProductsByCategory(activeCategory, currentPage, PAGE_SIZE);
    } else {
      res = await productService.getAllProducts(currentPage, PAGE_SIZE);
    }

    setResult(res);
    setLoading(false);
  }, [activeCategory, searchTerm, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Scroll to grid on page change ── */
  useEffect(() => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setCurrentPage(1);
    setSearchInput('');
  };

  const handleCardClick = (id: string) => navigate(`/san-pham/${id}`);

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const totalPages = result?.totalPages ?? 1;

  /* ── Pagination range ── */
  const getPaginationItems = () => {
    const items: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        items.push(i);
      }
      if (currentPage < totalPages - 2) items.push('...');
      items.push(totalPages);
    }
    return items;
  };

  return (
    <div className={styles.page}>
      {/* ── Bokeh background blobs ── */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
      </div>

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className={styles.hero}>
        {/* Animated paw prints */}
        <div className={styles.pawsContainer} aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={styles.floatingPaw} style={{
              left: `${10 + i * 13}%`,
              animationDelay: `${i * 0.9}s`,
              animationDuration: `${5 + (i % 3)}s`,
              fontSize: `${14 + (i % 3) * 6}px`,
            }}>🐾</span>
          ))}
        </div>

        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Cửa hàng thú cưng</p>
          <h1 className={styles.heroTitle}>
            Yêu thương từng<br />
            <span className={styles.heroTitleAccent}>sản phẩm</span> 🐾
          </h1>
          <p className={styles.heroSubtitle}>
            Tất cả những gì bạn cần cho người bạn bốn chân — thức ăn, đồ chơi, phụ kiện và hơn thế nữa.
          </p>

          {/* Search bar */}
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Tìm kiếm sản phẩm"
            />
            {searchInput && (
              <button className={styles.searchClear} onClick={clearSearch} aria-label="Xoá tìm kiếm">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </section>


      <div className={styles.container}>
        {/* ════════════════════════════════════
            FEATURED SWIPER
        ════════════════════════════════════ */}
        {!searchTerm && (
          <section className={styles.featuredSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Sản phẩm nổi bật</h2>
              <p className={styles.sectionSubtitle}>Được yêu thích nhất bởi các chủ nuôi thú cưng</p>
            </div>

            {featuredLoading ? (
              <div className={styles.featuredGrid}>
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
                effect="coverflow"
                grabCursor
                centeredSlides
                slidesPerView="auto"
                coverflowEffect={{
                  rotate: 28,
                  stretch: 0,
                  depth: 120,
                  modifier: 1,
                  slideShadows: false,
                }}
                autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                pagination={{ clickable: true, dynamicBullets: true }}
                navigation={{
                  prevEl: `.${styles.swiperPrev}`,
                  nextEl: `.${styles.swiperNext}`,
                }}
                className={styles.featuredSwiper}
              >
                {featuredProducts.map((p, i) => (
                  <SwiperSlide key={p.id} className={styles.featuredSlide}>
                    <ProductCard product={p} onClick={handleCardClick} index={i} />
                  </SwiperSlide>
                ))}

                {/* Custom nav */}
                <button className={`${styles.swiperNav} ${styles.swiperPrev}`} aria-label="Trước">
                  <ChevronLeft size={20} />
                </button>
                <button className={`${styles.swiperNav} ${styles.swiperNext}`} aria-label="Sau">
                  <ChevronRight size={20} />
                </button>
              </Swiper>
            )}
          </section>
        )}

        
      {/* ════════════════════════════════════
          CATEGORY FILTER BAR
      ════════════════════════════════════ */}
      <div className={styles.filterBarWrapper}>
        <nav className={styles.filterBar} aria-label="Danh mục sản phẩm">
          <SlidersHorizontal size={16} className={styles.filterIcon} aria-hidden="true" />
          <div className={styles.filterPills}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.pill} ${activeCategory === cat.id ? styles.pillActive : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
                aria-pressed={activeCategory === cat.id}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

        {/* ════════════════════════════════════
            PRODUCT GRID
        ════════════════════════════════════ */}
        <section ref={gridRef} className={styles.gridSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {searchTerm
                  ? `Kết quả cho "${searchTerm}"`
                  : CATEGORIES.find((c) => c.id === activeCategory)?.label === 'Tất cả'
                    ? 'Tất cả sản phẩm'
                    : CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </h2>
              {result && (
                <p className={styles.sectionSubtitle}>
                  {result.totalCount} sản phẩm
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.productGrid}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : result?.items.length ? (
            <div className={styles.productGrid}>
              {result.items.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={handleCardClick}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🐾</span>
              <h3 className={styles.emptyTitle}>Không tìm thấy sản phẩm</h3>
              <p className={styles.emptyText}>Hãy thử tìm kiếm với từ khoá khác hoặc chọn danh mục khác nhé!</p>
              <button className={styles.emptyBtn} onClick={clearSearch}>Xem tất cả sản phẩm</button>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Phân trang">
              <button
                className={`${styles.pageBtn} ${styles.pageArrow}`}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>

              {getPaginationItems().map((item, idx) =>
                item === '...' ? (
                  <span key={`dots-${idx}`} className={styles.pageDots}>…</span>
                ) : (
                  <button
                    key={item}
                    className={`${styles.pageBtn} ${currentPage === item ? styles.pageBtnActive : ''}`}
                    onClick={() => setCurrentPage(item as number)}
                    aria-label={`Trang ${item}`}
                    aria-current={currentPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                className={`${styles.pageBtn} ${styles.pageArrow}`}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}