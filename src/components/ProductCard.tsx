import { ShoppingCart } from 'lucide-react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img
          src={imageUrl}
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.product_name}
        </h3>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-xl font-bold text-teal-600">
              {formatPrice(displayPrice)}
            </span>
          </div>

          <button
            disabled={product.stock_quantity === 0}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
          <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-lg inline-block">
            Chỉ còn {product.stock_quantity} sản phẩm
          </div>
        )}
      </div>
    </div>
  );
}
