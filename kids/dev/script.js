// E-MAILADRES VAN DE BEHEERDER/ONTVANGER
const recipientEmail = 'bernaertruben@hotmail.com';

// --- NINJAGO: GENERATOR VOOR ELEMENTAIRE VONKEN ---
function createSparks() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    
    container.innerHTML = ''; // Maak leeg voor de zekerheid
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
    // 1. Deactiveer alle tabs en knoppen
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
    
    // 2. Activeer de tab-inhoud
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add("active");
    }
    
    // 3. Activeer de bijbehorende tab-knop
    let targetButton;
    if (evt && evt.currentTarget) {
        targetButton = evt.currentTarget;
    } else {
        targetButton = document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
    }

    if (targetButton) {
        targetButton.classList.add("active");
        
        // NINJAGO: Pas elementaire kleur toe op de actieve tab
        const btnText = targetButton.innerText.toLowerCase();
        if (btnText.includes('jonas')) {
            targetButton.style.backgroundColor = "#b71c1c"; // Kai (Rood)
        } else if (btnText.includes('milan')) {
            targetButton.style.backgroundColor = "#1976d2"; // Jay (Blauw)
        } else if (btnText.includes('gezamenlijk')) {
            targetButton.style.backgroundColor = "#2e7d32"; // Lloyd (Groen)
        } else {
            targetButton.style.backgroundColor = ""; // Reset voor overzicht/inventaris
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
    }, 150); 
}

// --- DYNAMISCHE TITEL FUNCTIE ---
function updateHtmlTitle(wishlistData) {
    const names = wishlistData.personen.map(p => p.naam).join(' & ');
    document.title = `🥷 De Ninjago Wenslijst van ${names} 🥷`;
}

// --- FUNCTIES VOOR HET GENEREREN VAN HTML CONTENT ---
function generateOverviewGrid(wishlistData) {
    const gridContainer = document.getElementById('overview-grid-container');
    let overviewHtml = '';

    wishlistData.personen.forEach(person => {
        overviewHtml += `<div class="overview-person-section">
                            <h3>Wensenlijst van ${person.naam}</h3>
                            <div class="overview-grid-inner">`;
        
        person.items.forEach(item => {
            const prijs = item.winkels?.[0]?.prijs || 'Prijs Onbekend';
            const itemClass = item.isPurchased ? 'overview-grid-item purchased' : 'overview-grid-item';
            const overlay = item.isPurchased ? `<span class="purchased-overlay">GEKOCHT</span>` : '';

            overviewHtml += `
                <div class="${itemClass}" onclick="scrollToItem('${person.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">
                        ${overlay}
                        <img src="${item.afbeelding_url}" alt="${item.naam}">
                    </div>
                    <div class="overview-caption">
                        ${item.naam} <span class="overview-person">(${person.naam})</span>
                    </div>
                    <span class="item-price-under-image">${prijs}</span>
                </div>`;
        });
        overviewHtml += `</div></div>`;
    });
    
    if (wishlistData.gezamenlijke_items && wishlistData.gezamenlijke_items.items.length > 0) {
        const shared = wishlistData.gezamenlijke_items;
        overviewHtml += `<div class="overview-person-section">
                            <h3>Wensenlijst: ${shared.naam}</h3>
                            <div class="overview-grid-inner">`;
        shared.items.forEach(item => {
            const prijs = item.winkels?.[0]?.prijs || 'Prijs Onbekend';
            overviewHtml += `
                <div class="${item.isPurchased ? 'overview-grid-item purchased' : 'overview-grid-item'}" onclick="scrollToItem('${shared.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">
                        ${item.isPurchased ? `<span class="purchased-overlay">GEKOCHT</span>` : ''}
                        <img src="${item.afbeelding_url}" alt="${item.naam}">
                    </div>
                    <div class="overview-caption">${item.naam} <span class="overview-person">(${shared.naam})</span></div>
                    <span class="item-price-under-image">${prijs}</span>
                </div>`;
        });
        overviewHtml += `</div></div>`;
    }
    gridContainer.innerHTML = overviewHtml;
}

