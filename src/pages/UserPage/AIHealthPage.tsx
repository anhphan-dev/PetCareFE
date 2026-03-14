import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Brain, History, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PetAPI, { Pet } from '../../services/PetAPI';
import AIHealthService, {
  AIAnalysisType,
  AIHealthAnalysisResponse,
  AIHealthAnalysisSummary,
} from '../../services/AIHealthService';
import SubscriptionService from '../../services/SubscriptionService';

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
  const [error, setError] = useState<string | null>(null);
  const [membershipActive, setMembershipActive] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isLoggedIn) {
        navigate('/dang-nhap', { state: { from: '/ai-suc-khoe' } });
        return;
      }

      try {
        setError(null);
        const [mySub, myPets] = await Promise.all([
          SubscriptionService.getMySubscription(),
          PetAPI.getActivePets(),
        ]);

        setMembershipActive(!!mySub?.isActive);
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
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    void loadHistory();
  }, [selectedPetId, membershipActive]);

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const selectedType = useMemo(
    () => analysisOptions.find((opt) => opt.value === analysisType),
    [analysisType]
  );

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
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
                <p className="text-sm text-gray-500">Phân tích sức khỏe thú cưng bằng AI</p>
              </div>
            </div>

            {!membershipActive && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
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
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thú cưng</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại phân tích</label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as AIAnalysisType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {analysisOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-500">{selectedType?.hint}</p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm (tùy chọn)</label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={4}
                placeholder="Ví dụ: Bé ăn ít 2 ngày gần đây, hay gãi vùng tai..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={handleAnalyse}
              disabled={!membershipActive || !selectedPet || analysing}
              className="mt-5 inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
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
          </div>

          {currentResult && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Kết quả mới nhất</h2>
              <p className="text-sm text-gray-500 mb-4">
                {currentResult.petName} · {currentResult.analysisType} · {formatDateTime(currentResult.createdAt)}
              </p>

              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {currentResult.aiResponse}
              </div>

              {currentResult.recommendations && (
                <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                  <h3 className="text-sm font-semibold text-teal-800 mb-1">Khuyến nghị</h3>
                  <p className="text-sm text-teal-700 whitespace-pre-wrap">{currentResult.recommendations}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-gray-900">Lịch sử phân tích</h2>
          </div>

          {historyLoading ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có lịch sử phân tích cho thú cưng này.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800">{item.analysisType}</p>
                  <p className="text-xs text-gray-500">{item.aiModel}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(item.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
