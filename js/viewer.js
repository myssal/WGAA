// viewer.js
import { ASSET_REPO, BRANCH, currentRegion } from "./config.js";
import { t } from "./locale.js"; // your localization function

function getAssetUrl(path, options = { type: 'image' }) {
    if (!path) return "";

    let relativePath = path.replace(/^Assets[\\/]/, "").replace(/\\/g, "/");
    let parts = relativePath.split('/');
    let filename = parts.pop();
    let dir = parts.join('/').toLowerCase();

    let finalPath;

    if (options.type === 'thumbnail') {
        const baseName = filename.replace(/\.(jpg|png|jpeg)$/i, "");
        finalPath = `thumbnails/${dir}/${baseName}_thumb.webp`;
    } else if (options.type === 'cg') {
        const baseName = filename.replace(/\.(jpg|png|jpeg)$/i, "");
        finalPath = `${dir}/${baseName}.png`;
    } else { // emoji and other cases
        finalPath = `${dir}/${filename}`;
    }

    return `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/${finalPath}`;
}

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

    const prevButton = document.createElement("button");
    prevButton.textContent = t("prevButton");
    prevButton.className = "px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    prevButton.disabled = page <= 1;
    const pageIndicator = document.createElement("span");
    pageIndicator.textContent = `${t("page")} ${page} / ${totalPages}`;
    pageIndicator.className = "text-gray-300 cursor-pointer";
    pageIndicator.onclick = () => {
      const newPage = prompt(`${t("goToPage")} (1-${totalPages}):`, page);
      if (newPage && !isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        showThumbnailGrid(cgList, parentName, section, parseInt(newPage));
      }
    };

    const nextButton = document.createElement("button");
    nextButton.textContent = t("nextButton");
    nextButton.className = "px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => showThumbnailGrid(cgList, parentName, section, page + 1);

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageIndicator);
    paginationDiv.appendChild(nextButton);
    main.appendChild(paginationDiv);
  }
}

/** Show individual CG with navigation */
export function showCG(cg, parentName = "", parentList = [], section = "CG", page = 1) {
  const main = document.getElementById("mainContent");
  const categoryPath = parentName ? `${t(section)}/${parentName}` : t(section);
  const imgUrl = getAssetUrl(cg.Bg, { type: 'cg' });

  // Find current CG index
  const index = parentList.findIndex(item => item.Id === cg.Id);
  const prev = parentList[index - 1];
  const next = parentList[index + 1];

  // Keep container height stable using aspect ratio + min height
  main.innerHTML = `
    <div class="max-w-5xl mx-auto text-center relative">
      <div class="flex justify-between items-center mb-4">
        <button id="backBtn" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">${t("backButton")}</button>
        <span class="text-gray-200 font-bold">${categoryPath} (${index + 1} / ${parentList.length})</span>
      </div>

      ${section !== "Manga" ? `<h2 class="text-2xl font-bold mb-4">${cg.Name || parentName || t("unknown")}</h2>` : ""}

      <div class="relative rounded-lg overflow-hidden shadow-lg bg-gray-800 flex items-center justify-center"
           style="width:100%; max-width:90%; aspect-ratio: 16 / 9; min-height: 60vh; margin: 0 auto;">
        
        <!-- Loading placeholder -->
        <div id="loadingSpinner" class="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          ${t("loading")}
        </div>

        <!-- Actual image -->
        <img id="cgImage" src="${imgUrl}" alt="${cg.Name}"
             class="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 opacity-0">

        <!-- Navigation arrows -->
        <button id="prevBtn" ${!prev ? "disabled" : ""} 
                class="absolute left-3 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
          &#10094;
        </button>
        <button id="nextBtn" ${!next ? "disabled" : ""} 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
          &#10095;
        </button>
      </div>

      ${section !== "Manga" ? `<p class="mt-4 text-gray-300">${cg.Desc || ""}</p>` : ""}
      <p class="text-gray-500 text-sm mt-2">${t("idLabel")}: ${cg.Id}</p>
    </div>

    <!-- Modal -->
    <div id="imageModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center hidden z-50">
      <img id="modalImage" src="" class="max-w-[90%] max-h-[90%] rounded shadow-lg">
    </div>
  `;

  const cgImage = document.getElementById("cgImage");
  const spinner = document.getElementById("loadingSpinner");

  // Fade-in effect
  cgImage.onload = () => {
    spinner.style.display = "none";
    cgImage.classList.remove("opacity-0");
    cgImage.classList.add("opacity-100");
  };

  // Modal logic
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

  // Navigation buttons
  document.getElementById("backBtn").addEventListener("click", () => {
    showThumbnailGrid(parentList, parentName, section, page);
  });

  if (prev) document.getElementById("prevBtn").addEventListener("click", () => showCG(prev, parentName, parentList, section, page));
  if (next) document.getElementById("nextBtn").addEventListener("click", () => showCG(next, parentName, parentList, section, page));

  // Preload other images in the same group
  parentList.forEach(item => {
    if (item.Id !== cg.Id) {
      const preloadUrl = getAssetUrl(item.Bg, { type: 'cg' });
      if (preloadUrl) {
        const preloadImg = new Image();
        preloadImg.src = preloadUrl;
      }
    }
  });

  // Keyboard support
  document.onkeydown = (e) => {
    if (e.key === "ArrowLeft" && prev) showCG(prev, parentName, parentList, section, page);
    if (e.key === "ArrowRight" && next) showCG(next, parentName, parentList, section, page);
  };
}

