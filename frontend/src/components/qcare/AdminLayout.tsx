import { Calendar, ChevronRight, LogOut, Scissors } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import { CHARCOAL, MINT, SLATE } from "../../data/mockData";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const sidebarItems = [
    { to: "/admin", icon: <Calendar size={16} />, label: "Lịch hẹn", match: (pathname: string) => pathname === "/admin" },
    { to: "/admin/services", icon: <Scissors size={16} />, label: "Quản lý dịch vụ", match: (pathname: string) => pathname === "/admin/services" },
  ];

  const pageTitles: Record<string, string> = {
    "/admin": "Lịch hẹn",
    "/admin/services": "Quản lý dịch vụ",
  };

  const date = new Date();
  const fmtLong = `${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  const currentTitle = pageTitles[location.pathname] ?? "Admin Panel";

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#F7F7F5" }}>
      <div style={{ width: 240, minHeight: "100vh", backgroundColor: CHARCOAL, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: MINT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: CHARCOAL }}>Q</div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em" }}>Q Care</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin Panel</span>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {sidebarItems.map((item) => {
            const active = item.match(location.pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  marginBottom: 4,
                  textAlign: "left",
                  backgroundColor: active ? MINT : "transparent",
                  color: active ? CHARCOAL : "rgba(255,255,255,0.55)",
                  fontWeight: active ? 700 : 500,
                  fontSize: 13.5,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
                {active && <ChevronRight size={13} style={{ marginLeft: "auto", color: CHARCOAL, opacity: 0.5 }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 64, backgroundColor: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", flexShrink: 0, position: "sticky", top: 0, zIndex: 30 }}>
          <div>
            <p style={{ fontSize: 19, fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.02em" }}>{currentTitle}</p>
            <p style={{ fontSize: 11.5, color: SLATE, marginTop: 1 }}>{fmtLong}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 24, backgroundColor: "#F5F5F5" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: CHARCOAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: MINT }}>AD</span>
              </div>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: CHARCOAL, lineHeight: 1.2 }}>Admin</p>
                <p style={{ fontSize: 10.5, color: SLATE }}>Quản trị viên</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              style={{ height: 38, padding: "0 16px", borderRadius: 12, backgroundColor: "#FFF5F5", border: "1px solid #FFCDD2", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#C62828", fontFamily: "inherit" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFEBEE")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFF5F5")}
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
