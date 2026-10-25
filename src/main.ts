import type {
  Check,
  ChecksMonitorData,
  MonitorStats,
  WireMessage,
} from "./types";

const title = document.getElementById("title") as HTMLElement;
const monitor = document.getElementById("monitor") as HTMLElement;
const apiStatus = document.getElementById("api-status") as HTMLElement;
const uptimeStatus = document.getElementById("uptime-status") as HTMLElement;
const monitorData = document.getElementById("monitor-data") as HTMLElement;
let apiUrl: string;
let monitorID: string;

let monitorCell: HTMLElement[] = [];
let checks: Check[] = [];
let monitorStats: MonitorStats;

async function mainApp() {
  apiUrl = import.meta.env.VITE_API_URL;
  monitorID = import.meta.env.VITE_MONITOR_ID;
  createGrid();
  await refreshData();
}

function renderGrid() {
  for (let i = 0; i < 50; i++) {
    if (checks[49 - i]) {
      assignCellStatus(checks[49 - i], monitorCell[i]);
    }
  }
  updateStatusDescription(checks[0], monitorStats);
}

function updateStatusDescription(check: Check, monitorStats: MonitorStats) {
  monitorData.textContent = `${monitorStats.uptime_percentage.toFixed(1)}% Uptime | ${monitorStats.avg_response_time.toFixed(1)}ms Average`;
  if (check.status_code == 0 || check.status_code >= 400) {
    uptimeStatus.textContent = "sadly, systems currently down(for now)";
    apiStatus.textContent = "Major Outage";
    apiStatus.dataset.status = "major";
    return;
  }
  if (check.response_time > 1000) {
    uptimeStatus.innerHTML = "Systems is Operational, but <i>slower</i>";
    apiStatus.textContent = "Partial Outage";
    apiStatus.dataset.status = "partial";
    return;
  }
  uptimeStatus.textContent = "Systems is Operational";
  apiStatus.textContent = "Operational";
  apiStatus.dataset.status = "up";
}

async function refreshData() {
  while (true) {
    await getChecksMonitorData();
    renderGrid();
    await new Promise((r) => setTimeout(r, 60000));
  }
}

async function getChecksMonitorData() {
  try {
    const res = await fetch(
      `${apiUrl}/api/v1/public/monitors/${monitorID}/status`,
    );
    if (!res.ok) {
      throw new Error(`failed to fetch checks monitor data`);
    }
    const payload: WireMessage<ChecksMonitorData> = await res.json();
    checks = payload.data.checks;
    monitorStats = payload.data.monitor_stats;
  } catch {
    uptimeStatus.textContent = "something bad happen, watchout";
    apiStatus.textContent = "???";
  }
}

// fetch
// create grid -> assign each cell with check
// create a validation for each loop
// create refreshGrid
function createGrid() {
  for (let i = 0; i < 50; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    monitorCell[i] = cell;
    monitor.append(cell);
  }
}

function assignCellStatus(check: Check, cell: HTMLElement) {
  cell.title = `Status Code: ${check.status_code}
Response Time: ${check.response_time}ms`;
  if (check.status_code == 0 || check.status_code >= 400) {
    cell.dataset.status = "major";
    return;
  }
  if (check.response_time > 1000) {
    cell.dataset.status = "partial";
    return;
  }
  cell.dataset.status = "up";
}

title.addEventListener("click", () => {
  window.location.href = "https://battleship-clone.xyz";
});

mainApp();
