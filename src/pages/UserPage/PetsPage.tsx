// PetsPage.tsx
import {
  Activity,
  Calendar,
  ChevronDown,
  Dog,
  Heart,
  Plus,
  Syringe,
  Trash2,
  Upload, X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { healthRecordService } from '../../services/HealthRecordService';
import PetAPI, { type PetPayload, type Pet as PetType } from '../../services/PetAPI';
import PetSpeciesAPI, { type PetSpecies } from '../../services/PetSpeciesAPI';
import { VaccinationResponse, VaccineCatalogItem } from '../../types/healthRecord';
import { convertImageToBase64, isValidImageFile } from '../../utils/imageUtils';
import styles from './PetsPage.module.css';

export type Pet = PetType;

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

  const [pets, setPets] = useState<Pet[]>([]);
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

  // ── All logic helpers & effects unchanged ────────
  const extractArray = <T,>(response: any): T[] => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.items && Array.isArray(response.items)) return response.items;
    return [];
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingSpecies(true);
        const [data, catalog] = await Promise.all([
          PetSpeciesAPI.getWithBreeds(),
          healthRecordService.getVaccineCatalog().catch(() => []),
        ]);
        setPetSpecies(extractArray<PetSpecies>(data) ?? []);
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
      try {
        const apiResponse = await PetAPI.getMyPets();
        const apiPets = extractArray<Pet>(apiResponse);
        setPets(apiPets ?? []);
        try { localStorage.setItem(storageKey(user.id), JSON.stringify(apiPets ?? [])); } catch {}
      } catch {
        try {
          const rawPets = localStorage.getItem(storageKey(user.id));
          setPets(rawPets ? (JSON.parse(rawPets) as Pet[]) : []);
        } catch { setPets([]); }
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
            id: record.id, petId: record.petId, date: record.recordDate,
            weight: record.weight !== undefined && record.weight !== null ? String(record.weight) : undefined,
            temperature: record.temperature !== undefined && record.temperature !== null ? String(record.temperature) : undefined,
            notes: record.notes, status,
          };
        });
        setHealthChecks(mappedHealth.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setVaccinationHistory(vaccinations);
      } catch (err) {
        console.error('Failed to load pet health data', err);
        setHealthChecks([]);
        setVaccinationHistory([]);
      }
    })();
  }, [selectedPetId, user?.id]);

  const getSelectedSpeciesBreeds = () => {
    const selected = petSpecies.find(s => s.id === form.speciesId);
    return selected?.breeds ?? [];
  };

  const persist = (next: Pet[]) => {
    setPets(next);
    if (!user?.id) return;
    try { localStorage.setItem(storageKey(user.id), JSON.stringify(next)); } catch {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.name.trim()) { toast.warning('Vui lòng nhập tên thú cưng trước khi lưu.'); return; }
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
        } catch { toast.warning('Đã tạo thú cưng, nhưng lưu mũi vaccine ban đầu chưa thành công.'); }
      }
      persist([created, ...pets]);
      setForm({ name:'', speciesId:'', speciesName:'', breedId:'', breedName:'', dateOfBirth:'', gender:'', weight:'', color:'', microchipId:'', note:'', image:null, hasInitialVaccination:false, initialVaccineCode:'', initialVaccineName:'', initialVaccinationDate:'' });
      setUseCustomInitialVaccine(false);
      setImagePreview('');
      toast.success('Thêm thú cưng thành công!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu thú cưng vào hệ thống.');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidImageFile(file)) { toast.warning('Vui lòng chọn ảnh hợp lệ (JPG, PNG, GIF, WebP) dưới 5MB'); return; }
    try {
      const base64 = await convertImageToBase64(file);
      setForm((p) => ({ ...p, image: base64 }));
      setImagePreview(base64);
      toast.success('Tải ảnh lên thành công!');
    } catch { toast.error('Không thể tải ảnh'); }
  };

  const handleRemoveImage = () => { setForm((p) => ({ ...p, image: null })); setImagePreview(''); };

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
        id: record.id, petId: record.petId, date: record.recordDate,
        weight: record.weight !== undefined && record.weight !== null ? String(record.weight) : undefined,
        temperature: record.temperature !== undefined && record.temperature !== null ? String(record.temperature) : undefined,
        notes: record.notes,
        status: record.diagnosis === 'Cần chú ý' || record.diagnosis === 'Cần điều trị' ? (record.diagnosis as HealthCheck['status']) : 'Khỏe mạnh',
      }));
      setHealthChecks(mappedUpdated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setHealthForm({ weight: '', temperature: '', notes: '', status: 'Khỏe mạnh' });
      toast.success('Đã lưu kết quả kiểm tra sức khỏe.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu kết quả kiểm tra sức khỏe.');
    }
  };

  const handleRemove = async (id: string) => {
    persist(pets.filter((p) => p.id !== id));
    if (selectedPetId === id) setSelectedPetId('');
    try { await PetAPI.deletePet(id); toast.success('Đã xóa thú cưng!'); }
    catch { toast.error('Có lỗi xảy ra khi xóa thú cưng từ hệ thống.'); }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    persist(pets.map((p) => (p.id === id ? { ...p, isActive: active } : p)));
    try { await PetAPI.updatePet(id, { isActive: active }); toast.success(active ? 'Đã bật trạng thái hoạt động' : 'Đã tắt trạng thái hoạt động'); }
    catch { toast.error('Có lỗi xảy ra khi cập nhật trạng thái hoạt động.'); }
  };

  const handleRemoveHealth = async (id: string) => {
    try {
      await healthRecordService.deleteHealthRecord(id);
      setHealthChecks((prev) => prev.filter((h) => h.id !== id));
      toast.success('Đã xóa kết quả kiểm tra.');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Không thể xóa kết quả kiểm tra.'); }
  };

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) return;
    if (!vaccinationForm.vaccineName.trim()) { toast.warning('Vui lòng nhập tên vaccine.'); return; }
    try {
      await healthRecordService.addVaccination(selectedPetId, {
        vaccineCode: vaccinationForm.vaccineCode || undefined,
        vaccineName: vaccinationForm.vaccineName.trim(),
        vaccinationDate: vaccinationForm.vaccinationDate,
        notes: vaccinationForm.notes.trim() || undefined,
      });
      setVaccinationForm({ vaccineCode:'', vaccineName:'', vaccinationDate: new Date().toISOString().split('T')[0], notes:'' });
      setUseCustomVaccinationName(false);
      const vaccinations = await healthRecordService.getVaccinationsByPet(selectedPetId);
      setVaccinationHistory(vaccinations);
      toast.success('Đã cập nhật lịch sử vaccine.');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Không thể cập nhật vaccine.'); }
  };

  const getPetHealthChecks = (petId: string) =>
    healthChecks.filter((h) => h.petId === petId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusVariant = (status: string): 'healthy' | 'warning' | 'danger' => {
    if (status === 'Cần chú ý') return 'warning';
    if (status === 'Cần điều trị') return 'danger';
    return 'healthy';
  };
  // ── End logic ────────────────────────────────────

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.blobContainer} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
        </div>
        <div className={styles.emptyLogin}>
          <span className={styles.emptyLoginIcon}>🐾</span>
          <h1 className={styles.emptyLoginTitle}>Thú cưng của tôi</h1>
          <p className={styles.emptyLoginText}>Vui lòng đăng nhập để quản lý thú cưng.</p>
        </div>
      </div>
    );
  }

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className={styles.page}>
      {/* Blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>

      <div className={styles.container}>
        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Thú cưng của tôi 🐾</h1>
            <p className={styles.pageSubtitle}>Quản lý hồ sơ và theo dõi sức khỏe của các bé</p>
          </div>
          <div className={styles.headerIconWrap}>
            <Dog size={26} className={styles.headerIcon} />
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <Dog size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Số thú cưng</p>
              <p className={styles.statValue}>{pets.length}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconRed}`}>
              <Heart size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Lần kiểm tra sức khỏe</p>
              <p className={styles.statValue}>{healthChecks.length}</p>
            </div>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className={styles.mainLayout}>

          {/* ════ LEFT: Pet management ════ */}
          <div className={styles.leftCol}>

            {/* Add pet */}
            <div className={styles.card}>
              <button
                type="button"
                className={styles.cardCollapseHeader}
                onClick={() => setAddOpen((s) => !s)}
                aria-expanded={addOpen}
              >
                <div className={styles.cardHeaderLeft}>
                  <div className={`${styles.cardHeaderIcon} ${styles.cardHeaderIconTeal}`}>
                    <Plus size={16} />
                  </div>
                  <h2 className={styles.cardTitle}>Thêm Thú cưng</h2>
                </div>
                <ChevronDown
                  size={18}
                  className={`${styles.collapseChevron} ${addOpen ? styles.collapseChevronOpen : ''}`}
                />
              </button>

              {addOpen && (
                <form onSubmit={handleAdd} className={styles.addForm}>
                  {/* Name */}
                  <div className={styles.field}>
                    <label className={styles.label}>Tên thú cưng <span className={styles.required}>*</span></label>
                    <input
                      className={styles.input}
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ví dụ: Milu"
                      disabled={!canUse}
                    />
                  </div>

                  {/* Image */}
                  <div className={styles.field}>
                    <label className={styles.label}>Hình ảnh</label>
                    {imagePreview ? (
                      <div className={styles.imagePreviewWrap}>
                        <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.imageRemoveBtn} onClick={handleRemoveImage} aria-label="Xóa ảnh">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className={styles.imageUpload}>
                        <Upload size={20} className={styles.uploadIcon} />
                        <span className={styles.uploadText}>Nhấp để chọn ảnh</span>
                        <span className={styles.uploadHint}>JPG, PNG, GIF hoặc WebP · tối đa 5MB</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className={styles.hiddenInput} disabled={!canUse} />
                      </label>
                    )}
                  </div>

                  {/* Species + Breed */}
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Loài <span className={styles.required}>*</span></label>
                      <div className={styles.selectWrap}>
                        <select
                          className={styles.select}
                          value={form.speciesId}
                          onChange={(e) => {
                            const id = e.target.value;
                            const sel = petSpecies.find(s => s.id === id);
                            setForm((p) => ({ ...p, speciesId: id, speciesName: sel?.speciesName || '', breedId: '', breedName: '' }));
                          }}
                          disabled={!canUse || loadingSpecies}
                        >
                          <option value="">{loadingSpecies ? 'Đang tải...' : 'Chọn loài'}</option>
                          {petSpecies.map((s) => <option key={s.id} value={s.id}>{s.speciesName}</option>)}
                        </select>
                        <ChevronDown size={14} className={styles.selectChevron} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Giống</label>
                      {getSelectedSpeciesBreeds().length > 0 ? (
                        <div className={styles.selectWrap}>
                          <select
                            className={styles.select}
                            value={form.breedId}
                            onChange={(e) => {
                              const id = e.target.value;
                              const sel = getSelectedSpeciesBreeds().find(b => b.id === id);
                              setForm((p) => ({ ...p, breedId: id, breedName: sel?.breedName || '' }));
                            }}
                            disabled={!canUse || !form.speciesId}
                          >
                            <option value="">Chọn giống</option>
                            {getSelectedSpeciesBreeds().map((b) => <option key={b.id} value={b.id}>{b.breedName}</option>)}
                          </select>
                          <ChevronDown size={14} className={styles.selectChevron} />
                        </div>
                      ) : (
                        <input
                          className={styles.input}
                          value={form.breedName}
                          onChange={(e) => setForm((p) => ({ ...p, breedName: e.target.value }))}
                          placeholder="Ví dụ: Poodle"
                          disabled={!canUse || !form.speciesId}
                        />
                      )}
                    </div>
                  </div>

                  {/* DOB + Gender */}
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Ngày sinh</label>
                      <input type="date" className={styles.input} value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} disabled={!canUse} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Giới tính</label>
                      <div className={styles.selectWrap}>
                        <select className={styles.select} value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as 'Đực' | 'Cái' | '' }))} disabled={!canUse}>
                          <option value="">Chọn</option>
                          <option value="Đực">Đực</option>
                          <option value="Cái">Cái</option>
                        </select>
                        <ChevronDown size={14} className={styles.selectChevron} />
                      </div>
                    </div>
                  </div>

                  {/* Weight + Color */}
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Cân nặng (kg)</label>
                      <input type="number" step="0.1" className={styles.input} value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} disabled={!canUse} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Màu sắc</label>
                      <input className={styles.input} value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} disabled={!canUse} />
                    </div>
                  </div>

                  {/* Microchip */}
                  <div className={styles.field}>
                    <label className={styles.label}>Số microchip</label>
                    <input className={styles.input} value={form.microchipId} onChange={(e) => setForm((p) => ({ ...p, microchipId: e.target.value }))} disabled={!canUse} />
                  </div>

                  {/* Age */}
                  <div className={styles.field}>
                    <label className={styles.label}>Tuổi</label>
                    <input className={styles.input} value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} placeholder="Ví dụ: 2" disabled={!canUse} />
                  </div>

                  {/* Note */}
                  <div className={styles.field}>
                    <label className={styles.label}>Ghi chú</label>
                    <textarea className={`${styles.input} ${styles.textarea}`} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={3} placeholder="Ví dụ: Dị ứng hải sản..." disabled={!canUse} />
                  </div>

                  {/* Initial vaccine */}
                  <div className={styles.vaccineInitBox}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkbox} checked={form.hasInitialVaccination}
                        onChange={(e) => setForm((p) => ({ ...p, hasInitialVaccination: e.target.checked, initialVaccinationDate: p.initialVaccinationDate || new Date().toISOString().split('T')[0] }))}
                      />
                      Thêm mũi vaccine ban đầu
                    </label>

                    {form.hasInitialVaccination && (
                      <div className={styles.vaccineInitFields}>
                        <div className={styles.selectWrap}>
                          <select
                            className={styles.select}
                            value={useCustomInitialVaccine ? CUSTOM_VACCINE_VALUE : (form.initialVaccineCode || '')}
                            onChange={(e) => {
                              const next = e.target.value;
                              if (next === CUSTOM_VACCINE_VALUE) { setUseCustomInitialVaccine(true); setForm((p) => ({ ...p, initialVaccineCode: '' })); return; }
                              const matched = vaccineCatalog.find((v) => v.code === next);
                              setUseCustomInitialVaccine(false);
                              setForm((p) => ({ ...p, initialVaccineCode: next, initialVaccineName: matched?.displayName || '' }));
                            }}
                            disabled={!canUse}
                          >
                            <option value="">Chọn vaccine chuẩn</option>
                            {vaccineCatalog.map((item) => <option key={item.code} value={item.code}>{item.displayName}</option>)}
                            <option value={CUSTOM_VACCINE_VALUE}>Khác</option>
                          </select>
                          <ChevronDown size={14} className={styles.selectChevron} />
                        </div>
                        {useCustomInitialVaccine && (
                          <input className={styles.input} value={form.initialVaccineName} onChange={(e) => setForm((p) => ({ ...p, initialVaccineName: e.target.value }))} placeholder="Nhập tên vaccine" disabled={!canUse} />
                        )}
                        <p className={styles.vaccineHint}>Chọn vaccine chuẩn để hệ thống nhắc lịch chính xác hơn.</p>
                        <input type="date" className={styles.input} value={form.initialVaccinationDate || new Date().toISOString().split('T')[0]} onChange={(e) => setForm((p) => ({ ...p, initialVaccinationDate: e.target.value }))} disabled={!canUse} />
                      </div>
                    )}
                  </div>

                  <button type="submit" className={styles.addBtn} disabled={!canUse}>
                    <Plus size={16} />
                    Thêm thú cưng
                  </button>
                </form>
              )}
            </div>

            {/* Pet list */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardHeaderIcon} ${styles.cardHeaderIconPurple}`}>
                  <Dog size={16} />
                </div>
                <h2 className={styles.cardTitle}>Danh sách thú cưng</h2>
              </div>

              {pets.length === 0 ? (
                <div className={styles.emptyPets}>
                  <Dog size={36} className={styles.emptyPetsIcon} />
                  <p>Bạn chưa thêm thú cưng nào</p>
                </div>
              ) : (
                <div className={styles.petList}>
                  {pets.map((p) => (
                    <div
                      key={p.id}
                      className={`${styles.petItem} ${selectedPetId === p.id ? styles.petItemActive : ''}`}
                      onClick={() => setSelectedPetId(p.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPetId(p.id)}
                    >
                      <div className={styles.petItemTop}>
                        <label className={styles.toggleLabel} onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={p.isActive} onChange={() => handleToggleActive(p.id, !p.isActive)} disabled={!canUse} className={styles.toggleInput} />
                          <span className={styles.toggleTrack}>
                            <span className={styles.toggleThumb} />
                          </span>
                          <span className={styles.toggleText}>{p.isActive ? 'Bật' : 'Tắt'}</span>
                        </label>
                      </div>
                      <div className={styles.petItemBody}>
                        {p.avatarUrl && (
                          <div className={styles.petAvatarWrap} onClick={(e) => { e.stopPropagation(); setZoomedImage(p.avatarUrl!); }}>
                            <img src={p.avatarUrl} alt={p.petName} className={styles.petAvatar} />
                          </div>
                        )}
                        <div className={styles.petInfo}>
                          <p className={styles.petName}>{p.petName}</p>
                          <p className={styles.petMeta}>
                            {[p.speciesName, p.breedName, p.age ? `${p.age} tuổi` : null, p.color].filter(Boolean).join(' · ')}
                          </p>
                          {p.specialNotes && <p className={styles.petNotes}>{p.specialNotes}</p>}
                          <p className={styles.petStatus}>{p.isActive ? '● Hoạt động' : '○ Không hoạt động'}</p>
                        </div>
                        <button
                          className={styles.petDeleteBtn}
                          onClick={(e) => { e.stopPropagation(); handleRemove(p.id); }}
                          aria-label="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ════ RIGHT: Health & Vaccination ════ */}
          <div className={styles.rightCol}>
            {selectedPet ? (
              <>
                {/* ── Vaccine form ── */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.cardHeaderIcon} ${styles.cardHeaderIconTeal}`}>
                      <Syringe size={16} />
                    </div>
                    <h2 className={styles.cardTitle}>Cập nhật vaccine — {selectedPet.petName}</h2>
                  </div>

                  <form onSubmit={handleAddVaccination} className={styles.vaccineForm}>
                    <div className={styles.vaccineFormTop}>
                      <div className={styles.field} style={{ flex: 2 }}>
                        <label className={styles.label}>Tên vaccine <span className={styles.required}>*</span></label>
                        <div className={styles.selectWrap}>
                          <select
                            className={styles.select}
                            value={useCustomVaccinationName ? CUSTOM_VACCINE_VALUE : (vaccinationForm.vaccineCode || '')}
                            onChange={(e) => {
                              const next = e.target.value;
                              if (next === CUSTOM_VACCINE_VALUE) { setUseCustomVaccinationName(true); setVaccinationForm((p) => ({ ...p, vaccineCode: '' })); return; }
                              const matched = vaccineCatalog.find((v) => v.code === next);
                              setUseCustomVaccinationName(false);
                              setVaccinationForm((p) => ({ ...p, vaccineCode: next, vaccineName: matched?.displayName || '' }));
                            }}
                            disabled={!canUse}
                          >
                            <option value="">Chọn vaccine chuẩn</option>
                            {vaccineCatalog.map((item) => <option key={item.code} value={item.code}>{item.displayName}</option>)}
                            <option value={CUSTOM_VACCINE_VALUE}>Khác</option>
                          </select>
                          <ChevronDown size={14} className={styles.selectChevron} />
                        </div>
                        {useCustomVaccinationName && (
                          <input className={`${styles.input} ${styles.mt8}`} value={vaccinationForm.vaccineName} onChange={(e) => setVaccinationForm((p) => ({ ...p, vaccineName: e.target.value }))} placeholder="Nhập tên vaccine" disabled={!canUse} />
                        )}
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Ngày tiêm <span className={styles.required}>*</span></label>
                        <input type="date" className={styles.input} value={vaccinationForm.vaccinationDate} onChange={(e) => setVaccinationForm((p) => ({ ...p, vaccinationDate: e.target.value }))} disabled={!canUse} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Ghi chú</label>
                      <textarea className={`${styles.input} ${styles.textarea}`} rows={2} value={vaccinationForm.notes} onChange={(e) => setVaccinationForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Ví dụ: Tiêm tại phòng khám ABC" disabled={!canUse} />
                    </div>
                    <button type="submit" className={styles.vaccineSubmitBtn} disabled={!canUse}>
                      <Plus size={15} />
                      Lưu vaccine
                    </button>
                  </form>
                </div>

                {/* ── Vaccination history ── */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.cardHeaderIcon} ${styles.cardHeaderIconGreen}`}>
                      <Calendar size={16} />
                    </div>
                    <h2 className={styles.cardTitle}>Lịch sử vaccine</h2>
                  </div>

                  {vaccinationHistory.length === 0 ? (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyStateIcon}>💉</span>
                      <p>Chưa có dữ liệu vaccine cho thú cưng này.</p>
                    </div>
                  ) : (
                    <div className={styles.vaccineList}>
                      {vaccinationHistory.map((vaccine) => (
                        <div key={vaccine.id} className={styles.vaccineItem}>
                          <div className={styles.vaccineItemLeft}>
                            <p className={styles.vaccineName}>{vaccine.vaccineName}</p>
                            {vaccine.vaccineCode && <p className={styles.vaccineCode}>Mã: {vaccine.vaccineCode}</p>}
                          </div>
                          <div className={styles.vaccineItemRight}>
                            <span className={styles.vaccineDate}>Tiêm: {new Date(vaccine.vaccinationDate).toLocaleDateString('vi-VN')}</span>
                            {vaccine.nextDueDate && (
                              <span className={styles.vaccineNext}>Nhắc: {new Date(vaccine.nextDueDate).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Health check form ── */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.cardHeaderIcon} ${styles.cardHeaderIconRed}`}>
                      <Heart size={16} />
                    </div>
                    <h2 className={styles.cardTitle}>Kiểm tra sức khỏe — {selectedPet.petName}</h2>
                  </div>

                  <form onSubmit={handleAddHealth} className={styles.healthForm}>
                    <div className={styles.fieldRow}>
                      <div className={styles.field}>
                        <label className={styles.label}>Cân nặng (kg)</label>
                        <input type="number" step="0.1" className={styles.input} value={healthForm.weight} onChange={(e) => setHealthForm((p) => ({ ...p, weight: e.target.value }))} placeholder="15.5" disabled={!canUse} />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Nhiệt độ (°C)</label>
                        <input type="number" step="0.1" className={styles.input} value={healthForm.temperature} onChange={(e) => setHealthForm((p) => ({ ...p, temperature: e.target.value }))} placeholder="38.5" disabled={!canUse} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Tình trạng <span className={styles.required}>*</span></label>
                      <div className={styles.statusBtnGroup}>
                        {(['Khỏe mạnh', 'Cần chú ý', 'Cần điều trị'] as HealthCheck['status'][]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`${styles.statusBtn} ${healthForm.status === s ? styles[`statusBtnActive_${getStatusVariant(s)}`] : ''}`}
                            onClick={() => setHealthForm((p) => ({ ...p, status: s }))}
                          >
                            {s === 'Khỏe mạnh' ? '✓' : s === 'Cần chú ý' ? '⚠' : '✕'} {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Ghi chú</label>
                      <textarea className={`${styles.input} ${styles.textarea}`} rows={3} value={healthForm.notes} onChange={(e) => setHealthForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Ví dụ: Có dấu hiệu viêm tai..." disabled={!canUse} />
                    </div>
                    <button type="submit" className={styles.healthSubmitBtn} disabled={!canUse}>
                      <Heart size={15} />
                      Lưu kết quả kiểm tra
                    </button>
                  </form>
                </div>

                {/* ── Health history ── */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.cardHeaderIcon} ${styles.cardHeaderIconOrange}`}>
                      <Activity size={16} />
                    </div>
                    <h2 className={styles.cardTitle}>Lịch sử kiểm tra</h2>
                  </div>

                  {getPetHealthChecks(selectedPetId).length === 0 ? (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyStateIcon}>📋</span>
                      <p>Chưa có kết quả kiểm tra sức khỏe.</p>
                    </div>
                  ) : (
                    <div className={styles.healthList}>
                      {getPetHealthChecks(selectedPetId).map((h) => {
                        const variant = getStatusVariant(h.status);
                        return (
                          <div key={h.id} className={`${styles.healthItem} ${styles[`healthItem_${variant}`]}`}>
                            <div className={styles.healthItemHead}>
                              <div>
                                <span className={styles.healthDate}>{new Date(h.date).toLocaleDateString('vi-VN')}</span>
                                <span className={`${styles.healthBadge} ${styles[`healthBadge_${variant}`]}`}>{h.status}</span>
                              </div>
                              <button className={styles.healthDeleteBtn} onClick={() => handleRemoveHealth(h.id)} aria-label="Xóa">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className={styles.healthDetails}>
                              {h.weight && <span>⚖️ {h.weight} kg</span>}
                              {h.temperature && <span>🌡️ {h.temperature}°C</span>}
                            </div>
                            {h.notes && <p className={styles.healthNotes}>{h.notes}</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.noSelectionCard}>
                <span className={styles.noSelectionIcon}>🐾</span>
                <h3 className={styles.noSelectionTitle}>Chọn thú cưng</h3>
                <p className={styles.noSelectionText}>Chọn một thú cưng từ danh sách bên trái để xem và cập nhật sức khỏe</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image zoom modal */}
      {zoomedImage && (
        <div className={styles.zoomOverlay} onClick={() => setZoomedImage(null)}>
          <button className={styles.zoomCloseBtn} onClick={() => setZoomedImage(null)} aria-label="Đóng">
            <X size={28} />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Zoomed" className={styles.zoomedImg} />
          </div>
        </div>
      )}
    </div>
  );
}