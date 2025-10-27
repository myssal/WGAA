import { t } from "../locale.js";
import { getAssetUrl, createPageInput } from "./utils.js";

export function showConstructCoatingGrid(fashions, characters, page = 1) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const pathDiv = document.createElement("div");
  pathDiv.className = "flex justify-between items-center mb-4";
  pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${t("constructCoating")}</span>`;
  main.appendChild(pathDiv);

  // Filter out default coatings
  const filteredFashions = fashions.filter(f => f.Description && !f.Description.includes("Default"));

  // Filter UI
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "flex items-center space-x-4 mb-4";
  main.appendChild(controlsDiv);

  const filterSelect = document.createElement("select");
  filterSelect.className = "bg-gray-700 text-gray-200 rounded px-2 py-1 focus:ring focus:ring-blue-500";
  let allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = t("all");
  filterSelect.appendChild(allOption);

  const characterNames = [...new Set(characters.map(c => c.Name))].sort();
  characterNames.forEach(name => {
    let option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    filterSelect.appendChild(option);
  });
  controlsDiv.appendChild(filterSelect);

  const gridDiv = document.createElement("div");
  gridDiv.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6";
  main.appendChild(gridDiv);

  const renderGrid = (fashionsToRender, currentPage) => {
    gridDiv.innerHTML = "";
    const pageSize = 16;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedFashions = fashionsToRender.slice(start, end);

    paginatedFashions.forEach(fashion => {
      const thumbUrl = getAssetUrl(fashion.CharacterIcon);
      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center cursor-pointer";
      wrapper.onclick = () => {
        location.hash = `#/coating/construct/${fashion.Id}`;
      };

      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = fashion.Name;
      img.className = "w-full h-48 object-contain rounded hover:scale-105 transition";
      img.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = fashion.Name;
      caption.className = "mt-1 text-sm text-gray-300 truncate text-center";

      wrapper.appendChild(img);
      wrapper.appendChild(caption);
      gridDiv.appendChild(wrapper);
    });

    // Pagination
    const totalPages = Math.ceil(fashionsToRender.length / pageSize);
    let paginationDiv = document.getElementById("coating-pagination");
    if (paginationDiv) {
        paginationDiv.remove();
    }
    if (totalPages > 1) {
        paginationDiv = document.createElement("div");
        paginationDiv.id = "coating-pagination";
        paginationDiv.className = "flex justify-center items-center space-x-4 mt-4";

        const firstPageButton = document.createElement("button");
        firstPageButton.textContent = "<<";
        firstPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        firstPageButton.disabled = currentPage <= 1;
        firstPageButton.onclick = () => renderGrid(fashionsToRender, 1);

        const prevButton = document.createElement("button");
        prevButton.textContent = "<";
        prevButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        prevButton.disabled = currentPage <= 1;
        prevButton.onclick = () => renderGrid(fashionsToRender, currentPage - 1);

        const pageInput = createPageInput(currentPage, totalPages, (newPage) => {
            renderGrid(fashionsToRender, newPage);
        });

        const nextButton = document.createElement("button");
        nextButton.textContent = ">";
        nextButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        nextButton.disabled = currentPage >= totalPages;
        nextButton.onclick = () => renderGrid(fashionsToRender, currentPage + 1);

        const lastPageButton = document.createElement("button");
        lastPageButton.textContent = ">>";
        lastPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        lastPageButton.disabled = currentPage >= totalPages;
        lastPageButton.onclick = () => renderGrid(fashionsToRender, totalPages);

        paginationDiv.appendChild(firstPageButton);
        paginationDiv.appendChild(prevButton);
        paginationDiv.appendChild(pageInput.container);
        paginationDiv.appendChild(nextButton);
        paginationDiv.appendChild(lastPageButton);
        main.appendChild(paginationDiv);
    }
  }

  const applyFilters = () => {
    const selectedCharacter = filterSelect.value;
    let fashionsToRender = filteredFashions;
    if (selectedCharacter) {
        const character = characters.find(c => c.Name === selectedCharacter);
        if (character) {
            fashionsToRender = filteredFashions.filter(f => f.CharacterId === character.Id);
        }
    }
    renderGrid(fashionsToRender, 1);
  }

  filterSelect.addEventListener("change", applyFilters);
  applyFilters();
}

export function showConstructCoatingDetails(fashion) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const imgUrl = getAssetUrl(fashion.CharacterIcon);
  const rarity = '★'.repeat(fashion.Quality);

  main.innerHTML = `
    <div class="max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg shadow-xl">
      <div class="flex justify-between items-center mb-4">
        <button id="backToGrid" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">${t("backButton")}</button>
        <span class="text-gray-400">coating/construct/${fashion.Name}</span>
      </div>

      <div class="flex mb-6">
        <img src="${imgUrl}" alt="${fashion.Name}" class="w-32 h-32 object-contain mr-8">
        <div class="flex-1 text-left space-y-2">
          <h2 class="text-3xl font-bold text-gray-100">${fashion.Name} (${rarity})</h2>
          <p class="text-lg text-gray-300 italic">"${fashion.Description.replace(/\n/g, '<br>')}"</p>
          <p class="text-sm text-gray-300">${t("worldDescription")}:</p>
          <p class="text-sm text-gray-400 preserve-whitespace">${fashion.WorldDescription}</p>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-4 text-right">ID: ${fashion.Id}</p>
    </div>
  `;

  document.getElementById("backToGrid").onclick = () => {
    history.back();
  };
}

