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
    } 
    else { // emoji and other cases
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

export function showEmojiGrid(emojis, page = 1, packId = 'all') {
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
      location.hash = `#/emoji/${packId}/${emoji.Id}`;
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
    firstPageButton.onclick = () => showEmojiGrid(emojis, 1, packId);

    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    prevButton.disabled = page <= 1;
    prevButton.onclick = () => showEmojiGrid(emojis, page - 1, packId);

    const pageInput = createPageInput(page, totalPages, (newPage) => {
        showEmojiGrid(emojis, newPage, packId);
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    nextButton.disabled = page >= totalPages;
    nextButton.onclick = () => showEmojiGrid(emojis, page + 1, packId);

    const lastPageButton = document.createElement("button");
    lastPageButton.textContent = ">>";
    lastPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
    lastPageButton.disabled = page >= totalPages;
    lastPageButton.onclick = () => showEmojiGrid(emojis, totalPages, packId);

    paginationDiv.appendChild(firstPageButton);
    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInput.container);
    paginationDiv.appendChild(nextButton);
    paginationDiv.appendChild(lastPageButton);
    main.appendChild(paginationDiv);
  }
}



export function showEmojiDetails(emoji, allEmojis, page = 1, packId = 'all') {
  const modalId = "emoji-details-modal";
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  function closeModal(currentPage) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
    // Construct the hash for the current pack and page
    const targetHash = packId === 'all' ? `#/emoji` : `#/emoji/${packId}`;
    const targetHashWithPage = currentPage && currentPage > 1 ? `${targetHash}/${currentPage}` : targetHash;

    // Only update location.hash if it's different from the current one
    if (location.hash !== targetHashWithPage) {
      location.hash = targetHashWithPage;
    }
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

  document.getElementById("close-emoji-modal").onclick = () => closeModal(page); // Pass the current page
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal(page); // Pass the current page
    }
  };

  const pageSize = 24; // Consistent with showEmojiGrid
  const sortedEmojis = allEmojis.sort((a,b) => a.Order - b.Order); // Ensure sorted list for index calculation

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.disabled = !prev;
  nextBtn.disabled = !next;

  // Remove existing listeners to prevent multiple calls
  prevBtn.onclick = null;
  nextBtn.onclick = null;

  if (prev) {
    prevBtn.onclick = () => {
      const prevIndex = sortedEmojis.findIndex(item => item.Id === prev.Id);
      const prevPage = Math.ceil((prevIndex + 1) / pageSize);
      showEmojiDetails(prev, allEmojis, prevPage, packId); // Update modal content
      showEmojiGrid(allEmojis, prevPage, packId); // Update background grid
    };
  }
  if (next) {
    nextBtn.onclick = () => {
      const nextIndex = sortedEmojis.findIndex(item => item.Id === next.Id);
      const nextPage = Math.ceil((nextIndex + 1) / pageSize);
      showEmojiDetails(next, allEmojis, nextPage, packId); // Update modal content
      showEmojiGrid(allEmojis, nextPage, packId); // Update background grid
    };
  }
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

  function closeStorySpriteModal(currentPage) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
    // Construct the hash for the current page
    const targetHash = `#/story-sprite`;
    const targetHashWithPage = currentPage && currentPage > 1 ? `${targetHash}/${currentPage}` : targetHash;

    // Only update location.hash if it's different from the current one
    if (location.hash !== targetHashWithPage) {
      location.hash = targetHashWithPage;
    }
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
  const pageSize = 18; // Consistent with showStorySpriteGrid

  // Remove existing listeners to prevent multiple calls
  prevSpriteBtn.onclick = null;
  nextSpriteBtn.onclick = null;

  if (prevSprite) {
    prevSpriteBtn.onclick = () => {
      const prevSpriteIndex = allSprites.findIndex(item => item.RoleId === prevSprite.RoleId);
      const prevSpritePage = Math.ceil((prevSpriteIndex + 1) / pageSize);
      showStorySpriteDetails(prevSprite, allSprites, prevSpritePage, prevSpriteIndex); // Update modal content
      showStorySpriteGrid(allSprites, prevSpritePage); // Update background grid
    };
  }

  if (nextSprite) {
    nextSpriteBtn.onclick = () => {
      const nextSpriteIndex = allSprites.findIndex(item => item.RoleId === nextSprite.RoleId);
      const nextSpritePage = Math.ceil((nextSpriteIndex + 1) / pageSize);
      showStorySpriteDetails(nextSprite, allSprites, nextSpritePage, nextSpriteIndex); // Update modal content
      showStorySpriteGrid(allSprites, nextSpritePage); // Update background grid
    };
  }

  document.getElementById("close-story-sprite-modal").onclick = () => closeStorySpriteModal(page); // Pass the current page
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeStorySpriteModal(page); // Pass the current page
    }
  };
}

