// viewer.js
import { ASSET_REPO, BRANCH } from "./config.js";

export function showCG(cg) {
  const main = document.getElementById("mainContent");

  let relativePath = cg.Bg.replace(/^Assets[\\/]/, "").replace(/\\/g, "/");
  let parts = relativePath.split("/");
  let filename = parts.pop();
  let dir = parts.join("/").toLowerCase();

  let imgUrl = `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/${dir}/${filename.replace(/\.jpg$/, ".png")}`;

  main.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">${cg.Name}</h2>
      <div class="rounded-lg overflow-hidden shadow-lg bg-gray-800 p-2">
        <img src="${imgUrl}" alt="${cg.Name}" class="w-full object-contain max-h-[70vh] mx-auto">
      </div>
      <p class="mt-4 text-gray-300">${cg.Desc || ""}</p>
      <p class="text-gray-500 text-sm mt-2">ID: ${cg.Id}</p>
    </div>
  `;
}
