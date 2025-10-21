// viewer.js
import { ASSET_REPO, BRANCH } from "./config.js";

export function showCG(cg, parentName = "", parentList = [], section = "CG") {
  const main = document.getElementById("mainContent");
  const displayName = cg.Name || parentName || "Unknown";

  // Category path display (bold)
  let categoryPath = parentName ? `${section}/${parentName}` : section;

  // Compute image URLs
  let relativePath = cg.Bg?.replace(/^Assets[\\/]/, "").replace(/\\/g, "/") || "";
  let parts = relativePath.split("/");
  let filename = parts.pop();
  let dir = parts.join("/").toLowerCase();

  let imgUrl = filename
    ? `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/${dir}/${filename.replace(/\.jpg$/, ".png")}`
    : "";

  let thumbUrl = filename
    ? `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/thumbnails/${dir}/${filename.replace(/\.jpg$/, "")}_thumb.webp`
    : "";

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

    <!-- Modal Overlay -->
    <div id="imageModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center hidden z-50">
      <img id="modalImage" src="" class="max-w-[90%] max-h-[90%] rounded shadow-lg">
    </div>
  `;

  // Modal behavior
  const cgImage = document.getElementById("cgImage");
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  cgImage.addEventListener("click", () => {
    modalImage.src = imgUrl;
    imageModal.classList.remove("hidden");
  });

  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.classList.add("hidden");
      modalImage.src = "";
    }
  });

  // Back button
  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    if (parentList && parentList.length > 0) {
      showCGGrid(parentList, parentName, section);
    }
  });
}

// Updated showCGGrid to use thumbnails from ASSET_REPO
export function showCGGrid(cgList, parentName = "", section = "CG") {
  const main = document.getElementById("mainContent");
  main.innerHTML = `<div class="max-w-6xl mx-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>`;
  const grid = main.querySelector("div");

  cgList.forEach(cg => {
    let relativePath = cg.Bg?.replace(/^Assets[\\/]/, "").replace(/\\/g, "/") || "";
    let parts = relativePath.split("/");
    let filename = parts.pop();
    let dir = parts.join("/").toLowerCase();

    let thumbUrl = filename
      ? `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/thumbnails/${dir}/${filename.replace(/\.jpg$/, "")}_thumb.webp`
      : "";

    const img = document.createElement("img");
    img.src = thumbUrl;
    img.alt = cg.Name || parentName;
    img.title = cg.Name || parentName;
    img.className = "w-full h-40 object-cover rounded cursor-pointer hover:scale-105 transition";
    img.loading = "lazy";
    img.onclick = () => showCG(cg, parentName, cgList, section);

    grid.appendChild(img);
  });
}
