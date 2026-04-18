import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import BlogService, {
  type BlogCategoryDto,
  type BlogPostDto,
  type CreateBlogPayload,
  type UpdateBlogPayload,
} from '../../services/BlogService';

const normalizeRole = (roleName?: string | null) => roleName?.trim().toLowerCase() ?? '';

const statusLabel = (s: string) => {
  const x = s.trim().toLowerCase();
  if (x === 'published') return 'Đã xuất bản';
  if (x === 'draft') return 'Bản nháp';
  return s;
};

export default function AdminBlogPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPostDto[]>([]);
  const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    title: '',
    content: '',
    excerpt: '',
    featuredImageUrl: '',
    status: 'draft' as 'draft' | 'published',
    tags: '',
  });

  const roleName = normalizeRole(user?.roleName);
  const canViewAdmin = isLoggedIn && roleName === 'admin';

  const loadAll = async (manual = false) => {
    try {
      setError(null);
      if (manual) setRefreshing(true);
      else setLoading(true);
      const [list, cats] = await Promise.all([BlogService.getAllPosts(), BlogService.getCategories()]);
      setPosts(list);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu blog.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/dang-nhap', { replace: true, state: { from: '/admin/tin-tuc' } });
      return;
    }
    if (roleName && roleName !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, roleName]);

  useEffect(() => {
    if (!canViewAdmin) return;
    void loadAll();
  }, [canViewAdmin]);

  const openCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setForm({
      categoryId: categories[0]?.id ?? '',
      title: '',
      content: '',
      excerpt: '',
      featuredImageUrl: '',
      status: 'draft',
      tags: '',
    });
    setFormOpen(true);
  };

  const openEdit = (p: BlogPostDto) => {
    setFormMode('edit');
    setEditingId(p.id);
    setForm({
      categoryId: p.categoryId ?? categories[0]?.id ?? '',
      title: p.title,
      content: p.content ?? '',
      excerpt: p.excerpt ?? '',
      featuredImageUrl: p.featuredImageUrl ?? '',
      status: p.status?.toLowerCase() === 'published' ? 'published' : 'draft',
      tags: (p.tags ?? []).join(', '),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Tiêu đề và nội dung là bắt buộc.');
      return;
    }
    if (!form.categoryId) {
      setError('Vui lòng chọn danh mục.');
      return;
    }

    try {
      setError(null);
      setBusyId('save');
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (formMode === 'create') {
        const payload: CreateBlogPayload = {
          categoryId: form.categoryId,
          title: form.title.trim(),
          content: form.content,
          excerpt: form.excerpt.trim() || undefined,
          featuredImageUrl: form.featuredImageUrl.trim() || undefined,
          status: form.status,
          tags: tags.length ? tags : undefined,
        };
        await BlogService.createPost(payload);
        toast.success('Đã tạo bài viết.');
      } else if (editingId) {
        const payload: UpdateBlogPayload = {
          title: form.title.trim(),
          content: form.content,
          categoryId: form.categoryId,
          excerpt: form.excerpt.trim() || undefined,
          featuredImageUrl: form.featuredImageUrl.trim() || undefined,
          status: form.status,
          tags,
        };
        await BlogService.updatePost(editingId, payload);
        toast.success('Đã cập nhật bài viết.');
      }

      closeForm();
      await loadAll(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu bài viết.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa vĩnh viễn bài viết này?')) return;
    try {
      setBusyId(id);
      await BlogService.deletePost(id);
      toast.success('Đã xóa bài viết.');
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa.');
    } finally {
      setBusyId(null);
    }
  };

  const handlePublishToggle = async (p: BlogPostDto) => {
    const isPub = p.status?.toLowerCase() === 'published';
    try {
      setBusyId(p.id);
      if (isPub) {
        await BlogService.unpublish(p.id);
        toast.success('Đã gỡ xuất bản.');
      } else {
        await BlogService.publish(p.id);
        toast.success('Đã xuất bản.');
      }
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [posts]
  );

  if (!canViewAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">Quản lý tin tức / Blog</h1>
            <p className="mt-1 text-sm text-slate-500">Kết nối API /blogs — tạo, sửa, xuất bản bài viết.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              disabled={categories.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Bài mới
            </button>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <button
              type="button"
              onClick={() => void loadAll(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Làm mới
            </button>
          </div>
        </div>

        {categories.length === 0 && !loading && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Chưa có danh mục blog. Tạo ít nhất một danh mục từ API backend (POST /api/blogs/categories) rồi tải lại
            trang.
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {formMode === 'create' ? 'Tạo bài viết' : 'Chỉnh sửa bài viết'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Danh mục</span>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  required
                >
                  <option value="">— Chọn —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Trạng thái</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value === 'published' ? 'published' : 'draft',
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Xuất bản</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm lg:col-span-2">
                <span className="font-medium text-slate-700">Tiêu đề</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm lg:col-span-2">
                <span className="font-medium text-slate-700">Tóm tắt (tuỳ chọn)</span>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  className="resize-y rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm lg:col-span-2">
                <span className="font-medium text-slate-700">Ảnh đại diện URL (tuỳ chọn)</span>
                <input
                  value={form.featuredImageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, featuredImageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm lg:col-span-2">
                <span className="font-medium text-slate-700">Nội dung (HTML)</span>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="resize-y rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm lg:col-span-2">
                <span className="font-medium text-slate-700">Tags (phân cách bằng dấu phẩy)</span>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="chó, mèo, sức khỏe"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={busyId === 'save'}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {busyId === 'save' ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-2 py-3">Tiêu đề</th>
                    <th className="px-2 py-3">Danh mục</th>
                    <th className="px-2 py-3">Trạng thái</th>
                    <th className="px-2 py-3">Xem</th>
                    <th className="px-2 py-3">Cập nhật</th>
                    <th className="px-2 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-slate-500">
                        Chưa có bài viết nào.
                      </td>
                    </tr>
                  ) : (
                    sortedPosts.map((p) => (
                      <tr key={p.id}>
                        <td className="max-w-xs px-2 py-3">
                          <p className="font-medium text-slate-900 line-clamp-2">{p.title}</p>
                          <p className="text-xs text-slate-400">/{p.slug}</p>
                        </td>
                        <td className="px-2 py-3 text-slate-700">{p.categoryName ?? '—'}</td>
                        <td className="px-2 py-3">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {statusLabel(p.status)}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-slate-600">{p.viewCount}</td>
                        <td className="whitespace-nowrap px-2 py-3 text-slate-600">
                          {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              to={`/tin-tuc/${encodeURIComponent(p.slug || p.id)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-teal-700 hover:bg-teal-50"
                            >
                              Xem
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handlePublishToggle(p)}
                              disabled={busyId === p.id}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                              {p.status?.toLowerCase() === 'published' ? 'Gỡ XB' : 'Xuất bản'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(p.id)}
                              disabled={busyId === p.id}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
