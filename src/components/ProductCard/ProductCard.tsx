// ProductCard.tsx
import { Eye, Heart, ShoppingCart } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types/product';
import styles from './Productcard.module.css';

const CATEGORY_MAP: Record<string, { emoji: string; label: string }> = {
  food:        { emoji: '🍖', label: 'Thức ăn' },
  toys:        { emoji: '🎾', label: 'Đồ chơi' },
  accessories: { emoji: '🧣', label: 'Phụ kiện' },
  clothing:    { emoji: '👕', label: 'Quần áo' },
  medicine:    { emoji: '💊', label: 'Thuốc & Vitamin' },
};

interface ProductCardProps {
  product: Product;
  onClick?: (id: string) => void;
  index?: number;
}

const PawWatermark: React.FC = () => (
  <svg
    className={styles.pawWatermark}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="14" cy="18" rx="6" ry="8" fill="currentColor" />
    <ellipse cx="28" cy="12" rx="5.5" ry="7.5" fill="currentColor" />
    <ellipse cx="42" cy="13" rx="5.5" ry="7.5" fill="currentColor" />
    <ellipse cx="54" cy="20" rx="5" ry="7" fill="currentColor" />
    <path
      d="M32 28C20 28 12 36 12 44C12 52 20 56 32 56C44 56 52 52 52 44C52 36 44 28 32 28Z"
      fill="currentColor"
    />
  </svg>
);

export default function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const categoryKey = product.categoryId?.toLowerCase() ?? '';
  const categoryInfo = CATEGORY_MAP[categoryKey] ?? { emoji: '🐾', label: product.categoryName ?? '' };

  const hasSale =
    product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const displayPrice = hasSale ? product.salePrice! : product.price ?? 0;
  const discountPct = hasSale
    ? Math.round(((product.price! - product.salePrice!) / product.price!) * 100)
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleClick = () => {
    if (onClick) onClick(product.id);
    else navigate(`/san-pham/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQuantity === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    await addToCart(product.id, 1);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Đã thêm vào danh sách yêu thích');
  };

  const imageUrl =
    product.images?.[0] ||
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg';

  const isOutOfStock = product.stockQuantity === 0;

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Xem chi tiết ${product.productName}`}
    >
      {/* Paw watermark */}
      <PawWatermark />

      {/* Image section */}
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={product.productName}
          className={styles.image}
          loading="lazy"
        />

        {hasSale && (
          <span className={styles.saleBadge}>-{discountPct}%</span>
        )}

        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span className={styles.outOfStockLabel}>Hết hàng</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className={styles.imageOverlay}>
          <span className={styles.quickView}>
            <Eye size={16} />
            Xem nhanh
          </span>
        </div>

        {/* Wishlist button */}
        <button
          className={styles.wishlistBtn}
          onClick={handleWishlist}
          aria-label="Thêm vào yêu thích"
        >
          <Heart size={15} />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Category badge */}
        <span className={styles.categoryBadge}>
          {categoryInfo.emoji}&nbsp;{categoryInfo.label}
        </span>

        {/* Product name */}
        <h3 className={styles.productName}>{product.productName}</h3>

        {/* Price row */}
        <div className={styles.priceRow}>
          <span className={styles.price}>
            {displayPrice > 0 ? formatPrice(displayPrice) : 'Liên hệ'}
          </span>
          {hasSale && (
            <span className={styles.originalPrice}>{formatPrice(product.price!)}</span>
          )}
        </div>

        {/* Stock info */}
        <p className={styles.stockInfo}>
          {isOutOfStock ? (
            <span className={styles.stockEmpty}>Hết hàng</span>
          ) : (
            <span className={styles.stockAvailable}>Còn {product.stockQuantity} sản phẩm</span>
          )}
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={16} />
            Thêm vào giỏ
          </button>
          <button
            className={styles.detailBtn}
            onClick={handleClick}
            aria-label="Xem chi tiết sản phẩm"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}