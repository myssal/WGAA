import { t } from "../locale.js";
import { getAssetUrl, createPageInput } from "./utils.js";

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
