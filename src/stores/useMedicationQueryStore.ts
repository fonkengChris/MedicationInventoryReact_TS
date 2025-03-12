import { create } from "zustand";

export interface MedicationQuery {
  serviceUserId?: string | null;
  medicationName?: string | null;
  prescribedBy?: string | null;
  isActive?: boolean;
  searchText?: string;
  sortBy?: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface MedicationQueryStore {
  medicationQuery: MedicationQuery;
  setServiceUserId: (serviceUserId: string | null) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setIsActive: (isActive: boolean) => void;
  setSearchText: (searchText: string) => void;
  setSortBy: (sortBy: string) => void;
  reset: () => void;
  buildQueryParams: () => Record<string, string>;
}

const useMedicationQueryStore = create<MedicationQueryStore>((set, get) => ({
  medicationQuery: {},

  setServiceUserId: (serviceUserId) =>
    set((store) => ({
      medicationQuery: { ...store.medicationQuery, serviceUserId },
    })),

  setDateRange: (startDate, endDate) =>
    set((store) => ({
      medicationQuery: { ...store.medicationQuery, startDate, endDate },
    })),

  setIsActive: (isActive) =>
    set((store) => ({
      medicationQuery: { ...store.medicationQuery, isActive },
    })),

  setSearchText: (searchText) =>
    set((store) => ({
      medicationQuery: { ...store.medicationQuery, searchText },
    })),

  setSortBy: (sortBy) =>
    set((store) => ({ medicationQuery: { ...store.medicationQuery, sortBy } })),

  reset: () => set({ medicationQuery: {} }),

  buildQueryParams: () => {
    const { medicationQuery } = get();
    const params: Record<string, string> = {};

    if (medicationQuery.serviceUserId)
      params.serviceUserId = medicationQuery.serviceUserId;
    if (medicationQuery.startDate) params.startDate = medicationQuery.startDate;
    if (medicationQuery.endDate) params.endDate = medicationQuery.endDate;
    if (medicationQuery.isActive !== undefined)
      params.isActive = medicationQuery.isActive.toString();
    if (medicationQuery.searchText)
      params.searchText = medicationQuery.searchText;
    if (medicationQuery.sortBy) params.sortBy = medicationQuery.sortBy;

    return params;
  },
}));

export default useMedicationQueryStore;
