import { Calendar, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogService, { type BlogPostDto } from '../../services/BlogService';
import { getImageUrl } from '../../utils/imageUtils';

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

export default function NewsPage() {
  const [articles, setArticles] = useState<BlogPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const list = await BlogService.getPublishedPosts();
        if (!cancelled) setArticles(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Không thể tải tin tức.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Tin tức</h1>
          <p className="mx-auto max-w-2xl text-lg opacity-90">
            Cập nhật kiến thức chăm sóc thú cưng và tin tức từ PettSuba.
          </p>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          {loading && (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            </div>
          )}

          {error && !loading && (
            <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {articles.length === 0 ? (
                <p className="col-span-full text-center text-slate-600">Chưa có bài viết nào.</p>
              ) : (
                articles.map((article) => {
                  const href = `/tin-tuc/${encodeURIComponent(article.slug?.trim() || article.id)}`;
                  const img = article.featuredImageUrl
                    ? getImageUrl(article.featuredImageUrl)
                    : 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=600';
                  return (
                    <Link
                      key={article.id}
                      to={href}
                      className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-teal-600">
                          {article.categoryName ?? 'Tin tức'}
                        </p>
                        <h2 className="mb-2 line-clamp-2 font-bold text-gray-800 transition-colors group-hover:text-teal-600">
                          {article.title}
                        </h2>
                        <p className="mb-3 line-clamp-3 text-sm text-gray-600">
                          {article.excerpt?.trim() || 'Xem chi tiết bài viết...'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatPostDate(article.publishedAt ?? article.createdAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
