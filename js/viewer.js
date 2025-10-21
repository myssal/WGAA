// viewer.js
import { ASSET_REPO, BRANCH } from "./config.js";

/** Thumbnail Grid Renderer */
export function showThumbnailGrid(cgList, parentName = "", section = "CG") {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  if (parentName) {
    const pathDiv = document.createElement("div");
    pathDiv.className = "flex justify-between items-center mb-4";
    pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${section}/${parentName}</span>`;
    main.appendChild(pathDiv);
  }

  const grouped = {};
  cgList.forEach(cg => {
    const key = cg.ChapterName || "All";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cg);
  });

  Object.keys(grouped).forEach(groupName => {
    if (Object.keys(grouped).length > 1 && groupName !== "All") {
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

      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center";

      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = baseName;
      img.className = "w-full h-40 object-cover rounded cursor-pointer hover:scale-105 transition";
      img.loading = "lazy";
      img.onclick = () => showCG(cg, parentName || groupName, cgList, section);

      wrapper.appendChild(img);

      if (section !== "Manga") {
        const caption = document.createElement("p");
        caption.textContent = cg.Name || groupName || "Unknown";
        caption.className = "mt-1 text-sm text-gray-300 truncate text-center";
        wrapper.appendChild(caption);
      }

      gridDiv.appendChild(wrapper);
    });
  });
}

/** Show individual CG with navigation */
export function showCG(cg, parentName = "", parentList = [], section = "CG") {
  const main = document.getElementById("mainContent");
  const categoryPath = parentName ? `${section}/${parentName}` : section;

  let relativePath = cg.Bg?.replace(/^Assets[\\/]/, "").replace(/\\/g, "/") || "";
  let parts = relativePath.split("/");
  let filename = parts.pop();
  let dir = parts.join("/").toLowerCase();

  const baseName = filename?.replace(/\.(jpg|png|jpeg)$/i, "") || "";
  const imgUrl = filename ? `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/${dir}/${baseName}.png` : "";

  // Find current CG index
  const index = parentList.findIndex(item => item.Id === cg.Id);
  const prev = parentList[index - 1];
  const next = parentList[index + 1];

  main.innerHTML = `
    <div class="max-w-5xl mx-auto text-center relative">
      <div class="flex justify-between items-center mb-4">
        <button id="backBtn" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">← Back</button>
        <span class="text-gray-200 font-bold">${categoryPath}</span>
      </div>

      ${section !== "Manga" ? `<h2 class="text-2xl font-bold mb-4">${cg.Name || parentName || "Unknown"}</h2>` : ""}

      <div class="relative rounded-lg overflow-hidden shadow-lg bg-gray-800 p-2">
        <img id="cgImage" src="${imgUrl}" alt="${baseName}" class="w-full object-contain max-h-[70vh] mx-auto cursor-pointer">

        <!-- Navigation arrows -->
        <button id="prevBtn" ${!prev ? "disabled" : ""} class="absolute left-3 top-1/2 transform -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30">
          &#10094;
        </button>
        <button id="nextBtn" ${!next ? "disabled" : ""} class="absolute right-3 top-1/2 transform -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30">
          &#10095;
        </button>
      </div>

      ${section !== "Manga" ? `<p class="mt-4 text-gray-300">${cg.Desc || ""}</p>` : ""}
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

  // Navigation
  document.getElementById("backBtn").addEventListener("click", () => {
    showThumbnailGrid(parentList, parentName, section);
  });

  if (prev) {
    document.getElementById("prevBtn").addEventListener("click", () => {
      showCG(prev, parentName, parentList, section);
    });
  }
  if (next) {
    document.getElementById("nextBtn").addEventListener("click", () => {
      showCG(next, parentName, parentList, section);
    });
  }

  // Keyboard navigation support
  document.onkeydown = (e) => {
    if (e.key === "ArrowLeft" && prev) showCG(prev, parentName, parentList, section);
    if (e.key === "ArrowRight" && next) showCG(next, parentName, parentList, section);
  };
}
