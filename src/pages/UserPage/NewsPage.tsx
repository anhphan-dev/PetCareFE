import type { NewsArticle } from '../../types';

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

export default function NewsPage() {
  return (
    <>
        <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tin tức</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Cập nhật kiến thức chăm sóc thú cưng và tin tức từ VetCare.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {newsArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <span className="text-xs text-gray-500">{article.date}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-10">
              <button className="bg-teal-600 text-white px-8 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors">
                Xem thêm
              </button>
            </div>
          </div>
        </section>
    </>
  );
}
