export const ICONS = {
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  building: "M3 21h18 M6 21V7l6-4 6 4v14 M9 10h.01 M9 13h.01 M9 16h.01 M15 10h.01 M15 13h.01 M15 16h.01",
  calendar: "M8 2v4 M16 2v4 M3 10h18 M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  camera: "M23 7l-7 5 7 5V7z M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1z",
  clock: "M12 6v6l4 2 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  filter: "M22 3H2l8 9v6l4 3v-9l8-9z",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  search: "M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M21 21l-4.35-4.35",
  server: "M4 6h16 M4 12h16 M4 18h16 M6 6v12 M18 6v12",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  spark: "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
  trend: "M3 17l6-6 4 4 8-8 M14 7h7v7",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wave: "M2 12c2 0 2-6 4-6s2 12 4 12 2-8 4-8 2 6 4 6 2-4 4-4",
};

export default function Icon({ d, size = 16, color = "currentColor", strokeWidth = 1.7 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
