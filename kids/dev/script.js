// E-MAILADRES VAN DE BEHEERDER/ONTVANGER
const recipientEmail = 'bernaertruben@hotmail.com';

// --- NINJAGO SPECIFIEKE FUNCTIES ---

// Genereer 50 elementaire vonken (voorheen sneeuw) in de zijbalk
function createSparks() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    
    container.innerHTML = ''; // Veiligheidshalve leegmaken
    const sparkCount = 50; 
    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'snow'; // Gebruikt de styling uit style.css
        container.appendChild(spark);
    }
}

// --- FUNCTIES VOOR CLAIMING ---

function claimItem(persoonNaam, itemName, itemId) {
    const subject = `BEVESTIGING: Cadeau Gekocht voor ${persoonNaam} - ${itemName}`;
    const body = `Beste wensenlijstbeheerder,\n\nIk heb het volgende cadeau gekocht van de wensenlijst:\n\nPersoon: ${persoonNaam}\nItem: ${itemName}\nID: ${itemId}\n\nBedankt voor het bijhouden van deze lijst!\n\nMet vriendelijke groeten,\n[Uw Naam]`;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// --- FUNCTIES VOOR TAB-NAVIGATIE EN SCROLLEN ---

function openTab(evt, tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
    
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add("active");
    }
    
    let targetButton;
    if (evt && evt.currentTarget) {
        targetButton = evt.currentTarget;
    } else {
        targetButton = document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
    }

    if (targetButton) {
        targetButton.classList.add("active");
        
        // NINJAGO ELEMENTAIRE KLEUREN LOGICA
        const btnText = targetButton.innerText.toLowerCase();
        // Reset naar standaard Ninja-rood
        targetButton.style.backgroundColor = ""; 
        
        if (btnText.includes('jonas')) {
            targetButton.style.backgroundColor = "#b71c1c"; // Kai (Rood)
        } else if (btnText.includes('milan')) {
            targetButton.style.backgroundColor = "#1976d2"; // Jay (Blauw)
        } else if (btnText.includes('gezamenlijk')) {
            targetButton.style.backgroundColor = "#2e7d32"; // Lloyd (Groen)
        }
    }

    const pageWrapper = document.querySelector('.page-wrapper');
    if (pageWrapper) {
        pageWrapper.scrollTop = 0;
    }
}

function scrollToItem(persoonNaam, itemId) {
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    openTab(null, tabId); 
    
    setTimeout(() => {
        const itemElement = document.getElementById(itemId);
        if (itemElement) {
            document.querySelectorAll('.wens-item').forEach(el => el.classList.remove('highlight'));
            itemElement.classList.add('highlight');
            itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                itemElement.classList.remove('highlight');
            }, 3000); 
        }
    }, 100); 
}

// --- GENERATIE FUNCTIES ---

function updateHtmlTitle(wishlistData) {
    const names = wishlistData.personen.map(p => p.naam).join(' & ');
    document.title = `🥷 De Ninjago Wenslijst van ${names} 🥷`;
}

function generateOverviewGrid(wishlistData) {
    const gridContainer = document.getElementById('overview-grid-container');
    let overviewHtml = '';

    const allSections = [...wishlistData.personen];
    if (wishlistData.gezamenlijke_items) allSections.push(wishlistData.gezamenlijke_items);

    allSections.forEach(section => {
        overviewHtml += `<div class="overview-person-section">
                            <h3>Wensenlijst: ${section.naam}</h3>
                            <div class="overview-grid-inner">`;
        
        section.items.forEach(item => {
            const prijs = item.winkels?.[0]?.prijs || 'Prijs Onbekend';
            const itemClass = item.isPurchased ? 'overview-grid-item purchased' : 'overview-grid-item';
            const overlay = item.isPurchased ? `<span class="purchased-overlay">GEKOCHT</span>` : '';

            overviewHtml += `
                <div class="${itemClass}" onclick="scrollToItem('${section.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">
                        ${overlay}
                        <img src="${item.afbeelding_url}" alt="${item.naam}">
                    </div>
                    <div class="overview-caption">
                        ${item.naam} <span class="overview-person">(${section.naam})</span>
                    </div>
                    <span class="item-price-under-image">${prijs}</span>
                </div>`;
        });
        overviewHtml += `</div></div>`;
    });
    gridContainer.innerHTML = overviewHtml;
}

