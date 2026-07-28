import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";

import AdminLayout from "../components/qcare/AdminLayout";
import PublicLayout from "../components/qcare/PublicLayout";
import { AppointmentsProvider } from "../contexts/AppointmentsContext";
import { AuthProvider } from "../contexts/AuthContext";
import { ServicesProvider } from "../contexts/ServicesContext";
import AdminAppointmentsPanel from "../components/qcare/AdminAppointmentsPanel";
import AdminServicesPage from "../pages/AdminServicesPage";
import BookingPage from "../pages/BookingPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MyAppointmentsPage from "../pages/MyAppointmentsPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import ServiceDetailPage from "../pages/ServiceDetailPage";
import ProtectedRoute from "../routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ServicesProvider>
          <AppointmentsProvider>
            <Toaster position="top-right" richColors />
            <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/my-appointments" element={<MyAppointmentsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminAppointmentsPanel />} />
                <Route path="appointments" element={<Navigate to="/admin" replace />} />
                <Route path="services" element={<AdminServicesPage />} />
              </Route>
            </Route>
            </Routes>
          </AppointmentsProvider>
        </ServicesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