export function showEmojiGrid(emojis, page = 1) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const pathDiv = document.createElement("div");
  pathDiv.className = "flex justify-between items-center mb-4";
  pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${t("emojiSection")}</span>`;
  main.appendChild(pathDiv);

  const gridDiv = document.createElement("div");
  gridDiv.className = "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6";
  main.appendChild(gridDiv);

  const pageSize = 24;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedEmojis = emojis.sort((a,b) => a.Order - b.Order).slice(start, end);

  paginatedEmojis.forEach(emoji => {
    const imgUrl = getAssetUrl(emoji.Path);

    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col items-center cursor-pointer";
    wrapper.onclick = () => {
      console.log(imgUrl);
      showEmojiDetails(emoji, emojis, page);
    };

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = emoji.Name;
    img.className = "w-full h-24 object-contain rounded hover:scale-105 transition";
    img.loading = "lazy";

    const caption = document.createElement("p");
    caption.textContent = emoji.ConnotationDesc;
    caption.className = "mt-1 text-sm text-gray-300 truncate text-center";

    wrapper.appendChild(img);
    wrapper.appendChild(caption);
    gridDiv.appendChild(wrapper);
  });

  // Pagination
  const totalPages = Math.ceil(emojis.length / pageSize);
  if (totalPages > 1) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "flex justify-center items-center space-x-4 mt-4";

    const prevButton = document.createElement("button");
    prevButton.textContent = t("prevButton");
    prevButton.className = "px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    prevButton.disabled = page <= 1;
    const pageIndicator = document.createElement("span");
    pageIndicator.textContent = `${t("page")} ${page} / ${totalPages}`;
    pageIndicator.className = "text-gray-300 cursor-pointer";
    pageIndicator.onclick = () => {
      const newPage = prompt(`${t("goToPage")} (1-${totalPages}):`, page);
      if (newPage && !isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        showEmojiGrid(emojis, parseInt(newPage));
      }
    };

    const nextButton = document.createElement("button");
    nextButton.textContent = t("nextButton");
    nextButton.className = "px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => showEmojiGrid(emojis, page + 1);

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageIndicator);
    paginationDiv.appendChild(nextButton);
    main.appendChild(paginationDiv);
  }
}

function showEmojiDetails(emoji, allEmojis, page = 1) {
  const modalId = "emoji-details-modal";
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  const imgUrl = getAssetUrl(emoji.Path);
  console.log(imgUrl);

  const main = document.getElementById("mainContent");

  const index = allEmojis.findIndex(item => item.Id === emoji.Id);

  modal = document.createElement("div");
  modal.id = modalId;
  modal.className = "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
      <button id="close-emoji-modal" class="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
      <div class="flex justify-between items-center mb-4">
        <button id="backBtn" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">${t("backButton")}</button>
        <span class="text-gray-200 font-bold">${t("emojiSection")} (${index + 1} / ${allEmojis.length})</span>
      </div>
      <div class="flex">
        <img src="${imgUrl}" alt="${emoji.ConnotationDesc}" class="w-24 h-24 object-contain rounded mr-8">
        <div class="text-left">
          <p class="font-bold">${emoji.ConnotationDesc}</p>
          <p class="italic">${emoji.WorldDesc}</p>
          <p>${emoji.Description}</p>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-4 text-right">ID: ${emoji.Id}</p>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("close-emoji-modal").onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };

  document.getElementById("backBtn").addEventListener("click", () => {
    modal.remove();
    showEmojiGrid(allEmojis, page);
  });
}

export function showStorySpriteGrid(storySprites, page = 1) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const pathDiv = document.createElement("div");
  pathDiv.className = "flex justify-between items-center mb-4";
  pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${t("storySpriteSection")}</span>`;
  main.appendChild(pathDiv);

  const gridDiv = document.createElement("div");
  gridDiv.className = "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6";
  main.appendChild(gridDiv);

  const pageSize = 18;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedSprites = storySprites.slice(start, end);

  paginatedSprites.forEach(sprite => {
    const imgUrl = getAssetUrl(sprite.RoleIcon);

    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col items-center cursor-pointer";
    wrapper.onclick = () => showStorySpriteDetails(sprite, storySprites, page);

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = sprite.Name;
    img.className = "w-full h-48 object-contain rounded hover:scale-105 transition";
    img.loading = "lazy";

    const caption = document.createElement("p");
    caption.textContent = sprite.Name;
    caption.className = "mt-1 text-sm text-gray-300 truncate text-center w-full";

    wrapper.appendChild(img);
    wrapper.appendChild(caption);
    gridDiv.appendChild(wrapper);
  });

  // Pagination
  const totalPages = Math.ceil(storySprites.length / pageSize);
  if (totalPages > 1) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "flex justify-center items-center space-x-4 mt-4";

    const prevButton = document.createElement("button");
    prevButton.textContent = t("prevButton");
    prevButton.className = "px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    prevButton.disabled = page <= 1;
    prevButton.onclick = () => showStorySpriteGrid(storySprites, page - 1);

    const pageIndicator = document.createElement("span");
    pageIndicator.textContent = `${t("page")} ${page} / ${totalPages}`;
    pageIndicator.className = "text-gray-300 cursor-pointer";
    pageIndicator.onclick = () => {
      const newPage = prompt(`${t("goToPage")} (1-${totalPages}):`, page);
      if (newPage && !isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        showStorySpriteGrid(storySprites, parseInt(newPage));
      }
    };

    const nextButton = document.createElement("button");
    nextButton.textContent = t("nextButton");
    nextButton.className = "px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => showStorySpriteGrid(storySprites, page + 1);

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageIndicator);
    paginationDiv.appendChild(nextButton);
    main.appendChild(paginationDiv);
  }
}

function showStorySpriteDetails(sprite, allSprites, page = 1) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const imgUrl = getAssetUrl(sprite.RoleIcon);

  main.innerHTML = `
    <div class="max-w-5xl mx-auto text-center relative">
      <div class="flex justify-between items-center mb-4">
        <button id="backBtn" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">${t("backButton")}</button>
        <span class="text-gray-200 font-bold">${t("storySpriteSection")} (${index + 1} / ${allSprites.length})</span>
      </div>

      <h2 class="text-2xl font-bold mb-4">${sprite.Name}</h2>

      <div class="relative rounded-lg overflow-hidden shadow-lg bg-gray-800 flex items-center justify-center"
           style="width:100%; max-width:90%; margin: 0 auto;">
        
        <img id="spriteImage" src="${imgUrl}" alt="${sprite.Name}"
             class="object-contain transition-opacity duration-500 opacity-100">

      </div>

      <p class="text-gray-500 text-sm mt-2">${t("idLabel")}: ${sprite.RoleId}</p>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => {
    showStorySpriteGrid(allSprites, page);
  });
}
