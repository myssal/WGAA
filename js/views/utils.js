import { ASSET_REPO, BRANCH } from "../config.js";

export function createPageInput(currentPage, totalPages, onPageChange) {
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
