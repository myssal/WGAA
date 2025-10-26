// viewer.js
import { ASSET_REPO, BRANCH, currentRegion } from "./config.js";
import { t } from "./locale.js"; // your localization function

function createPageInput(currentPage, totalPages, onPageChange) {
    const container = document.createElement("div");
    container.className = "flex items-center space-x-1 text-gray-300";

    const input = document.createElement("input");
    input.type = "text";
    input.value = currentPage;
    input.className = "w-12 text-center bg-gray-800 border border-gray-600 rounded focus:ring focus:ring-blue-500";
    input.onchange = (e) => {
        let newPage = parseInt(e.target.value);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage);
        } else {
            e.target.value = currentPage; // Reset if invalid
        }
    };

    const label = document.createElement("span");
    label.textContent = `/ ${totalPages}`;

    container.appendChild(input);
    container.appendChild(label);

    return { container, input, label };
}


export function getAssetUrl(path, options = { type: 'image' }) {
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


export function showChapterGrid(group, chapters, mangaDetails) {
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
        location.hash = `#/manga/${encodeURIComponent(group.Name)}/${encodeURIComponent(chap.Name)}`;
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

  const prevBtn = document.getElementById("prevBtn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (prev) {
        showCG(prev, parentName, parentList, section, page);
      }
    });
  }

  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (next) {
        showCG(next, parentName, parentList, section, page);
      }
    });
  }

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
      location.hash = `#/emoji/${emoji.Id}`;
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

    const firstPageButton = document.createElement("button");
    firstPageButton.textContent = "<<";
    firstPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    firstPageButton.disabled = page <= 1;
    firstPageButton.onclick = () => showEmojiGrid(emojis, 1);

    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    prevButton.disabled = page <= 1;
    prevButton.onclick = () => showEmojiGrid(emojis, page - 1);

    const pageInput = createPageInput(page, totalPages, (newPage) => {
        showEmojiGrid(emojis, newPage);
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => showEmojiGrid(emojis, page + 1);

    const lastPageButton = document.createElement("button");
    lastPageButton.textContent = ">>";
    lastPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    lastPageButton.disabled = page >= totalPages;
    lastPageButton.onclick = () => showEmojiGrid(emojis, totalPages);

    paginationDiv.appendChild(firstPageButton);
    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInput.container);
    paginationDiv.appendChild(nextButton);
    paginationDiv.appendChild(lastPageButton);
    main.appendChild(paginationDiv);
  }
}



