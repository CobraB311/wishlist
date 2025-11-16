// E-MAILADRES VAN DE BEHEERDER/ONTVANGER (OPGESLAGEN INFORMATIE)
const recipientEmail = 'bernaertruben@hotmail.com'; 

// NIEUWE FUNCTIE: Om strings te escapen voor gebruik in HTML onclick handler
function escapeHtmlString(str) {
    // Vervang enkel aanhalingsteken door een geëscaped enkel aanhalingsteken (\')
    return str.replace(/'/g, "\\'"); 
}

// --- FUNCTIES VOOR CLAIMING ---

// Functie om de gebruiker een e-mail te laten sturen voor het melden van de aankoop
function claimItem(persoonNaam, itemName, itemId) {
    
    const subject = `BEVESTIGING: Cadeau Gekocht voor ${persoonNaam} - ${itemName}`;
    
    // De VEREENVOUDIGDE mail body:
    const body = `Beste wensenlijstbeheerder,\n\nIk heb het volgende cadeau gekocht van de wensenlijst:\n\nPersoon: ${persoonNaam}\nItem: ${itemName}\nID: ${itemId}\n\nBedankt voor het bijhouden van deze lijst!\n\nMet vriendelijke groeten,\n[Uw Naam]`;
    
    // Gebruik window.location.href om de mailto link te openen
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}


// --- FUNCTIES VOOR TAB-NAVIGATIE EN SCROLLEN ---

// Functie om een tab te openen (de tab-knop krijgt .active, de tab-inhoud krijgt .active)
function openTab(evt, tabId) {
    // Deactiveer alle tabs
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    // Deactiveer alle tab-knoppen
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Activeer de geselecteerde tab-inhoud en knop
    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
    
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}

// Functie om naar de detailtab te wisselen en naar het item te scrollen
function switchToDetail(persoonId, itemId) {
    // Deactiveer alle tabs
    document.getElementById('overview-content').classList.remove("active");
    const allPersonTabs = document.getElementById('person-lists-container').children;
    for (const tab of allPersonTabs) {
        tab.classList.remove("active");
    }
    const inventoryContent = document.getElementById('inventory-content');
    if(inventoryContent) inventoryContent.classList.remove("active");

    // Activeer de persoon's tab
    document.getElementById(`${persoonId}-content`).classList.add("active");
    
    // Deactiveer alle tab-knoppen
    var tablinks = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Activeer de juiste tab-knop
    document.getElementById(`btn-${persoonId}`).classList.add("active");

    const itemElement = document.getElementById(itemId);
    if (itemElement) {
        // Scroll het item in beeld
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- FUNCTIES VOOR GENEREREN CONTENT ---

// Functie om het wens-item detail kaart te genereren
function generateWishlistItem(item, persoon) {
    // Maak een unieke ID van de persoon en het item ID voor de detail view
    const itemId = `${persoon.naam.toLowerCase().replace(/\s/g, '-')}-${item.id}`;
    
    let claimButtonHtml = '';
    
    // Controleer of het item al gekocht is (geclaimd)
    const isPurchased = item.isPurchased || false;
    
    // FIX: Gebruik escapeHtmlString hier om SyntaxError te voorkomen
    const escapedPersoonNaam = escapeHtmlString(persoon.naam); 
    const escapedItemNaam = escapeHtmlString(item.naam);
    
    if (isPurchased) {
        claimButtonHtml = `<button class="claim-button purchased" disabled>Gekocht</button>`;
    } else {
        // FIX: De claimItem aanroep gebruikt de geëscapte namen
        claimButtonHtml = `<button class="claim-button" onclick="claimItem('${escapedPersoonNaam}', '${escapedItemNaam}', '${item.id}')">Claim dit item (Stuur E-mail)</button>`;
    }

    // Genereer de winkel links
    const winkelLinksHtml = item.winkels.map(winkel => `
        <a href="${winkel.link}" target="_blank" class="winkel-knop">${winkel.naam}: ${winkel.prijs}</a>
    `).join('');

    const itemHtml = `
        <div class="wens-item" id="${itemId}">
            ${isPurchased ? '<div class="purchased-overlay">GEKOCHT</div>' : ''}
            <div class="left-column">
                <div class="item-image-container">
                    <img src="${item.afbeelding_url}" alt="${item.naam}">
                </div>
                <p class="item-number">Artikelnr.: ${item.nummer}</p>
            </div>
            <div class="right-column">
                <h3>${item.naam}</h3>
                <p class="item-description">${item.beschrijving}</p>
                <div class="item-action-area">
                    <div class="winkel-links">
                        ${winkelLinksHtml}
                    </div>
                    ${claimButtonHtml}
                </div>
            </div>
        </div>
    `;

    return itemHtml;
}


// Functie om de overzichts-kaart te genereren (voor de Overview tab)
function generateOverviewItem(item, persoon) {
    // Maak de unieke ID voor de detail view
    const detailId = `${persoon.naam.toLowerCase().replace(/\s/g, '-')}-${item.id}`;
    const isPurchased = item.isPurchased || false;

    const overviewHtml = `
        <div class="overview-item ${isPurchased ? 'purchased' : ''}" onclick="switchToDetail('${persoon.naam.toLowerCase().replace(/\s/g, '-')}', '${detailId}')">
            <div class="overview-image-wrapper">
                <img src="${item.afbeelding_url}" alt="${item.naam}">
                ${isPurchased ? '<div class="purchased-overlay">GEKOCHT</div>' : ''}
            </div>
            <p class="overview-name">${item.naam} (${persoon.naam})</p>
            <p class="item-price-under-image">${item.winkels.length > 0 ? item.winkels[0].prijs : 'Prijs onbekend'}</p>
        </div>
    `;
    return overviewHtml;
}

// Functie om de inventaris-content te genereren
function generateInventoryContent(listsContainer, inventarisLinks) {
    const inventoryWrapper = document.createElement('div');
    inventoryWrapper.id = 'inventory-content';
    inventoryWrapper.className = 'tab-content';
    
    // Titel
    const title = document.createElement('h2');
    title.textContent = '🏠 Onze Speelgoed Inventaris';
    inventoryWrapper.appendChild(title);
    
    // Beschrijving
    const description = document.createElement('p');
    description.innerHTML = 'Dit zijn overzichten van het speelgoed dat onze kinderen al hebben. Hierdoor kan dubbel werk vermeden worden bij het zoeken naar nieuwe cadeaus.';
    inventoryWrapper.appendChild(description);
    
    if (inventarisLinks && inventarisLinks.length > 0) {
        const linkSectionTitle = document.createElement('h3');
        linkSectionTitle.textContent = 'Huidige Overzichten:';
        linkSectionTitle.style.marginTop = '30px';
        inventoryWrapper.appendChild(linkSectionTitle);
        
        const linksList = document.createElement('ul');
        linksList.style.listStyleType = 'none';
        linksList.style.paddingLeft = '0';
        
        // LOOP DOOR LINKS UIT DE JSON
        inventarisLinks.forEach(linkData => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = linkData.url;
            link.target = '_blank';
            link.textContent = linkData.naam;
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        inventoryWrapper.appendChild(linksList);
    }
    
    listsContainer.appendChild(inventoryWrapper);
}


// Hoofdfunctie om de wensenlijst structuur te genereren en te vullen
function generateWishlistContent(data, purchasedItemIds) {
    const listsContainer = document.getElementById('person-lists-container');
    const overviewGrid = document.getElementById('overview-grid-container');
    const tabNav = document.getElementById('dynamic-tab-nav');
    listsContainer.innerHTML = '';
    overviewGrid.innerHTML = '';
    tabNav.innerHTML = '';

    // Stel de hoofdtitel in
    document.getElementById('main-title').textContent = data.wenslijst_titel;

    // Voeg de Overview tab toe
    const overviewButton = document.createElement('button');
    overviewButton.id = 'btn-overview';
    overviewButton.className = 'tab-button active';
    overviewButton.textContent = 'Overzicht'; 
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    tabNav.appendChild(overviewButton);
    
    // Loop door personen en maak tabs en content aan
    data.personen.forEach(persoon => {
        const persoonId = persoon.naam.toLowerCase().replace(/\s/g, '-');
        
        // AANMAKEN VAN DE TAB-KNOP
        const tabButton = document.createElement('button');
        tabButton.id = `btn-${persoonId}`;
        tabButton.className = 'tab-button';
        tabButton.textContent = persoon.naam;
        tabButton.onclick = (e) => openTab(e, `${persoonId}-content`);
        tabNav.appendChild(tabButton);
        
        // AANMAKEN VAN DE TAB-INHOUD
        const contentDiv = document.createElement('div');
        contentDiv.id = `${persoonId}-content`;
        contentDiv.className = 'tab-content';
        
        // E-mailadres toevoegen (indien aanwezig)
        if (persoon.email) {
            const emailP = document.createElement('p');
            emailP.className = 'email-note';
            emailP.innerHTML = `E-mail: <a href="mailto:${persoon.email}">${persoon.email}</a>`;
            contentDiv.appendChild(emailP);
        }

        // ITEMS TOEVOEGEN AAN DE DETAIL LIJST
        persoon.items.forEach(item => {
            // Voeg de claim status toe aan het item object voor verwerking
            item.isPurchased = purchasedItemIds.has(item.id);
            
            // Genereer de detail card en voeg toe aan de persoon's tab
            contentDiv.innerHTML += generateWishlistItem(item, persoon);
            
            // Genereer de overzichts card en voeg toe aan de overview grid
            overviewGrid.innerHTML += generateOverviewItem(item, persoon);
        });
        
        listsContainer.appendChild(contentDiv);
    });

    // Voeg de Gezamenlijke Items toe als aparte tab (als ze bestaan)
    if (data.gezamenlijke_items && data.gezamenlijke_items.items.length > 0) {
        const persoon = data.gezamenlijke_items;
        const persoonId = persoon.naam.toLowerCase();

        // AANMAKEN VAN DE TAB-KNOP
        const tabButton = document.createElement('button');
        tabButton.id = `btn-${persoonId}`;
        tabButton.className = 'tab-button';
        tabButton.textContent = persoon.naam;
        tabButton.onclick = (e) => openTab(e, `${persoonId}-content`);
        tabNav.appendChild(tabButton);
        
        // AANMAKEN VAN DE TAB-INHOUD
        const contentDiv = document.createElement('div');
        contentDiv.id = `${persoonId}-content`;
        contentDiv.className = 'tab-content';

        // ITEMS TOEVOEGEN AAN DE DETAIL LIJST
        persoon.items.forEach(item => {
            // Voeg de claim status toe aan het item object voor verwerking
            item.isPurchased = purchasedItemIds.has(item.id);
            
            // Genereer de detail card en voeg toe aan de gezamenlijke tab
            contentDiv.innerHTML += generateWishlistItem(item, persoon);
            
            // Genereer de overzichts card en voeg toe aan de overview grid
            overviewGrid.innerHTML += generateOverviewItem(item, persoon);
        });

        listsContainer.appendChild(contentDiv);
    }
    
    // Voeg de Inventaris tab toe
    const inventoryButton = document.createElement('button');
    inventoryButton.id = 'btn-inventory';
    inventoryButton.className = 'tab-button';
    inventoryButton.textContent = '🏠 Onze Inventaris (Links)'; 
    inventoryButton.onclick = (e) => openTab(e, 'inventory-content');
    tabNav.appendChild(inventoryButton);
    
    // INVENTARIS CONTENT AANMAKEN (Dit is de tab inhoud)
    generateInventoryContent(listsContainer, data.inventaris_links);

    // Update van de laatste update datum
    document.getElementById('last-update-text').textContent = `Laatste update: ${data.datum}`;\n}

// --- INITIALISATIE ---\n

// Functie om de JSON te laden en de pagina op te bouwen
function loadWishlist() {
    // 1. Laad de hoofdfiles parallel
    Promise.all([
        fetch('wishlist.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Kon wishlist.json niet laden.');
                }
                return res.json();
            }),
        // 2. Laad de claims lijst
        fetch('claims.json')
            .then(res => {
                if (!res.ok) {
                    // Als de file niet gevonden wordt (404), val terug op leeg
                    console.warn("claims.json niet gevonden of kon niet geladen worden. Start met lege claims.");
                    return { purchased_items: [] }; 
                }
                // Controleer op JSON syntax error
                return res.json();
            })
            .catch(error => {
                // Als er een andere fout is (netwerk, JSON parse), val terug op leeg
                console.error("Fout bij laden van claims.json:", error.message);
                return { purchased_items: [] }; 
            })
    ])
    .then(([wishlistData, claimsData]) => {
        // Maak een Set voor snelle lookups van gekochte items
        const purchasedItemIds = new Set(claimsData.purchased_items || []);
        
        // Genereer de volledige inhoud
        generateWishlistContent(wishlistData, purchasedItemIds); 
        
        // Activeer de Overview-knop na het laden
        const overviewButton = document.getElementById('btn-overview');
        if (overviewButton) {
            overviewButton.classList.add('active');
        }
        
    })
    .catch(error => {
        console.error("Fout bij laden van data:", error);
        const container = document.getElementById('overview-grid-container');
        if (container) {
            container.innerHTML = '<p style="color: red; font-weight: bold;">Fout: Kon de wensenlijst niet laden. Controleer of de JSON-bestanden correct zijn en op de juiste locatie staat.</p>';
        }
    });
}

// Start het laadproces wanneer de pagina geladen is
window.onload = loadWishlist;
