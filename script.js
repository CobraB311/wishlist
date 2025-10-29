document.addEventListener('DOMContentLoaded', () => {
    // Definieer de elementen
    const tabMenu = document.getElementById('tab-menu');
    const tabContent = document.getElementById('tab-content');
    const wishlistTitle = document.getElementById('wishlist-title');
    const emailInfo = document.getElementById('email-info');

    let wishlistData = null;

    // Functie om de JSON data in te laden
    async function loadWishlistData() {
        try {
            // Laadt het externe JSON-bestand
            const response = await fetch('wishlist.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            wishlistData = await response.json();
            
            // Start de weergave
            initializeApp();

        } catch (error) {
            console.error('Fout bij het laden van de wenslijst data:', error);
            tabContent.innerHTML = '<p>Fout bij het laden van de wenslijst. Controleer of het bestand `wishlist.json` bestaat en correct is.</p>';
        }
    }

    function initializeApp() {
        if (!wishlistData) return;

        // 1. Stel de algemene titel in
        wishlistTitle.textContent = wishlistData.wenslijst_titel;

        // 2. Stel de e-mailinformatie in
        emailInfo.innerHTML = `E-mail voor contact: <strong>${wishlistData.email}</strong>`;

        // 3. Laad de Tab Knoppen
        loadTabs();

        // 4. Toon de inhoud van de eerste persoon bij het laden
        if (wishlistData.personen.length > 0) {
            showContent(0);
        }
    }

    function loadTabs() {
        // Maak voor elke persoon een knop aan
        wishlistData.personen.forEach((persoon, index) => {
            const button = document.createElement('button');
            button.className = 'tab-button';
            button.textContent = persoon.naam;
            button.dataset.index = index;
            button.onclick = () => showContent(index);
            tabMenu.appendChild(button);
        });
    }

    function showContent(index) {
        // Verwijder 'active' van alle knoppen
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Voeg 'active' toe aan de geselecteerde knop
        const activeButton = document.querySelector(`.tab-button[data-index="${index}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Wis vorige inhoud
        tabContent.innerHTML = '';

        const persoon = wishlistData.personen[index];
        if (!persoon) return;

        // Voeg een subtitel toe
        const subTitle = document.createElement('h2');
        subTitle.textContent = `Wenslijst voor ${persoon.naam}`;
        subTitle.style.color = 'var(--primary-color)';
        subTitle.style.marginBottom = '25px';
        tabContent.appendChild(subTitle);


        // Bouw de items
        persoon.items.forEach(item => {
            const itemHtml = document.createElement('div');
            itemHtml.className = 'wishlist-item';
            
            // 1. Afbeelding
            const imageContainer = `
                <div class="item-image-container">
                    <img src="${item.afbeelding_url}" alt="${item.naam}">
                </div>
            `;

            // 2. Details en Links
            const linksHtml = item.winkels.map(winkel => `
                <a href="${winkel.link}" target="_blank" class="winkel-link">
                    ${winkel.naam}: <strong>${winkel.prijs}</strong>
                </a>
            `).join('');

            const detailsHtml = `
                <div class="item-details">
                    <h3>${item.naam} <small>(${item.nummer})</small></h3>
                    <p>${item.beschrijving}</p>
                    <div class="winkel-links">
                        ${linksHtml}
                    </div>
                </div>
            `;

            itemHtml.innerHTML = imageContainer + detailsHtml;
            tabContent.appendChild(itemHtml);
        });
    }

    // Start het proces: laad de data
    loadWishlistData();
});