export function showMemoryGrid(equipSuits, equips, equipRes, page = 1) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const pathDiv = document.createElement("div");
  pathDiv.className = "flex justify-between items-center mb-4";
  pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${t("memorySection")}</span>`;
  main.appendChild(pathDiv);

  // Filter and Search controls
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "flex items-center space-x-4 mb-4";
  main.appendChild(controlsDiv);

  // Filter by Description
  const uniqueDescriptions = [...new Set(equipSuits.map(suit => suit.Description))].sort();
  const filterSelect = document.createElement("select");
  filterSelect.className = "bg-gray-700 text-gray-200 rounded px-2 py-1 focus:ring focus:ring-blue-500";
  let allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = t("all"); // Assuming 'all' translation exists or add it
  filterSelect.appendChild(allOption);
  uniqueDescriptions.forEach(desc => {
    let option = document.createElement("option");
    option.value = desc;
    option.textContent = desc;
    filterSelect.appendChild(option);
  });
  controlsDiv.appendChild(filterSelect);

  // Search by Name
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = t("search");
  searchInput.className = "bg-gray-700 text-gray-200 rounded px-2 py-1 focus:ring focus:ring-blue-500 flex-1";
  controlsDiv.appendChild(searchInput);

  let filteredMemories = equipSuits.filter(suit => suit.Id !== 0);

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDescription = filterSelect.value;

    filteredMemories = equipSuits.filter(suit => {
      if (suit.Id === 0) return false;
      const matchesSearch = suit.Name.toLowerCase().includes(searchTerm);
      const matchesFilter = selectedDescription === "" || suit.Description === selectedDescription;
      return matchesSearch && matchesFilter;
    });
    renderGrid(filteredMemories, page);
  };

  filterSelect.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", applyFilters);


  const gridDiv = document.createElement("div");
  gridDiv.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6"; // 3 columns
  main.appendChild(gridDiv);

  const pageSize = 18; // Adjust as needed

  const renderGrid = (memoriesToRender, currentPage) => {
    gridDiv.innerHTML = ""; // Clear existing grid items

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedMemories = memoriesToRender.slice(start, end);

    paginatedMemories.forEach(suit => {
      const thumbUrl = getAssetUrl(suit.WaferBagPath, { type: 'memory' });

      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center cursor-pointer bg-gray-800 p-3 rounded-lg shadow hover:shadow-lg transition-shadow duration-200";
      wrapper.onclick = () => {
        location.hash = `#/memory/${suit.Id}`;
      };

      const img = document.createElement("img");
      img.src = thumbUrl || 'https://via.placeholder.com/150?text=No+Image';
      img.alt = suit.Name;
      img.className = "w-full h-40 object-contain rounded mb-2";
      img.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = suit.Name;
      caption.className = "text-sm text-gray-300 truncate text-center font-semibold";

      wrapper.appendChild(img);
      wrapper.appendChild(caption);
      gridDiv.appendChild(wrapper);
    });

    // Pagination
    const totalPages = Math.ceil(memoriesToRender.length / pageSize);
    let paginationDiv = document.getElementById("memory-pagination");
    if (paginationDiv) {
        paginationDiv.remove();
    }

    if (totalPages > 1) {
      paginationDiv = document.createElement("div");
      paginationDiv.id = "memory-pagination";
      paginationDiv.className = "flex justify-center items-center space-x-4 mt-4";

      const firstPageButton = document.createElement("button");
      firstPageButton.textContent = "<<";
      firstPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
      firstPageButton.disabled = currentPage <= 1;
      firstPageButton.onclick = () => renderGrid(memoriesToRender, 1);

      const prevButton = document.createElement("button");
      prevButton.textContent = "<";
      prevButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
      prevButton.disabled = currentPage <= 1;
      prevButton.onclick = () => renderGrid(memoriesToRender, currentPage - 1);

      const pageInput = createPageInput(currentPage, totalPages, (newPage) => {
          renderGrid(memoriesToRender, newPage);
      });

      const nextButton = document.createElement("button");
      nextButton.textContent = ">";
      nextButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
      nextButton.disabled = currentPage >= totalPages;
      nextButton.onclick = () => renderGrid(memoriesToRender, currentPage + 1);

      const lastPageButton = document.createElement("button");
      lastPageButton.textContent = ">>";
      lastPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
      lastPageButton.disabled = currentPage >= totalPages;
      lastPageButton.onclick = () => renderGrid(memoriesToRender, totalPages);

      paginationDiv.appendChild(firstPageButton);
      paginationDiv.appendChild(prevButton);
      paginationDiv.appendChild(pageInput.container);
      paginationDiv.appendChild(nextButton);
      paginationDiv.appendChild(lastPageButton);
      main.appendChild(paginationDiv);
    }
  };

  applyFilters(); // Initial render
}

