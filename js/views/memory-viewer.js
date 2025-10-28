import { t } from "../locale.js";
import { getAssetUrl, createPageInput } from "./utils.js";

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

export function showMemoryDetails(memorySuit, equips, equipRes, awarenessSettings, page = 1) {
  const modalId = "memory-details-modal";
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  function closeModal(currentPage) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
    const targetHash = `#/memory`;
    const targetHashWithPage = currentPage && currentPage > 1 ? `${targetHash}/${currentPage}` : targetHash;
    location.hash = targetHashWithPage;
  }

  const memoryId = memorySuit.Id;
  const memoryName = memorySuit.Name;

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

  modal = document.createElement("div");
  modal.id = modalId;
  modal.className = "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl relative max-h-[90%] overflow-y-auto">
      <button id="close-memory-modal" class="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl">&times;</button>
      <div class="flex justify-between items-center mb-4">
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

  document.body.appendChild(modal);

  document.getElementById("close-memory-modal").onclick = () => closeModal(page);
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal(page);
    }
  };

  // Update URL hash when modal is opened
  location.hash = `#/memory/${memorySuit.Id}`;

  // Handle image modal (existing logic)
  let imageModal = document.getElementById("imageModal");
  if (!imageModal) {
    imageModal = document.createElement("div");
    imageModal.id = "imageModal";
    imageModal.className = "fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center hidden z-[60]";
    imageModal.innerHTML = `<img id="modalImage" src="" class="max-w-[90%] max-h-[90%] rounded shadow-lg">`;
    document.body.appendChild(imageModal);

    imageModal.addEventListener("click", e => {
      if (e.target === imageModal) {
        imageModal.classList.add("hidden");
        document.getElementById("modalImage").src = "";
      }
    });
  }
}
