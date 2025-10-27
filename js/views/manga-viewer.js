import { t } from "../locale.js";
import { getAssetUrl } from "./utils.js";

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
