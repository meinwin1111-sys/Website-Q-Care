import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, Clock, LogOut, MapPin, User } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import { CHARCOAL, MINT, SLATE } from "../../data/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { getUserInitials, getUserShortName } from "./shared";

export default function PublicLayout() {
  const { isLoggedIn, loggedInEmail, loggedInName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const userInitials = getUserInitials(loggedInName);
  const userShortName = getUserShortName(loggedInName);
  const isHome = location.pathname === "/" || location.pathname.startsWith("/services/");
  const isAppointments = location.pathname === "/my-appointments";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ backgroundColor: CHARCOAL }} className="py-2 px-8 flex items-center justify-between flex-shrink-0">
        <span style={{ color: MINT }} className="text-xs font-medium tracking-wide">Dịch vụ thú y tại nhà — Tận tâm · Chuyên nghiệp · An toàn</span>
        <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          <span className="flex items-center gap-1.5"><MapPin size={10} />Phục vụ toàn thành phố Đà Nẵng</span>
          <span className="flex items-center gap-1.5"><Clock size={10} />07:00 – 21:00 hàng ngày</span>
        </div>
      </div>

      <header className="bg-white border-b border-black/[0.07] sticky top-0 z-40 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-8 h-[60px] flex items-center justify-between">
          <Link to="/" className="font-bold text-[20px]" style={{ color: CHARCOAL, letterSpacing: "-0.03em" }}>Q Care</Link>
          <nav className="flex items-center gap-8">
            {[{ label: "Trang chủ", to: "/" }, ...(isLoggedIn ? [{ label: "Lịch hẹn", to: "/my-appointments" }] : [])].map((item) => {
              const active = item.to === "/" ? isHome : isAppointments;
              return (
                <Link key={item.label} to={item.to} className="text-sm font-medium relative" style={{ color: active ? CHARCOAL : SLATE }}>
                  {item.label}
                  {active && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full" style={{ backgroundColor: MINT }} />}
                </Link>
              );
            })}
          </nav>
          {!isLoggedIn ? (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all"
              style={{ borderColor: CHARCOAL, color: CHARCOAL, backgroundColor: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CHARCOAL; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = CHARCOAL; }}
            >
              <User size={13} /> Đăng nhập
            </button>
          ) : (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full transition-all"
                style={{ backgroundColor: dropdownOpen ? "#F0F0F0" : "transparent" }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: CHARCOAL, color: MINT }}>{userInitials}</div>
                <span className="text-sm" style={{ color: CHARCOAL }}>Xin chào, <strong>{userShortName}</strong></span>
                <ChevronDown size={12} style={{ color: SLATE, transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 12px 32px rgba(0,0,0,0.14)" }}>
                  <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: CHARCOAL, color: MINT }}>{userInitials}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: CHARCOAL }}>{loggedInName || "Người dùng"}</p>
                      <p className="text-[11px]" style={{ color: SLATE }}>{loggedInEmail || "Khách hàng"}</p>
                    </div>
                  </div>
                  {[
                    { icon: <User size={14} />, label: "Thông tin cá nhân", action: () => navigate("/profile") },
                    { icon: <Calendar size={14} />, label: "Lịch hẹn của tôi", action: () => navigate("/my-appointments") },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                      style={{ color: CHARCOAL }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F7F7")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span style={{ color: SLATE }}>{item.icon}</span>{item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); navigate("/"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left"
                      style={{ color: "#C62828" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFF5F5")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <Outlet />
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
