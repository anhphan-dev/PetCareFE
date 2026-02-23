import { Link, useParams } from 'react-router-dom';
import { ShoppingBag, Utensils, ToyBrick, SprayCan, ChevronRight } from 'lucide-react';

const categories = [
  { key: 'thuc-an', label: 'Thức ăn', icon: Utensils },
  { key: 'do-choi', label: 'Đồ chơi', icon: ToyBrick },
  { key: 've-sinh', label: 'Vệ sinh', icon: SprayCan },
];

function titleFromCategory(category?: string) {
  const found = categories.find((c) => c.key === category);
  return found ? found.label : 'Cửa hàng';
}

export default function ShopCategoryPage() {
  const { category } = useParams();
  const title = titleFromCategory(category);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              <p className="text-white/90 text-sm mt-1">Chọn danh mục sản phẩm cho thú cưng.</p>
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
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{c.label}</div>
                        <div className="text-xs text-gray-500">Xem sản phẩm</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Chưa có dữ liệu sản phẩm. Khi bạn kết nối API cửa hàng, danh sách sản phẩm sẽ hiển thị ở đây.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

