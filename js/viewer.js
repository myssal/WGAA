import { t } from "./locale.js";
import { ASSET_REPO, BRANCH } from "./config.js";

const mainContent = document.getElementById("mainContent");

export function showThumbnailGrid(items, title, type, page) {
    mainContent.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${title}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" id="thumbnailGrid"></div>
        <div id="pagination" class="flex justify-center items-center space-x-2 mt-4"></div>
    `;

    const grid = document.getElementById("thumbnailGrid");
    const pagination = document.getElementById("pagination");
    const pageSize = 16;
    const totalPages = Math.ceil(items.length / pageSize);

    const renderPage = (pageNumber) => {
        grid.innerHTML = "";
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        const paginatedItems = items.slice(start, end);

        paginatedItems.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200";
            itemDiv.innerHTML = `
                <img src="https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${item.Path}" alt="${item.Name}" class="w-full h-32 object-cover">
                <div class="p-2 text-center text-sm truncate">${item.Name}</div>
            `;
            itemDiv.addEventListener("click", () => {
                if (type === "CG") {
                    location.hash = `#/cg/${encodeURIComponent(title)}/${item.Id}`;
                } else if (type === "Manga") {
                    location.hash = `#/manga/${encodeURIComponent(title.split('/')[0])}/${encodeURIComponent(item.ChapterName)}/${item.Id}`;
                }
            });
            grid.appendChild(itemDiv);
        });
    };

    const renderPagination = (currentPage) => {
        pagination.innerHTML = "";

        const createButton = (text, pageNum, isActive = false, isDisabled = false) => {
            const button = document.createElement("button");
            button.className = `px-3 py-1 rounded ${isActive ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`;
            button.textContent = text;
            button.disabled = isDisabled;
            button.addEventListener("click", () => {
                if (!isDisabled) {
                    if (type === "CG") {
                        location.hash = `#/cg/${encodeURIComponent(title)}?page=${pageNum}`;
                    } else if (type === "Manga") {
                        location.hash = `#/manga/${encodeURIComponent(title.split('/')[0])}/${encodeURIComponent(title.split('/')[1])}?page=${pageNum}`;
                    }
                }
            });
            return button;
        };

        pagination.appendChild(createButton(t("prevButton"), currentPage - 1, false, currentPage === 1));

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            pagination.appendChild(createButton("1", 1));
            if (startPage > 2) {
                const span = document.createElement("span");
                span.textContent = "...";
                span.className = "px-3 py-1";
                pagination.appendChild(span);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createButton(i.toString(), i, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const span = document.createElement("span");
                span.textContent = "...";
                span.className = "px-3 py-1";
                pagination.appendChild(span);
            }
            pagination.appendChild(createButton(totalPages.toString(), totalPages));
        }

        pagination.appendChild(createButton(t("nextButton"), currentPage + 1, false, currentPage === totalPages));
    };

    renderPage(page);
    renderPagination(page);
}