export function showWeaponCoatingGrid(weaponFashions, page = 1) {
  const main = document.getElementById("mainContent");
  main.innerHTML = "";

  const pathDiv = document.createElement("div");
  pathDiv.className = "flex justify-between items-center mb-4";
  pathDiv.innerHTML = `<span class="text-gray-200 font-bold">${t("weaponCoating")}</span>`;
  main.appendChild(pathDiv);

  const gridDiv = document.createElement("div");
  gridDiv.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6";
  main.appendChild(gridDiv);

  const renderGrid = (fashionsToRender, currentPage) => {
    gridDiv.innerHTML = "";
    const pageSize = 16;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedFashions = fashionsToRender.slice(start, end);

    paginatedFashions.forEach(fashion => {
      const thumbUrl = getAssetUrl(fashion.ShopIcon);
      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center cursor-pointer";
      wrapper.onclick = () => {
        location.hash = `# /coating/weapon/${fashion.Id}`;
      };

      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = fashion.Name;
      img.className = "w-full h-48 object-contain rounded hover:scale-105 transition";
      img.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = fashion.Name;
      caption.className = "mt-1 text-sm text-gray-300 truncate text-center";

      wrapper.appendChild(img);
      wrapper.appendChild(caption);
      gridDiv.appendChild(wrapper);
    });

    // Pagination
    const totalPages = Math.ceil(fashionsToRender.length / pageSize);
    let paginationDiv = document.getElementById("coating-pagination");
    if (paginationDiv) {
        paginationDiv.remove();
    }
    if (totalPages > 1) {
        paginationDiv = document.createElement("div");
        paginationDiv.id = "coating-pagination";
        paginationDiv.className = "flex justify-center items-center space-x-4 mt-4";

        const firstPageButton = document.createElement("button");
        firstPageButton.textContent = "<<";
        firstPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        firstPageButton.disabled = currentPage <= 1;
        firstPageButton.onclick = () => renderGrid(fashionsToRender, 1);

        const prevButton = document.createElement("button");
        prevButton.textContent = "<";
        prevButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        prevButton.disabled = currentPage <= 1;
        prevButton.onclick = () => renderGrid(fashionsToRender, currentPage - 1);

        const pageInput = createPageInput(currentPage, totalPages, (newPage) => {
            renderGrid(fashionsToRender, newPage);
        });

        const nextButton = document.createElement("button");
        nextButton.textContent = ">";
        nextButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        nextButton.disabled = currentPage >= totalPages;
        nextButton.onclick = () => renderGrid(fashionsToRender, currentPage + 1);

        const lastPageButton = document.createElement("button");
        lastPageButton.textContent = ">>";
        lastPageButton.className = "px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50";
        lastPageButton.disabled = currentPage >= totalPages;
        lastPageButton.onclick = () => renderGrid(fashionsToRender, totalPages);

        paginationDiv.appendChild(firstPageButton);
        paginationDiv.appendChild(prevButton);
        paginationDiv.appendChild(pageInput.container);
        paginationDiv.appendChild(nextButton);
        paginationDiv.appendChild(lastPageButton);
        main.appendChild(paginationDiv);
    }
  }
  renderGrid(weaponFashions, page);
}

export function showWeaponCoatingDetails(weaponFashion) {
    const main = document.getElementById("mainContent");
    main.innerHTML = "";

    const imgUrl = getAssetUrl(weaponFashion.ShopIcon);
    const rarity = '★'.repeat(weaponFashion.Quality);

    main.innerHTML = `
    <div class="max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg shadow-xl">
        <div class="flex justify-between items-center mb-4">
        <button id="backToGrid" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">${t("backButton")}</button>
        <span class="text-gray-400">coating/weapon/${weaponFashion.Name}</span>
        </div>

        <div class="flex mb-6">
        <img src="${imgUrl}" alt="${weaponFashion.Name}" class="w-32 h-32 object-contain mr-8">
        <div class="flex-1 text-left space-y-2">
            <h2 class="text-3xl font-bold text-gray-100">${weaponFashion.Name} (${rarity})</h2>
            <p class="text-lg text-gray-300 italic">"${weaponFashion.Description.replace(/\n/g, '<br>')}"</p>
            <p class="text-sm text-gray-300">${t("worldDescription")}:</p>
            <p class="text-sm text-gray-400 preserve-whitespace">${weaponFashion.WorldDescription}</p>
        </div>
        </div>
        <p class="text-xs text-gray-500 mt-4 text-right">ID: ${weaponFashion.Id}</p>
    </div>
    `;

    document.getElementById("backToGrid").onclick = () => {
        history.back();
    };
}