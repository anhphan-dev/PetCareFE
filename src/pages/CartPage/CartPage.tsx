import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-toastify";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const { refreshCart } = useCart();

  useEffect(() => {
  refreshCart();
}, []);

  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    navigate("/thanh-toan");
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
      toast.success("Đã xóa toàn bộ giỏ hàng");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 py-16 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link
          to="/cua-hang"
          className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-50 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Giỏ hàng ({cartCount} sản phẩm)
          </h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-800 flex items-center gap-2 font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Xóa toàn bộ
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price ?? 0;
              const itemTotal = price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex gap-6 hover:shadow-xl transition"
                >
                  <Link to={`/san-pham/${item.productId}`} className="w-28 h-28 flex-shrink-0">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/150"}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <Link
                      to={`/san-pham/${item.productId}`}
                      className="font-semibold text-lg text-gray-900 hover:text-teal-600 mb-1"
                    >
                      {item.productName}
                    </Link>

                    <p className="text-gray-900 font-bold text-xl mb-2">
                      {formatPrice(price)}
                      {item.salePrice && item.price && item.salePrice < item.price && (
                        <span className="text-sm text-gray-400 line-through ml-3">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </p>

                    <p className="text-sm text-gray-500 mb-4">
                      Thành tiền: {formatPrice(itemTotal)}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-6 py-2 bg-gray-50 font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.quantity)}  // Xóa hết số lượng của item
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-10">
              <h3 className="text-xl font-bold mb-6">Tổng thanh toán</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({cartCount} sản phẩm)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-xl font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-teal-600 text-white py-4 rounded-xl hover:bg-teal-700 transition font-semibold shadow-md text-lg"
              >
                Tiến hành thanh toán
              </button>

              <Link
                to="/cua-hang"
                className="block text-center mt-6 text-teal-600 hover:text-teal-700 font-medium"
              >
                Tiếp tục mua sắm →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}