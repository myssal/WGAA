import { showCG, showThumbnailGrid } from "./viewer.js";

/** Render Sidebar */
export function renderSidebar(cgGroups, cgDetails, mangaGroups, mangaChapters, mangaDetails) {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";
  container.className = "h-full overflow-y-auto pr-2 space-y-2 text-gray-200";

  const query = document.getElementById("globalSearch")?.value.trim().toLowerCase() || "";

  const createCollapsible = (title) => {
    const div = document.createElement("div");
    div.className = "group-item border-b border-gray-700 pb-2";

    const header = document.createElement("button");
    header.className =
      "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
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
  const cgSection = createCollapsible("CG");
  cgGroups.sort((a,b)=>a.Order-b.Order).forEach(group => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "pl-2 mb-1";

    const groupHeader = document.createElement("button");
    groupHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
    groupHeader.textContent = group.Name;

    const groupDetails = cgDetails.filter(d => d.GroupId === group.Id).sort((a,b)=>a.Order-b.Order);
    const filteredDetails = query ? groupDetails.filter(d=>d.Name.toLowerCase().includes(query)) : groupDetails;

    groupHeader.addEventListener("click", () => {
      if (filteredDetails.length > 0) showThumbnailGrid(filteredDetails, group.Name, "CG");
    });

    groupDiv.appendChild(groupHeader);
    cgSection.content.appendChild(groupDiv);
  });
  container.appendChild(cgSection.div);

  /** Manga Section */
  const mangaSection = createCollapsible("Manga");
  mangaGroups.sort((a,b)=>a.Order-b.Order).forEach(group => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "pl-2 mb-1";

    // Group-level header with arrow
    const groupHeader = document.createElement("button");
    groupHeader.className = "w-full text-left flex justify-between items-center px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
    groupHeader.innerHTML = `<span>${group.Name}</span><span class="transition-transform duration-200" data-arrow>▼</span>`;

    // Chapters container (collapsible)
    const chapterContainer = document.createElement("div");
    chapterContainer.className = "pl-2 overflow-hidden transition-all duration-300";
    chapterContainer.style.display = "none"; // initially collapsed

    const chapters = mangaChapters.filter(c => c.GroupId === group.Id).sort((a,b)=>a.Order-b.Order);

    chapters.forEach(chap => {
      const chapterDiv = document.createElement("div");
      chapterDiv.className = "mb-1";

      const chapterHeader = document.createElement("button");
      chapterHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm";
      chapterHeader.textContent = chap.Name;

      const detailsList = mangaDetails.filter(d => d.ChapterId === chap.Id);
      chapterHeader.addEventListener("click", () => {
        if (detailsList.length > 0) showThumbnailGrid(detailsList, chap.Name, "Manga");
      });

      chapterDiv.appendChild(chapterHeader);
      chapterContainer.appendChild(chapterDiv);
    });

    // Toggle chapter container
    let expanded = false;
    const arrow = groupHeader.querySelector("[data-arrow]");
    groupHeader.addEventListener("click", () => {
      expanded = !expanded;
      chapterContainer.style.display = expanded ? "block" : "none";
      arrow.style.transform = expanded ? "rotate(180deg)" : "rotate(0deg)";

      // Show all CGs of all chapters when expanding
      if (expanded) {
        const allCGs = [];
        chapters.forEach(chap => {
          mangaDetails.filter(d => d.ChapterId === chap.Id)
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
}