// services/weeklySummariesApi.ts
import { api } from "./api";

export interface TrendAnalysis {
  stockTrend: {
    direction: "increasing" | "decreasing";
    percentage: number;
    average: number;
  } | null;
  usageTrend: {
    direction: "increasing" | "decreasing";
    percentage: number;
    average: number;
  } | null;
  anomalies: Array<{
    type: string;
    week: string;
    value: number;
    message: string;
    expected?: number;
    previous?: number;
  }>;
}

export interface WeeklySummary {
  _id: string;
  startDate: string;
  endDate: string;
  summaries: Array<{
    _id: string;
    serviceUser: {
      _id: string;
      name: string;
      nhsNumber: string;
    };
    medication: {
      _id: string;
      name: string;
      dosage: {
        amount: number;
        unit: string;
      };
    };
    totals: {
      initialStock: number;
      fromPharmacy: number;
      quantityAdministered: number;
      leavingHome: number;
      returningHome: number;
      returnedToPharmacy: number;
      lost: number;
      damaged: number;
      other: number;
      currentStock: number;
    };
    daysRemaining: number;
    changes: Array<{
      _id: string;
      type: string;
      quantity: number;
      note?: string;
      timestamp: string;
      updatedBy: {
        _id: string;
        username: string;
        email: string;
      };
    }>;
  }>;
  createdAt: string;
}

export const weeklySummariesApi = {
  // Get summaries for a date range
  getAll: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<WeeklySummary[]>("/weekly-summaries", {
      params,
    });
    return response.data;
  },

  // Generate a new summary
  generate: async () => {
    const response = await api.post<WeeklySummary>(
      "/weekly-summaries/generate"
    );
    return response.data;
  },

  // Download PDF
  downloadPdf: async (summaryId: string) => {
    const response = await api.get(`/weekly-summaries/${summaryId}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Get trend analysis
  getTrends: async (medicationId: string, weeks?: number) => {
    const response = await api.get<TrendAnalysis>(
      `/weekly-summaries/medication/${medicationId}/trends`,
      {
        params: { weeks },
      }
    );
    return response.data;
  },

  // Get anomalies
  getAnomalies: async (medicationId: string) => {
    const response = await api.get<TrendAnalysis["anomalies"]>(
      `/weekly-summaries/medication/${medicationId}/anomalies`
    );
    return response.data;
  },
};
