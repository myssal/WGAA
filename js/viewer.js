import { ASSET_REPO, BRANCH } from "./config.js";

/** Universal thumbnail grid renderer */
export function showThumbnailGrid(cgList, parentName = "", section = "CG") {
  const main = document.getElementById("mainContent");
  main.innerHTML = ""; // clear

  // Show category path only when inside a subcategory
  if (parentName) {
    const pathDiv = document.createElement("div");
    pathDiv.className = "flex justify-between items-center mb-4";

    // Only show "Back" if there’s actually a higher-level view to return to
    const pathSpan = document.createElement("span");
    pathSpan.textContent = `${section}/${parentName}`;
    pathSpan.className = "text-gray-200 font-bold";

    pathDiv.appendChild(pathSpan);
    main.appendChild(pathDiv);
  }

  // Group by parent (optional for Manga chapters)
  let grouped = {};
  cgList.forEach(cg => {
    const key = cg.ChapterName || parentName || "All";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cg);
  });

  Object.keys(grouped).forEach(groupName => {
    if (groupName !== parentName && groupName !== "All") {
      const title = document.createElement("h3");
      title.textContent = groupName;
      title.className = "text-lg font-bold text-gray-200 mt-4 mb-2";
      main.appendChild(title);
    }

    const gridDiv = document.createElement("div");
    gridDiv.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6";
    main.appendChild(gridDiv);

    grouped[groupName].forEach(cg => {
      let relativePath = cg.Bg?.replace(/^Assets[\\/]/, "").replace(/\\/g, "/") || "";
      let parts = relativePath.split("/");
      let filename = parts.pop();
      let dir = parts.join("/").toLowerCase();
      if (!filename) return;

      const baseName = filename.replace(/\.(jpg|png|jpeg)$/i, "");
      const thumbUrl = `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/thumbnails/${dir}/${baseName}_thumb.webp`;
      const imgUrl = `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/${dir}/${baseName}.png`;

      const cgDisplayName = cg.Name || groupName || "Unknown";

      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center";

      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = cgDisplayName;
      img.title = cgDisplayName;
      img.className = "w-full h-40 object-cover rounded cursor-pointer hover:scale-105 transition";
      img.loading = "lazy";
      img.onclick = () => showCG(cg, groupName, cgList, section);

      const caption = document.createElement("p");
      caption.textContent = cgDisplayName;
      caption.className = "mt-1 text-sm text-gray-300 truncate text-center";

      wrapper.appendChild(img);
      wrapper.appendChild(caption);
      gridDiv.appendChild(wrapper);
    });
  });
}

/** Show individual CG */
export function showCG(cg, parentName = "", parentList = [], section = "CG") {
  const main = document.getElementById("mainContent");
  const displayName = cg.Name || parentName || "Unknown";

  let categoryPath = parentName ? `${section}/${parentName}` : section;

  let relativePath = cg.Bg?.replace(/^Assets[\\/]/, "").replace(/\\/g, "/") || "";
  let parts = relativePath.split("/");
  let filename = parts.pop();
  let dir = parts.join("/").toLowerCase();

  const baseName = filename?.replace(/\.(jpg|png|jpeg)$/i, "") || "";
  const imgUrl = filename ? `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/${dir}/${baseName}.png` : "";

  main.innerHTML = `
    <div class="max-w-4xl mx-auto text-center">
      <div class="flex justify-between items-center mb-4">
        <button id="backBtn" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">← Back</button>
        <span class="text-gray-200 font-bold">${categoryPath}</span>
      </div>

      <h2 class="text-2xl font-bold mb-4">${displayName}</h2>
      <div class="rounded-lg overflow-hidden shadow-lg bg-gray-800 p-2">
        <img id="cgImage" src="${imgUrl}" alt="${displayName}" class="w-full object-contain max-h-[70vh] mx-auto cursor-pointer">
      </div>
      <p class="mt-4 text-gray-300">${cg.Desc || ""}</p>
      <p class="text-gray-500 text-sm mt-2">ID: ${cg.Id}</p>
    </div>

    <!-- Modal -->
    <div id="imageModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center hidden z-50">
      <img id="modalImage" src="" class="max-w-[90%] max-h-[90%] rounded shadow-lg">
    </div>
  `;

  const cgImage = document.getElementById("cgImage");
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  cgImage.addEventListener("click", () => {
    modalImage.src = imgUrl;
    imageModal.classList.remove("hidden");
  });
  imageModal.addEventListener("click", e => {
    if (e.target === imageModal) {
      imageModal.classList.add("hidden");
      modalImage.src = "";
    }
  });

  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    if (parentList && parentList.length > 0) {
      showThumbnailGrid(parentList, parentName, section);
    }
  });
}
