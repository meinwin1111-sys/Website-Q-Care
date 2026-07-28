import type { Appointment } from "../types";
import api from "./api";

export type AppointmentCreatePayload = {
  serviceId: number;
  petId: number;
  date: string;
  slotId: number;
  address: string;
  vetName?: string;
};

function mapApiAppointmentToAppointment(raw: any): Appointment {
  const petType = raw.petType || "other";
  const petDisplay = raw.petDisplay || (petType === "other" ? "Khác" : petType);
  const petEmoji = raw.petEmoji || "🐾";

  return {
    id: raw.id,
    service: raw.service || raw.serviceName || "",
    pet: raw.petName || raw.pet || "",
    petType,
    petDisplay,
    petEmoji,
    date: raw.date,
    time: raw.time,
    status: raw.status === "cancelled" ? "cancelled" : "success",
    price: Number(raw.price ?? 0),
    address: raw.address || "",
    vet: raw.customerName || raw.vet || "",
  };
}

export async function createAppointment(payload: AppointmentCreatePayload) {
  const { data } = await api.post<any>("/appointments", payload);
  return mapApiAppointmentToAppointment(data);
}

export async function getMyAppointments() {
  const { data } = await api.get<any[]>("/appointments/my-appointments");
  return (data ?? []).map(mapApiAppointmentToAppointment);
}

export async function getAdminAppointments() {
  const { data } = await api.get<any[]>("/appointments/admin");
  return (data ?? []).map(mapApiAppointmentToAppointment);
}

export async function cancelAppointment(id: string, reason: string) {
  const { data } = await api.put<any>(`/appointments/${id}/cancel`, { cancelReason: reason });
  return mapApiAppointmentToAppointment(data);
}
