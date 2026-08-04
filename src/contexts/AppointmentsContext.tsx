import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "./AuthContext";
import { cancelAppointment as cancelAppointmentApi, getAdminAppointments, getMyAppointments } from "../services/appointmentService";
import type { Appointment } from "../types";

type AppointmentsContextValue = {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refreshAppointments: () => Promise<void>;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updater: (appointment: Appointment) => Appointment) => void;
  cancelAppointment: (id: string, reason: string) => Promise<void>;
};

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, role } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function sortAppointments(list: Appointment[]) {
    return [...list].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const bDate = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return aDate - bDate;
    });
  }

  async function refreshAppointments() {
    if (!isLoggedIn) {
      setAppointments([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = role === "admin" ? await getAdminAppointments() : await getMyAppointments();
      setAppointments(sortAppointments(data));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải lịch hẹn.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAppointments();
  }, [isLoggedIn, role]);

  const value = useMemo<AppointmentsContextValue>(() => ({
    appointments,
    loading,
    error,
    refreshAppointments,
    addAppointment: (appointment) => {
      setAppointments((prev) => sortAppointments([appointment, ...prev]));
    },
    updateAppointment: (id, updater) => {
      setAppointments((prev) => sortAppointments(prev.map((appointment) => (
        appointment.id === id ? updater(appointment) : appointment
      ))));
    },
    cancelAppointment: async (id, reason) => {
      try {
        const updated = await cancelAppointmentApi(id, reason);
        setAppointments((prev) => sortAppointments(prev.map((appointment) => (
          appointment.id === id ? updated : appointment
        ))));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không thể hủy lịch hẹn.");
        throw err;
      }
    },
  }), [appointments, error, loading, refreshAppointments]);

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);

  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }

  return context;
}
