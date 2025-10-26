import { t } from "./locale.js";

/** Render Sidebar */
export function renderSidebar(cgGroups, cgDetails, mangaGroups, mangaChapters, mangaDetails, emojis, storySprites) {
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
  const emojiButtonDiv = document.createElement("div");
  emojiButtonDiv.className = "group-item border-b border-gray-700 pb-2";

  const emojiButton = document.createElement("button");
  emojiButton.className = "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
  emojiButton.innerHTML = `<span class="font-semibold">${t("emojiSection")}</span>`;
  emojiButton.addEventListener("click", () => {
    location.hash = "#/emoji";
  });

  emojiButtonDiv.appendChild(emojiButton);
  container.appendChild(emojiButtonDiv);

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
