import { ChevronRight, Clock, Plus, Search, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { CATEGORIES, CHARCOAL, MINT, SLATE, VET_NAME } from "../../data/mockData";
import { useServices } from "../../contexts/ServicesContext";
import type { Service } from "../../types";
import { fmtPrice } from "./shared";

export default function ServicesBrowser({
  initialService,
  navigateOnSelect,
}: {
  initialService?: Service;
  navigateOnSelect?: boolean;
}) {
  const navigate = useNavigate();
  const { services } = useServices();
  const [activeCat, setActiveCat] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [selectedSvcId, setSelectedSvcId] = useState(initialService?.id ?? services[0]?.id ?? 0);

  const filteredSvcs = useMemo(() => services.filter((service) => {
    const matchCategory = activeCat === "all" || service.category === activeCat;
    const query = searchQ.toLowerCase();
    const matchQuery = service.title.toLowerCase().includes(query) || service.subtitle.toLowerCase().includes(query);
    return matchCategory && matchQuery;
  }), [services, activeCat, searchQ]);

  const selectedSvc = useMemo(() => {
    return services.find((service) => service.id === selectedSvcId) ?? filteredSvcs[0] ?? services[0];
  }, [services, filteredSvcs, selectedSvcId]);

  if (!selectedSvc) {
    return null;
  }

  const catLabel = CATEGORIES.find((category) => category.id === selectedSvc.category)?.label ?? "Dịch vụ";

  return (
    <div className="flex-1 max-w-[1400px] mx-auto w-full px-8 py-6 flex gap-5 overflow-hidden" style={{ height: "calc(100vh - 100px)" }}>
      <div className="flex flex-col gap-4" style={{ width: "35%", minWidth: 0 }}>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: SLATE }} />
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ backgroundColor: "#EBEBEB", border: "1.5px solid transparent", color: CHARCOAL }}
            onFocus={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = MINT; }}
            onBlur={(e) => { e.currentTarget.style.backgroundColor = "#EBEBEB"; e.currentTarget.style.borderColor = "transparent"; }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ backgroundColor: activeCat === cat.id ? CHARCOAL : "#EBEBEB", color: activeCat === cat.id ? "#fff" : SLATE }}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2.5" style={{ scrollbarWidth: "none" }}>
          {filteredSvcs.map((svc) => {
            const active = svc.id === selectedSvc.id;
            return (
              <div
                key={svc.id}
                onClick={() => {
                  setSelectedSvcId(svc.id);
                  if (navigateOnSelect) navigate(`/services/${svc.id}`);
                }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ backgroundColor: "#fff", border: `1.5px solid ${active ? MINT : "transparent"}`, boxShadow: active ? "0 0 0 4px rgba(163,228,215,0.2),0 2px 8px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: "#F0F0EE" }}>
                  <img src={svc.image} alt={svc.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[13.5px] font-semibold truncate" style={{ color: CHARCOAL }}>{svc.title}</h3>
                    {active && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: MINT }} />}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: SLATE }}>{svc.subtitle}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm font-bold" style={{ color: CHARCOAL }}>{fmtPrice(svc.price)}</span>
                    <span className="text-[11px]" style={{ color: SLATE }}>{svc.duration}</span>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: active ? MINT : "#D0D0D0", flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col rounded-2xl overflow-hidden" style={{ width: "65%", backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 260, backgroundColor: "#F0F0EE" }}>
          <img src={selectedSvc.image} alt={selectedSvc.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(20,20,20,0.72) 0%,rgba(20,20,20,0.08) 55%,transparent 100%)" }} />
          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: MINT, color: CHARCOAL }}>{catLabel}</span>
            </div>
            <h1 className="text-white text-[26px] font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>{selectedSvc.title}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>{selectedSvc.subtitle}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "none" }}>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#555" }}>{selectedSvc.description}</p>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: SLATE }}>Bảng giá chi tiết</h2>
              {selectedSvc.priceBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid #F0F0EE" }}>
                  <span className="text-sm" style={{ color: "#555" }}>{item.label}</span>
                  <span className="text-sm font-semibold" style={{ color: CHARCOAL }}>{fmtPrice(item.price)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm font-bold" style={{ color: CHARCOAL }}>Tổng cộng</span>
                <span className="text-base font-extrabold" style={{ color: CHARCOAL }}>{fmtPrice(selectedSvc.price)}</span>
              </div>
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: SLATE }}>Thông tin dịch vụ</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${MINT}25` }}><Clock size={14} style={{ color: CHARCOAL }} /></div>
                <div><p className="text-[11px]" style={{ color: SLATE }}>Thời gian thực hiện</p><p className="text-sm font-semibold" style={{ color: CHARCOAL }}>{selectedSvc.duration}</p></div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${MINT}25` }}><Stethoscope size={14} style={{ color: CHARCOAL }} /></div>
                <div><p className="text-[11px]" style={{ color: SLATE }}>Bác sĩ phụ trách</p><p className="text-sm font-semibold" style={{ color: CHARCOAL }}>{VET_NAME}</p></div>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${MINT}15`, border: `1px solid ${MINT}50` }}>
                <p className="text-xs font-semibold" style={{ color: CHARCOAL }}>Tận nhà · Không phụ phí ẩn</p>
                <p className="text-[11px] mt-0.5" style={{ color: SLATE }}>Nhân viên đến đúng giờ, thanh toán sau dịch vụ</p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: SLATE }}>Quy trình thực hiện</h2>
            {selectedSvc.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: CHARCOAL }}>
                    <span className="text-[11px] font-bold" style={{ color: MINT }}>{step.step}</span>
                  </div>
                  {index < selectedSvc.steps.length - 1 && <div className="w-px my-1" style={{ backgroundColor: "#E0E0E0", minHeight: 18 }} />}
                </div>
                <div className="pb-4"><p className="text-[13.5px] font-semibold" style={{ color: CHARCOAL }}>{step.title}</p><p className="text-xs mt-0.5" style={{ color: SLATE }}>{step.desc}</p></div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/booking?serviceId=${selectedSvc.id}`)}
            className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{ backgroundColor: MINT, color: CHARCOAL }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#7DD8C6"; e.currentTarget.style.boxShadow = `0 8px 24px ${MINT}60`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = MINT; e.currentTarget.style.boxShadow = "none"; }}
          >
            <Plus size={17} strokeWidth={2.5} /> Đặt lịch dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
}
