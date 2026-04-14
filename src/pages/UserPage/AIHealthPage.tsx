import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Brain,
  ChevronRight,
  HeartPulse,
  History,
  Loader2,
  Syringe,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PetAPI, { Pet } from '../../services/PetAPI';
import { healthRecordService } from '../../services/HealthRecordService';
import AIHealthService, {
  AIAnalysisType,
  AIHealthAnalysisResponse,
  AIHealthAnalysisSummary,
} from '../../services/AIHealthService';
import SubscriptionService from '../../services/SubscriptionService';
import { DogRoutineItem, DogRoutineSchedule } from '../../types/healthRecord';

const analysisOptions: Array<{ value: AIAnalysisType; label: string; hint: string }> = [
  {
    value: 'HealthProfile',
    label: 'Hồ sơ sức khỏe',
    hint: 'Tổng hợp tình trạng sức khỏe hiện tại của thú cưng.',
  },
  {
    value: 'Recommendation',
    label: 'Khuyến nghị chăm sóc',
    hint: 'Nhận gợi ý chăm sóc hằng ngày phù hợp.',
  },
  {
    value: 'DiseaseRisk',
    label: 'Đánh giá nguy cơ bệnh',
    hint: 'Phân tích dấu hiệu và nguy cơ bệnh tiềm ẩn.',
  },
  {
    value: 'Nutrition',
    label: 'Tư vấn dinh dưỡng',
    hint: 'Gợi ý chế độ ăn theo thể trạng thú cưng.',
  },
];

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const analysisTypeLabels: Record<string, string> = {
  HealthProfile: 'Hồ sơ sức khỏe',
  Recommendation: 'Khuyến nghị chăm sóc',
  DiseaseRisk: 'Đánh giá nguy cơ bệnh',
  Nutrition: 'Tư vấn dinh dưỡng',
};

const routineStatusLabel: Record<string, string> = {
  Completed: 'Đã hoàn thành',
  Overdue: 'Quá hạn',
  DueSoon: 'Sắp đến hạn',
  Upcoming: 'Sắp tới',
};

const routineStatusClass: Record<string, string> = {
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Overdue: 'bg-rose-100 text-rose-700 border-rose-200',
  DueSoon: 'bg-amber-100 text-amber-700 border-amber-200',
  Upcoming: 'bg-slate-100 text-slate-700 border-slate-200',
};

