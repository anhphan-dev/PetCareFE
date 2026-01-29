import { useEffect, useMemo, useState } from 'react';
import { Dog, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Pet = {
  id: string;
  name: string;
  species: 'Chó' | 'Mèo' | 'Khác';
  breed?: string;
  age?: string;
  note?: string;
};

function storageKey(userId: string) {
  return `pets:${userId}`;
}

export default function PetsPage() {
  const { user } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [form, setForm] = useState({
    name: '',
    species: 'Chó' as Pet['species'],
    breed: '',
    age: '',
    note: '',
  });

  const canUse = useMemo(() => !!user?.id, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      setPets(raw ? (JSON.parse(raw) as Pet[]) : []);
    } catch {
      setPets([]);
    }
  }, [user?.id]);

  const persist = (next: Pet[]) => {
    setPets(next);
    if (!user?.id) return;
    localStorage.setItem(storageKey(user.id), JSON.stringify(next));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.name.trim()) return;

    const next: Pet[] = [
      {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim() || undefined,
        age: form.age.trim() || undefined,
        note: form.note.trim() || undefined,
      },
      ...pets,
    ];
    persist(next);
    setForm({ name: '', species: 'Chó', breed: '', age: '', note: '' });
  };

  const handleRemove = (id: string) => {
    const next = pets.filter((p) => p.id !== id);
    persist(next);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thú cưng</h1>
          <p className="text-gray-600">Vui lòng đăng nhập để quản lý thú cưng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Thú cưng</h1>
            <p className="text-sm text-gray-500 mt-1">
              Thêm và quản lý hồ sơ thú cưng của bạn.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Dog className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Thêm thú cưng
              </h2>
              <span className="text-xs text-gray-500">{pets.length} thú cưng</span>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ví dụ: Milu"
                  disabled={!canUse}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loài</label>
                  <select
                    value={form.species}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, species: e.target.value as Pet['species'] }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    disabled={!canUse}
                  >
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi</label>
                  <input
                    value={form.age}
                    onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ví dụ: 2"
                    disabled={!canUse}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giống</label>
                <input
                  value={form.breed}
                  onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ví dụ: Poodle"
                  disabled={!canUse}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  rows={3}
                  placeholder="Ví dụ: Dị ứng hải sản..."
                  disabled={!canUse}
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-300"
                disabled={!canUse}
              >
                <Plus className="w-4 h-4" />
                Thêm thú cưng
              </button>
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
              Danh sách thú cưng
            </h2>

            {pets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-10 px-4 text-center text-sm text-gray-500">
                Bạn chưa thêm thú cưng nào.
              </div>
            ) : (
              <div className="space-y-3">
                {pets.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">{p.name}</div>
                      <div className="text-sm text-gray-600">
                        {p.species}
                        {p.breed ? ` • ${p.breed}` : ''}
                        {p.age ? ` • ${p.age} tuổi` : ''}
                      </div>
                      {p.note && <div className="text-xs text-gray-500 mt-1">{p.note}</div>}
                    </div>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                      aria-label="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

