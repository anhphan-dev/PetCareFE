import httpClient from './httpClient';

export type AIAnalysisType =
  | 'HealthProfile'
  | 'Recommendation'
  | 'DiseaseRisk'
  | 'Nutrition';

export interface AIHealthAnalysisRequest {
  petId: string;
  analysisType: AIAnalysisType;
  additionalContext?: string;
}

export interface AIHealthAnalysisResponse {
  id: string;
  petId: string;
  petName: string;
  analysisType: string;
  aiResponse: string;
  recommendations?: string | null;
  confidenceScore?: number | null;
  aiModel: string;
  isReviewed: boolean;
  reviewNotes?: string | null;
  createdAt: string;
}

export interface AIHealthAnalysisSummary {
  id: string;
  analysisType: string;
  aiModel: string;
  isReviewed: boolean;
  createdAt: string;
}

type ApiResult<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const unwrap = <T>(response: T | ApiResult<T>): T => {
  if (response && typeof response === 'object' && 'data' in (response as ApiResult<T>)) {
    return ((response as ApiResult<T>).data as T) ?? (response as T);
  }
  return response as T;
};

const AIHealthService = {
  async analyse(payload: AIHealthAnalysisRequest): Promise<AIHealthAnalysisResponse> {
    const response = await httpClient.post<AIHealthAnalysisResponse | ApiResult<AIHealthAnalysisResponse>>(
      '/ai-health/analyse',
      payload
    );
    return unwrap(response);
  },

  async getHistory(petId: string): Promise<AIHealthAnalysisSummary[]> {
    const response = await httpClient.get<AIHealthAnalysisSummary[] | ApiResult<AIHealthAnalysisSummary[]>>(
      `/ai-health/history/${petId}`
    );
    return unwrap(response) ?? [];
  },
};

export default AIHealthService;
