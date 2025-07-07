import axios from "axios";
import {
  User,
  Medication,
  ServiceUser,
  ActiveMedication,
  MedicationUpdate,
  DateRangeFilter,
  Appointment,
  Group,
  WeeklySummary,
} from "../types/models";

const API_BASE_URL = "http://localhost:5000/api"; // Make sure this matches your backend URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const medicationApi = {
  getAll: (params?: { serviceUserId?: string }) =>
    api.get<Medication[]>("/medications", { params }),
  getById: (id: string) => api.get<Medication>(`/medications/${id}`),
  create: (medication: Omit<Medication, "_id">) =>
    api.post<Medication>("/medications", medication),
  update: (id: string, medication: Partial<Medication>) =>
    api.put<Medication>(`/medications/${id}`, medication),
  delete: (id: string) => api.delete(`/medications/${id}`),
};

export const authApi = {
  auth: (credentials: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth", credentials),
  register: (userData: Omit<User, "_id" | "role">) =>
    api.post<{ token: string; user: User }>("/users/register", userData),
};

export const serviceUserApi = {
  getAll: () => api.get<ServiceUser[]>("/service-users"),
  getById: (id: string) => api.get<ServiceUser>(`/service-users/${id}`),
  create: (serviceUser: Omit<ServiceUser, "_id">) =>
    api.post<ServiceUser>("/service-users", serviceUser),
  update: (id: string, serviceUser: Partial<ServiceUser>) =>
    api.put<ServiceUser>(`/service-users/${id}`, serviceUser),
  delete: (id: string) => api.delete(`/service-users/${id}`),
};

export const activeMedicationApi = {
  getAll: () => api.get<ActiveMedication[]>("/active-medications"),
  getById: (id: string) =>
    api.get<ActiveMedication>(`/active-medications/${id}`),
  create: (activeMedication: Omit<ActiveMedication, "_id">) =>
    api.post<ActiveMedication>("/active-medications", activeMedication),
  update: (id: string, activeMedication: Partial<ActiveMedication>) =>
    api.put<ActiveMedication>(`/active-medications/${id}`, activeMedication),
  delete: (id: string) => api.delete(`/active-medications/${id}`),
  patch: (id: string, activeMedication: Partial<ActiveMedication>) =>
    api.patch<ActiveMedication>(`/active-medications/${id}`, activeMedication),
  deactivate: (id: string) =>
    api.put(
      `/active-medications/${id}/deactivate`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ),
};

export const medicationUpdateApi = {
  getAll: () => api.get<MedicationUpdate[]>("/updates"),
  getByMedication: (medicationId: string) =>
    api.get<MedicationUpdate[]>(`/updates/medication/${medicationId}`),
  getByUser: (userId: string) =>
    api.get<MedicationUpdate[]>(`/updates/user/${userId}`),
  getByDateRange: (filter: DateRangeFilter) =>
    api.get<MedicationUpdate[]>("/updates/date-range", { params: filter }),
  delete: (id: string) => api.delete(`/updates/${id}`),
  create: (update: Omit<MedicationUpdate, "_id">) =>
    api.post<MedicationUpdate>("/updates", update),
};

export const userApi = {
  getAll: () => api.get<User[]>("/users"),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  getCurrentUser: () => api.get<User>("/auth/me"),
  update: (id: string, user: Partial<User>) =>
    api.put<User>(`/users/${id}`, user),
  delete: (id: string) => api.delete(`/users/${id}`),
  updateFcmToken: (token: string) => api.post("/users/fcm-token", { token }),
};

export const appointmentApi = {
  getAll: () => api.get<Appointment[]>("/appointments"),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (appointment: Omit<Appointment, "_id">) =>
    api.post<Appointment>("/appointments", appointment),
  update: (id: string, appointment: Partial<Appointment>) =>
    api.put<Appointment>(`/appointments/${id}`, appointment),
  delete: (id: string) => api.delete(`/appointments/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put<Appointment>(`/appointments/${id}/status`, { status }),
};

export const groupApi = {
  getAll: () => api.get<Group[]>("/groups"),
  getById: (id: string) => api.get<Group>(`/groups/${id}`),
  create: (group: Omit<Group, "_id">) => api.post<Group>("/groups", group),
  update: (id: string, group: Partial<Group>) =>
    api.put<Group>(`/groups/${id}`, group),
  delete: (id: string) => api.delete(`/groups/${id}`),
};

export const weeklySummariesApi = {
  getAll: async (params?: { startDate?: string; endDate?: string }) => {
    console.log("Fetching weekly summaries with params:", params);
    const response = await api.get<WeeklySummary>("/summaries/date-range", {
      params,
    });
    console.log("Weekly summaries response:", response.data);
    return response;
  },
  generate: async (params: { startDate: string; endDate: string }) => {
    console.log("Generating weekly summary");
    const response = await api.post<WeeklySummary>(
      "/summaries/generate",
      params
    );
    console.log("Generate summary response:", response.data);
    return response;
  },
  downloadPdf: (summaryId: string) =>
    api.get(`/summaries/${summaryId}/pdf`, { responseType: "blob" }),
  getByMedication: (
    medicationId: string,
    params: { startDate: string; endDate: string }
  ) =>
    api.get<WeeklySummary["summaries"][0]>(
      `/summaries/medication/${medicationId}`,
      { params }
    ),
  getByServiceUser: (
    serviceUserId: string,
    params: { startDate: string; endDate: string }
  ) =>
    api.get<WeeklySummary["summaries"]>(
      `/summaries/service-user/${serviceUserId}`,
      { params }
    ),
};