export function showEmojiDetails(emoji, allEmojis, page = 1) {
  const modalId = "emoji-details-modal";
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  function closeModal() {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
    location.hash = `#/emoji`;
  }

  const imgUrl = getAssetUrl(emoji.Path);
  console.log(imgUrl);

  const main = document.getElementById("mainContent");

  const index = allEmojis.findIndex(item => item.Id === emoji.Id);
  const prev = allEmojis[index - 1];
  const next = allEmojis[index + 1];

  modal = document.createElement("div");
  modal.id = modalId;
  modal.className = "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative">
      <button id="close-emoji-modal" class="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
      <div class="flex justify-center items-center mb-4">
        <span class="text-gray-200 font-bold">${t("emojiSection")} (${index + 1} / ${allEmojis.length})</span>
      </div>
      <button id="prevBtn" ${!prev ? "disabled" : ""} 
              class="absolute left-0 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
        &#10094;
      </button>

      <div class="flex items-center justify-center">
          <img src="${imgUrl}" alt="${emoji.ConnotationDesc}" class="w-24 h-24 object-contain rounded mr-8">
          <div class="text-left">
              <p class="font-bold">${emoji.ConnotationDesc}</p>
              <p class="italic">${emoji.WorldDesc}</p>
              <p>${emoji.Description}</p>
          </div>
      </div>

      <button id="nextBtn" ${!next ? "disabled" : ""}
              class="absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
        &#10095;
      </button>

      <p class="text-xs text-gray-500 mt-4 text-right">ID: ${emoji.Id}</p>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("close-emoji-modal").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };

  if (prev) document.getElementById("prevBtn").addEventListener("click", () => location.hash = `#/emoji/${prev.Id}`);
  if (next) document.getElementById("nextBtn").addEventListener("click", () => location.hash = `#/emoji/${next.Id}`);
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
  
    paginatedSprites.forEach((sprite, index) => {
      const imgUrl = getAssetUrl(sprite.RoleIcon);
  
      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center cursor-pointer";
      wrapper.onclick = () => location.hash = `#/story-sprite/${sprite.RoleId}`;
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

    const firstPageButton = document.createElement("button");
    firstPageButton.textContent = "<<";
    firstPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    firstPageButton.disabled = page <= 1;
    firstPageButton.onclick = () => showStorySpriteGrid(storySprites, 1);

    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    prevButton.disabled = page <= 1;
    prevButton.onclick = () => showStorySpriteGrid(storySprites, page - 1);

    const pageInput = createPageInput(page, totalPages, (newPage) => {
        showStorySpriteGrid(storySprites, newPage);
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => showStorySpriteGrid(storySprites, page + 1);

    const lastPageButton = document.createElement("button");
    lastPageButton.textContent = ">>";
    lastPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    lastPageButton.disabled = page >= totalPages;
    lastPageButton.onclick = () => showStorySpriteGrid(storySprites, totalPages);

    paginationDiv.appendChild(firstPageButton);
    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInput.container);
    paginationDiv.appendChild(nextButton);
    paginationDiv.appendChild(lastPageButton);
    main.appendChild(paginationDiv);
  }
}

export function showStorySpriteDetails(sprite, allSprites, page = 1, index = 0) {
  const modalId = "story-sprite-details-modal";
  let modal = document.getElementById(modalId);

  function closeStorySpriteModal() {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
    location.hash = `#/story-sprite`;
  }

  const imgUrl = getAssetUrl(sprite.RoleIcon);

  if (!modal) {
    // Create modal if it doesn't exist
    modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative flex flex-col items-center">
        <button id="close-story-sprite-modal" class="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
        <h2 id="spriteModalTitle" class="text-gray-200 font-bold mb-4"></h2>
        <div class="sprite-canvas">
          <!-- Navigation arrows -->
          <button id="prevSpriteBtn" class="absolute left-0 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
            &#10094;
          </button>
          <img id="detailSpriteImage" src="" alt="" class="max-w-full max-h-full object-contain rounded cursor-pointer">
          <button id="nextSpriteBtn" class="absolute right-0 top-1/2 -translate-y-1/2 text-3xl text-gray-300 hover:text-white disabled:opacity-30 z-10">
            &#10095;
          </button>
        </div>
        <p id="spriteModalName" class="font-bold text-lg mt-4"></p>
        <p id="spriteModalId" class="text-xs text-gray-500 mt-2"></p>
      </div>
    `;
    document.body.appendChild(modal);

    // Event listeners for the modal itself (only once)
    document.getElementById("close-story-sprite-modal").onclick = closeStorySpriteModal;
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeStorySpriteModal();
      }
    };

    // Image pop-up listener
    document.getElementById("detailSpriteImage").addEventListener("click", () => {
      const imageModal = document.getElementById("imageModal");
      const modalImage = document.getElementById("modalImage");
      modalImage.src = document.getElementById("detailSpriteImage").src;
      imageModal.classList.add("fixed-size-modal");
      imageModal.classList.remove("hidden");
    });
  }

  // Update content of the existing modal
  document.getElementById("spriteModalTitle").textContent = `${t("storySpriteSection")} (${index + 1} / ${allSprites.length})`;
  document.getElementById("detailSpriteImage").src = imgUrl;
  document.getElementById("detailSpriteImage").alt = sprite.Name;
  document.getElementById("spriteModalName").textContent = sprite.Name;
  document.getElementById("spriteModalId").textContent = `ID: ${sprite.RoleId}`;

  const prevSprite = allSprites[index - 1];
  const nextSprite = allSprites[index + 1];

  const prevSpriteBtn = document.getElementById("prevSpriteBtn");
  const nextSpriteBtn = document.getElementById("nextSpriteBtn");

  prevSpriteBtn.disabled = !prevSprite;
  nextSpriteBtn.disabled = !nextSprite;

  // Update navigation button handlers to call showStorySpriteDetails with new sprite and index
  prevSpriteBtn.onclick = () => {
    if (prevSprite) {
      location.hash = `#/story-sprite/${prevSprite.RoleId}`;
    }
  };

  nextSpriteBtn.onclick = () => {
    if (nextSprite) {
      location.hash = `#/story-sprite/${nextSprite.RoleId}`;
    }
  };

  document.getElementById("close-story-sprite-modal").onclick = closeStorySpriteModal;
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeStorySpriteModal();
    }
  };
}
