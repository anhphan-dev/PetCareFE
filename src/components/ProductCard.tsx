import { Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../contexts/CartContext";
import { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const hasSale =
    product.salePrice && product.salePrice > 0 && product.salePrice < product.price;

  const displayPrice = hasSale ? product.salePrice : product.price ?? 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const handleAdd = async () => {
    if (product.stockQuantity === 0) {
      toast.error("Sản phẩm hết hàng");
      return;
    }

    const success = await addToCart(product.id, 1);
    if (true) {
      toast.success(`Đã thêm sản phẩm vào giỏ hàng!`);;
    }
  };

  return (
    <div className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
      <Link
        to={`/san-pham/${product.id}`}
        className="block relative aspect-square overflow-hidden"
      >
        <img
          src={
            product.images?.[0] ||
            "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"
          }
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {hasSale && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
            -{Math.round(((product.price! - product.salePrice!) / product.price!) * 100)}%
          </div>
        )}

        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-white/90 px-6 py-3 rounded-xl font-semibold text-red-600 shadow-lg">
              Hết hàng
            </span>
          </div>
        )}
      </Link>

      <div className="p-5 space-y-3">
        <Link to={`/san-pham/${product.id}`}>
          <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[2.8rem] group-hover:text-[#2C2C2C] transition-colors duration-200">
            {product.productName}
          </h3>
        </Link>

        <div className="flex items-end gap-2.5">
          <p className="text-xl font-bold text-[#2C2C2C]">
            {displayPrice > 0 ? formatPrice(displayPrice) : "Liên hệ"}
          </p>
        </div>

        <p className="text-sm text-gray-500">
          {product.stockQuantity > 0
            ? `Còn ${product.stockQuantity} sản phẩm`
            : "Hết hàng"}
        </p>

        <div className="flex items-center justify-between pt-3">
          <button
            className="text-gray-500 hover:text-[#2C2C2C] transition p-1"
            title="Thêm vào yêu thích"
          >
            <Heart className="w-5 h-5" />
          </button>

          <button
            onClick={handleAdd}
            disabled={product.stockQuantity === 0}
            className="bg-[#5DD3B6] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#3EBFA0] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}