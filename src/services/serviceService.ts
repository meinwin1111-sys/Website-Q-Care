import type { CategoryOption, Service } from "../types";
import api from "./api";

export async function getServices() {
  const { data } = await api.get<Service[]>("/services");
  return data;
}

export async function getServiceDetail(id: number | string) {
  const { data } = await api.get<Service>(`/services/${id}`);
  return data;
}

export async function getCategories() {
  const { data } = await api.get<CategoryOption[]>("/categories");
  return data;
}

export async function createService(payload: Partial<Service>) {
  const { data } = await api.post<Service>("/services", payload);
  return data;
}

export async function updateService(id: number | string, payload: Partial<Service>) {
  const { data } = await api.put<Service>(`/services/${id}`, payload);
  return data;
}

export async function deleteService(id: number | string) {
  await api.delete(`/services/${id}`);
}
