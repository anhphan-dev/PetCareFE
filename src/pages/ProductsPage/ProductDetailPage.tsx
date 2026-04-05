// ProductDetailPage.tsx
import {
  ArrowLeft,
  ChevronLeft, ChevronRight,
  Heart,
  Minus, Plus,
  Share2, Shield,
  ShoppingCart,
  Star,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { Autoplay, FreeMode, Navigation, Pagination, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useCart } from '../../contexts/CartContext';
import { productService } from '../../services/ProductService/productService';
import { Product } from '../../types/product';
import styles from './ProductDetailPage.module.css';

const CATEGORY_MAP: Record<string, { emoji: string; label: string }> = {
  food:        { emoji: '🍖', label: 'Thức ăn' },
  toys:        { emoji: '🎾', label: 'Đồ chơi' },
  accessories: { emoji: '🧣', label: 'Phụ kiện' },
  clothing:    { emoji: '👕', label: 'Quần áo' },
  medicine:    { emoji: '💊', label: 'Thuốc & Vitamin' },
};

const PLACEHOLDER = 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg';

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div className={styles.stars} aria-label={`Đánh giá ${rating}/5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}
          fill={i < Math.floor(rating) ? '#F59E0B' : 'none'}
        />
      ))}
      <span className={styles.ratingText}>{rating.toFixed(1)}</span>
      <span className={styles.reviewCount}>(128 đánh giá)</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeThumb, setActiveThumb] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const mainSwiperRef = useRef<SwiperType | null>(null);

  /* ── Fetch product ── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const p = await productService.getProductById(id);
      setProduct(p);
      if (p?.categoryId) {
        const res = await productService.getProductsByCategory(p.categoryId, 1, 8);
        setRelated((res?.items ?? []).filter((r) => r.id !== id).slice(0, 6));
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!product) return <NotFound onBack={() => navigate('/san-pham')} />;

  const categoryKey = product.categoryId?.toLowerCase() ?? '';
  const categoryInfo = CATEGORY_MAP[categoryKey] ?? { emoji: '🐾', label: product.categoryName ?? '' };

  const images = product.images?.length ? product.images : [PLACEHOLDER];
  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const displayPrice = hasSale ? product.salePrice! : product.price ?? 0;
  const discountPct = hasSale
    ? Math.round(((product.price! - product.salePrice!) / product.price!) * 100)
    : 0;
  const isOutOfStock = product.stockQuantity === 0;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const handleAddToCart = async () => {
    if (isOutOfStock) { toast.error('Sản phẩm đã hết hàng'); return; }
    await addToCart(product.id, qty);
    toast.success(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) { toast.error('Sản phẩm đã hết hàng'); return; }
    await addToCart(product.id, qty);
    navigate('/gio-hang');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    toast.success('Đã sao chép liên kết!');
  };

  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.productName}</span>
        </nav>

        {/* ════ Main product layout ════ */}
        <div className={styles.productLayout}>

          {/* ── LEFT: Image Gallery ── */}
          <div className={styles.galleryCol}>
            {/* Bokeh duplicate backdrop */}
            <div
              className={styles.imageBackdrop}
              style={{ backgroundImage: `url(${images[activeThumb] || images[0]})` }}
              aria-hidden="true"
            />

            {/* Main swiper */}
            <div className={styles.mainSwiperWrapper}>
              <Swiper
                modules={[Navigation, Thumbs, Pagination]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                onSwiper={(s) => { mainSwiperRef.current = s; }}
                onSlideChange={(s) => setActiveThumb(s.activeIndex)}
                navigation={{
                  prevEl: `.${styles.galPrev}`,
                  nextEl: `.${styles.galNext}`,
                }}
                pagination={{ clickable: true }}
                className={styles.mainSwiper}
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i} className={styles.mainSlide}>
                    <img
                      src={img}
                      alt={`${product.productName} - ảnh ${i + 1}`}
                      className={styles.mainImage}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Gallery nav */}
              {images.length > 1 && (
                <>
                  <button className={`${styles.galNav} ${styles.galPrev}`} aria-label="Ảnh trước">
                    <ChevronLeft size={18} />
                  </button>
                  <button className={`${styles.galNav} ${styles.galNext}`} aria-label="Ảnh sau">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Badges on main image */}
              {hasSale && (
                <span className={styles.saleBadgeDetail}>-{discountPct}%</span>
              )}
              {isOutOfStock && (
                <div className={styles.outOfStockOverlay}>
                  <span>Hết hàng</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <Swiper
                modules={[FreeMode, Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView="auto"
                freeMode
                watchSlidesProgress
                className={styles.thumbSwiper}
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i} className={styles.thumbSlide}>
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className={`${styles.thumbImage} ${i === activeThumb ? styles.thumbActive : ''}`}
                      loading="lazy"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className={styles.infoCol}>
            {/* Category badge */}
            <span className={styles.categoryBadge}>
              {categoryInfo.emoji}&nbsp;{categoryInfo.label}
            </span>

            {/* Product name */}
            <h1 className={styles.productName}>{product.productName}</h1>

            {/* Rating */}
            <StarRating rating={4.5} />

            {/* Price block */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(displayPrice)}</span>
              {hasSale && (
                <span className={styles.originalPrice}>{formatPrice(product.price!)}</span>
              )}
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Description */}
            {product.description && (
              <p className={styles.description}>{product.description}</p>
            )}

            {/* Stock info */}
            <div className={styles.stockRow}>
              <Shield size={15} className={styles.stockIcon} />
              <span className={isOutOfStock ? styles.stockEmpty : styles.stockAvailable}>
                {isOutOfStock
                  ? 'Hết hàng'
                  : `Còn ${product.stockQuantity} sản phẩm trong kho`}
              </span>
            </div>

            {/* Qty selector */}
            {!isOutOfStock && (
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>Số lượng</span>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                    disabled={qty <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.qtyValue}>{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
                    aria-label="Tăng số lượng"
                    disabled={qty >= product.stockQuantity}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className={styles.ctaRow}>
              <button
                className={styles.addCartBtn}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} />
                Thêm vào giỏ hàng
              </button>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <Zap size={18} />
                Mua ngay
              </button>
            </div>

            {/* Wishlist + Share */}
            <div className={styles.socialRow}>
              <button
                className={`${styles.socialBtn} ${wishlisted ? styles.socialBtnActive : ''}`}
                onClick={() => { setWishlisted((w) => !w); toast.info(wishlisted ? 'Đã xoá khỏi yêu thích' : 'Đã thêm vào yêu thích'); }}
              >
                <Heart size={16} fill={wishlisted ? '#0D9488' : 'none'} />
                {wishlisted ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
              <button className={styles.socialBtn} onClick={handleShare}>
                <Share2 size={16} />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>

        {/* ════ Related products ════ */}
        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Sản phẩm liên quan 🐾</h2>
              <p className={styles.sectionSub}>Bạn có thể cũng thích</p>
            </div>

            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={20}
              slidesPerView="auto"
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              navigation={{
                prevEl: `.${styles.relPrev}`,
                nextEl: `.${styles.relNext}`,
              }}
              className={styles.relatedSwiper}
            >
              {related.map((p, i) => (
                <SwiperSlide key={p.id} className={styles.relatedSlide}>
                  <ProductCard
                    product={p}
                    onClick={(pid) => navigate(`/san-pham/${pid}`)}
                    index={i}
                  />
                </SwiperSlide>
              ))}

              <button className={`${styles.relNav} ${styles.relPrev}`} aria-label="Trước">
                <ChevronLeft size={18} />
              </button>
              <button className={`${styles.relNav} ${styles.relNext}`} aria-label="Sau">
                <ChevronRight size={18} />
              </button>
            </Swiper>
          </section>
        )}
      </div>
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────── */
function PageSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.productLayout} style={{ marginTop: 40 }}>
          <div className={styles.galleryCol}>
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: 24,
              background: 'linear-gradient(90deg, #e2f7f4 25%, #c8f0eb 50%, #e2f7f4 75%)',
              backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
            }} />
          </div>
          <div className={styles.infoCol} style={{ gap: 18 }}>
            {[40, 80, 30, 50, 70, 100, 45].map((w, i) => (
              <div key={i} style={{
                height: i === 1 ? 38 : 18, width: `${w}%`, borderRadius: 8,
                background: 'linear-gradient(90deg, #e2f7f4 25%, #c8f0eb 50%, #e2f7f4 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🐾</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', marginBottom: 8 }}>Không tìm thấy sản phẩm</h2>
        <p style={{ color: '#57534E', marginBottom: 24 }}>Sản phẩm này không tồn tại hoặc đã bị xoá.</p>
        <button onClick={onBack} style={{
          padding: '12px 28px', background: 'linear-gradient(135deg,#0D9488,#14B8A6)',
          color: '#fff', border: 'none', borderRadius: 999, cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14,
        }}>
          Quay lại cửa hàng
        </button>
      </div>
    </div>
  );
}