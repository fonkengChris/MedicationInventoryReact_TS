import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MedicationList from "./pages/MedicationList";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import AdminMedicationsPage from "./pages/AdminMedicationsPage";
import AdminMedicationForm from "./pages/AdminMedicationForm";
import AdminServiceUsersPage from "./pages/AdminServiceUsersPage";
import AdminServiceUserForm from "./pages/AdminServiceUserForm";
import AdminActiveMedicationsPage from "./pages/AdminActiveMedicationsPage";
import AdminActiveMedicationForm from "./pages/AdminActiveMedicationForm";
import AdminMedicationUpdatesPage from "./pages/AdminMedicationUpdatesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminAppointmentForm from "./pages/AdminAppointmentForm";
import AdminGroupsPage from "./pages/AdminGroupsPage";
import AdminGroupForm from "./pages/AdminGroupForm";
import AdminUserForm from "./pages/AdminUserForm";
import AppointmentList from "./pages/AppointmentList";
import MedicationDetails from "./pages/MedicationDetails";
import AdminWeeklySummariesPage from "./pages/AdminWeeklySummariesPage";
import AdminMarPage from "./pages/AdminMarPage";
import AdminAdministrationPage from "./pages/AdminAdministrationPage";
import AdminAdministrationSettingsPage from "./pages/AdminAdministrationSettingsPage";
import StockAmendmentPage from "./pages/StockAmendmentPage";
// import { MedicationTrends } from "./pages/AdminMedicationTrends";

// Create a client
const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/medications" element={<MedicationList />} />
            <Route path="/medications/:id" element={<MedicationDetails />} />
            <Route path="/administration" element={<AdminAdministrationPage />} />
          <Route path="/stock-amendment" element={<StockAmendmentPage />} />
          </Route>
          <Route path="admin" element={<AdminPage />}>
            <Route path="medications" element={<AdminMedicationsPage />} />
            <Route path="medications/new" element={<AdminMedicationForm />} />
            <Route
              path="medications/edit/:id"
              element={<AdminMedicationForm />}
            />
            <Route path="service-users" element={<AdminServiceUsersPage />} />
            <Route
              path="service-users/new"
              element={<AdminServiceUserForm />}
            />
            <Route
              path="service-users/edit/:id"
              element={<AdminServiceUserForm />}
            />
            <Route
              path="active-medications"
              element={<AdminActiveMedicationsPage />}
            />
            <Route
              path="active-medications/new"
              element={<AdminActiveMedicationForm />}
            />
            <Route
              path="active-medications/edit/:id"
              element={<AdminActiveMedicationForm />}
            />
            <Route
              path="medication-updates"
              element={<AdminMedicationUpdatesPage />}
            />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/edit/:id" element={<AdminUserForm />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="appointments/new" element={<AdminAppointmentForm />} />
            <Route
              path="appointments/edit/:id"
              element={<AdminAppointmentForm />}
            />
            <Route path="groups" element={<AdminGroupsPage />} />
            <Route path="groups/new" element={<AdminGroupForm />} />
            <Route path="groups/edit/:id" element={<AdminGroupForm />} />
            <Route
              path="weekly-summaries"
              element={<AdminWeeklySummariesPage />}
            />
            <Route path="mar" element={<AdminMarPage />} />
            <Route
              path="administration/settings"
              element={<AdminAdministrationSettingsPage />}
            />
            {/* <Route path="medication-trends" element={<MedicationTrends />} /> */}
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
