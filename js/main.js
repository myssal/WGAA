// main.js
import { DATA_REPO, BRANCH, currentRegion } from "./config.js";
import { renderSidebar } from "./sidebar.js";

export let groups = [];
export let details = [];

async function loadConfigs(region) {
  const baseUrl = `https://cdn.jsdelivr.net/gh/${DATA_REPO}@${BRANCH}/${region}/bytes/share/archive`;

  try {
    const [groupRes, detailRes] = await Promise.all([
      fetch(`${baseUrl}/CGGroup.json`),
      fetch(`${baseUrl}/CGDetail.json`)
    ]);

    if (!groupRes.ok || !detailRes.ok) throw new Error("Failed to fetch config files");

    groups = await groupRes.json();
    details = await detailRes.json();

    renderSidebar();
  } catch (err) {
    console.error("❌ Failed to load config:", err);
    document.getElementById("mainContent").innerHTML =
      `<p class="text-red-400 text-center mt-6">Failed to load data for region: ${region}</p>`;
  }
}

/** Event bindings */
document.getElementById("regionSelect").addEventListener("change", e => {
  loadConfigs(e.target.value);
});

document.getElementById("globalSearch").addEventListener("input", () => {
  renderSidebar();
});

/** Initialize */
loadConfigs(currentRegion);

// Sidebar resizing with grab handle
const sidebarContainer = document.getElementById("sidebarContainer");
const sidebarHandle = document.getElementById("sidebarHandle");

let isResizing = false;

sidebarHandle.addEventListener("mousedown", e => {
  isResizing = true;
  document.body.style.cursor = "ew-resize";
  e.preventDefault(); // prevent text selection
});

document.addEventListener("mousemove", e => {
  if (!isResizing) return;
  // Calculate new width in percentage
  let newWidth = (e.clientX / window.innerWidth) * 100;
  newWidth = Math.max(20, Math.min(25, newWidth)); // clamp 20%-25%
  sidebarContainer.style.width = `${newWidth}%`;
});

document.addEventListener("mouseup", () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = "default";
  }
});
