// sidebar.js
import { showCG } from "./viewer.js";
import { groups, details } from "./main.js";

/** Render sidebar with collapsible categories and search */
export function renderSidebar() {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";
  container.className =
    "h-full overflow-y-auto pr-2 space-y-2 text-gray-200 relative";

  const globalSearch = document.getElementById("globalSearch");
  const query = globalSearch?.value.trim().toLowerCase() || "";

  console.log("Rendering sidebar, search query:", query);

  groups
    .sort((a, b) => a.Order - b.Order)
    .forEach(group => {
      const cgList = details
        .filter(d => d.GroupId === group.Id)
        .sort((a, b) => a.Order - b.Order);

      const filtered = query
        ? cgList.filter(cg => cg.Name.toLowerCase().includes(query))
        : cgList;

      console.log(
        `Group "${group.Name}" (ID: ${group.Id}) - total CGs: ${cgList.length}, filtered: ${filtered.length}`
      );

      if (filtered.length === 0 && query) return;

      const groupDiv = document.createElement("div");
      groupDiv.className = "group-item border-b border-gray-700 pb-2";

      // Group Header
      const header = document.createElement("button");
      header.className =
        "w-full text-left flex justify-between items-center px-2 py-2 bg-gray-800 rounded hover:bg-gray-700 transition";
      header.innerHTML = `
        <span class="font-semibold">${group.Name}</span>
        <span class="transition-transform duration-200" data-arrow>▼</span>
      `;

      // CG List container (no independent scroll)
      const cgListDiv = document.createElement("div");
      cgListDiv.className =
        "max-h-0 overflow-hidden transition-all duration-300";

      filtered.forEach(cg => {
        const btn = document.createElement("button");
        btn.className =
          "block w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition text-sm";
        btn.textContent = cg.Name;
        btn.onclick = () => showCG(cg);
        cgListDiv.appendChild(btn);
      });

      // Expand/collapse logic
      const arrow = header.querySelector("[data-arrow]");
      let expanded = false;
      const setExpanded = state => {
        expanded = state;
        if (expanded) {
          cgListDiv.classList.remove("max-h-0");
          cgListDiv.style.maxHeight = null; // allow full height naturally
          arrow.style.transform = "rotate(180deg)";
        } else {
          cgListDiv.classList.add("max-h-0");
          cgListDiv.style.maxHeight = null;
          arrow.style.transform = "rotate(0deg)";
        }
      };

      header.addEventListener("click", () => setExpanded(!expanded));

      // Auto-expand if search matches
      if (query && filtered.length > 0) setExpanded(true);

      groupDiv.appendChild(header);
      groupDiv.appendChild(cgListDiv);
      container.appendChild(groupDiv);
    });

  // Optional: subtle fade at bottom
  const fadeDiv = document.createElement("div");
  fadeDiv.className =
    "absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-900 pointer-events-none";
  container.appendChild(fadeDiv);
}