export function showCG(cg, groupName, groupDetails, type, page) {
    mainContent.innerHTML = `
        <button id="backButton" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-4">${t("backButton")}</button>
        <div class="flex flex-col items-center">
            <h2 class="text-2xl font-bold mb-2">${cg.Name}</h2>
            <p class="text-gray-400 mb-4">${t("idLabel")}: ${cg.Id}</p>
            <img src="https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${cg.Path}" alt="${cg.Name}" class="max-w-full h-auto rounded-lg shadow-lg mb-4">
            <div class="flex space-x-2">
                <button id="prevCgButton" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">${t("prevButton")}</button>
                <button id="nextCgButton" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">${t("nextButton")}</button>
            </div>
        </div>
    `;

    document.getElementById("backButton").addEventListener("click", () => {
        if (type === "CG") {
            location.hash = `#/cg/${encodeURIComponent(groupName)}?page=${page}`;
        } else if (type === "Manga") {
            location.hash = `#/manga/${encodeURIComponent(groupName.split('/')[0])}/${encodeURIComponent(groupName.split('/')[1])}?page=${page}`;
        }
    });

    const currentIndex = groupDetails.findIndex(item => item.Id === cg.Id);

    const prevCgButton = document.getElementById("prevCgButton");
    if (currentIndex > 0) {
        prevCgButton.addEventListener("click", () => {
            const prevCg = groupDetails[currentIndex - 1];
            if (type === "CG") {
                location.hash = `#/cg/${encodeURIComponent(groupName)}/${prevCg.Id}`;
            } else if (type === "Manga") {
                location.hash = `#/manga/${encodeURIComponent(groupName.split('/')[0])}/${encodeURIComponent(prevCg.ChapterName)}/${prevCg.Id}`;
            }
        });
    } else {
        prevCgButton.disabled = true;
        prevCgButton.classList.add("opacity-50", "cursor-not-allowed");
    }

    const nextCgButton = document.getElementById("nextCgButton");
    if (currentIndex < groupDetails.length - 1) {
        nextCgButton.addEventListener("click", () => {
            const nextCg = groupDetails[currentIndex + 1];
            if (type === "CG") {
                location.hash = `#/cg/${encodeURIComponent(groupName)}/${nextCg.Id}`;
            } else if (type === "Manga") {
                location.hash = `#/manga/${encodeURIComponent(groupName.split('/')[0])}/${encodeURIComponent(nextCg.ChapterName)}/${nextCg.Id}`;
            }
        });
    } else {
        nextCgButton.disabled = true;
        nextCgButton.classList.add("opacity-50", "cursor-not-allowed");
    }
}

export function showChapterGrid(group, chapters, mangaDetails) {
    mainContent.innerHTML = `
        <button id="backButton" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-4">${t("backButton")}</button>
        <h2 class="text-2xl font-bold mb-4">${group.Name}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" id="chapterGrid"></div>
    `;

    document.getElementById("backButton").addEventListener("click", () => {
        location.hash = "#/";
    });

    const grid = document.getElementById("chapterGrid");
    chapters.forEach(chapter => {
        const chapterDiv = document.createElement("div");
        chapterDiv.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200";
        
        const firstMangaInChapter = mangaDetails.find(m => m.ChapterId === chapter.Id);
        const imagePath = firstMangaInChapter ? `https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${firstMangaInChapter.Path}` : "";

        chapterDiv.innerHTML = `
            <img src="${imagePath}" alt="${chapter.Name}" class="w-full h-32 object-cover">
            <div class="p-2 text-center text-sm truncate">${chapter.Name}</div>
        `;
        chapterDiv.addEventListener("click", () => {
            location.hash = `#/manga/${encodeURIComponent(group.Name)}/${encodeURIComponent(chapter.Name)}`;
        });
        grid.appendChild(chapterDiv);
    });
}

export function showEmojiGrid(emojis, page, packId) {
    mainContent.innerHTML = `
        <button id="backButton" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-4">${t("backButton")}</button>
        <h2 class="text-2xl font-bold mb-4">${t("emojiSection")}</h2>
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4" id="emojiGrid"></div>
        <div id="pagination" class="flex justify-center items-center space-x-2 mt-4"></div>
    `;

    document.getElementById("backButton").addEventListener("click", () => {
        location.hash = "#/";
    });

    const grid = document.getElementById("emojiGrid");
    const pagination = document.getElementById("pagination");
    const pageSize = 24;
    const totalPages = Math.ceil(emojis.length / pageSize);

    const renderPage = (pageNumber) => {
        grid.innerHTML = "";
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        const paginatedEmojis = emojis.sort((a,b) => a.Order - b.Order).slice(start, end);

        paginatedEmojis.forEach(emoji => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center p-2";
            itemDiv.innerHTML = `
                <img src="https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${emoji.Path}" alt="${emoji.Name}" class="w-16 h-16 object-contain">
                <div class="p-1 text-center text-xs truncate">${emoji.Name}</div>
            `;
            itemDiv.addEventListener("click", () => {
                location.hash = `#/emoji/${packId}/${emoji.Id}`;
            });
            grid.appendChild(itemDiv);
        });
    };

    const renderPagination = (currentPage) => {
        pagination.innerHTML = "";

        const createButton = (text, pageNum, isActive = false, isDisabled = false) => {
            const button = document.createElement("button");
            button.className = `px-3 py-1 rounded ${isActive ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`;
            button.textContent = text;
            button.disabled = isDisabled;
            button.addEventListener("click", () => {
                if (!isDisabled) {
                    location.hash = `#/emoji/${packId}/${pageNum}`;
                }
            });
            return button;
        };

        pagination.appendChild(createButton(t("prevButton"), currentPage - 1, false, currentPage === 1));

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            pagination.appendChild(createButton("1", 1));
            if (startPage > 2) {
                const span = document.createElement("span");
                span.textContent = "...";
                span.className = "px-3 py-1";
                pagination.appendChild(span);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createButton(i.toString(), i, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const span = document.createElement("span");
                span.textContent = "...";
                span.className = "px-3 py-1";
                pagination.appendChild(span);
            }
            pagination.appendChild(createButton(totalPages.toString(), totalPages));
        }

        pagination.appendChild(createButton(t("nextButton"), currentPage + 1, false, currentPage === totalPages));
    };

    renderPage(page);
    renderPagination(page);
}

