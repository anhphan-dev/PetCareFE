import { ArrowLeft, Calendar, Eye, Heart, Loader2, MessageCircle, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import BlogService, { type BlogCommentDto, type BlogPostDetailDto } from '../../services/BlogService';
import { getImageUrl } from '../../utils/imageUtils';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function CommentBlock({ comment, depth = 0 }: { comment: BlogCommentDto; depth?: number }) {
  return (
    <div className={`${depth > 0 ? 'ml-6 mt-4 border-l-2 border-teal-100 pl-4' : ''}`}>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">{comment.userName}</p>
        <p className="mt-1 text-xs text-slate-500">{formatPostDate(comment.createdAt)}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{comment.commentText}</p>
      </div>
      {comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((r) => (
            <CommentBlock key={r.id} comment={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [post, setPost] = useState<BlogPostDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const loadPost = useCallback(async () => {
    if (!slug) {
      setError('Không tìm thấy đường dẫn bài viết.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const detail = UUID_RE.test(slug)
        ? await BlogService.getById(slug)
        : await BlogService.getBySlug(slug);
      setPost(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải bài viết.');
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  const coverSrc = post?.featuredImageUrl ? getImageUrl(post.featuredImageUrl) : undefined;

  const handleLike = async () => {
    if (!isLoggedIn || !post) {
      navigate('/dang-nhap', { state: { from: `/tin-tuc/${slug}` } });
      return;
    }
    try {
      setLikeBusy(true);
      const { liked } = await BlogService.toggleLike(post.id);
      setPost((prev) => {
        if (!prev) return null;
        const was = Boolean(prev.isLikedByCurrentUser);
        const delta = (liked ? 1 : 0) - (was ? 1 : 0);
        return {
          ...prev,
          isLikedByCurrentUser: liked,
          likeCount: Math.max(0, prev.likeCount + delta),
        };
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể cập nhật lượt thích.');
    } finally {
      setLikeBusy(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;
    if (!isLoggedIn) {
      navigate('/dang-nhap', { state: { from: `/tin-tuc/${slug}` } });
      return;
    }
    try {
      setSubmittingComment(true);
      await BlogService.addComment(post.id, commentText.trim());
      setCommentText('');
      toast.success('Đã gửi bình luận. Nội dung sẽ hiển thị sau khi được duyệt.');
      await loadPost();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi bình luận.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[50vh] bg-gray-50 px-4 py-16 text-center">
        <p className="text-slate-700">{error ?? 'Không tìm thấy bài viết.'}</p>
        <Link to="/tin-tuc" className="mt-6 inline-flex items-center gap-2 text-teal-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Quay lại tin tức
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-12 text-white">
        <div className="container mx-auto max-w-4xl px-4">
          <Link
            to="/tin-tuc"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Tất cả tin tức
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-100">
            {post.categoryName ?? 'Tin tức'}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatPostDate(post.publishedAt ?? post.createdAt)}
            </span>
            {post.authorName && <span>{post.authorName}</span>}
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {post.viewCount} lượt xem
            </span>
          </div>
        </div>
      </section>

      {coverSrc && (
        <div className="bg-gray-100">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <img
              src={coverSrc}
              alt=""
              className="max-h-[420px] w-full rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>
      )}

      <article className="bg-white py-10">
        <div className="container mx-auto max-w-3xl px-4">
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="blog-body text-base leading-relaxed text-slate-800 [&_a]:text-teal-600 [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_img]:my-4 [&_img]:max-h-[480px] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
          />

          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-8">
            <button
              type="button"
              onClick={() => void handleLike()}
              disabled={likeBusy}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                post.isLikedByCurrentUser
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50'
              }`}
            >
              {likeBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`} />
              )}
              {post.likeCount} thích
            </button>
            {!isLoggedIn && (
              <span className="text-xs text-slate-500">Đăng nhập để thích bài viết và bình luận.</span>
            )}
          </div>
        </div>
      </article>

      <section className="border-t border-slate-100 bg-gray-50 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
            <MessageCircle className="h-5 w-5 text-teal-600" />
            Bình luận
          </h2>

          {isLoggedIn ? (
            <form onSubmit={handleComment} className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Chia sẻ suy nghĩ của bạn..."
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
                >
                  {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Gửi bình luận
                </button>
              </div>
            </form>
          ) : (
            <p className="mb-10 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              <Link to="/dang-nhap" state={{ from: `/tin-tuc/${slug}` }} className="font-semibold text-teal-700">
                Đăng nhập
              </Link>{' '}
              để tham gia bình luận.
            </p>
          )}

          <div className="space-y-4">
            {(post.comments ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có bình luận nào.</p>
            ) : (
              post.comments.map((c) => <CommentBlock key={c.id} comment={c} />)
            )}
          </div>
        </div>
      </section>
    </>
  );
}
