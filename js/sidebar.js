import { showThumbnailGrid, showEmojiGrid, showStorySpriteGrid } from "./viewer.js";
import { t } from "./locale.js";

/** Render Sidebar */
export function renderSidebar(cgGroups, cgDetails, mangaGroups, mangaChapters, mangaDetails, emojis, storySprites) {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";
  container.className = "h-full overflow-y-auto pr-2 pl-4 space-y-2 text-gray-200";

  const createCollapsible = (title) => {
    const div = document.createElement("div");
    div.className = "group-item border-b border-gray-700 pb-2";

    const header = document.createElement("button");
    header.className = "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
    header.innerHTML = `<span class="font-semibold">${title}</span><span class="transition-transform duration-200" data-arrow>▼</span>`;

    const content = document.createElement("div");
    content.className = "overflow-hidden transition-all duration-300";

    let expanded = false;
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

    const groupDetails = cgDetails.filter(d => d.GroupId === group.Id).sort((a,b)=>a.Order-b.Order);

    groupHeader.addEventListener("click", () => {
      if (groupDetails.length > 0) showThumbnailGrid(groupDetails, group.Name, "CG");
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
    groupHeader.className = "w-full text-left flex justify-between items-center px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
    groupHeader.innerHTML = `<span>${group.Name}</span><span class="transition-transform duration-200" data-arrow>▼</span>`;

    const chapterContainer = document.createElement("div");
    chapterContainer.className = "pl-2 overflow-hidden transition-all duration-300";
    chapterContainer.style.display = "none";

    const chapters = mangaChapters.filter(c => c.GroupId === group.Id).sort((a,b)=>a.Order-b.Order);

    chapters.forEach(chap => {
      const chapterDiv = document.createElement("div");
      chapterDiv.className = "mb-1";

      const chapterHeader = document.createElement("button");
      chapterHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm";
      chapterHeader.textContent = chap.Name;

      const detailsList = mangaDetails.filter(d => d.ChapterId === chap.Id);
      chapterHeader.addEventListener("click", () => {
        if (detailsList.length > 0) {
          const augmented = detailsList.map(d => ({ ...d, ChapterName: chap.Name }));
          showThumbnailGrid(augmented, `${group.Name}/${chap.Name}`, "Manga");
        }
      });

      chapterDiv.appendChild(chapterHeader);
      chapterContainer.appendChild(chapterDiv);
    });

    // Toggle for the group
    let expanded = false;
    const arrow = groupHeader.querySelector("[data-arrow]");
    groupHeader.addEventListener("click", () => {
      expanded = !expanded;
      chapterContainer.style.display = expanded ? "block" : "none";
      arrow.style.transform = expanded ? "rotate(180deg)" : "rotate(0deg)";

      if (expanded) {
        // Show all CGs in this group by default
        const allCGs = [];
        chapters.forEach(chap => {
          mangaDetails
            .filter(d => d.ChapterId === chap.Id)
            .forEach(d => allCGs.push({ ...d, ChapterName: chap.Name }));
        });
        if (allCGs.length > 0) showThumbnailGrid(allCGs, group.Name, "Manga");
      }
    });

    groupDiv.appendChild(groupHeader);
    groupDiv.appendChild(chapterContainer);
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
    showEmojiGrid(emojis);
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
    showStorySpriteGrid(storySprites);
  });

  storySpriteButtonDiv.appendChild(storySpriteButton);
  container.appendChild(storySpriteButtonDiv);
}