export function showEmojiDetails(emoji, emojiList, page, packId) {
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";
    detailsContainer.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-xl relative w-11/12 md:w-1/2 lg:w-1/3">
            <button id="closeEmojiDetails" class="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold">&times;</button>
            <h3 class="text-xl font-bold mb-4">${emoji.Name}</h3>
            <img src="https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${emoji.Path}" alt="${emoji.Name}" class="w-full h-auto object-contain mb-4">
            <p>${t("idLabel")}: ${emoji.Id}</p>
        </div>
    `;
    document.body.appendChild(detailsContainer);

    document.getElementById("closeEmojiDetails").addEventListener("click", () => {
        document.body.removeChild(detailsContainer);
        location.hash = `#/emoji/${packId}/${page}`;
    });
}

export function showStorySpriteGrid(sprites, page) {
    mainContent.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${t("storySpriteSection")}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" id="spriteGrid"></div>
        <div id="pagination" class="flex justify-center items-center space-x-2 mt-4"></div>
    `;

    const grid = document.getElementById("spriteGrid");
    const pagination = document.getElementById("pagination");
    const pageSize = 18;
    const totalPages = Math.ceil(sprites.length / pageSize);

    const renderPage = (pageNumber) => {
        grid.innerHTML = "";
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        const paginatedSprites = sprites.slice(start, end);

        paginatedSprites.forEach(sprite => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200";
            itemDiv.innerHTML = `
                <img src="https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${sprite.Path}" alt="${sprite.Name}" class="w-full h-32 object-cover">
                <div class="p-2 text-center text-sm truncate">${sprite.Name}</div>
            `;
            itemDiv.addEventListener("click", () => {
                location.hash = `#/story-sprite/${sprite.RoleId}`;
            });
            grid.appendChild(itemDiv);
        });
    };

    const renderPagination = (currentPage) => {
        pagination.innerHTML = "";

        const createButton = (text, pageNum, isActive = false, isDisabled = false) => {
            const button = document.createElement("button");
            button.className = `px-3 py-1 rounded ${isActive ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`;
            button.textContent = text;
            button.disabled = isDisabled;
            button.addEventListener("click", () => {
                if (!isDisabled) {
                    location.hash = `#/story-sprite?page=${pageNum}`;
                }
            });
            return button;
        };

        pagination.appendChild(createButton(t("prevButton"), currentPage - 1, false, currentPage === 1));

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            pagination.appendChild(createButton("1", 1));
            if (startPage > 2) {
                const span = document.createElement("span");
                span.textContent = "...";
                span.className = "px-3 py-1";
                pagination.appendChild(span);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createButton(i.toString(), i, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const span = document.createElement("span");
                span.textContent = "...";
                span.className = "px-3 py-1";
                pagination.appendChild(span);
            }
            pagination.appendChild(createButton(totalPages.toString(), totalPages));
        }

        pagination.appendChild(createButton(t("nextButton"), currentPage + 1, false, currentPage === totalPages));
    };

    renderPage(page);
    renderPagination(page);
}

