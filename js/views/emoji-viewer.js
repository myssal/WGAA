import { t } from "../locale.js";
import { getAssetUrl, createPageInput } from "./utils.js";

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
