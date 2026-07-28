import { Navigate, useParams } from "react-router";

import ServicesBrowser from "../components/qcare/ServicesBrowser";
import { useServices } from "../contexts/ServicesContext";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { services, loading } = useServices();
  const service = services.find((item) => item.id === Number(id));

  if (loading) {
    return <div className="flex-1 flex items-center justify-center" style={{ color: "#666" }}>Đang tải dịch vụ...</div>;
  }

  if (!service) {
    return <Navigate to="/" replace />;
  }

  return <ServicesBrowser initialService={service} navigateOnSelect />;
}