export function showStorySpriteDetails(sprite, spriteList, page, index) {
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50";
    detailsContainer.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-xl relative w-11/12 md:w-1/2 lg:w-1/3">
            <button id="closeSpriteDetails" class="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold">&times;</button>
            <h3 class="text-xl font-bold mb-4">${sprite.Name}</h3>
            <img src="https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${sprite.Path}" alt="${sprite.Name}" class="w-full h-auto object-contain mb-4">
            <p>${t("idLabel")}: ${sprite.RoleId}</p>
        </div>
    `;
    document.body.appendChild(detailsContainer);

    document.getElementById("closeSpriteDetails").addEventListener("click", () => {
        document.body.removeChild(detailsContainer);
        location.hash = `#/story-sprite?page=${page}`;
    });
}

export function showMemoryGrid(equipSuits, equipRes) {
    mainContent.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${t("memorySection")}</h2>
        <div class="flex items-center space-x-4 mb-4">
            <select id="memoryFilter" class="bg-gray-700 text-gray-200 rounded px-2 py-1 focus:ring focus:ring-blue-500"></select>
            <input type="text" id="memorySearch" placeholder="${t("searchByName")}" class="bg-gray-700 text-gray-200 rounded px-2 py-1 focus:ring focus:ring-blue-500 flex-1">
        </div>
        <div class="grid grid-cols-3 gap-4" id="memoryGrid"></div>
    `;

    const memoryGrid = document.getElementById("memoryGrid");
    const memoryFilter = document.getElementById("memoryFilter");
    const memorySearch = document.getElementById("memorySearch");

    // Populate filter options
    const uniqueDescriptions = [...new Set(equipSuits.map(suit => suit.Description))].sort();
    memoryFilter.innerHTML = `<option value="all">${t("allMemories")}</option>`;
    uniqueDescriptions.forEach(desc => {
        const option = document.createElement("option");
        option.value = desc;
        option.textContent = desc;
        memoryFilter.appendChild(option);
    });

    const renderMemories = (filteredSuits) => {
        memoryGrid.innerHTML = "";
        filteredSuits.forEach(suit => {
            const memoryDiv = document.createElement("div");
            memoryDiv.className = "bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200";
            const imagePath = suit.WaferBagPath ? (() => {
                let relativePath = suit.WaferBagPath;
                if (relativePath.startsWith("Assets/")) {
                    relativePath = relativePath.substring("Assets/".length);
                }
                const lastSlashIndex = relativePath.lastIndexOf('/');
                if (lastSlashIndex > -1) {
                    const directory = relativePath.substring(0, lastSlashIndex).toLowerCase();
                    const filename = relativePath.substring(lastSlashIndex + 1);
                    return `https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${directory}/${filename}`;
                } else {
                    return `https://cdn.jsdelivr.net/gh/${ASSET_REPO}@${BRANCH}/${relativePath}`;
                }
            })() : '';
            memoryDiv.innerHTML = `
                <img src="${imagePath}" alt="${suit.Name}" class="w-full h-32 object-cover">
                <div class="p-2 text-center text-sm truncate">${suit.Name}</div>
            `;
            console.log("Memory Image URL:", imagePath);
            // TODO: Add click event for detail view later
            memoryDiv.addEventListener("click", () => {
                console.log("Clicked memory:", suit.Name);
            });
            memoryGrid.appendChild(memoryDiv);
        });
    };

    const applyFilters = () => {
        const selectedDescription = memoryFilter.value;
        const searchTerm = memorySearch.value.toLowerCase();

        let filteredSuits = equipSuits;

        if (selectedDescription !== "all") {
            filteredSuits = filteredSuits.filter(suit => suit.Description === selectedDescription);
        }

        if (searchTerm) {
            filteredSuits = filteredSuits.filter(suit => suit.Name.toLowerCase().includes(searchTerm));
        }
        renderMemories(filteredSuits);
    };

    memoryFilter.addEventListener("change", applyFilters);
    memorySearch.addEventListener("input", applyFilters);

    renderMemories(equipSuits);
}

export function showMemoryDetails(memory) {
    // This will be implemented later
    console.log("Showing details for:", memory);
}