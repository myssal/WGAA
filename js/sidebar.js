import { showThumbnailGrid, showEmojiGrid, showStorySpriteGrid, getAssetUrl } from "./viewer.js";
import { t } from "./locale.js";

function showChapterGrid(group, chapters, mangaDetails) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const pathDiv = document.createElement("div");
  pathDiv.className = "flex justify-between items-center mb-4";
  pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${t("mangaSection")}/${group.Name}</span>`;
  main.appendChild(pathDiv);

  const gridDiv = document.createElement("div");
  gridDiv.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6";
  main.appendChild(gridDiv);

  chapters.forEach(chap => {
    const detailsList = mangaDetails.filter(d => d.ChapterId === chap.Id);
    let thumbUrl = '';
    if (detailsList.length > 0) {
      thumbUrl = getAssetUrl(detailsList[0].Bg, { type: 'thumbnail' });
    }

    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col items-center cursor-pointer";
    wrapper.onclick = () => {
      if (detailsList.length > 0) {
        const augmented = detailsList.map(d => ({ ...d, ChapterName: chap.Name }));
        showThumbnailGrid(augmented, `${group.Name}/${chap.Name}`, "Manga", 1);
      }
    };

    const img = document.createElement("img");
    img.src = thumbUrl || 'https://via.placeholder.com/150?text=No+Image'; // Placeholder if no image
    img.alt = chap.Name;
    img.className = "w-full h-40 object-cover rounded hover:scale-105 transition";
    img.loading = "lazy";

    const caption = document.createElement("p");
    caption.textContent = chap.Name;
    caption.className = "mt-1 text-sm text-gray-300 truncate text-center";

    wrapper.appendChild(img);
    wrapper.appendChild(caption);
    gridDiv.appendChild(wrapper);
  });
}

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

    let expanded = true;
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
      if (groupDetails.length > 0) showThumbnailGrid(groupDetails, group.Name, "CG", 1);
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

    const chapters = mangaChapters.filter(c => c.GroupId === group.Id).sort((a,b)=>a.Order-b.Order);

    groupHeader.addEventListener("click", () => {
      showChapterGrid(group, chapters, mangaDetails);
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
    showEmojiGrid(emojis, 1);
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
    showStorySpriteGrid(storySprites, 1);
  });

  storySpriteButtonDiv.appendChild(storySpriteButton);
  container.appendChild(storySpriteButtonDiv);
}
