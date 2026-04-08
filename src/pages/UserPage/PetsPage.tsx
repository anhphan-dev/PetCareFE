import { useEffect, useMemo, useState } from 'react';
import { Dog, Plus, Trash2, Heart, Calendar, ClipboardList, Upload, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PetAPI, { type Pet as PetType, type PetPayload } from '../../services/PetAPI';
import PetSpeciesAPI, { type PetSpecies } from '../../services/PetSpeciesAPI';
import { healthRecordService } from '../../services/HealthRecordService';
import { VaccineCatalogItem, VaccinationResponse } from '../../types/healthRecord';
import { convertImageToBase64, isValidImageFile } from '../../utils/imageUtils';
import { toast } from 'react-toastify';

// alias for the imported type so we can use `Pet` throughout this file
export type Pet = PetType;



// Health checks keep their own internal shape

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

const CUSTOM_VACCINE_VALUE = '__custom_vaccine__';

export default function PetsPage() {
  const { user } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]); // Pet is alias imported above
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<PetSpecies[]>([]);
  const [loadingSpecies, setLoadingSpecies] = useState(false);

  const [form, setForm] = useState({
    name: '',
    speciesId: '' as string,
    speciesName: '' as string,
    breedId: '' as string,
    breedName: '' as string,
    dateOfBirth: '' as string,
    gender: '' as 'Đực' | 'Cái' | '',
    weight: '' as string,
    color: '',
    microchipId: '',
    age: '',
    note: '',
    image: '' as string | null,
    hasInitialVaccination: false,
    initialVaccineCode: '',
    initialVaccineName: '',
    initialVaccinationDate: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const [healthForm, setHealthForm] = useState({
    weight: '',
    temperature: '',
    notes: '',
    status: 'Khỏe mạnh' as HealthCheck['status'],
  });

  const [vaccinationForm, setVaccinationForm] = useState({
    vaccineCode: '',
    vaccineName: '',
    vaccinationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [vaccineCatalog, setVaccineCatalog] = useState<VaccineCatalogItem[]>([]);
  const [vaccinationHistory, setVaccinationHistory] = useState<VaccinationResponse[]>([]);
  const [useCustomInitialVaccine, setUseCustomInitialVaccine] = useState(false);
  const [useCustomVaccinationName, setUseCustomVaccinationName] = useState(false);

  const canUse = useMemo(() => !!user?.id, [user?.id]);

  const [addOpen, setAddOpen] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Helper to extract array from API response (handles both array and paginated response)
  const extractArray = <T,>(response: any): T[] => {
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response?.items && Array.isArray(response.items)) {
      return response.items;
    }
    return [];
  };

  useEffect(() => {
    // Fetch species with breeds
    (async () => {
      try {
        setLoadingSpecies(true);
        const [data, catalog] = await Promise.all([
          PetSpeciesAPI.getWithBreeds(),
          healthRecordService.getVaccineCatalog().catch(() => []),
        ]);
        const speciesArray = extractArray<PetSpecies>(data);
        setPetSpecies(speciesArray ?? []);
        setVaccineCatalog(catalog ?? []);
      } catch (err) {
        console.error('Failed to load pet species:', err);
        setPetSpecies([]);
        setVaccineCatalog([]);
      } finally {
        setLoadingSpecies(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      // Try loading pets from API, fall back to localStorage
      try {
        const apiResponse = await PetAPI.getMyPets();
        const apiPets = extractArray<Pet>(apiResponse);
        setPets(apiPets ?? []);
        try {
          localStorage.setItem(storageKey(user.id), JSON.stringify(apiPets ?? []));
        } catch {}
      } catch (err) {
        try {
          const rawPets = localStorage.getItem(storageKey(user.id));
          setPets(rawPets ? (JSON.parse(rawPets) as Pet[]) : []);
        } catch {
          setPets([]);
        }
      }

      setHealthChecks([]);
      setVaccinationHistory([]);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !selectedPetId) {
      setHealthChecks([]);
      setVaccinationHistory([]);
      return;
    }

    (async () => {
      try {
        const [healthRecords, vaccinations] = await Promise.all([
          healthRecordService.getHealthRecordsByPet(selectedPetId),
          healthRecordService.getVaccinationsByPet(selectedPetId),
        ]);

        const mappedHealth: HealthCheck[] = healthRecords.map((record) => {
          const status =
            record.diagnosis === 'Cần chú ý' || record.diagnosis === 'Cần điều trị'
              ? (record.diagnosis as HealthCheck['status'])
              : ('Khỏe mạnh' as HealthCheck['status']);

          return {
            id: record.id,
            petId: record.petId,
            date: record.recordDate,
            weight: record.weight !== undefined && record.weight !== null ? String(record.weight) : undefined,
            temperature: record.temperature !== undefined && record.temperature !== null ? String(record.temperature) : undefined,
            notes: record.notes,
            status,
          };
        });

        setHealthChecks(
          mappedHealth.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        setVaccinationHistory(vaccinations);
      } catch (err) {
        console.error('Failed to load pet health data', err);
        setHealthChecks([]);
        setVaccinationHistory([]);
      }
    })();
  }, [selectedPetId, user?.id]);

  // Get breeds for selected species id
  const getSelectedSpeciesBreeds = () => {
    const selected = petSpecies.find(s => s.id === form.speciesId);
    return selected?.breeds ?? [];
  };

  const persist = (next: Pet[]) => {
    setPets(next);
    if (!user?.id) return;
    try {
      localStorage.setItem(storageKey(user.id), JSON.stringify(next));
    } catch {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.name.trim()) {
      toast.warning('Vui lòng nhập tên thú cưng trước khi lưu.');
      return;
    }

    // translate form values into the new backend payload shape

    const payload: PetPayload = {
      petName: form.name.trim(),
      speciesId: form.speciesId || undefined,
      breedId: form.breedId || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      age: form.age.trim() || undefined,
      gender: (form.gender as PetPayload['gender']) || undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      color: form.color.trim() || undefined,
      microchipId: form.microchipId.trim() || undefined,
      specialNotes: form.note.trim() || undefined,
      avatarUrl: form.image || undefined,
      isActive: true,
    };

    // Try create via API, fallback to local storage when API fails
    try {
      const created = await PetAPI.createPet(payload);

      if (form.hasInitialVaccination && form.initialVaccineName.trim()) {
        try {
          await healthRecordService.addVaccination(created.id, {
            vaccineCode: form.initialVaccineCode || undefined,
            vaccineName: form.initialVaccineName.trim(),
            vaccinationDate: form.initialVaccinationDate || new Date().toISOString().split('T')[0],
            notes: 'Initial vaccination record during pet onboarding',
          });
        } catch (vaccinationErr) {
          console.error('Failed to save initial vaccination', vaccinationErr);
          toast.warning('Đã tạo thú cưng, nhưng lưu mũi vaccine ban đầu chưa thành công.');
        }
      }

      const next: Pet[] = [created, ...pets];
      persist(next);
      setForm({
        name: '',
        speciesId: '',
        speciesName: '',
        breedId: '',
        breedName: '',
        dateOfBirth: '',
        gender: '',
        weight: '',
        color: '',
        microchipId: '',
        note: '',
        image: null,
        hasInitialVaccination: false,
        initialVaccineCode: '',
        initialVaccineName: '',
        initialVaccinationDate: '',
      });
      setUseCustomInitialVaccine(false);
      setImagePreview('');
      toast.success('Thêm thú cưng thành công!');
    } catch (err) {
      console.error('Failed to create pet via API', err);
      toast.error(err instanceof Error ? err.message : 'Không thể lưu thú cưng vào hệ thống.');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
      toast.warning('Vui lòng chọn ảnh hợp lệ (JPG, PNG, GIF, WebP) dưới 5MB');
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setForm((p) => ({ ...p, image: base64 }));
      setImagePreview(base64);
      toast.success('Tải ảnh lên thành công!');
    } catch (err) {
      toast.error('Không thể tải ảnh');
      console.error(err);
    }
  };

  const handleRemoveImage = () => {
    setForm((p) => ({ ...p, image: null }));
    setImagePreview('');
  };

  const handleAddHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) return;

    try {
      await healthRecordService.createHealthRecord({
        petId: selectedPetId,
        recordDate: new Date().toISOString(),
        weight: healthForm.weight ? Number(healthForm.weight) : undefined,
        temperature: healthForm.temperature ? Number(healthForm.temperature) : undefined,
        diagnosis: healthForm.status,
        notes: healthForm.notes.trim() || undefined,
      });

      const updated = await healthRecordService.getHealthRecordsByPet(selectedPetId);
      const mappedUpdated: HealthCheck[] = updated.map((record) => ({
        id: record.id,
        petId: record.petId,
        date: record.recordDate,
        weight: record.weight !== undefined && record.weight !== null ? String(record.weight) : undefined,
        temperature: record.temperature !== undefined && record.temperature !== null ? String(record.temperature) : undefined,
        notes: record.notes,
        status:
          record.diagnosis === 'Cần chú ý' || record.diagnosis === 'Cần điều trị'
            ? (record.diagnosis as HealthCheck['status'])
            : 'Khỏe mạnh',
      }));

      setHealthChecks(
        mappedUpdated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      setHealthForm({ weight: '', temperature: '', notes: '', status: 'Khỏe mạnh' });
      toast.success('Đã lưu kết quả kiểm tra sức khỏe.');
    } catch (err) {
      console.error('Failed to add health record', err);
      toast.error(err instanceof Error ? err.message : 'Không thể lưu kết quả kiểm tra sức khỏe.');
    }
  };

  const handleRemove = async (id: string) => {
    const next = pets.filter((p) => p.id !== id);
    persist(next);
    if (selectedPetId === id) setSelectedPetId('');

    try {
      await PetAPI.deletePet(id);
      toast.success('Đã xóa thú cưng!');
    } catch (err) {
      // If API delete failed, we already removed locally. Log error.
      console.error('Failed to delete pet from API', err);
      toast.error('Có lỗi xảy ra khi xóa thú cưng từ hệ thống.');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const next = pets.map((p) => (p.id === id ? { ...p, isActive: active } : p));
    persist(next);
    try {
      await PetAPI.updatePet(id, { isActive: active });
      toast.success(active ? 'Đã bật trạng thái hoạt động' : 'Đã tắt trạng thái hoạt động');
    } catch (err) {
      console.error('Failed to toggle pet active state', err);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái hoạt động.');
    }
  };

  const handleRemoveHealth = async (id: string) => {
    try {
      await healthRecordService.deleteHealthRecord(id);
      setHealthChecks((prev) => prev.filter((h) => h.id !== id));
      toast.success('Đã xóa kết quả kiểm tra.');
    } catch (err) {
      console.error('Failed to delete health record', err);
      toast.error(err instanceof Error ? err.message : 'Không thể xóa kết quả kiểm tra.');
    }
  };

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) return;

    if (!vaccinationForm.vaccineName.trim()) {
      toast.warning('Vui lòng nhập tên vaccine.');
      return;
    }

    try {
      await healthRecordService.addVaccination(selectedPetId, {
        vaccineCode: vaccinationForm.vaccineCode || undefined,
        vaccineName: vaccinationForm.vaccineName.trim(),
        vaccinationDate: vaccinationForm.vaccinationDate,
        notes: vaccinationForm.notes.trim() || undefined,
      });

      setVaccinationForm({
        vaccineCode: '',
        vaccineName: '',
        vaccinationDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setUseCustomVaccinationName(false);
      const vaccinations = await healthRecordService.getVaccinationsByPet(selectedPetId);
      setVaccinationHistory(vaccinations);
      toast.success('Đã cập nhật lịch sử vaccine.');
    } catch (err) {
      console.error('Failed to add vaccination', err);
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật vaccine.');
    }
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
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Thêm Thú cưng</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAddOpen((s) => !s)}
                  aria-expanded={addOpen}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown className={`w-5 h-5 transform ${addOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {addOpen && (
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

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        aria-label="Xóa ảnh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Nhấp để chọn ảnh</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF hoặc WebP (tối đa 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={!canUse}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loài *</label>
                    <select
                      value={form.speciesId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const sel = petSpecies.find(s => s.id === id);
                        setForm((p) => ({
                          ...p,
                          speciesId: id,
                          speciesName: sel?.speciesName || '',
                          breedId: '',
                          breedName: '',
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      disabled={!canUse || loadingSpecies}
                    >
                      <option value="">
                        {loadingSpecies ? 'Đang tải...' : 'Chọn loài'}
                      </option>
                      {petSpecies.map((species) => (
                        <option key={species.id} value={species.id}>
                          {species.speciesName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giống</label>
                    {getSelectedSpeciesBreeds().length > 0 ? (
                      <select
                        value={form.breedId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const sel = getSelectedSpeciesBreeds().find(b => b.id === id);
                          setForm((p) => ({
                            ...p,
                            breedId: id,
                            breedName: sel?.breedName || '',
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        disabled={!canUse || !form.speciesId}
                      >
                        <option value="">Chọn giống</option>
                        {getSelectedSpeciesBreeds().map((breed) => (
                          <option key={breed.id} value={breed.id}>
                            {breed.breedName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={form.breedName}
                        onChange={(e) => setForm((p) => ({ ...p, breedName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ví dụ: Poodle"
                        disabled={!canUse || !form.speciesId}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      disabled={!canUse}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as 'Đực' | 'Cái' | '' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      disabled={!canUse}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Đực">Đực</option>
                      <option value="Cái">Cái</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cân nặng (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      disabled={!canUse}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu sắc
                    </label>
                    <input
                      value={form.color}
                      onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      disabled={!canUse}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số microchip
                  </label>
                  <input
                    value={form.microchipId}
                    onChange={(e) => setForm((p) => ({ ...p, microchipId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={!canUse}
                  />
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

                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3 space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.hasInitialVaccination}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          hasInitialVaccination: e.target.checked,
                          initialVaccinationDate: p.initialVaccinationDate || new Date().toISOString().split('T')[0],
                        }))
                      }
                      className="form-checkbox h-4 w-4 text-teal-600"
                    />
                    Thêm mũi vaccine ban đầu cho thú cưng
                  </label>

                  {form.hasInitialVaccination && (
                    <div className="grid grid-cols-1 gap-2">
                      <div className="relative">
                        <select
                          value={useCustomInitialVaccine ? CUSTOM_VACCINE_VALUE : (form.initialVaccineCode || '')}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next === CUSTOM_VACCINE_VALUE) {
                              setUseCustomInitialVaccine(true);
                              setForm((p) => ({ ...p, initialVaccineCode: '' }));
                              return;
                            }

                            const matched = vaccineCatalog.find((v) => v.code === next);
                            setUseCustomInitialVaccine(false);
                            setForm((p) => ({
                              ...p,
                              initialVaccineCode: next,
                              initialVaccineName: matched?.displayName || '',
                            }));
                          }}
                          className="w-full h-11 appearance-none px-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          disabled={!canUse}
                        >
                          <option value="">Chọn vaccine chuẩn</option>
                          {vaccineCatalog.map((item) => (
                            <option key={item.code} value={item.code}>{item.displayName}</option>
                          ))}
                          <option value={CUSTOM_VACCINE_VALUE}>Khác</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {useCustomInitialVaccine && (
                        <input
                          value={form.initialVaccineName}
                          onChange={(e) => setForm((p) => ({ ...p, initialVaccineName: e.target.value }))}
                          className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Nhập tên vaccine"
                          disabled={!canUse}
                        />
                      )}

                      <p className="text-xs text-gray-500">Ưu tiên chọn vaccine chuẩn để hệ thống nhắc lịch chính xác hơn.</p>
                      <input
                        type="date"
                        value={form.initialVaccinationDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setForm((p) => ({ ...p, initialVaccinationDate: e.target.value }))}
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        disabled={!canUse}
                      />
                    </div>
                  )}
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
              )}
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
                      <div className="flex justify-end">
                        <label className="inline-flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={p.isActive}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleActive(p.id, !p.isActive);
                            }}
                            disabled={!canUse}
                            className="form-checkbox h-4 w-4 text-teal-600"
                          />
                          <span className="text-xs">{p.isActive ? 'On' : 'Off'}</span>
                        </label>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        {p.avatarUrl && (
                          <div className="flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); setZoomedImage(p.avatarUrl!); }}>
                            <img
                              src={p.avatarUrl}
                              alt={p.petName}
                              className="w-12 h-12 object-cover rounded-lg hover:opacity-80 transition-opacity"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800">{p.petName}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {p.speciesName}
                            {p.breedName ? ` • ${p.breedName}` : ''}
                            {p.age ? ` • ${p.age} tuổi` : ''}
                            {p.color ? ` • ${p.color}` : ''}
                          </div>
                          {p.specialNotes && <div className="text-xs text-gray-500 mt-1 truncate">{p.specialNotes}</div>}
                          <div className="text-xs text-gray-500 mt-1">
                            {p.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(p.id);
                          }}
                          className="text-red-600 hover:bg-red-50 rounded p-1 transition-colors flex-shrink-0"
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
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Cập nhật lịch sử vaccine - {pets.find((p) => p.id === selectedPetId)?.petName}
                    </h2>
                  </div>

                  <form onSubmit={handleAddVaccination} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên vaccine *</label>
                      <div className="relative">
                        <select
                          value={useCustomVaccinationName ? CUSTOM_VACCINE_VALUE : (vaccinationForm.vaccineCode || '')}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next === CUSTOM_VACCINE_VALUE) {
                              setUseCustomVaccinationName(true);
                              setVaccinationForm((p) => ({ ...p, vaccineCode: '' }));
                              return;
                            }

                            const matched = vaccineCatalog.find((v) => v.code === next);
                            setUseCustomVaccinationName(false);
                            setVaccinationForm((p) => ({
                              ...p,
                              vaccineCode: next,
                              vaccineName: matched?.displayName || '',
                            }));
                          }}
                          className="w-full h-11 appearance-none px-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          disabled={!canUse}
                        >
                          <option value="">Chọn vaccine chuẩn</option>
                          {vaccineCatalog.map((item) => (
                            <option key={item.code} value={item.code}>{item.displayName}</option>
                          ))}
                          <option value={CUSTOM_VACCINE_VALUE}>Khác</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {useCustomVaccinationName && (
                        <input
                          value={vaccinationForm.vaccineName}
                          onChange={(e) => setVaccinationForm((p) => ({ ...p, vaccineName: e.target.value }))}
                          className="mt-2 w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Nhập tên vaccine"
                          disabled={!canUse}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tiêm *</label>
                      <input
                        type="date"
                        value={vaccinationForm.vaccinationDate}
                        onChange={(e) =>
                          setVaccinationForm((p) => ({ ...p, vaccinationDate: e.target.value }))
                        }
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        disabled={!canUse}
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                      disabled={!canUse}
                    >
                      <Plus className="w-4 h-4" />
                      Lưu vaccine
                    </button>
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <textarea
                        value={vaccinationForm.notes}
                        onChange={(e) =>
                          setVaccinationForm((p) => ({ ...p, notes: e.target.value }))
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        placeholder="Ví dụ: Tiêm tại phòng khám ABC"
                        disabled={!canUse}
                      />
                    </div>
                  </form>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Lịch sử vaccine</h2>
                  </div>

                  {vaccinationHistory.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 py-8 px-4 text-center text-sm text-gray-500">
                      Chưa có dữ liệu lịch sử vaccine cho thú cưng này.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vaccinationHistory.map((vaccine) => (
                        <div key={vaccine.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{vaccine.vaccineName}</p>
                              {vaccine.vaccineCode && (
                                <p className="text-xs text-gray-500 mt-0.5">Mã chuẩn: {vaccine.vaccineCode}</p>
                              )}
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              Ngày tiêm: {new Date(vaccine.vaccinationDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-gray-700 space-y-1">
                            {vaccine.nextDueDate && (
                              <p>
                                <span className="font-medium">Lịch nhắc kế tiếp:</span>{' '}
                                {new Date(vaccine.nextDueDate).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                            {vaccine.notes && (
                              <p>
                                <span className="font-medium">Ghi chú:</span> {vaccine.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Add Health Check */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Kiểm tra sức khỏe - {pets.find((p) => p.id === selectedPetId)?.petName}
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

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={zoomedImage} 
              alt="Zoomed Pet" 
              className="rounded-lg max-w-full max-h-[85vh] object-contain shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

