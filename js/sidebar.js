import { t } from "./locale.js";

/** Render Sidebar */
export function renderSidebar(cgGroups, cgDetails, mangaGroups, mangaChapters, mangaDetails, emojis, emojiPacks, storySprites, equips, equipRes, equipSuits, awarenessSettings, fashions, characters, weaponFashions) {
  const container = document.getElementById("categoryList");
  if (!container) {
    console.error("Sidebar container #categoryList not found.");
    return;
  }
  container.innerHTML = "";
  container.className = "h-full overflow-y-auto pr-2 pl-4 space-y-2 text-gray-200";

  // Ensure all data arrays are valid before proceeding
  cgGroups = Array.isArray(cgGroups) ? cgGroups : [];
  cgDetails = Array.isArray(cgDetails) ? cgDetails : [];
  mangaGroups = Array.isArray(mangaGroups) ? mangaGroups : [];
  mangaChapters = Array.isArray(mangaChapters) ? mangaChapters : [];
  mangaDetails = Array.isArray(mangaDetails) ? mangaDetails : [];
  emojis = Array.isArray(emojis) ? emojis : [];
  emojiPacks = Array.isArray(emojiPacks) ? emojiPacks : [];
  storySprites = Array.isArray(storySprites) ? storySprites : [];
  equips = Array.isArray(equips) ? equips : [];
  equipRes = Array.isArray(equipRes) ? equipRes : [];
  equipSuits = Array.isArray(equipSuits) ? equipSuits : [];
  awarenessSettings = Array.isArray(awarenessSettings) ? awarenessSettings : [];
  fashions = Array.isArray(fashions) ? fashions : [];
  characters = Array.isArray(characters) ? characters : [];
  weaponFashions = Array.isArray(weaponFashions) ? weaponFashions : [];

  const createCollapsible = (title) => {
    const div = document.createElement("div");
    div.className = "group-item border-b border-gray-700 pb-2";

    const header = document.createElement("button");
    header.className = "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
    header.innerHTML = `<span class="font-semibold">${title}</span><span class="transition-transform duration-200" data-arrow>▼</span>`;

    const content = document.createElement("div");
    content.className = "overflow-hidden transition-all duration-300";

    let expanded = false
    const arrow = header.querySelector("[data-arrow]");
    const setExpanded = (state) => {
      expanded = state;
      content.style.display = expanded ? "block" : "none";
      arrow.style.transform = expanded ? "rotate(180deg)" : "rotate(0deg)";
    };

    setExpanded(expanded);
    header.addEventListener("click", () => setExpanded(!expanded));
    div.appendChild(header);
    div.appendChild(content);
    return { div, content };
  };

  /** CG Section */
  const cgSection = createCollapsible(t("cgSection"));
  cgGroups.sort((a,b)=>a.Order-b.Order).forEach(group => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "pl-2 mb-1";

    const groupHeader = document.createElement("button");
    groupHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
    groupHeader.textContent = group.Name;

    groupHeader.addEventListener("click", () => {
      location.hash = `#/cg/${encodeURIComponent(group.Name)}`;
    });

    groupDiv.appendChild(groupHeader);
    cgSection.content.appendChild(groupDiv);
  });
  container.appendChild(cgSection.div);

  /** Manga Section */
  const mangaSection = createCollapsible(t("mangaSection"));
  mangaGroups.sort((a,b)=>a.Order-b.Order).forEach(group => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "pl-2 mb-1";

    const groupHeader = document.createElement("button");
    groupHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
    groupHeader.textContent = group.Name;

    groupHeader.addEventListener("click", () => {
      location.hash = `#/manga/${encodeURIComponent(group.Name)}`;
    });

    groupDiv.appendChild(groupHeader);
    mangaSection.content.appendChild(groupDiv);
  });

  container.appendChild(mangaSection.div);

  /** Emoji Section */
  const emojiSection = createCollapsible(t("emojiSection"));
  const allowedPacks = ["Default Stamp", "Event Stamp", "Achievement Stamp"];
  const filteredPacks = emojiPacks.filter(p => allowedPacks.includes(p.Name));

  filteredPacks.sort((a,b)=>a.Order-b.Order).forEach(pack => {
    const packDiv = document.createElement("div");
    packDiv.className = "pl-2 mb-1";

    const packHeader = document.createElement("button");
    packHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
    packHeader.textContent = pack.Name.replace("Stamp", "Emoji");

    packHeader.addEventListener("click", () => {
      location.hash = `#/emoji/${pack.Id}`;
    });

    packDiv.appendChild(packHeader);
    emojiSection.content.appendChild(packDiv);
  });
  container.appendChild(emojiSection.div);

  /** Story Sprite Section */
  const storySpriteButtonDiv = document.createElement("div");
  storySpriteButtonDiv.className = "group-item border-b border-gray-700 pb-2";

  const storySpriteButton = document.createElement("button");
  storySpriteButton.className = "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
  storySpriteButton.innerHTML = `<span class="font-semibold">${t("storySpriteSection")}</span>`;
  storySpriteButton.addEventListener("click", () => {
    location.hash = "#/story-sprite";
  });

  storySpriteButtonDiv.appendChild(storySpriteButton);
  container.appendChild(storySpriteButtonDiv);

  /** Memory Section */
  const memoryButtonDiv = document.createElement("div");
  memoryButtonDiv.className = "group-item border-b border-gray-700 pb-2";

  const memoryButton = document.createElement("button");
  memoryButton.className = "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
  memoryButton.innerHTML = `<span class="font-semibold">${t("memorySection")}</span>`;
  memoryButton.addEventListener("click", () => {
    location.hash = "#/memory";
  });

  memoryButtonDiv.appendChild(memoryButton);
  container.appendChild(memoryButtonDiv);

  /** Coating Section */
  const coatingSection = createCollapsible(t("coatingSection"));
  const coatingConstructDiv = document.createElement("div");
  coatingConstructDiv.className = "pl-2 mb-1";
  const coatingConstructButton = document.createElement("button");
  coatingConstructButton.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
  coatingConstructButton.textContent = t("constructCoating");
  coatingConstructButton.addEventListener("click", () => {
    location.hash = "#/coating/construct";
  });
  coatingConstructDiv.appendChild(coatingConstructButton);
  coatingSection.content.appendChild(coatingConstructDiv);

  const coatingWeaponDiv = document.createElement("div");
  coatingWeaponDiv.className = "pl-2 mb-1";
  const coatingWeaponButton = document.createElement("button");
  coatingWeaponButton.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
  coatingWeaponButton.textContent = t("weaponCoating");
  coatingWeaponButton.addEventListener("click", () => {
    location.hash = "#/coating/weapon";
  });
  coatingWeaponDiv.appendChild(coatingWeaponButton);
  coatingSection.content.appendChild(coatingWeaponDiv);
  container.appendChild(coatingSection.div);
}