function generatePersonLists(wishlistData, purchasedItemIds) {
    const container = document.getElementById('person-lists-container');
    let listsHtml = '';

    const allGroups = [...wishlistData.personen];
    if (wishlistData.gezamenlijke_items) allGroups.push(wishlistData.gezamenlijke_items);

    allGroups.forEach(person => {
        const tabId = person.naam.toLowerCase() + '-list-content';
        listsHtml += `<div id="${tabId}" class="tab-content">
                        <h2>Wensenlijst van ${person.naam}</h2>
                        <div class="wens-lijst">`;
        
        person.items.forEach(item => {
            const isPurchased = purchasedItemIds.has(item.id);
            const winkels = item.winkels.map(w => `<a href="${w.link}" target="_blank" class="winkel-link-button">${w.naam} (${w.prijs})</a>`).join('');
            const action = isPurchased ? `<span class="purchased-note">🎁 Reeds in bezit van de Ninja's!</span>` 
                                       : `<button class="claim-button" onclick="claimItem('${person.naam}', '${item.naam}', '${item.id}')">Cadeau Kopen & Claimen</button>`;

            listsHtml += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">
                            ${isPurchased ? '<span class="purchased-overlay">GEKOCHT</span>' : ''}
                            <img src="${item.afbeelding_url}" alt="${item.naam}">
                        </div>
                        <span class="item-price-under-image">${item.winkels?.[0]?.prijs || ''}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p class="item-description">${item.beschrijving}</p>
                        <div class="winkel-links">${winkels}</div>
                        <p class="item-nummer">Artikelnummer: ${item.nummer}</p>
                        <div class="item-action-area">${action}</div>
                    </div>
                </div>`;
        });
        listsHtml += `</div></div>`;
    });
    container.innerHTML = listsHtml;
}

function generateTabNavigation(wishlistData) {
    const tabNav = document.getElementById('dynamic-tab-nav');
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')">Overzicht (Galerij)</button>`;
    
    wishlistData.personen.forEach(person => {
        const total = person.items.length;
        const bought = person.items.filter(i => i.isPurchased).length;
        navHtml += `<button class="tab-button" onclick="openTab(event, '${person.naam.toLowerCase()}-list-content')">
                        ${person.naam} <span class="percentage-bought">${bought}/${total}</span>
                    </button>`;
    });

    if (wishlistData.gezamenlijke_items) {
        const g = wishlistData.gezamenlijke_items;
        navHtml += `<button class="tab-button" onclick="openTab(event, 'gezamenlijk-list-content')">
                        Gezamenlijk <span class="percentage-bought">${g.items.filter(i=>i.isPurchased).length}/${g.items.length}</span>
                    </button>`;
    }

    navHtml += `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris Links</button>`;
    tabNav.innerHTML = navHtml;
}

function updatePageTitle(wishlistData) {
    document.getElementById('main-title').innerHTML = `🥷 ${wishlistData.wenslijst_titel} 🥷`;
    document.getElementById('last-update-text').textContent = `Laatste update: ${wishlistData.datum}`;
}

function generateInventoryLinks(links) {
    const html = `<div id="inventory-content" class="tab-content">
                    <h2>Inventaris/Collectie Overzicht</h2>
                    <div class="inventory-link-section">
                        ${links.map(l => `<div class="inventaris-link-item"><a href="${l.url}" target="_blank">🔗 ${l.naam}</a></div>`).join('')}
                    </div>
                  </div>`;
    document.getElementById('person-lists-container').innerHTML += html;
}

// --- HOOFD LAAD LOGICA ---
function loadWishlist() {
    createSparks();
    
    fetch('wishlist_data.json')
    .then(r => r.json())
    .then(mainData => {
        const claimsFetch = fetch('claims.json').then(r => r.json()).catch(() => ({ purchased_items: [] }));
        const inventoryFetch = fetch(mainData.inventaris_links_file).then(r => r.json()).catch(() => []);
        const gezamenlijkFetch = fetch(mainData.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const personFetches = mainData.personen.map(p => fetch(p.data_file).then(r => r.json()));

        Promise.all([claimsFetch, inventoryFetch, gezamenlijkFetch, ...personFetches]).then(results => {
            const [claims, inventory, gezamenlijk, ...personItems] = results;
            const purchasedIds = new Set(claims.purchased_items);
            
            const fullData = {
                wenslijst_titel: mainData.wenslijst_titel,
                datum: mainData.datum,
                personen: mainData.personen.map((p, i) => ({
                    naam: p.naam,
                    items: personItems[i].map(it => ({...it, isPurchased: purchasedIds.has(it.id)}))
                })),
                gezamenlijke_items: { naam: "Gezamenlijk", items: gezamenlijk.map(it => ({...it, isPurchased: purchasedIds.has(it.id)})) },
                inventaris_links: inventory
            };

            updatePageTitle(fullData);
            updateHtmlTitle(fullData);
            generatePersonLists(fullData, purchasedIds);
            generateTabNavigation(fullData);
            generateOverviewGrid(fullData);
            generateInventoryLinks(fullData.inventaris_links);
            
            document.getElementById('loading-message').style.display = 'none';
        });
    })
    .catch(err => {
        console.error(err);
        document.getElementById('loading-message').textContent = "Fout bij het betreden van de Dojo.";
    });
}

window.onload = loadWishlist;
