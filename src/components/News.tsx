// News.tsx
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './News.module.css';

interface NewsArticle {
  id: string;
  title: string;
  image: string;
  date: string;
  summary: string;
  slug?: string;
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    title: 'Chuẩn bị gì trước khi đưa chó đi khám bệnh',
    image: 'https://images.pexels.com/photos/1458925/pexels-photo-1458925.jpeg?auto=compress&cs=tinysrgb&w=600',
    date: '15/12/2024',
    summary: 'Một số lưu ý quan trọng khi chuẩn bị đưa thú cưng đi khám để buổi khám diễn ra thuận lợi và hiệu quả nhất.',
  },
  {
    id: '2',
    title: 'Phòng chống dị ứng thức ăn ở mèo',
    image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=600',
    date: '12/12/2024',
    summary: 'Dị ứng thức ăn là vấn đề phổ biến ở mèo. Tìm hiểu cách nhận biết triệu chứng và phòng ngừa hiệu quả.',
  },
  {
    id: '3',
    title: 'Vệ sinh răng miệng cho chó đúng cách',
    image: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=600',
    date: '10/12/2024',
    summary: 'Hướng dẫn chi tiết cách vệ sinh răng miệng cho chó tại nhà, giúp phòng ngừa các bệnh về nướu và răng.',
  },
];

export default function News() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Tin tức & kiến thức</span>
            <h2 className={styles.title}>Cập nhật mới nhất 🐾</h2>
          </div>
          <Link to="/tin-tuc" className={styles.viewAll}>
            Xem tất cả <ArrowRight size={15} />
          </Link>
        </div>

        <div className={styles.grid}>
          {NEWS_ARTICLES.map((article, i) => (
            <Link
              key={article.id}
              to={`/tin-tuc/${article.slug ?? article.id}`}
              className={styles.card}
              style={{ '--index': i } as React.CSSProperties}
            >
              <div className={styles.imageWrap}>
                <img src={article.image} alt={article.title} className={styles.image} loading="lazy" />
                <div className={styles.imageOverlay} aria-hidden="true" />
              </div>
              <div className={styles.content}>
                <div className={styles.meta}>
                  <Calendar size={12} />
                  {article.date}
                </div>
                <h3 className={styles.cardTitle}>{article.title}</h3>
                <p className={styles.summary}>{article.summary}</p>
                <span className={styles.readMore}>
                  Đọc thêm <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}