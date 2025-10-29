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
export let equips = []; // Equip
export let equipRes = []; // EquipRes
export let equipSuits = []; // EquipSuit
export let awarenessSettings = []; // AwarenessSetting
export let fashions = []; // Fashion
export let characters = []; // Character
export let weaponFashions = []; // WeaponFashionRes

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

    // Fetch Memory
    const [equipResRes, equipSuitRes, equipResData, awarenessSettingRes] = await Promise.all([
      fetch(`${baseShareUrl}/equip/Equip.json`),
      fetch(`${baseShareUrl}/equip/EquipSuit.json`),
      fetch(`${baseClientUrl}/equip/EquipRes.json`),
      fetch(`${baseShareUrl}/archive/AwarenessSetting.json`)
    ]);
    if (!equipResRes.ok || !equipSuitRes.ok || !equipResData.ok || !awarenessSettingRes.ok) throw new Error("Failed to fetch Memory config files");
    equips = await equipResRes.json();
    equipSuits = await equipSuitRes.json();
    equipRes = await equipResData.json();
    awarenessSettings = await awarenessSettingRes.json();

    // Fetch Coating
    const [fashionRes, characterRes, weaponFashionRes] = await Promise.all([
      fetch(`${baseShareUrl}/fashion/Fashion.json`),
      fetch(`${baseShareUrl}/character/Character.json`),
      fetch(`${baseClientUrl}/weaponfashion/WeaponFashionRes.json`)
    ]);
    if (!fashionRes.ok || !characterRes.ok || !weaponFashionRes.ok) throw new Error("Failed to fetch Coating config files");
    fashions = await fashionRes.json();
    characters = await characterRes.json();
    weaponFashions = await weaponFashionRes.json();

    // Render sidebar
    renderSidebar(groups, details, mangaGroups, mangaChapters, mangaDetails, emojis, emojiPacks, storySprites, equips, equipRes, equipSuits, awarenessSettings, fashions, characters, weaponFashions);
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

const aboutButton = document.getElementById('aboutButton');
const closeModalButton = document.getElementById('closeModalButton');
const aboutModal = document.getElementById('aboutModal');

aboutButton.addEventListener('click', () => {
    aboutModal.classList.remove('hidden');
});

closeModalButton.addEventListener('click', () => {
    aboutModal.classList.add('hidden');
});

aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.add('hidden');
    }
});