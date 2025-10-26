
import { showThumbnailGrid, showEmojiGrid, showStorySpriteGrid, showCG, showChapterGrid, showEmojiDetails, showStorySpriteDetails } from "./viewer.js";
import { groups, details, mangaGroups, mangaChapters, mangaDetails, emojis, storySprites } from "./main.js";
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
    "/emoji": () => {
        showEmojiGrid(emojis, 1);
    },
    "/story-sprite": () => {
        showStorySpriteGrid(storySprites, 1);
    },
    "/emoji/:emojiId": (emojiId) => {
        const emoji = emojis.find(e => e.Id === parseInt(emojiId));
        if (emoji) {
            const pageSize = 24; // from showEmojiGrid
            const sortedEmojis = emojis.sort((a,b) => a.Order - b.Order);
            const index = sortedEmojis.findIndex(e => e.Id === emoji.Id);
            const page = Math.ceil((index + 1) / pageSize);
            showEmojiGrid(emojis, page);
            showEmojiDetails(emoji, emojis, page);
        }
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
    }
};

export const router = () => {
    const path = location.hash.slice(1) || "/";
    const pathParts = path.split("/").slice(1);

    let currentRoute = null;
    let params = [];

    for (const route in routes) {
        const routeParts = route.split("/").slice(1);
        if (routeParts.length === pathParts.length) {
            let match = true;
            let tempParams = [];
            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(":")) {
                    tempParams.push(decodeURIComponent(pathParts[i]));
                } else if (routeParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                currentRoute = routes[route];
                params = tempParams;
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
