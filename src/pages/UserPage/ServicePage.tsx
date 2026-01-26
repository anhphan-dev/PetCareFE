import { Home, Heart, Scissors, Smile } from 'lucide-react';
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
        <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Dịch vụ của chúng tôi</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Các dịch vụ chăm sóc thú cưng chuyên nghiệp, tận tâm với đội ngũ bác sĩ giàu kinh nghiệm.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
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
    </>
  );
}
