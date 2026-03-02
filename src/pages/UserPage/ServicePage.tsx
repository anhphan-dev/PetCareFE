import { Heart, Home, Scissors, Smile } from 'lucide-react';
import type { Service } from '../../types';

const services: Service[] = [
  {
    id: '1',
    title: 'KHÁM BỆNH TẠI NHÀ',
    description:
      'Dịch vụ khám bệnh tại nhà tiện lợi, giúp thú cưng của bạn được chăm sóc trong môi trường quen thuộc. Bác sĩ thú y sẽ đến tận nơi với đầy đủ trang thiết bị.',
    icon: 'home',
  },
  {
    id: '2',
    title: 'KHÁM SỨC KHỎE ĐỊNH KỲ',
    description:
      'Chương trình khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề sức khỏe. Bao gồm kiểm tra tổng quát, xét nghiệm, và tư vấn dinh dưỡng chuyên sâu.',
    icon: 'heart',
  },
  {
    id: '3',
    title: 'THẨM MỸ',
    description:
      'Dịch vụ spa và thẩm mỹ cao cấp cho thú cưng: tắm gội, cắt tỉa lông, vệ sinh tai, cắt móng, và nhiều dịch vụ làm đẹp khác với sản phẩm chất lượng.',
    icon: 'scissors',
  },
  {
    id: '4',
    title: 'CHĂM SÓC RĂNG MIỆNG',
    description:
      'Chăm sóc răng miệng chuyên nghiệp giúp phòng ngừa các bệnh về nướu và răng. Bao gồm vệ sinh răng miệng, lấy cao răng, và điều trị các vấn đề nha khoa.',
    icon: 'smile',
  },
];

const iconMap = {
  home: Home,
  heart: Heart,
  scissors: Scissors,
  smile: Smile,
};

export default function ServicePage() {
  return (
    <>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dịch vụ của chúng tôi</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Các dịch vụ chăm sóc thú cưng chuyên nghiệp, tận tâm với đội ngũ bác sĩ giàu kinh nghiệm.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-emerald-50 border-t border-teal-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap];
              return (
                <div
                  key={service.id}
                  className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 p-4 rounded-full flex-shrink-0">
                      <Icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3 text-gray-800">
                        {service.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                      <button className="mt-4 text-teal-600 font-medium hover:text-teal-700 flex items-center gap-2">
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Phần mới: CTA dẫn đến Shop */}
      {/* <section className="">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-6">
              <ShoppingBag className="w-10 h-10 text-teal-600" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Khám phá cửa hàng thú cưng của chúng tôi
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Thức ăn cao cấp, phụ kiện xinh xắn, thuốc men chính hãng và đồ chơi an toàn – tất cả đều dành riêng cho boss nhà bạn!
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ShoppingBag className="w-6 h-6" />
              Xem ngay cửa hàng
            </Link>
          </div>
        </div>
      </section> */}
    </>
  );
}