import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { useCart } from '../../contexts/CartContext';
import { cartService } from '../../services/CartService/cartService';
import { CartItem } from '../../types/cart';
import styles from './CartPage.module.css';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch cart on mount ── */
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    const items = await cartService.getCart();
    setCartItems(items || []);
    setLoading(false);
  }, []);

  /* ── Update quantity with debounce ── */
  const updateQuantity = useCallback(async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(cartItemId);
      return;
    }

    // Update UI immediately
    setCartItems(prev =>
      prev.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Debounce API call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const success = await cartService.updateCartItem(cartItemId, newQuantity);
      if (!success) {
        // Revert on failure
        await fetchCart();
      } else {
        await refreshCart();
      }
    }, 300);
  }, [fetchCart, refreshCart]);

  /* ── Remove item ── */
  const handleConfirmRemoveItem = useCallback(async () => {
  if (!selectedItemId) return;

  setOpenConfirm(false);

  // Update UI trước
  setCartItems(prev => prev.filter(item => item.id !== selectedItemId));

  const success = await cartService.removeCartItem(selectedItemId);
  const selectedItem = cartItems.find(i => i.id === selectedItemId);

  if (success) {
    toast.success(`Đã xóa sản phẩm ${selectedItem?.productName ?? ''} khỏi giỏ hàng!`);
    await refreshCart();
  } else {
    toast.error('Xóa sản phẩm thất bại!');
    await fetchCart();
  }


  setSelectedItemId(null);
}, [selectedItemId, fetchCart, refreshCart, cartItems]);

  /* ── Clear cart ── */
  const clearCart = useCallback(async () => {
    setCartItems([]);
    const success = await cartService.clearCart();
    if (success) {
      toast.success('Đã xóa toàn bộ giỏ hàng!');
      await refreshCart();
    } else {
      toast.error('Xóa giỏ hàng thất bại!');
      await fetchCart();
    }
    setIsClearDialogOpen(false);
    }, [fetchCart, refreshCart]);

  /* ── Calculations ── */
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = 0; // Free shipping
  const total = subtotal + shipping;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  /* ── Handlers ── */
  const handleCheckout = () => navigate('/thanh-toan');
  const handleContinueShopping = () => navigate('/cua-hang');
  const handleProductClick = (productId: string) => navigate(`/san-pham/${productId}`);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className={styles.page}>
        {/* Background blobs */}
        <div className={styles.blobContainer} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
          <div className={`${styles.blob} ${styles.blob3}`} />
        </div>

        <div className={styles.container}>
          <section className={styles.loadingState}>
            <div className={styles.loadingIcon}>🐾</div>
            <p className={styles.loadingText}>Đang tải giỏ hàng...</p>
          </section>
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (cartItems.length === 0) {
    return (
      <div className={styles.page}>
        {/* Background blobs */}
        <div className={styles.blobContainer} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
          <div className={`${styles.blob} ${styles.blob3}`} />
        </div>

        {/* Floating paws */}
        <div className={styles.pawsContainer} aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={styles.floatingPaw}
              style={{
                left: `${15 + i * 18}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${6 + (i % 2) * 2}s`,
                fontSize: `${16 + (i % 2) * 4}px`,
              }}
            >
              🐾
            </span>
          ))}
        </div>

        <div className={styles.container}>
          <section className={styles.emptyState}>
            <span className={styles.emptyIcon} role="img" aria-label="Empty cart">🐾</span>
            <h2 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
            <p className={styles.emptyText}>
              Hãy thêm một số sản phẩm yêu thích cho người bạn bốn chân của bạn!
            </p>
            <button
              className={styles.emptyBtn}
              onClick={handleContinueShopping}
              aria-label="Tiếp tục mua sắm"
            >
              Tiếp tục mua sắm
            </button>
          </section>
        </div>
      </div>
    );
  }

  /* ── Main cart view ── */
  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
      </div>

      {/* Floating paws */}
      <div className={styles.pawsContainer} aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className={styles.floatingPaw}
            style={{
              left: `${10 + i * 13}%`,
              animationDelay: `${i * 0.9}s`,
              animationDuration: `${5 + (i % 3)}s`,
              fontSize: `${14 + (i % 3) * 6}px`,
            }}
          >
            🐾
          </span>
        ))}
      </div>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>
            Giỏ hàng của bạn 🐾
          </h1>
          <p className={styles.headerSubtitle}>
            Kiểm tra và hoàn tất đơn hàng của bạn
          </p>
        </header>

        {/* Main content */}
        <div className={styles.mainContent}>
          {/* Cart items */}
          <section className={styles.cartItems} aria-label="Các sản phẩm trong giỏ hàng">
            {cartItems.map((item) => {
              const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price ?? 0;
              const itemSubtotal = price * item.quantity;

              return (
                <article key={item.id} className={styles.cartItem}>
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/150'}
                    alt={item.productName}
                    className={styles.itemImage}
                    onClick={() => handleProductClick(item.productId)}
                    loading="lazy"
                  />

                  <div className={styles.itemDetails}>
                    <h3
                      className={styles.itemName}
                      onClick={() => handleProductClick(item.productId)}
                    >
                      {item.productName}
                    </h3>

                    <p className={styles.itemPrice}>
                      {formatPrice(price)}
                      {item.salePrice && item.price && item.salePrice < item.price && (
                        <span style={{ color: '#57534E', textDecoration: 'line-through', marginLeft: '8px', fontSize: '12px' }}>
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </p>

                    <p className={styles.itemSubtotal}>
                      Thành tiền: {formatPrice(itemSubtotal)}
                    </p>

                    <div className={styles.itemControls}>
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityBtn}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Giảm số lượng ${item.productName}`}
                        >
                          <Minus size={16} />
                        </button>

                        <span className={styles.quantityDisplay} aria-label={`Số lượng: ${item.quantity}`}>
                          {item.quantity}
                        </span>

                        <button
                          className={styles.quantityBtn}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          aria-label={`Tăng số lượng ${item.productName}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                        setSelectedItemId(item.id);
                        setOpenConfirm(true);
                      }}
                      >
                        <Trash2 size={16} />
                      </button>
                      
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Cart summary */}
          <aside className={styles.cartSummary}>
            <h2 className={styles.summaryTitle}>Tổng thanh toán</h2>

            <div className={styles.summaryBreakdown}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Tạm tính ({itemCount} sản phẩm)</span>
                <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Phí vận chuyển</span>
                <span className={styles.summaryValue} style={{ color: '#059669' }}>
                  {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryTotal}>
              <span className={styles.summaryTotalLabel}>Tổng cộng</span>
              <span className={styles.summaryTotalValue}>{formatPrice(total)}</span>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              aria-label="Thanh toán ngay"
            >
              Thanh toán ngay
            </button>

            {/* Xóa lẻ từng Item */}
            <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Xóa sản phẩm?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={handleConfirmRemoveItem}
                    >
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            {/* Xóa toàn bộ Item */}
            <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
              <AlertDialogTrigger asChild>
                <button
                  className={styles.clearCartBtn}
                  aria-label="Xóa toàn bộ giỏ hàng"
                >
                  Xóa giỏ hàng
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa giỏ hàng</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCart}>Xóa giỏ hàng</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </aside>
        </div>
      </div>
    </div>
  );
}