function generatePersonLists(wishlistData, purchasedItemIds) {
    const container = document.getElementById('person-lists-container');
    let html = '';

    const groups = [...wishlistData.personen];
    if (wishlistData.gezamenlijke_items) groups.push(wishlistData.gezamenlijke_items);

    groups.forEach(person => {
        const tabId = person.naam.toLowerCase() + '-list-content';
        html += `<div id="${tabId}" class="tab-content">
                    <h2>Wensenlijst van ${person.naam}</h2>
                    <div class="wens-lijst">`;

        person.items.forEach(item => {
            const isPurchased = purchasedItemIds.has(item.id);
            const overlay = isPurchased ? `<span class="purchased-overlay">GEKOCHT</span>` : '';
            const action = isPurchased ? `<span class="purchased-note">🎁 Reeds in bezit van de Ninja's!</span>` 
                                       : `<button class="claim-button" onclick="claimItem('${person.naam}', '${item.naam}', '${item.id}')">Cadeau Claimen</button>`;

            html += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">
                            ${overlay}
                            <img src="${item.afbeelding_url}" alt="${item.naam}">
                        </div>
                        <span class="item-price-under-image">${item.winkels?.[0]?.prijs || '???'}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p class="item-description">${item.beschrijving}</p>
                        <div class="winkel-links">
                            ${item.winkels.map(w => `<a href="${w.link}" target="_blank" class="winkel-link-button">${w.naam}</a>`).join('')}
                        </div>
                        <p class="item-nummer">ID: ${item.nummer}</p>
                        <div class="item-action-area">${action}</div>
                    </div>
                </div>`;
        });
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

function generateTabNavigation(wishlistData) {
    const tabNav = document.getElementById('dynamic-tab-nav');
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')">Overzicht</button>`;
    
    const all = [...wishlistData.personen];
    if (wishlistData.gezamenlijke_items) all.push(wishlistData.gezamenlijke_items);

    all.forEach(p => {
        const total = p.items.length;
        const bought = p.items.filter(i => i.isPurchased).length;
        navHtml += `<button class="tab-button" onclick="openTab(event, '${p.naam.toLowerCase()}-list-content')">
                        ${p.naam} <span class="percentage-bought">${bought}/${total}</span>
                    </button>`;
    });

    navHtml += `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    tabNav.innerHTML = navHtml;
}

function generateInventoryLinks(links) {
    const html = `
        <div id="inventory-content" class="tab-content">
            <h2>Collectie Archief</h2>
            <div class="inventory-link-section">
                ${links.map(l => `<div class="inventaris-link-item"><a href="${l.url}" target="_blank">📜 ${l.naam}</a></div>`).join('')}
            </div>
        </div>`;
    document.getElementById('person-lists-container').innerHTML += html;
}

// --- HOOFD LAAD LOGICA ---

function loadWishlist() {
    createSparks(); // Start de elementaire vonken animatie

    fetch('wishlist_data.json')
    .then(r => r.json())
    .then(mainData => {
        // Parallel laden van alle benodigde bestanden
        const claimsFetch = fetch('claims.json').then(r => r.json()).catch(() => ({ purchased_items: [] }));
        const inventoryFetch = fetch(mainData.inventaris_links_file).then(r => r.json()).catch(() => []);
        const gezamenlijkFetch = fetch(mainData.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const personFetches = mainData.personen.map(p => fetch(p.data_file).then(r => r.json()));

        return Promise.all([claimsFetch, inventoryFetch, gezamenlijkFetch, ...personFetches]).then(results => {
            const [claims, inventory, gezamenlijk, ...personItems] = results;
            
            // Reconstructie van de data objecten
            const data = {
                wenslijst_titel: mainData.wenslijst_titel,
                datum: mainData.datum,
                personen: mainData.personen.map((p, i) => ({
                    naam: p.naam,
                    items: personItems[i].map(item => ({...item, isPurchased: claims.purchased_items.includes(item.id)}))
                })),
                gezamenlijke_items: {
                    naam: "Gezamenlijk",
                    items: gezamenlijk.map(item => ({...item, isPurchased: claims.purchased_items.includes(item.id)}))
                },
                inventaris_links: inventory
            };

            // Pagina vullen
            updateHtmlTitle(data);
            document.getElementById('main-title').innerText = `🥷 ${data.wenslijst_titel} 🥷`;
            document.getElementById('last-update-text').innerText = `Update: ${data.datum}`;
            
            generatePersonLists(data, new Set(claims.purchased_items));
            generateTabNavigation(data);
            generateOverviewGrid(data);
            generateInventoryLinks(data.inventaris_links);
        });
    })
    .catch(err => {
        console.error(err);
        document.getElementById('loading-message').innerText = "Fout bij het laden van de Dojo.";
    });
}

// Start het laadproces wanneer de pagina volledig geladen is
window.onload = loadWishlist;