export function showMemoryDetails(memorySuit, equips, equipRes, awarenessSettings) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const memoryId = memorySuit.Id;
  const memoryName = memorySuit.Name;

  // Modal (only create once)
  let imageModal = document.getElementById("imageModal");
  if (!imageModal) {
    imageModal = document.createElement("div");
    imageModal.id = "imageModal";
    imageModal.className = "fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center hidden z-50";
    imageModal.innerHTML = `<img id="modalImage" src="" class="max-w-[90%] max-h-[90%] rounded shadow-lg">`;
    document.body.appendChild(imageModal);

    // Add event listener to close modal when clicking outside the image
    imageModal.addEventListener("click", e => {
      if (e.target === imageModal) {
        imageModal.classList.add("hidden");
        document.getElementById("modalImage").src = "";
      }
    });
  }

  // Find associated Equip and EquipRes data
  const equipId = memorySuit.EquipIds && memorySuit.EquipIds.length > 0 ? memorySuit.EquipIds[0] : null;
  const equip = equipId ? equips.find(e => e.Id === equipId) : null;
  const equipResource = equipId ? equipRes.find(er => er.Id === equipId) : null;

  // Backstory
  const backstories = awarenessSettings.filter(aw => aw.SuitId === memoryId).sort((a, b) => a.Order - b.Order);

  const iconUrl = getAssetUrl(memorySuit.ClearIconPath, { type: 'memory' });
  const waferBagUrl = getAssetUrl(memorySuit.WaferBagPath, { type: 'memory' });
  const liHuiPath1 = memorySuit.EquipIds && memorySuit.EquipIds.length > 0 ? equipRes.find(er => er.Id === memorySuit.EquipIds[0])?.LiHuiPath : null;
  const liHuiPath2 = memorySuit.EquipIds && memorySuit.EquipIds.length > 1 ? equipRes.find(er => er.Id === memorySuit.EquipIds[1])?.LiHuiPath : null;
  const liHuiPath3 = memorySuit.EquipIds && memorySuit.EquipIds.length > 2 ? equipRes.find(er => er.Id === memorySuit.EquipIds[2])?.LiHuiPath : null;

  const liHuiUrl1 = liHuiPath1 ? getAssetUrl(liHuiPath1, { type: 'memory' }) : 'https://via.placeholder.com/100x150?text=N/A';
  const liHuiUrl2 = liHuiPath2 ? getAssetUrl(liHuiPath2, { type: 'memory' }) : 'https://via.placeholder.com/100x150?text=N/A';
  const liHuiUrl3 = liHuiPath3 ? getAssetUrl(liHuiPath3, { type: 'memory' }) : 'https://via.placeholder.com/100x150?text=N/A';


  main.innerHTML = `
    <div class="max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg shadow-xl">
      <div class="flex justify-between items-center mb-4">
        <button id="backToMemoryGrid" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">${t("backButton")}</button>
        <span class="text-gray-400">memory/${memoryName}</span>
      </div>

      <div class="flex mb-6">
        <img src="${iconUrl}" alt="${memoryName}" class="w-32 h-32 object-contain mr-8">
        <div class="flex-1 text-left space-y-2">
          <h2 class="text-3xl font-bold text-gray-100">${memoryName} ${equip ? `(${equip.Quality}★)` : ''}</h2>
          <span class="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mt-1">${memorySuit.Description}</span>
          <p class="text-sm text-gray-300">${t("artist")}: ${equipResource ? equipResource.PainterName : 'N/A'}</p>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-100 mb-2 text-left">${t("setEffect")}</h3>
        <div class="bg-gray-700 p-3 rounded-md mb-2 text-left">
          <p class="font-bold text-gray-200">${t("set2Effect")}:</p>
          <p class="text-gray-300">${memorySuit.SkillDescription[0] || 'N/A'}</p>
        </div>
        <div class="bg-gray-700 p-3 rounded-md text-left">
          <p class="font-bold text-gray-200">${t("set4Effect")}:</p>
          <p class="text-gray-300">${memorySuit.SkillDescription[1] || 'N/A'}</p>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-100 mb-2 text-left">${t("illustration")}</h3>
        <div class="grid grid-cols-3 gap-4">
          <img src="${liHuiUrl1}" alt="${memoryName} 1" class="w-full h-auto object-contain rounded-lg shadow-md cursor-pointer" onclick="document.getElementById('modalImage').src = this.src; document.getElementById('imageModal').classList.remove('hidden');">
          <img src="${liHuiUrl2}" alt="${memoryName} 2" class="w-full h-auto object-contain rounded-lg shadow-md cursor-pointer" onclick="document.getElementById('modalImage').src = this.src; document.getElementById('imageModal').classList.remove('hidden');">
          <img src="${liHuiUrl3}" alt="${memoryName} 3" class="w-full h-auto object-contain rounded-lg shadow-md cursor-pointer" onclick="document.getElementById('modalImage').src = this.src; document.getElementById('imageModal').classList.remove('hidden');">
        </div>
      </div>

      <div>
        <h3 class="text-xl font-semibold text-gray-100 mb-2 text-left">${t("backstory")}</h3>
        ${backstories.map(story => `<div class="bg-gray-700 p-3 rounded-md mb-2 text-left"><p class="font-bold text-gray-200">${story.Title}</p><p class="text-gray-300 preserve-whitespace">${story.Text}</p></div>`).join('')}
        ${backstories.length === 0 ? `<p class="text-gray-400 text-left">No backstory available.</p>` : ''}
      </div>
    </div>
  `;

  document.getElementById("backToMemoryGrid").onclick = () => {
    location.hash = "#/memory";
  };
}