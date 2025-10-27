import { t } from "../locale.js";
import { getAssetUrl, createPageInput } from "./utils.js";

/** Thumbnail Grid Renderer */
export function showThumbnailGrid(cgList, parentName = "", section = "CG", page = 1) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  if (parentName) {
    const pathDiv = document.createElement("div");
    pathDiv.className = "flex justify-between items-center mb-4";
    pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${t(section)}${parentName ? "/" + parentName : ""}</span>`;
    main.appendChild(pathDiv);
  }

  const pageSize = 16;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedCGs = cgList.slice(start, end);

  const gridDiv = document.createElement("div");
  gridDiv.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6";
  main.appendChild(gridDiv);

  paginatedCGs.forEach(cg => {
    const thumbUrl = getAssetUrl(cg.Bg, { type: 'thumbnail' });
    if (!thumbUrl) return;

    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col items-center";

    const img = document.createElement("img");
    img.src = thumbUrl;
    img.alt = cg.Name;
    img.className = "w-full h-40 object-cover rounded cursor-pointer hover:scale-105 transition";
    img.loading = "lazy";
    img.onclick = () => showCG(cg, parentName, cgList, section, page);

    wrapper.appendChild(img);

    if (section !== "Manga") {
      const caption = document.createElement("p");
      caption.textContent = cg.Name || parentName || t("unknown");
      caption.className = "mt-1 text-sm text-gray-300 truncate text-center";
      wrapper.appendChild(caption);
    }

    gridDiv.appendChild(wrapper);
  });

  // Pagination
  const totalPages = Math.ceil(cgList.length / pageSize);
  if (totalPages > 1) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "flex justify-center items-center space-x-4 mt-4";

    const firstPageButton = document.createElement("button");
    firstPageButton.textContent = "<<";
    firstPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    firstPageButton.disabled = page <= 1;
    firstPageButton.onclick = () => showThumbnailGrid(cgList, parentName, section, 1);

    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    prevButton.disabled = page <= 1;
    prevButton.onclick = () => showThumbnailGrid(cgList, parentName, section, page - 1);

    const pageInput = createPageInput(page, totalPages, (newPage) => {
        showThumbnailGrid(cgList, parentName, section, newPage);
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => showThumbnailGrid(cgList, parentName, section, page + 1);

    const lastPageButton = document.createElement("button");
    lastPageButton.textContent = ">>";
    lastPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    lastPageButton.disabled = page >= totalPages;
    lastPageButton.onclick = () => showThumbnailGrid(cgList, parentName, section, totalPages);

    paginationDiv.appendChild(firstPageButton);
    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInput.container);
    paginationDiv.appendChild(nextButton);
    paginationDiv.appendChild(lastPageButton);
    main.appendChild(paginationDiv);
  }
}

/** Show individual CG with navigation */
export function showCG(cg, parentName = "", parentList = [], section = "CG", page = 1) {
  if (section === "CG") {
    history.replaceState(null, null, `#/cg/${encodeURIComponent(parentName)}/${cg.Id}`);
  } else if (section === "Manga") {
    history.replaceState(null, null, `#/manga/${encodeURIComponent(parentName)}/${cg.Id}`);
  }

  const main = document.getElementById("mainContent");
  const categoryPath = parentName ? `${t(section)}/${parentName}` : t(section);
  const imgUrl = getAssetUrl(cg.Bg, { type: 'cg' });

  // Find current CG index
  const index = parentList.findIndex(item => item.Id === cg.Id);
  const prev = parentList[index - 1];
  const next = parentList[index + 1];

  // Keep container height stable using aspect ratio + min height
  let cgViewerContainer = document.getElementById("cgViewerContainer");

  if (!cgViewerContainer) {
    main.innerHTML = ""; // Clear main content only if cgViewerContainer doesn't exist
    cgViewerContainer = document.createElement("div");
    cgViewerContainer.id = "cgViewerContainer";
    cgViewerContainer.className = "max-w-5xl mx-auto text-center relative";
    cgViewerContainer.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <button id="backBtn" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">${t("backButton")}</button>
        <span id="cgPath" class="text-gray-200 font-bold"></span>
      </div>

      <h2 id="cgTitle" class="text-2xl font-bold mb-4"></h2>

      <div class="relative rounded-lg overflow-hidden shadow-lg bg-gray-800 flex items-center justify-center"
           style="width:100%; max-width:90%; aspect-ratio: 16 / 9; min-height: 60vh; margin: 0 auto;">
        
        <!-- Loading placeholder -->
        <div id="loadingSpinner" class="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          ${t("loading")}
        </div>

        <!-- Actual image -->
        <img id="cgImage" src="" alt=""
             class="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 opacity-0">

        <!-- Navigation arrows -->
        <button id="prevBtn" 
                class="absolute left-3 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
          &#10094;
        </button>
        <button id="nextBtn" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
          &#10095;
        </button>
      </div>

      <p id="cgDescription" class="mt-4 text-gray-300"></p>
      <p id="cgId" class="text-gray-500 text-sm mt-2"></p>
    `;
    main.appendChild(cgViewerContainer);

    // Modal (only create once)
    let imageModal = document.getElementById("imageModal");
    if (!imageModal) {
      imageModal = document.createElement("div");
      imageModal.id = "imageModal";
      imageModal.className = "fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center hidden z-50";
      imageModal.innerHTML = `<img id="modalImage" src="" class="max-w-[90%] max-h-[90%] rounded shadow-lg">`;
      document.body.appendChild(imageModal);
    }
  }

  // Update dynamic content
  document.getElementById("cgPath").textContent = `${categoryPath} (${index + 1} / ${parentList.length})`;
  
  const cgTitle = document.getElementById("cgTitle");
  if (section !== "Manga") {
    cgTitle.textContent = cg.Name || parentName || t("unknown");
    cgTitle.style.display = "block";
  } else {
    cgTitle.style.display = "none";
  }

  const cgDescription = document.getElementById("cgDescription");
  if (section !== "Manga") {
    cgDescription.textContent = cg.Desc || "";
    cgDescription.style.display = "block";
  } else {
    cgDescription.style.display = "none";
  }

  document.getElementById("cgId").textContent = `${t("idLabel")}: ${cg.Id}`;

  const cgImage = document.getElementById("cgImage");
  const spinner = document.getElementById("loadingSpinner");

  // Reset image opacity and show spinner before loading new image
  cgImage.classList.remove("opacity-100");
  cgImage.classList.add("opacity-0");
  spinner.style.display = "flex";

  cgImage.src = imgUrl;
  cgImage.alt = cg.Name;

  // Fade-in effect
  cgImage.onload = () => {
    spinner.style.display = "none";
    cgImage.classList.remove("opacity-0");
    cgImage.classList.add("opacity-100");
  };

  // Modal logic (ensure event listeners are only attached once)
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  if (!cgImage.dataset.listenerAttached) {
    cgImage.addEventListener("click", () => {
      modalImage.src = cgImage.src; // Use the current src of the displayed image
      imageModal.classList.remove("hidden");
    });
    cgImage.dataset.listenerAttached = "true";
  }

  if (!imageModal.dataset.listenerAttached) {
    imageModal.addEventListener("click", e => {
      if (e.target === imageModal) {
        imageModal.classList.add("hidden");
        modalImage.src = "";
      }
    });
    imageModal.dataset.listenerAttached = "true";
  }

  // Navigation buttons
  document.getElementById("backBtn").onclick = () => {
    showThumbnailGrid(parentList, parentName, section, page);
  };

  const prevBtn = document.getElementById("prevBtn");
  prevBtn.disabled = !prev;
  prevBtn.onclick = () => {
    if (prev) {
      showCG(prev, parentName, parentList, section, page);
    }
  };

  const nextBtn = document.getElementById("nextBtn");
  nextBtn.disabled = !next;
  nextBtn.onclick = () => {
    if (next) {
      showCG(next, parentName, parentList, section, page);
    }
  };

  // Preload a limited number of images around the current one
  const preloadRange = 7; // Preload 3 before, current, and 3 after
  const startIndex = Math.max(0, index - Math.floor(preloadRange / 2));
  const endIndex = Math.min(parentList.length - 1, index + Math.floor(preloadRange / 2));

  for (let i = startIndex; i <= endIndex; i++) {
    const itemToPreload = parentList[i];
    if (itemToPreload.Id !== cg.Id) { // Don't preload the current image again
      const preloadUrl = getAssetUrl(itemToPreload.Bg, { type: 'cg' });
      if (preloadUrl) {
        const preloadImg = new Image();
        preloadImg.src = preloadUrl;
      }
    }
  }
}
