import type { NewsArticle } from '../types';

const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Chuẩn bị gì trước khi đưa chó đi khám bệnh',
    excerpt:
      'Một số lưu ý quan trọng khi chuẩn bị đưa thú cưng đi khám bệnh để buổi khám diễn ra thuận lợi và hiệu quả nhất...',
    imageUrl:
      'https://images.pexels.com/photos/1458925/pexels-photo-1458925.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '15/12/2024',
  },
  {
    id: '2',
    title: 'Phòng chống dị ứng thức ăn ở mèo',
    excerpt:
      'Dị ứng thức ăn là vấn đề phổ biến ở mèo. Tìm hiểu cách nhận biết triệu chứng và phòng ngừa hiệu quả cho thú cưng...',
    imageUrl:
      'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '12/12/2024',
  },
  {
    id: '3',
    title: 'Vệ sinh răng miệng cho chó đúng cách',
    excerpt:
      'Hướng dẫn chi tiết cách vệ sinh răng miệng cho chó tại nhà, giúp phòng ngừa các bệnh về nướu và răng hiệu quả...',
    imageUrl:
      'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '10/12/2024',
  },
  {
    id: '4',
    title: 'Nhận biết các dấu hiệu bệnh tật ở thú cưng',
    excerpt:
      'Những dấu hiệu cảnh báo cần đưa thú cưng đi khám ngay để phát hiện và điều trị kịp thời các vấn đề sức khỏe...',
    imageUrl:
      'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=400',
    date: '08/12/2024',
  },
];

export default function News() {
  return (
    <section className="py-16 bg-gray-100" id="tin tức">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          TIN TỨC
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {article.excerpt}
                </p>
                <span className="text-xs text-gray-500">{article.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-teal-600 text-white px-8 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors">
            XEM THÊM
          </button>
        </div>
      </div>
    </section>
  );
}
