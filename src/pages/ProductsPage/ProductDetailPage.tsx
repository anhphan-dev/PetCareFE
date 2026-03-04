import {
  ArrowLeft,
  Heart,
  Loader2,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../contexts/CartContext";
import { productService } from "../../services/ProductService/productService";
import { Product } from "../../types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err: any) {
        setError("Không thể tải thông tin sản phẩm");
        toast.error("Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const hasValidSale =
    product?.salePrice && product.salePrice > 0 && product.salePrice < product.price;

  const displayPrice = hasValidSale ? product!.salePrice : product?.price ?? 0;

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity < quantity) {
      toast.error("Số lượng không đủ hoặc sản phẩm hết hàng");
      return;
    }

    try {
      await addToCart(product.id, quantity);
      toast.success(`Đã thêm ${quantity} ${product.productName} vào giỏ hàng!`);
      navigate("/gio-hang");
    } catch {
      toast.error("Thêm vào giỏ hàng thất bại");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#5DD3B6]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-6">{error || "Không tìm thấy sản phẩm"}</h2>
        <Link
          to="/cua-hang"
          className="flex items-center gap-2 px-6 py-3 bg-[#5DD3B6] text-white rounded-lg shadow hover:bg-[#3EBFA0] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cua-hang"
          className="inline-flex items-center gap-2 text-[#5DD3B6] hover:text-[#3EBFA0] mb-8 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại cửa hàng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={product.images?.[0] || "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"}
                alt={product.productName}
                className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            {product.images?.length > 1 && (
              <div className="mt-6 grid grid-cols-4 gap-3">
                {product.images.slice(1).map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-gray-100 hover:border-[#5DD3B6] transition cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <img src={img} alt={`${product.productName}-${idx}`} className="w-full h-20 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.productName}</h1>

            <div className="mb-6">
              <p className="text-4xl font-bold text-[#2C2C2C]">
                {displayPrice > 0 ? formatPrice(displayPrice) : "Liên hệ"}
              </p>
              {hasValidSale && (
                <p className="text-gray-500 mt-1 line-through">{formatPrice(product.price!)}</p>
              )}
              <p className="text-gray-600 mt-2">
                {product.stockQuantity > 0
                  ? `Còn ${product.stockQuantity} sản phẩm trong kho`
                  : "Hết hàng"}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-5 py-3 hover:bg-gray-100 transition"
                >
                  -
                </button>
                <span className="px-6 py-3 border-x border-gray-200 bg-gray-50 font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-5 py-3 hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity < quantity || product.stockQuantity === 0 || loading}
                className="flex-1 bg-[#5DD3B6] text-white py-3 rounded-xl hover:bg-[#3EBFA0] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>
            </div>

            <div className="mt-6 flex items-center gap-6 text-gray-600">
              <button className="flex items-center gap-2 hover:text-[#5DD3B6] transition">
                <Heart className="w-5 h-5" />
                Yêu thích
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}