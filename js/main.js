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

    // Pass updated arrays
    renderSidebar(groups, details);
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
  renderSidebar(groups, details);
});

/** Initialize */
loadConfigs(currentRegion);
