export const S = {
  // Layout
  app: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "#F8F9FB",
    color: "#2C3E50",
  },
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "#0F3460",
    borderRight: "1px solid #0D2847",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  main: {
    marginLeft: 220,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    padding: "0 28px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 5,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  content: {
    padding: "28px 28px 48px",
    flex: 1,
  },

  // Cards
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    padding: "20px 22px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  metricCard: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    padding: "18px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },

  // Typography
  h1: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
    letterSpacing: -0.3,
    color: "#0F3460",
  },
  h2: {
    fontSize: 16,
    fontWeight: 600,
    margin: "0 0 16px",
    color: "#2C3E50",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 12,
  },

  // Buttons
  btn: {
    border: "1px solid #E5E7EB",
    background: "#fff",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#4B5563",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  btnPrimary: {
    border: "none",
    background: "#0F3460",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 18px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "all 0.15s",
  },

  // Badge
  badge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background:
      type === "authorized" ? "#D1FAE5"
      : type === "unauthorized" ? "#FEE2E2"
      : "#FEF3C7",
    color:
      type === "authorized" ? "#059669"
      : type === "unauthorized" ? "#991B1B"
      : "#92400E",
  }),

  // Nav item
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 16px",
    borderRadius: 8,
    margin: "2px 8px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    color: active ? "#fff" : "#CBD5E1",
    transition: "all 0.15s",
    border: "none",
    width: "calc(100% - 16px)",
    textAlign: "left",
  }),

  // Table
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 12px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    borderBottom: "1px solid #E5E7EB",
    background: "#F9FAFB",
  },
  td: {
    padding: "11px 12px",
    borderBottom: "1px solid #E5E7EB",
    color: "#2C3E50",
  },

  // Progress bar
  barBg: {
    height: 6,
    borderRadius: 3,
    background: "#E5E7EB",
    overflow: "hidden",
    margin: "6px 0",
  },
};