import { useEffect, useMemo, useState } from 'react';
import { Dog, Plus, Trash2, Heart, Calendar, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Pet = {
  id: string;
  name: string;
  species: 'Chó' | 'Mèo' | 'Khác';
  breed?: string;
  age?: string;
  note?: string;
};

type HealthCheck = {
  id: string;
  petId: string;
  date: string;
  weight?: string;
  temperature?: string;
  notes?: string;
  status: 'Khỏe mạnh' | 'Cần chú ý' | 'Cần điều trị';
};

function storageKey(userId: string) {
  return `pets:${userId}`;
}

function healthStorageKey(userId: string) {
  return `health:${userId}`;
}

export default function PetsPage() {
  const { user } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'add' | 'health'>('add');

  const [form, setForm] = useState({
    name: '',
    species: 'Chó' as Pet['species'],
    breed: '',
    age: '',
    note: '',
  });

  const [healthForm, setHealthForm] = useState({
    weight: '',
    temperature: '',
    notes: '',
    status: 'Khỏe mạnh' as HealthCheck['status'],
  });

  const canUse = useMemo(() => !!user?.id, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const rawPets = localStorage.getItem(storageKey(user.id));
      setPets(rawPets ? (JSON.parse(rawPets) as Pet[]) : []);
      
      const rawHealth = localStorage.getItem(healthStorageKey(user.id));
      setHealthChecks(rawHealth ? (JSON.parse(rawHealth) as HealthCheck[]) : []);
    } catch {
      setPets([]);
      setHealthChecks([]);
    }
  }, [user?.id]);

  const persist = (next: Pet[]) => {
    setPets(next);
    if (!user?.id) return;
    localStorage.setItem(storageKey(user.id), JSON.stringify(next));
  };

  const persistHealth = (next: HealthCheck[]) => {
    setHealthChecks(next);
    if (!user?.id) return;
    localStorage.setItem(healthStorageKey(user.id), JSON.stringify(next));
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

  const handleAddHealth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) return;

    const next: HealthCheck[] = [
      {
        id: crypto.randomUUID(),
        petId: selectedPetId,
        date: new Date().toISOString().split('T')[0],
        weight: healthForm.weight.trim() || undefined,
        temperature: healthForm.temperature.trim() || undefined,
        notes: healthForm.notes.trim() || undefined,
        status: healthForm.status,
      },
      ...healthChecks,
    ];
    persistHealth(next);
    setHealthForm({ weight: '', temperature: '', notes: '', status: 'Khỏe mạnh' });
  };

  const handleRemove = (id: string) => {
    const next = pets.filter((p) => p.id !== id);
    persist(next);
    if (selectedPetId === id) setSelectedPetId('');
  };

  const handleRemoveHealth = (id: string) => {
    const next = healthChecks.filter((h) => h.id !== id);
    persistHealth(next);
  };

  const getPetHealthChecks = (petId: string) => {
    return healthChecks.filter((h) => h.petId === petId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Khỏe mạnh':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'Cần chú ý':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Cần điều trị':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Khỏe mạnh':
        return 'bg-green-100 text-green-800';
      case 'Cần chú ý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cần điều trị':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Quản lý Thú cưng</h1>
            <p className="text-sm text-gray-500 mt-2">
              Quản lý hồ sơ thú cưng và theo dõi sức khỏe của chúng
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
            <Dog className="w-6 h-6" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Dog className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Số thú cưng</p>
              <p className="text-2xl font-bold text-gray-800">{pets.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Lần kiểm tra sức khỏe</p>
              <p className="text-2xl font-bold text-gray-800">{healthChecks.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pet Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Pet Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-800">Thêm Thú cưng</h2>
              </div>

              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thú cưng *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ví dụ: Milu"
                    disabled={!canUse}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loài *</label>
                    <select
                      value={form.species}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, species: e.target.value as Pet['species'] }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ví dụ: Poodle"
                    disabled={!canUse}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Ví dụ: Dị ứng hải sản, sợ bắn pháo..."
                    disabled={!canUse}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                  disabled={!canUse}
                >
                  <Plus className="w-4 h-4" />
                  Thêm thú cưng
                </button>
              </form>
            </section>

            {/* Pet List */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Danh sách thú cưng</h2>

              {pets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 py-8 px-4 text-center text-sm text-gray-500">
                  <Dog className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  Bạn chưa thêm thú cưng nào
                </div>
              ) : (
                <div className="space-y-2">
                  {pets.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPetId(p.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPetId === p.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {p.species}
                            {p.breed ? ` • ${p.breed}` : ''}
                            {p.age ? ` • ${p.age} tuổi` : ''}
                          </div>
                          {p.note && <div className="text-xs text-gray-500 mt-1">{p.note}</div>}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(p.id);
                          }}
                          className="text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Health Check */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPetId ? (
              <>
                {/* Add Health Check */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Kiểm tra sức khỏe - {pets.find((p) => p.id === selectedPetId)?.name}
                    </h2>
                  </div>

                  <form onSubmit={handleAddHealth} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cân nặng (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={healthForm.weight}
                          onChange={(e) =>
                            setHealthForm((p) => ({ ...p, weight: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ví dụ: 15.5"
                          disabled={!canUse}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nhiệt độ (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={healthForm.temperature}
                          onChange={(e) =>
                            setHealthForm((p) => ({ ...p, temperature: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ví dụ: 38.5"
                          disabled={!canUse}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tình trạng sức khỏe *
                      </label>
                      <select
                        value={healthForm.status}
                        onChange={(e) =>
                          setHealthForm((p) => ({
                            ...p,
                            status: e.target.value as HealthCheck['status'],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        disabled={!canUse}
                      >
                        <option value="Khỏe mạnh">✓ Khỏe mạnh</option>
                        <option value="Cần chú ý">⚠ Cần chú ý</option>
                        <option value="Cần điều trị">✕ Cần điều trị</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú kiểm tra
                      </label>
                      <textarea
                        value={healthForm.notes}
                        onChange={(e) =>
                          setHealthForm((p) => ({ ...p, notes: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Ví dụ: Có dấu hiệu viêm tai, cần kiểm tra kỹ hơn..."
                        disabled={!canUse}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400"
                      disabled={!canUse}
                    >
                      <Heart className="w-4 h-4" />
                      Lưu kết quả kiểm tra
                    </button>
                  </form>
                </section>

                {/* Health History */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Lịch sử kiểm tra</h2>
                  </div>

                  {getPetHealthChecks(selectedPetId).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 py-8 px-4 text-center text-sm text-gray-500">
                      <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      Chưa có kết quả kiểm tra sức khỏe
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getPetHealthChecks(selectedPetId).map((h) => (
                        <div
                          key={h.id}
                          className={`p-4 rounded-xl border-2 ${getStatusColor(h.status)}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold">
                                  {new Date(h.date).toLocaleDateString('vi-VN')}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(h.status)}`}>
                                  {h.status}
                                </span>
                              </div>
                              <div className="text-sm space-y-1">
                                {h.weight && (
                                  <p>
                                    <span className="font-medium">Cân nặng:</span> {h.weight} kg
                                  </p>
                                )}
                                {h.temperature && (
                                  <p>
                                    <span className="font-medium">Nhiệt độ:</span> {h.temperature}°C
                                  </p>
                                )}
                              </div>
                              {h.notes && (
                                <p className="text-sm mt-2 p-2 bg-white bg-opacity-50 rounded">
                                  {h.notes}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveHealth(h.id)}
                              className="text-gray-500 hover:text-red-600 rounded p-2 transition-colors"
                              aria-label="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Chọn thú cưng</p>
                <p className="text-gray-500">Chọn một thú cưng từ danh sách bên trái để kiểm tra sức khỏe</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

