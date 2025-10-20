// sidebar.js
import { showCG } from "./viewer.js";

/**
 * Render sidebar with CG and Manga
 * @param {Array} cgGroups - CGGroup
 * @param {Array} cgDetails - CGDetail
 * @param {Array} mangaGroups - ArchiveComicGroup
 * @param {Array} mangaChapters - ArchiveComicChapter
 * @param {Array} mangaDetails - ArchiveComicDetail
 */
export function renderSidebar(cgGroups, cgDetails, mangaGroups, mangaChapters, mangaDetails) {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";
  container.className = "h-full overflow-y-auto pr-2 space-y-2 text-gray-200";

  const query = document.getElementById("globalSearch")?.value.trim().toLowerCase() || "";

  /** Helper to create collapsible container */
  const createCollapsible = (title) => {
    const div = document.createElement("div");
    div.className = "group-item border-b border-gray-700 pb-2";

    const header = document.createElement("button");
    header.className =
      "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
    header.innerHTML = `<span class="font-semibold">${title}</span><span class="transition-transform duration-200" data-arrow>▼</span>`;

    const content = document.createElement("div");
    content.className = "overflow-hidden transition-all duration-300";

    let expanded = false; // initially collapsed
    const arrow = header.querySelector("[data-arrow]");
    const setExpanded = (state) => {
      expanded = state;
      if (expanded) {
        content.style.display = "block"; // show content
        arrow.style.transform = "rotate(180deg)";
      } else {
        content.style.display = "none"; // hide content
        arrow.style.transform = "rotate(0deg)";
      }
    };

    // initially collapsed
    setExpanded(expanded);

    header.addEventListener("click", () => setExpanded(!expanded));
    div.appendChild(header);
    div.appendChild(content);

    return { div, content, setExpanded };
  };

  /** Render CG Section */
  const cgSection = createCollapsible("CG");
  cgGroups
    .sort((a, b) => a.Order - b.Order)
    .forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "pl-2 mb-1";

      const groupHeader = document.createElement("button");
      groupHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
      groupHeader.textContent = group.Name;

      const cgListDiv = document.createElement("div");
      cgListDiv.className = "pl-4";

      const groupDetails = cgDetails.filter(d => d.GroupId === group.Id).sort((a, b) => a.Order - b.Order);
      const filteredDetails = query ? groupDetails.filter(d => d.Name.toLowerCase().includes(query)) : groupDetails;

      filteredDetails.forEach(cg => {
        const btn = document.createElement("button");
        btn.className = "block w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm";
        btn.textContent = cg.Name;
        btn.onclick = () => showCG(cg);
        cgListDiv.appendChild(btn);
      });

      let groupExpanded = false;
      const toggleGroup = () => {
        groupExpanded = !groupExpanded;
        cgListDiv.style.display = groupExpanded ? "block" : "none";
      };
      groupHeader.addEventListener("click", toggleGroup);

      // initially collapsed
      cgListDiv.style.display = "none";

      groupDiv.appendChild(groupHeader);
      groupDiv.appendChild(cgListDiv);
      cgSection.content.appendChild(groupDiv);
    });
  container.appendChild(cgSection.div);

  /** Render Manga Section */
  const mangaSection = createCollapsible("Manga");
  mangaGroups
    .sort((a, b) => a.Order - b.Order)
    .forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "pl-2 mb-1";

      const groupHeader = document.createElement("button");
      groupHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";
      groupHeader.textContent = group.Name;

      const chapterListDiv = document.createElement("div");
      chapterListDiv.className = "pl-4";

      const chapters = mangaChapters.filter(c => c.GroupId === group.Id).sort((a, b) => a.Order - b.Order);

      chapters.forEach((chapter, chapterIndex) => {
        const chapterDiv = document.createElement("div");
        chapterDiv.className = "pl-2 mb-1";

        const chapterHeader = document.createElement("button");
        chapterHeader.className = "w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm font-semibold";

        // Get chapter own CG if exists (some chapters have Bg)
        chapterHeader.textContent = chapter.Name;
        
        const detailListDiv = document.createElement("div");
        detailListDiv.className = "pl-4";

        const detailsList = mangaDetails.filter(d => d.ChapterId === chapter.Id);

        detailsList.forEach((detail, index) => {
          const btn = document.createElement("button");
          btn.className = "block w-full text-left px-3 py-1 rounded hover:bg-gray-700 transition text-sm";
          // Show parent's name + order instead of undefined
          btn.textContent = `${chapter.Name} ${index + 1}`;
          btn.onclick = () => showCG(detail, chapter.Name);
          detailListDiv.appendChild(btn);
        });

        // Toggle chapter expand/collapse and show first CG if clicked
        let chapterExpanded = false;
        chapterHeader.addEventListener("click", () => {
          chapterExpanded = !chapterExpanded;
          detailListDiv.style.display = chapterExpanded ? "block" : "none";

          // Show first CG when expanding
          if (chapterExpanded && detailsList.length > 0) {
            showCG(detailsList[0], chapter.Name);
          }
        });

        // initially collapsed
        detailListDiv.style.display = "none";

        chapterDiv.appendChild(chapterHeader);
        chapterDiv.appendChild(detailListDiv);
        chapterListDiv.appendChild(chapterDiv);
      });

      let groupExpanded = false;
      const toggleGroup = () => {
        groupExpanded = !groupExpanded;
        chapterListDiv.style.display = groupExpanded ? "block" : "none";
      };
      groupHeader.addEventListener("click", toggleGroup);

      // initially collapsed
      chapterListDiv.style.display = "none";

      groupDiv.appendChild(groupHeader);
      groupDiv.appendChild(chapterListDiv);
      mangaSection.content.appendChild(groupDiv);
    });

  container.appendChild(mangaSection.div);
}
