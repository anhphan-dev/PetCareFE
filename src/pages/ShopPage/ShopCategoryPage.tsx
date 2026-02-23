// src/pages/ShopPage/ShopCategoryPage.tsx
import { ChevronRight, ShoppingBag, SprayCan, ToyBrick, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { key: 'thuc-an', label: 'Thức ăn', icon: Utensils, description: 'Thức ăn khô, ướt, hạt dinh dưỡng' },
  { key: 'do-choi', label: 'Đồ chơi', icon: ToyBrick, description: 'Bóng, gặm, đồ chơi tương tác' },
  { key: 've-sinh', label: 'Vệ sinh', icon: SprayCan, description: 'Cát vệ sinh, khử mùi, tắm rửa' },
];

export default function ShopCategoryPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Cửa hàng</h1>
              <p className="text-white/90 text-sm mt-1">Chọn danh mục sản phẩm phù hợp cho thú cưng của bạn</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.key}
                    to={`/cua-hang/${c.key}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">{c.label}</div>
                        <div className="text-sm text-gray-500">{c.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                  </Link>
                );
              })}
            </div>

            {/* Placeholder nếu cần thêm nội dung */}
            <div className="mt-12 text-center text-gray-500 text-sm">
              <p>Chúng tôi đang cập nhật thêm nhiều danh mục và sản phẩm mới.</p>
              <p className="mt-1">Thức ăn hữu cơ, đồ chơi an toàn, sản phẩm vệ sinh thân thiện với môi trường...</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}