const formatOptionalDate = (value?: string) => {
  if (!value) return 'Chưa có';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Chưa có';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

type RenderBlock =
  | { type: 'section'; title: string }
  | { type: 'bullet'; content: string }
  | { type: 'paragraph'; content: string };

const cleanMarkdown = (value: string) =>
  value.replace(/\*\*/g, '').replace(/`/g, '').trim();

const parseAiBlocks = (content: string): RenderBlock[] => {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const numberedSection = line.match(/^\d+\.\s*\*\*(.+?)\*\*\s*:?$/);
      if (numberedSection) {
        return { type: 'section', title: cleanMarkdown(numberedSection[1]) } as RenderBlock;
      }

      const plainSection = line.match(/^\*\*(.+?)\*\*\s*:?$/);
      if (plainSection) {
        return { type: 'section', title: cleanMarkdown(plainSection[1]) } as RenderBlock;
      }

      if (/^[-*]\s+/.test(line)) {
        return {
          type: 'bullet',
          content: cleanMarkdown(line.replace(/^[-*]\s+/, '')),
        } as RenderBlock;
      }

      return { type: 'paragraph', content: cleanMarkdown(line.replace(/^\d+\.\s+/, '')) } as RenderBlock;
    });
};

export default function AIHealthPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [analysisType, setAnalysisType] = useState<AIAnalysisType>('HealthProfile');
  const [additionalContext, setAdditionalContext] = useState('');

  const [currentResult, setCurrentResult] = useState<AIHealthAnalysisResponse | null>(null);
  const [history, setHistory] = useState<AIHealthAnalysisSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membershipActive, setMembershipActive] = useState(false);
  const [dogRoutine, setDogRoutine] = useState<DogRoutineSchedule | null>(null);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [routineError, setRoutineError] = useState<string | null>(null);

  const hasPaidActiveSubscription = (
    subscription: Awaited<ReturnType<typeof SubscriptionService.getMySubscription>>,
    packagePrice?: number
  ) => {
    if (!subscription?.isActive || subscription.status !== 'Active') return false;
    if (subscription.endDate) {
      const end = new Date(subscription.endDate);
      if (!Number.isNaN(end.getTime()) && end <= new Date()) return false;
    }
    return (packagePrice ?? 0) > 0;
  };

  useEffect(() => {
    const init = async () => {
      if (!isLoggedIn) {
        navigate('/dang-nhap', { state: { from: '/ai-suc-khoe' } });
        return;
      }

      try {
        setError(null);
        const [mySub, packages, myPets] = await Promise.all([
          SubscriptionService.getMySubscription(),
          SubscriptionService.getPackages(),
          PetAPI.getActivePets(),
        ]);

        const currentPackage = packages.find((pkg) => pkg.id === mySub?.subscriptionPackageId);
        setMembershipActive(hasPaidActiveSubscription(mySub, currentPackage?.price));
        setPets(myPets);

        if (myPets.length > 0) {
          setSelectedPetId(myPets[0].id);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Không thể tải dữ liệu AI Health.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedPetId || !membershipActive) {
        setHistory([]);
        return;
      }
      try {
        setHistoryLoading(true);
        const data = await AIHealthService.getHistory(selectedPetId);
        setHistory(data);
        setCurrentResult((current) => {
          if (!current || current.petId !== selectedPetId) {
            return null;
          }

          const stillExists = data.some((item) => item.id === current.id);
          return stillExists ? current : null;
        });
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    void loadHistory();
  }, [selectedPetId, membershipActive]);

  const loadDogRoutine = async (petId: string) => {
    try {
      setRoutineLoading(true);
      setRoutineError(null);
      const data = await healthRecordService.getDogRoutineSchedule(petId);
      setDogRoutine(data);
    } catch (e: unknown) {
      setDogRoutine(null);
      const msg = e instanceof Error ? e.message : 'Không thể tải lịch nhắc tiêm phòng.';
      setRoutineError(msg);
    } finally {
      setRoutineLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedPetId || !membershipActive) {
      setDogRoutine(null);
      setRoutineError(null);
      return;
    }

    void loadDogRoutine(selectedPetId);
  }, [selectedPetId, membershipActive]);

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const selectedType = useMemo(
    () => analysisOptions.find((opt) => opt.value === analysisType),
    [analysisType]
  );

  const parsedResult = useMemo(
    () => (currentResult ? parseAiBlocks(currentResult.aiResponse) : []),
    [currentResult]
  );

  const activePackageName = useMemo(
    () => (membershipActive ? 'Thành viên AI đang hoạt động' : 'Chưa kích hoạt AI'),
    [membershipActive]
  );

  const routineItems = useMemo(() => {
    if (!dogRoutine) return [] as DogRoutineItem[];
    const merged = [...dogRoutine.vaccinations, ...dogRoutine.deworming];
    return merged.sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }, [dogRoutine]);

  const visibleRoutineItems = useMemo(
    () => routineItems.filter((item) => item.category !== 'Vaccination' || item.source === 'vaccinations'),
    [routineItems]
  );

  const hasEstimatedVaccinations = useMemo(
    () => routineItems.some((item) => item.category === 'Vaccination' && item.source !== 'vaccinations'),
    [routineItems]
  );

  const handleSelectHistory = async (analysisId: string) => {
    try {
      setError(null);
      setDetailLoading(true);
      const result = await AIHealthService.getById(analysisId);
      setCurrentResult(result);
      setAnalysisType(result.analysisType as AIAnalysisType);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể tải lại chẩn đoán cũ.';
      setError(msg);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAnalyse = async () => {
    if (!selectedPetId) {
      setError('Vui lòng chọn thú cưng để phân tích.');
      return;
    }

    try {
      setError(null);
      setAnalysing(true);
      const result = await AIHealthService.analyse({
        petId: selectedPetId,
        analysisType,
        additionalContext: additionalContext.trim() || undefined,
      });
      setCurrentResult(result);
      setAdditionalContext('');

      const latestHistory = await AIHealthService.getHistory(selectedPetId);
      setHistory(latestHistory);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể chạy AI phân tích.';
      setError(msg);
    } finally {
      setAnalysing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-9 h-9 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_30%),linear-gradient(180deg,#f4fffd_0%,#ffffff_48%,#f8fafc_100%)] py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-[28px] border border-teal-100/80 bg-white/85 backdrop-blur shadow-[0_18px_60px_rgba(15,118,110,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="p-8 lg:p-10 bg-[linear-gradient(135deg,rgba(13,148,136,0.12),rgba(255,255,255,0.8))]">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                <Sparkles className="w-3.5 h-3.5" />
                AI Health
              </div>

              <div className="mt-5 max-w-2xl">
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900">
                  Phân tích sức khỏe thú cưng bằng AI, trình bày rõ ràng bằng tiếng Việt.
                </h1>
                <p className="mt-4 text-base lg:text-lg text-slate-600 leading-7">
                  Chọn thú cưng, chọn loại phân tích và nhập triệu chứng hoặc bối cảnh bạn đang lo lắng.
                  Hệ thống sẽ trả về bản tóm tắt, rủi ro và khuyến nghị dễ đọc ngay trên trang này.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white px-4 py-3 border border-teal-100 min-w-[180px]">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Trạng thái AI</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{activePackageName}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-teal-100 min-w-[180px]">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Thú cưng hiện có</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{pets.length} hồ sơ khả dụng</p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-10 bg-slate-950 text-white flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                  <HeartPulse className="w-6 h-6 text-teal-300" />
                </div>
                <p className="mt-6 text-sm uppercase tracking-[0.2em] text-teal-200/80">Quy trình</p>
                <div className="mt-4 space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="w-4 h-4 mt-0.5 text-teal-300" />
                    <span>Kiểm tra gói thành viên và quyền sử dụng AI.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Stethoscope className="w-4 h-4 mt-0.5 text-teal-300" />
                    <span>Đọc hồ sơ sức khỏe gần nhất của thú cưng trước khi phân tích.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 mt-0.5 text-teal-300" />
                    <span>Luôn xem đây là gợi ý tham khảo, không thay thế bác sĩ thú y.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr_320px] gap-6 items-start">
          <aside className="xl:sticky xl:top-24 space-y-6">
            <div className="rounded-[24px] bg-white border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Bảng điều khiển AI</h2>
                  <p className="text-sm text-slate-500">Cấu hình đầu vào trước khi chạy</p>
                </div>
              </div>

              {!membershipActive && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm leading-6">
                Tài khoản của bạn chưa có gói thành viên hoạt động để dùng AI.{' '}
                <button
                  className="font-semibold underline"
                  onClick={() => navigate('/membership')}
                >
                  Nâng cấp ngay
                </button>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm flex items-start gap-2 leading-6">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thú cưng</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {pets.length === 0 ? (
                    <option value="">Chưa có thú cưng</option>
                  ) : (
                    pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.petName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Loại phân tích</label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as AIAnalysisType)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {analysisOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 rounded-2xl bg-teal-50 border border-teal-100 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-teal-700/70">Gợi ý</p>
                <p className="mt-2 text-sm text-teal-900 leading-6">{selectedType?.hint}</p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả thêm</label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={4}
                placeholder="Ví dụ: Bé ăn ít 2 ngày gần đây, hay gãi vùng tai..."
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              </div>

              <button
              onClick={handleAnalyse}
              disabled={!membershipActive || !selectedPet || analysing}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_14px_28px_rgba(15,23,42,0.22)]"
            >
              {analysing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Chạy AI phân tích
                </>
              )}
              </button>

              {selectedPet && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hồ sơ đang chọn</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{selectedPet.petName}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Loài</p>
                      <p className="font-medium text-slate-800">{selectedPet.speciesName || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Cân nặng</p>
                      <p className="font-medium text-slate-800">{selectedPet.weight ? `${selectedPet.weight} kg` : 'Chưa có'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-teal-700" />
                  <p className="text-sm font-semibold text-slate-900">Lịch nhắc tiêm phòng và tẩy giun</p>
                </div>

                {!membershipActive ? (
                  <p className="mt-3 text-sm text-slate-500 leading-6">
                    Cần gói thành viên để xem lịch nhắc từ hồ sơ y tế.
                  </p>
                ) : routineLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải lịch nhắc...
                  </div>
                ) : routineError ? (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>{routineError}</span>
                  </div>
                ) : dogRoutine && !dogRoutine.isDog ? (
                  <p className="mt-3 text-sm text-slate-600 leading-6">
                    {dogRoutine.note || 'Hiện tại lịch nhắc mới hỗ trợ chó.'}
                  </p>
                ) : visibleRoutineItems.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500 leading-6">Chưa có mốc lịch nhắc nào cho thú cưng này.</p>
                ) : (
                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {visibleRoutineItems.map((item, idx) => (
                      <div key={`${item.category}-${item.itemName}-${idx}`} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.itemName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.category} • {item.frequency}</p>
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${routineStatusClass[item.status] || routineStatusClass.Upcoming}`}>
                            {routineStatusLabel[item.status] || item.status}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <p>Đến hạn: {formatOptionalDate(item.dueDate)}</p>
                          <p>Đã làm: {formatOptionalDate(item.lastCompletedDate)}</p>
                        </div>

                      </div>
                    ))}

                    {hasEstimatedVaccinations && (
                      <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800">
                        Đang ẩn các mốc vaccine ước tính. Cập nhật lịch sử tiêm thực tế tại{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/thu-cung')}
                          className="font-semibold underline"
                        >
                          Quản lý Thú cưng
                        </button>
                        {' '}để hiển thị đúng dữ liệu đã tiêm.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            {currentResult ? (
              <div className="rounded-[28px] bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 lg:px-8 lg:py-6 border-b border-slate-100 bg-[linear-gradient(135deg,rgba(15,118,110,0.07),rgba(255,255,255,1))]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-teal-700/70">
                        {detailLoading ? 'Đang tải chẩn đoán cũ' : 'Kết quả đang hiển thị'}
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">
                        {analysisTypeLabels[currentResult.analysisType] ?? currentResult.analysisType}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        {currentResult.petName} · {formatDateTime(currentResult.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {detailLoading && (
                        <div className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1.5 text-sm font-medium text-teal-700 inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tải
                        </div>
                      )}
                      {typeof currentResult.confidenceScore === 'number' && (
                        <div className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                          Độ tin cậy {currentResult.confidenceScore}%
                        </div>
                      )}
                      <div className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600">
                        {currentResult.aiModel}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 lg:p-8 space-y-4">
                  {parsedResult.map((block, index) => (
                    <Fragment key={`${block.type}-${index}`}>
                      {block.type === 'section' && (
                        <div className="pt-2 first:pt-0">
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{block.title}</h3>
                        </div>
                      )}
                      {block.type === 'paragraph' && (
                        <p className="text-[15px] leading-7 text-slate-700">{block.content}</p>
                      )}
                      {block.type === 'bullet' && (
                        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                          <ChevronRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                          <p className="text-[15px] leading-7 text-slate-700">{block.content}</p>
                        </div>
                      )}
                    </Fragment>
                  ))}

                  {currentResult.recommendations && (
                    <div className="rounded-[24px] border border-teal-100 bg-[linear-gradient(180deg,rgba(204,251,241,0.55),rgba(255,255,255,1))] p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-teal-700/70">Khuyến nghị nổi bật</p>
                      <p className="mt-3 text-[15px] leading-7 text-teal-950 whitespace-pre-wrap">
                        {cleanMarkdown(currentResult.recommendations)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] bg-white border border-dashed border-slate-300 p-10 text-center shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-teal-100 flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-teal-700" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-900">Chưa có kết quả phân tích</h2>
                <p className="mt-3 max-w-xl mx-auto text-slate-500 leading-7">
                  Chọn thú cưng, nhập triệu chứng hoặc mô tả thêm rồi bấm chạy AI để nhận bản phân tích sức khỏe được trình bày rõ ràng bằng tiếng Việt.
                </p>
              </div>
            )}
          </main>

          <aside className="xl:sticky xl:top-24">
            <div className="rounded-[24px] bg-white border border-slate-200 shadow-sm p-5 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-[0.15em]">Lịch sử phân tích</h2>
              </div>

              {historyLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-slate-500 leading-6">Chưa có lịch sử phân tích cho thú cưng này.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void handleSelectHistory(item.id)}
                      disabled={detailLoading}
                      className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                        currentResult?.id === item.id
                          ? 'border-teal-300 bg-teal-50/70'
                          : 'border-slate-100 bg-slate-50 hover:border-teal-200 hover:bg-white'
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {analysisTypeLabels[item.analysisType] ?? item.analysisType}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.aiModel}</p>
                      <p className="text-xs text-slate-400 mt-2">{formatDateTime(item.createdAt)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
