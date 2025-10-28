
import { showThumbnailGrid, showCG } from "./views/cg-viewer.js";
import { showEmojiGrid, showEmojiDetails } from "./views/emoji-viewer.js";
import { showChapterGrid } from "./views/manga-viewer.js";
import { showMemoryGrid, showMemoryDetails } from "./views/memory-viewer.js";
import { showStorySpriteGrid, showStorySpriteDetails } from "./views/story-sprite-viewer.js";
import { showConstructCoatingGrid, showWeaponCoatingGrid, showConstructCoatingDetailsPopup, showWeaponCoatingDetailsPopup } from "./views/coating-viewer.js";
import { groups, details, mangaGroups, mangaChapters, mangaDetails, emojis, emojiPacks, storySprites, equips, equipRes, equipSuits, awarenessSettings, fashions, characters, weaponFashions } from "./main.js";
import { t } from "./locale.js";

const routes = {
    "/": () => {
        document.getElementById("mainContent").innerHTML = `<p class="text-center text-gray-400">${t("welcomeMessage")}</p>`;
    },
    "/cg/:groupName": (groupName) => {
        const group = groups.find(g => g.Name === groupName);
        if (group) {
            const groupDetails = details.filter(d => d.GroupId === group.Id).sort((a, b) => a.Order - b.Order);
            showThumbnailGrid(groupDetails, group.Name, "CG", 1);
        }
    },
    "/cg/:groupName/:cgId": (groupName, cgId) => {
        const group = groups.find(g => g.Name === groupName);
        const cg = details.find(d => d.Id === parseInt(cgId));
        if (group && cg) {
            const groupDetails = details.filter(d => d.GroupId === group.Id).sort((a, b) => a.Order - b.Order);
            const pageSize = 16; // Ensure this matches showThumbnailGrid
            const index = groupDetails.findIndex(item => item.Id === cg.Id);
            const page = Math.ceil((index + 1) / pageSize);
            showCG(cg, group.Name, groupDetails, "CG", page);
        }
    },
    "/manga/:groupName": (groupName) => {
        const group = mangaGroups.find(g => g.Name === groupName);
        if (group) {
            const chapters = mangaChapters.filter(c => c.GroupId === group.Id).sort((a, b) => a.Order - b.Order);
            showChapterGrid(group, chapters, mangaDetails);
        }
    },
    "/manga/:groupName/:chapterName": (groupName, chapterName) => {
        const group = mangaGroups.find(g => g.Name === groupName);
        const chapter = mangaChapters.find(c => c.Name === chapterName && c.GroupId === group.Id);
        if (group && chapter) {
            const detailsList = mangaDetails.filter(d => d.ChapterId === chapter.Id);
            const augmented = detailsList.map(d => ({ ...d, ChapterName: chapter.Name }));
            showThumbnailGrid(augmented, `${group.Name}/${chapter.Name}`, "Manga", 1);
        }
    },
    "/manga/:groupName/:chapterName/:mangaId": (groupName, chapterName, mangaId) => {
        const group = mangaGroups.find(g => g.Name === groupName);
        const chapter = mangaChapters.find(c => c.Name === chapterName && c.GroupId === group.Id);
        const manga = mangaDetails.find(d => d.Id === parseInt(mangaId));
        if (group && chapter && manga) {
            const detailsList = mangaDetails.filter(d => d.ChapterId === chapter.Id);
            const augmented = detailsList.map(d => ({ ...d, ChapterName: chapter.Name }));
            const pageSize = 16; // Ensure this matches showThumbnailGrid
            const index = augmented.findIndex(item => item.Id === manga.Id);
            const page = Math.ceil((index + 1) / pageSize);
            showCG(manga, `${group.Name}/${chapter.Name}`, augmented, "Manga", page);
        }
    },
    "/emoji/:packId/:emojiId": (packId, emojiId) => {
        const id = parseInt(packId);
        const pack = emojiPacks.find(p => p.Id === id);
        const emoji = emojis.find(e => e.Id === parseInt(emojiId));
        if (emoji && pack) {
            let emojiList;
            if (pack.Id === 0) {
                emojiList = emojis.filter(e => !e.PackageId);
            } else {
                emojiList = emojis.filter(e => e.PackageId === pack.Id);
            }
            
            const pageSize = 24;
            const sortedEmojis = emojiList.sort((a,b) => a.Order - b.Order);
            const index = sortedEmojis.findIndex(e => e.Id === emoji.Id);
            const page = Math.ceil((index + 1) / pageSize);

            showEmojiGrid(emojiList, page, id);
            showEmojiDetails(emoji, emojiList, page, id);
        }
    },
    "/emoji/:packId/:page?": (packId, page = 1) => {
        const id = parseInt(packId);
        const pack = emojiPacks.find(p => p.Id === id);
        if (pack) {
            let filteredEmojis;
            if (pack.Id === 0) {
                filteredEmojis = emojis.filter(e => !e.PackageId);
            } else {
                filteredEmojis = emojis.filter(e => e.PackageId === pack.Id);
            }
            showEmojiGrid(filteredEmojis, parseInt(page), id);
        }
    },
    "/emoji/:page?": (page = 1) => {
        const main = document.getElementById("mainContent");
        main.innerHTML = ""; // Clear content
        showEmojiGrid(emojis.filter(e => !e.PackageId), parseInt(page), 'all');
    },
    "/story-sprite": () => {
        showStorySpriteGrid(storySprites, 1);
    },
    "/story-sprite/:spriteId": (spriteId) => {
        const sprite = storySprites.find(s => s.RoleId === parseInt(spriteId));
        if (sprite) {
            const pageSize = 18; // from showStorySpriteGrid
            const index = storySprites.findIndex(s => s.RoleId === sprite.RoleId);
            const page = Math.ceil((index + 1) / pageSize);
            showStorySpriteGrid(storySprites, page);
            showStorySpriteDetails(sprite, storySprites, page, index);
        }
    },
    "/memory": () => {
        showMemoryGrid(equipSuits, equips, equipRes);
    },
    "/memory/:memoryId": (memoryId) => {
        const memory = equipSuits.find(m => m.Id === parseInt(memoryId));
        if (memory) {
            showMemoryDetails(memory, equips, equipRes, awarenessSettings);
        }
    },
    "/coating/construct/:id": (id) => {
        const filteredFashions = fashions.filter(f => f.Description && !f.Description.includes("Default"));
        const fashion = filteredFashions.find(f => f.Id === parseInt(id));
        if (fashion) {
            const pageSize = 15; // Consistent with showConstructCoatingGrid
            const index = filteredFashions.findIndex(item => item.Id === fashion.Id);
            const page = Math.ceil((index + 1) / pageSize);
            showConstructCoatingGrid(fashions, characters, page);
            showConstructCoatingDetailsPopup(fashion, filteredFashions, characters, page);
        }
    },
    "/coating/weapon/:id": (id) => {
        const filteredWeaponFashions = weaponFashions.filter(f => f.Description && !f.Description.includes("Default"));
        const weaponFashion = filteredWeaponFashions.find(f => f.Id === parseInt(id));
        if (weaponFashion) {
            const pageSize = 15; // Consistent with showWeaponCoatingGrid
            const index = filteredWeaponFashions.findIndex(item => item.Id === weaponFashion.Id);
            const page = Math.ceil((index + 1) / pageSize);
            showWeaponCoatingGrid(weaponFashions, page);
            showWeaponCoatingDetailsPopup(weaponFashion, filteredWeaponFashions, page);
        }
    },
    "/coating/construct/:page?": (page = 1) => {
        showConstructCoatingGrid(fashions, characters, parseInt(page));
    },
    "/coating/weapon/:page?": (page = 1) => {
        showWeaponCoatingGrid(weaponFashions, parseInt(page));
    },

};

