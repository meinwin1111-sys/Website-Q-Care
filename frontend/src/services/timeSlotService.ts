import api from "./api";

export type TimeSlotGroup = {
  label: string;
  slots: Array<{ id: number; time: string }>;
  times?: Array<{ id: number; time: string }>;
};

export type TimeSlotResponse = {
  grouped: TimeSlotGroup[];
  slots: Array<{ slotId: number; period: string; time: string }>;
};

export async function getTimeSlots() {
  const { data } = await api.get<TimeSlotResponse>("/time-slots");
  return data;
}
