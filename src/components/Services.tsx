import { Home, Heart, Scissors, Smile } from 'lucide-react';
import type { Service } from '../types';

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

export default function Services() {
  return (
    <section className="py-16 bg-gray-50" id="dịch vụ">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          DỊCH VỤ CHÍNH
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <div
                key={service.id}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
