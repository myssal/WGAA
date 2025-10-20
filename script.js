const DATA_REPO = "myssal/PGR_Data";
const ASSET_REPO = "myssal/PGR-Assets";
const BRANCH = "master";

let currentRegion = "en";
let groups = [];
let details = [];

/** Load configs from jsDelivr (small, safe repo) */
async function loadConfigs(region) {
  const baseUrl = `https://cdn.jsdelivr.net/gh/${DATA_REPO}@${BRANCH}/${region}/bytes/share/archive`;

  try {
    const [groupRes, detailRes] = await Promise.all([
      fetch(`${baseUrl}/CGGroup.json`),
      fetch(`${baseUrl}/CGDetail.json`)
    ]);

    if (!groupRes.ok || !detailRes.ok) {
      throw new Error("Failed to fetch config files");
    }

    groups = await groupRes.json();
    details = await detailRes.json();

    renderSidebar();
  } catch (err) {
    console.error("❌ Failed to load config:", err);
    document.getElementById("mainContent").innerHTML =
      `<p class="text-red-400 text-center mt-6">Failed to load data for region: ${region}</p>`;
  }
}

/** Render sidebar with collapsible categories + scroll */
function renderSidebar() {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";
  container.className =
    "h-full overflow-y-auto pr-2 space-y-2 text-gray-200";

  groups
    .sort((a, b) => a.Order - b.Order)
    .forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "border-b border-gray-700 pb-2";

      // Header button (collapsible)
      const header = document.createElement("button");
      header.className =
        "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
      header.innerHTML = `
        <span class="font-semibold">${group.Name}</span>
        <span class="transition-transform duration-200" data-arrow>▼</span>
      `;

      // List of CGs (initially hidden)
      const cgListDiv = document.createElement("div");
      cgListDiv.className = "max-h-0 overflow-hidden transition-all duration-300";

      const cgList = details
        .filter(d => d.GroupId === group.Id)
        .sort((a, b) => a.Order - b.Order);

      cgList.forEach(cg => {
        const btn = document.createElement("button");
        btn.className =
          "block w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition text-sm";
        btn.textContent = cg.Name;
        btn.onclick = () => showCG(cg);
        cgListDiv.appendChild(btn);
      });

      // Toggle collapse on header click
      header.addEventListener("click", () => {
        const expanded = cgListDiv.classList.toggle("max-h-0");
        if (expanded) {
          cgListDiv.classList.remove("max-h-[500px]");
        } else {
          cgListDiv.classList.add("max-h-[500px]");
        }
        const arrow = header.querySelector("[data-arrow]");
        arrow.style.transform = cgListDiv.classList.contains("max-h-0")
          ? "rotate(0deg)"
          : "rotate(180deg)";
      });

      groupDiv.appendChild(header);
      groupDiv.appendChild(cgListDiv);
      container.appendChild(groupDiv);
    });
}

/** Display a CG in the main area */
function showCG(cg) {
  const main = document.getElementById("mainContent");

  // Use raw.githubusercontent.com because jsDelivr blocks large repos
  let relativePath = cg.Bg
  .replace(/^Assets[\\/]/, "")
  .replace(/\\/g, "/");

  // Split into directory and filename
  let parts = relativePath.split("/");
  let filename = parts.pop(); // keep case
  let dir = parts.join("/").toLowerCase(); // only lower directory

  let imgUrl = `https://raw.githubusercontent.com/${ASSET_REPO}/${BRANCH}/${dir}/${filename.replace(/\.jpg$/, ".png")}`;

  console.log("🖼️ Image URL:", imgUrl);
  console.log("CG object:", cg);

  main.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">${cg.Name}</h2>
      <div class="rounded-lg overflow-hidden shadow-lg bg-gray-800 p-2">
        <img src="${imgUrl}" alt="${cg.Name}" class="w-full object-contain max-h-[70vh] mx-auto">
      </div>
      <p class="mt-4 text-gray-300">${cg.Desc || ""}</p>
      <p class="text-gray-500 text-sm mt-2">ID: ${cg.Id}</p>
      <div class="mt-4 text-sm text-gray-400">
        <a href="${imgUrl}" target="_blank" class="underline hover:text-blue-400">Open Image in New Tab</a>
      </div>
    </div>
  `;
}

/** Region change listener */
document.getElementById("regionSelect").addEventListener("change", e => {
  currentRegion = e.target.value;
  loadConfigs(currentRegion);
});

/** Initialize */
loadConfigs(currentRegion);
