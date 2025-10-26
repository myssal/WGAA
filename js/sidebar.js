import { t } from "./locale.js";

/** Render Sidebar */
export function renderSidebar(cgGroups, cgDetails, mangaGroups, mangaChapters, mangaDetails, emojis, emojiPacks, storySprites) {
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
}