export const router = () => {
    const path = location.hash.slice(1) || "/";
    console.log("Router: Processing path", path);
    const pathParts = path.split("/").slice(1);

    let currentRoute = null;
    let params = [];

    for (const route in routes) {
        const routeParts = route.split("/").slice(1);
        // Calculate min and max length for the current route
        let minLength = 0;
        let maxLength = 0;
        routeParts.forEach(part => {
            if (!part.endsWith("?")) { // Required parameter
                minLength++;
                maxLength++;
            } else { // Optional parameter
                maxLength++;
            }
        });

        if (pathParts.length >= minLength && pathParts.length <= maxLength) {
            let match = true;
            let tempParams = [];
            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(":")) {
                    // If it's an optional parameter and not present in pathParts, push undefined
                    if (routeParts[i].endsWith("?") && i >= pathParts.length) {
                        tempParams.push(undefined);
                    } else {
                        tempParams.push(decodeURIComponent(pathParts[i]));
                    }
                } else if (routeParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                currentRoute = routes[route];
                params = tempParams;
                console.log("Router: Matched route", route, "with params", params);
                break;
            }
        }
    }

    if (currentRoute) {
        currentRoute(...params);
    } else {
        document.getElementById("mainContent").innerHTML = `<p class="text-center text-red-400">${t("notFound")}</p>`;
    }
};

export const initializeRouter = () => {
    window.addEventListener("hashchange", router);
};
