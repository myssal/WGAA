// viewer.js
export function showCG(cg, parentName = "") {
  const main = document.getElementById("mainContent");

  const displayName = cg.Name || parentName || "Unknown";

  let relativePath = cg.Bg?.replace(/^Assets[\\/]/, "").replace(/\\/g, "/") || "";
  let parts = relativePath.split("/");
  let filename = parts.pop();
  let dir = parts.join("/").toLowerCase();

  let imgUrl = filename 
    ? `https://raw.githubusercontent.com/myssal/PGR-Assets/master/${dir}/${filename.replace(/\.jpg$/, ".png")}`
    : "";

  main.innerHTML = `
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-2xl font-bold mb-4">${displayName}</h2>
      <div class="rounded-lg overflow-hidden shadow-lg bg-gray-800 p-2">
        <img id="cgImage" src="${imgUrl}" alt="${displayName}" class="w-full object-contain max-h-[70vh] mx-auto cursor-pointer">
      </div>
      <p class="mt-4 text-gray-300">${cg.Desc || ""}</p>
      <p class="text-gray-500 text-sm mt-2">ID: ${cg.Id}</p>
    </div>

    <!-- Modal Overlay -->
    <div id="imageModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center hidden z-50">
      <img id="modalImage" src="" class="max-w-[90%] max-h-[90%] rounded shadow-lg">
    </div>
  `;

  // Add click behavior for modal
  const cgImage = document.getElementById("cgImage");
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  cgImage.addEventListener("click", () => {
    modalImage.src = imgUrl;
    imageModal.classList.remove("hidden");
  });

  // Close modal when clicking outside image
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.classList.add("hidden");
      modalImage.src = "";
    }
  });
}



