import { t } from '../locale.js';

export function renderHome() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="w-full p-4">
            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-4 text-left">WGAA Museum</h2>
                <div class="version-box rounded-lg">
                    <h3 class="text-lg font-semibold mb-2 text-left p-4">Current game version:</h3>
                    <table id="versionTable" class="w-full text-left"></table>
                </div>
            </div>
        </div>
    `;

    fetch('https://raw.githubusercontent.com/myssal/PGR_Data/master/version.json')
        .then(response => response.json())
        .then(data => {
            const versionTable = document.getElementById('versionTable');
            const regions = {
                'CN': 'CN',
                'EN': 'EN',
                'JP': 'JP',
                'KR': 'KR',
                'TW': 'TW'
            };

            let tableHTML = `
                <thead>
                    <tr>
                        <th class="p-4">Region</th>
                        <th class="p-4">Android</th>
                        <th class="p-4">PC</th>
                    </tr>
                </thead>
                <tbody>
            `;

            for (const [key, name] of Object.entries(regions)) {
                const androidVersion = data[key] || 'N/A';
                const pcVersion = data[`${key}_PC`] || 'N/A';
                tableHTML += `
                    <tr>
                        <td class="p-4">${name}</td>
                        <td class="p-4">${androidVersion}</td>
                        <td class="p-4">${pcVersion}</td>
                    </tr>
                `;
            }

            tableHTML += `</tbody>`;
            versionTable.innerHTML = tableHTML;
        })
        .catch(error => {
            console.error('Error fetching version data:', error);
            const versionList = document.getElementById('versionList');
            versionList.innerHTML = `<p class="text-red-400">${t('failedLoad')}</p>`;
        });
}
