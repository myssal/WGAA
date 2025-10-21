import { DATA_REPO, BRANCH, currentRegion } from "./config.js";
import { renderSidebar } from "./sidebar.js";
import { loadLocale, t } from "./locale.js";

export let groups = [];       // CGGroup
export let details = [];      // CGDetail
export let mangaGroups = [];  // ArchiveComicGroup
export let mangaChapters = []; // ArchiveComicChapter
export let mangaDetails = [];  // ArchiveComicDetail

async function loadConfigs(region) {
  const baseShareUrl = `https://cdn.jsdelivr.net/gh/${DATA_REPO}@${BRANCH}/${region}/bytes/share/archive`;
  const baseClientUrl = `https://cdn.jsdelivr.net/gh/${DATA_REPO}@${BRANCH}/${region}/bytes/client/archive`;

  try {
    await loadLocale(region);

    // Update UI placeholders & title
    document.getElementById("headerTitle").textContent = t("title");
    document.getElementById("globalSearch").placeholder = t("searchPlaceholder");

    // Fetch normal CG
    const [groupRes, detailRes] = await Promise.all([
      fetch(`${baseShareUrl}/CGGroup.json`),
      fetch(`${baseShareUrl}/CGDetail.json`)
    ]);
    if (!groupRes.ok || !detailRes.ok) throw new Error("Failed to fetch CG config files");
    groups = await groupRes.json();
    details = await detailRes.json();

    // Fetch Manga/Comic
    const [comicGroupRes, comicChapterRes, comicDetailRes] = await Promise.all([
      fetch(`${baseShareUrl}/ArchiveComicGroup.json`),
      fetch(`${baseShareUrl}/ArchiveComicChapter.json`),
      fetch(`${baseClientUrl}/ArchiveComicDetail.json`)
    ]);
    if (!comicGroupRes.ok || !comicChapterRes.ok || !comicDetailRes.ok) throw new Error("Failed to fetch Manga config files");
    mangaGroups = await comicGroupRes.json();
    mangaChapters = await comicChapterRes.json();
    mangaDetails = await comicDetailRes.json();

    // Render sidebar
    renderSidebar(groups, details, mangaGroups, mangaChapters, mangaDetails);
  } catch (err) {
    console.error("Failed to load config:", err);
    document.getElementById("mainContent").innerHTML =
      `<p class="text-red-400 text-center mt-6">${t("failedLoad") || "Failed to load data for region:"} ${region}</p>`;
  }
}

/** Event bindings */
document.getElementById("regionSelect").addEventListener("change", e => {
  loadConfigs(e.target.value);
});

document.getElementById("globalSearch").addEventListener("input", () => {
  renderSidebar(groups, details, mangaGroups, mangaChapters, mangaDetails);
});

/** Initialize */
loadConfigs(currentRegion);
