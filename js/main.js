import { DATA_REPO, BRANCH, currentRegion } from "./config.js";
import { renderSidebar } from "./sidebar.js";
import { loadLocale, t } from "./locale.js";
import { initializeRouter, router } from "./router.js";

export let groups = [];       // CGGroup
export let details = [];      // CGDetail
export let mangaGroups = [];  // ArchiveComicGroup
export let mangaChapters = []; // ArchiveComicChapter
export let mangaDetails = [];  // ArchiveComicDetail
export let emojis = []; // Emoji
export let emojiPacks = []; // EmojiPack
export let storySprites = []; // MovieActor

async function loadConfigs(region) {
  const baseShareUrl = `https://cdn.jsdelivr.net/gh/${DATA_REPO}@${BRANCH}/${region}/bytes/share`;
  const baseClientUrl = `https://cdn.jsdelivr.net/gh/${DATA_REPO}@${BRANCH}/${region}/bytes/client`;
  
  try {
    await loadLocale(region);

    // Update UI placeholders & title
    document.getElementById("headerTitle").textContent = t("title");

    // Fetch normal CG
    const [groupRes, detailRes] = await Promise.all([
      fetch(`${baseShareUrl}/archive/CGGroup.json`),
      fetch(`${baseShareUrl}/archive/CGDetail.json`)
    ]);
    if (!groupRes.ok || !detailRes.ok) throw new Error("Failed to fetch CG config files");
    groups = await groupRes.json();
    details = await detailRes.json();

    // Fetch Manga/Comic
    const [comicGroupRes, comicChapterRes, comicDetailRes] = await Promise.all([
      fetch(`${baseShareUrl}/archive/ArchiveComicGroup.json`),
      fetch(`${baseShareUrl}/archive/ArchiveComicChapter.json`),
      fetch(`${baseClientUrl}/archive/ArchiveComicDetail.json`)
    ]);
    if (!comicGroupRes.ok || !comicChapterRes.ok || !comicDetailRes.ok) throw new Error("Failed to fetch Manga config files");
    mangaGroups = await comicGroupRes.json();
    mangaChapters = await comicChapterRes.json();
    mangaDetails = await comicDetailRes.json();

    // Fetch Emoji
    const [emojiRes, emojiPackRes] = await Promise.all([
      fetch(`${baseShareUrl}/chat/Emoji.json`),
      fetch(`${baseShareUrl}/chat/EmojiPack.json`)
    ]);
    if (!emojiRes.ok || !emojiPackRes.ok) throw new Error("Failed to fetch Emoji config file");
    emojis = await emojiRes.json();
    emojiPacks = await emojiPackRes.json();

    // Fetch Story Sprites
    const storySpriteRes = await fetch(`${baseClientUrl}/movie/MovieActor.json`);
    if (!storySpriteRes.ok) throw new Error("Failed to fetch Story Sprite config file");
    storySprites = await storySpriteRes.json();

    // Render sidebar
    renderSidebar(groups, details, mangaGroups, mangaChapters, mangaDetails, emojis, emojiPacks, storySprites);
    router();
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

/** Initialize */
initializeRouter();
loadConfigs(currentRegion);
