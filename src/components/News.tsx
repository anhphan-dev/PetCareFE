// News.tsx — tin nổi bật trên trang chủ (API /blogs)
import { ArrowRight, Calendar, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogService, { type BlogPostDto } from '../services/BlogService';
import { getImageUrl } from '../utils/imageUtils';
import styles from './News.module.css';

function formatPostDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

const HOME_LIMIT = 3;

export default function News() {
  const [articles, setArticles] = useState<BlogPostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await BlogService.getPublishedPosts();
        if (!cancelled) setArticles(list.slice(0, HOME_LIMIT));
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : articles.length === 0 ? (
          <p className="py-8 text-center text-slate-600">Chưa có bài viết nào. Hãy thêm tin tức trong trang quản trị.</p>
        ) : (
          <div className={styles.grid}>
            {articles.map((article, i) => {
              const href = `/tin-tuc/${encodeURIComponent(article.slug?.trim() || article.id)}`;
              const img = article.featuredImageUrl
                ? getImageUrl(article.featuredImageUrl)
                : 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=600';
              const summary = article.excerpt?.trim() || 'Đọc thêm về chủ đề này...';
              return (
                <Link
                  key={article.id}
                  to={href}
                  className={styles.card}
                  style={{ '--index': i } as React.CSSProperties}
                >
                  <div className={styles.imageWrap}>
                    <img src={img} alt="" className={styles.image} loading="lazy" />
                    <div className={styles.imageOverlay} aria-hidden="true" />
                  </div>
                  <div className={styles.content}>
                    <div className={styles.meta}>
                      <Calendar size={12} />
                      {formatPostDate(article.publishedAt ?? article.createdAt)}
                    </div>
                    <h3 className={styles.cardTitle}>{article.title}</h3>
                    <p className={styles.summary}>{summary}</p>
                    <span className={styles.readMore}>
                      Đọc thêm <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
