import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Service } from "../types";
import { createService, deleteService as deleteServiceApi, getServices, updateService as updateServiceApi } from "../services/serviceService";

type ServicesContextValue = {
  services: Service[];
  loading: boolean;
  error: string | null;
  refreshServices: () => Promise<void>;
  addService: (service: Service) => Promise<void>;
  updateService: (id: number, updater: (service: Service) => Service) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
};

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshServices() {
    try {
      setLoading(true);
      setError(null);
      const data = await getServices();
      setServices(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshServices();
  }, []);

  const value = useMemo<ServicesContextValue>(() => ({
    services,
    loading,
    error,
    refreshServices,
    addService: async (service) => {
      try {
        const created = await createService(service as Partial<Service>);
        setServices((prev) => [created, ...prev]);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không thể tạo dịch vụ.");
        throw err;
      }
    },
    updateService: async (id, updater) => {
      const current = services.find((service) => service.id === id);
      if (!current) return;

      try {
        const updated = await updateServiceApi(id, updater(current));
        setServices((prev) => prev.map((service) => (service.id === id ? updated : service)));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không thể cập nhật dịch vụ.");
        throw err;
      }
    },
    deleteService: async (id) => {
      try {
        await deleteServiceApi(id);
        setServices((prev) => prev.filter((service) => service.id !== id));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không thể xóa dịch vụ.");
        throw err;
      }
    },
  }), [error, loading, services]);

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices() {
  const context = useContext(ServicesContext);

  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }

  return context;
}
