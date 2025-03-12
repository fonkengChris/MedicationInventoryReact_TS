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
import { messaging, getToken } from "./firebase";
import { userApi } from "./services/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onMessage } from "firebase/messaging";
import AppointmentList from "./pages/AppointmentList";
import MedicationDetails from "./pages/MedicationDetails";

// Create a client
const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const auth = getAuth();

    const requestPermissionAndFetchToken = async () => {
      try {
        if (!auth.currentUser) {
          console.log("User not authenticated. Skipping FCM token request.");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey:
              "BPVvL_REPLACE_WITH_YOUR_ACTUAL_VAPID_KEY_FROM_FIREBASE_CONSOLE",
            serviceWorkerRegistration:
              await navigator.serviceWorker.getRegistration(
                "/firebase-messaging-sw.js"
              ),
          });
          if (token) {
            console.log("Development FCM Token:", token);
            await userApi.updateFcmToken(token);
          }
        } else {
          console.error("Notification permission not granted");
        }
      } catch (error) {
        console.error("Error fetching FCM token:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        requestPermissionAndFetchToken();
      }
    });

    // Set up foreground message handler
    const onMessageUnsubscribe = onMessage(messaging, (payload) => {
      console.log("Received foreground message:", payload);

      // Show notification even when app is in foreground
      if (payload.notification) {
        new Notification(payload.notification.title || "New Message", {
          body: payload.notification.body,
          icon: "/firebase-logo.png",
        });
      }
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Running in development mode");
    }

    return () => {
      unsubscribe();
      onMessageUnsubscribe();
    };
  }, []);

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
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
