const DAY_MS = 24 * 60 * 60 * 1000;

export const VENUES = [
  { id: "A", name: "Main Gate", camera: "CAM-01", location: "Block A", authorized: 312, unauthorized: 18, unknown: 7 },
  { id: "B", name: "Library", camera: "CAM-02", location: "Block B", authorized: 189, unauthorized: 9, unknown: 4 },
  { id: "C", name: "Lab Block", camera: "CAM-03", location: "Block C", authorized: 254, unauthorized: 22, unknown: 11 },
  { id: "D", name: "Cafeteria", camera: "CAM-04", location: "Block D", authorized: 421, unauthorized: 31, unknown: 8 },
];

export const NAMES = [
  "Afeef M", "Rahul K", "Priya S", "Mohammed A", "Divya R", "Karthik B",
  "Sneha T", "Arjun N", "Lakshmi P", "Vishnu C", "Meera J", "Arun V",
];

export const ROLL_PREFIXES = ["21CS", "22EC", "20ME", "23CE", "21IT", "22EE"];

export const HOURLY_BASE = [12, 8, 5, 3, 2, 4, 15, 42, 68, 75, 82, 78, 71, 65, 58, 55, 60, 72, 68, 55, 40, 30, 22, 15];
export const DAY_WEIGHTS = [0.52, 0.18, 0.1, 0.08, 0.05, 0.04, 0.03];

function weightedPick(weights) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  let threshold = Math.random() * total;

  for (let index = 0; index < weights.length; index += 1) {
    threshold -= weights[index];
    if (threshold <= 0) return index;
  }

  return weights.length - 1;
}

function getPersonKey(log) {
  return log.roll === "UNKNOWN" ? `unknown-${log.id}` : log.roll;
}

function formatDisplayTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildTimestamp() {
  const now = new Date();
  const dayOffset = weightedPick(DAY_WEIGHTS);
  const hour = weightedPick(HOURLY_BASE);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  const timestamp = new Date(now);
  timestamp.setDate(now.getDate() - dayOffset);
  timestamp.setHours(hour, minute, second, 0);

  if (timestamp.getTime() > now.getTime()) {
    timestamp.setDate(timestamp.getDate() - 1);
  }

  return timestamp.getTime();
}

function createLog(id, timestamp = buildTimestamp()) {
  const venue = VENUES[Math.floor(Math.random() * VENUES.length)];
  const type = Math.random() < 0.84 ? "authorized" : Math.random() < 0.62 ? "unauthorized" : "unknown";

  return {
    id,
    roll: type === "unknown" ? "UNKNOWN" : genRoll(),
    name: type === "unknown" ? "Unknown" : NAMES[Math.floor(Math.random() * NAMES.length)],
    venue: venue.name,
    camera: venue.camera,
    confidence: type === "unknown"
      ? (Math.random() * 0.3 + 0.18).toFixed(2)
      : (Math.random() * 0.16 + 0.81).toFixed(2),
    type,
    time: formatDisplayTime(timestamp),
    ts: timestamp,
  };
}

export function genRoll() {
  return ROLL_PREFIXES[Math.floor(Math.random() * ROLL_PREFIXES.length)] +
    String(Math.floor(Math.random() * 90 + 10)).padStart(3, "0");
}

export function genLogs(count = 180) {
  const logs = Array.from({ length: count }, (_, index) => createLog(count - index));
  return logs.sort((a, b) => b.ts - a.ts);
}

export function genNewLog() {
  return createLog(Date.now(), Date.now());
}

export function getLogsWithinHours(logs, hours = 24) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return logs.filter((log) => log.ts >= cutoff);
}

export function buildHourlyStats(logs, hours = 24) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
    total: 0,
    people: 0,
    authorized: 0,
    unauthorized: 0,
    unknown: 0,
    uniqueKeys: new Set(),
  }));

  getLogsWithinHours(logs, hours).forEach((log) => {
    const bucket = buckets[new Date(log.ts).getHours()];
    bucket.total += 1;
    bucket[log.type] += 1;
    bucket.uniqueKeys.add(getPersonKey(log));
  });

  return buckets.map(({ uniqueKeys, ...bucket }) => ({
    ...bucket,
    people: uniqueKeys.size,
  }));
}

export function buildVenueStats(logs, hours = 24) {
  const recentLogs = getLogsWithinHours(logs, hours);

  return VENUES.map((venue) => {
    const venueLogs = recentLogs.filter((log) => log.venue === venue.name);
    const authorized = venueLogs.filter((log) => log.type === "authorized").length;
    const unauthorized = venueLogs.filter((log) => log.type === "unauthorized").length;
    const unknown = venueLogs.filter((log) => log.type === "unknown").length;
    const uniquePeople = new Set(venueLogs.map(getPersonKey)).size;

    return {
      ...venue,
      total: venueLogs.length,
      authorized,
      unauthorized,
      unknown,
      people: uniquePeople,
    };
  });
}

export function buildDailyStats(logs, days = 7) {
  const today = new Date();
  const buckets = Array.from({ length: days }, (_, offset) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (days - offset - 1));

    return {
      dateKey: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      authorized: 0,
      unauthorized: 0,
      total: 0,
    };
  });

  const byDate = new Map(buckets.map((bucket) => [bucket.dateKey, bucket]));

  logs.forEach((log) => {
    const dateKey = new Date(log.ts).toISOString().slice(0, 10);
    const bucket = byDate.get(dateKey);
    if (!bucket) return;
    bucket.total += 1;
    if (log.type !== "unknown") {
      bucket[log.type] += 1;
    }
  });

  return buckets;
}

export function buildSummary(logs, hours = 24) {
  const recentLogs = getLogsWithinHours(logs, hours);
  const hourlyStats = buildHourlyStats(logs, hours);
  const peakHour = hourlyStats.reduce((best, hour) => (hour.total > best.total ? hour : best), hourlyStats[0]);

  const total = recentLogs.length;
  const authorized = recentLogs.filter((log) => log.type === "authorized").length;
  const unauthorized = recentLogs.filter((log) => log.type === "unauthorized").length;
  const unknown = recentLogs.filter((log) => log.type === "unknown").length;
  const people = new Set(recentLogs.map(getPersonKey)).size;

  return {
    total,
    people,
    authorized,
    unauthorized,
    unknown,
    peakHour,
  };
}

export function formatFullDate(timestamp) {
  return new Date(timestamp).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getHourWindowLabel(hour) {
  const start = `${String(hour).padStart(2, "0")}:00`;
  const end = `${String((hour + 1) % 24).padStart(2, "0")}:00`;
  return `${start} - ${end}`;
}

export function getTrafficChange(logs) {
  const now = Date.now();
  const recentCutoff = now - 12 * 60 * 60 * 1000;
  const previousCutoff = now - 24 * 60 * 60 * 1000;
  const recent = logs.filter((log) => log.ts >= recentCutoff).length;
  const previous = logs.filter((log) => log.ts >= previousCutoff && log.ts < recentCutoff).length;

  if (previous === 0) return 100;
  return Math.round(((recent - previous) / previous) * 100);
}

export function getRetentionWindow(logs) {
  if (!logs.length) return "No records";

  const oldest = logs[logs.length - 1].ts;
  const totalDays = Math.max(1, Math.ceil((Date.now() - oldest) / DAY_MS));
  return `${totalDays} day${totalDays > 1 ? "s" : ""} of history`;
}
