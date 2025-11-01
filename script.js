// E-MAILADRES VAN DE BEHEERDER/ONTVANGER (OPGESLAGEN INFORMATIE)
const recipientEmail = 'bernaertruben@hotmail.com'; 

// --- FUNCTIES VOOR CLAIMING ---

// Functie om de gebruiker een e-mail te laten sturen voor het claimen
function claimItem(persoonNaam, itemName, itemId) {
    const subject = `Claim: Cadeau voor ${persoonNaam} - ${itemName}`;
    const body = `Beste wensenlijstbeheerder,\n\nIk wil graag het volgende cadeau claimen:\n\nPersoon: ${persoonNaam}\nItem: ${itemName}\nID: ${itemId}\n\nGelieve mij te laten weten of dit item nog beschikbaar is. Bedankt!\n\nMet vriendelijke groeten,`;
    
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
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Activeer de gevraagde tab-inhoud
    document.getElementById(tabId).classList.add("active");
    
    // Activeer de tab-knop
    evt.currentTarget.classList.add("active");
    
    // Scroll naar de top van de pagina voor een schone start
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

// --- ITEM GENERATIE FUNCTIES ---

// Nieuwe Functie: Genereer de inventaris-content
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
            listItem.className = 'inventaris-link-item';
            
            const link = document.createElement('a');
            link.href = linkData.url;
            link.textContent = linkData.naam;
            link.target = '_blank'; // Open in nieuw tabblad
            
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        
        inventoryWrapper.appendChild(linksList);
    } else {
        const noLinks = document.createElement('p');
        noLinks.textContent = 'Er zijn momenteel geen inventarislinks beschikbaar.';
        inventoryWrapper.appendChild(noLinks);
    }
    
    listsContainer.appendChild(inventoryWrapper);
}

// Functie om één wens-item detailweergave te maken
function createWensItem(persoonNaam, persoonId, item, isPurchased) {
    const wensItem = document.createElement('div');
    wensItem.id = item.id;
    wensItem.className = `wens-item ${isPurchased ? 'purchased' : ''}`;
    
    // Linker kolom: Afbeelding en prijs
    const leftColumn = document.createElement('div');
    leftColumn.className = 'left-column';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = `item-image-container ${isPurchased ? 'purchased' : ''}`;
    const img = document.createElement('img');
    img.src = item.afbeelding_url;
    img.alt = item.naam;
    imageContainer.appendChild(img);
    leftColumn.appendChild(imageContainer);

    // Prijs onder de afbeelding (voor mobiel)
    if (item.winkels && item.winkels.length > 0) {
        const priceUnderImage = document.createElement('p');
        priceUnderImage.className = 'item-price-under-image';
        priceUnderImage.textContent = `Prijsindicatie: ${item.winkels[0].prijs}`;
        leftColumn.appendChild(priceUnderImage);
    }

    wensItem.appendChild(leftColumn);

    // Rechter kolom: Details en actie
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-column';

    // Naam en nummer
    const name = document.createElement('h3');
    name.className = 'item-name';
    name.textContent = item.naam;
    rightColumn.appendChild(name);
    
    const number = document.createElement('p');
    number.className = 'item-number';
    number.textContent = `Artikelnr: ${item.nummer || 'N/A'}`;
    rightColumn.appendChild(number);

    // Beschrijving
    const description = document.createElement('p');
    description.className = 'item-description';
    description.textContent = item.beschrijving;
    rightColumn.appendChild(description);

    // Actiegebied
    const actionArea = document.createElement('div');
    actionArea.className = 'item-action-area';

    // Winkel links
    const winkelLinksDiv = document.createElement('div');
    winkelLinksDiv.className = 'winkel-links';
    
    if (item.winkels && item.winkels.length > 0) {
        item.winkels.forEach(winkel => {
            const link = document.createElement('a');
            link.href = winkel.link;
            link.textContent = `${winkel.naam} (${winkel.prijs})`;
            link.target = '_blank';
            winkelLinksDiv.appendChild(link);
        });
    } else {
        winkelLinksDiv.textContent = 'Geen winkellinks beschikbaar.';
    }
    actionArea.appendChild(winkelLinksDiv);

    // Claim/Gekocht knop
    if (isPurchased) {
        const purchasedButton = document.createElement('span');
        purchasedButton.className = 'purchased-button';
        purchasedButton.textContent = 'GEKOCHT';
        actionArea.appendChild(purchasedButton);
    } else {
        const claimBtn = document.createElement('button');
        claimBtn.className = 'claim-button';
        claimBtn.textContent = 'Dit cadeau claimen';
        claimBtn.onclick = () => claimItem(persoonNaam, item.naam, item.id);
        actionArea.appendChild(claimBtn);
    }
    
    rightColumn.appendChild(actionArea);
    wensItem.appendChild(rightColumn);

    return wensItem;
}

// Functie om de algemene overzichtsgids te genereren (voor de "Alle Wensen" tab)
function generateOverviewGrid(container, items) {
    // Sorteer items op naam van de persoon (optioneel: voor een betere groepering)
    items.sort((a, b) => a.persoonNaam.localeCompare(b.persoonNaam));

    let currentPersoon = '';
    
    // Gebruik een wrapper om de titels en de grids te groeperen
    const dynamicContentWrapper = document.createElement('div');
    dynamicContentWrapper.id = 'dynamic-overview-content';
    container.appendChild(dynamicContentWrapper);

    let currentGrid = null;

    items.forEach(item => {
        // Maak een nieuwe sectie (titel + grid) als de persoon verandert
        if (item.persoonNaam !== currentPersoon) {
            // Titel voor de sectie
            const title = document.createElement('h3');
            title.className = 'overview-person-title';
            title.textContent = `Wensen van ${item.persoonNaam}`;
            dynamicContentWrapper.appendChild(title);
            
            // Nieuwe grid voor de items van deze persoon
            currentGrid = document.createElement('div');
            currentGrid.className = 'overview-grid';
            dynamicContentWrapper.appendChild(currentGrid);
            
            currentPersoon = item.persoonNaam;
        }

        const gridItem = document.createElement('div');
        gridItem.id = `grid-item-${item.id}`;
        gridItem.className = `overview-grid-item ${item.isPurchased ? 'purchased' : ''}`;
        gridItem.onclick = () => switchToDetail(item.persoonId, item.id);

        // Afbeelding
        const img = document.createElement('img');
        img.src = item.afbeelding_url;
        img.alt = item.naam;
        gridItem.appendChild(img);

        // Naam
        const name = document.createElement('p');
        name.className = 'overview-grid-item-name';
        name.textContent = item.naam;
        gridItem.appendChild(name);

        // 'GEKOCHT' stempel toevoegen indien gekocht
        if (item.isPurchased) {
            const stamp = document.createElement('div');
            stamp.className = 'purchased-stamp';
            stamp.textContent = 'GEKOCHT';
            gridItem.appendChild(stamp);
        }

        if (currentGrid) {
            currentGrid.appendChild(gridItem);
        }
    });

    // Verwijder de "Laden..." melding
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) loadingMessage.remove();
}


// Functie om de volledige inhoud van de wensenlijst te genereren
function generateWishlistContent(data, purchasedItemIds) {
    const tabNav = document.getElementById('dynamic-tab-nav');
    const listsContainer = document.getElementById('person-lists-container');
    const overviewGridContainer = document.getElementById('overview-grid-container');

    // Leeg de containers
    tabNav.innerHTML = '';
    listsContainer.innerHTML = '';
    overviewGridContainer.innerHTML = '';
    
    // Update de hoofdtitel
    document.getElementById('main-title').textContent = data.wenslijst_titel;

    // --- 1. OVERZICHT TAB-KNOP ---
    const overviewButton = document.createElement('button');
    overviewButton.id = 'btn-overview';
    overviewButton.className = 'tab-button';
    overviewButton.textContent = 'Alle Wensen (Overzicht)'; 
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    tabNav.appendChild(overviewButton);
    
    // --- 2. PERSOONSGEBONDEN TABS EN CONTENT ---
    const allItems = [];
    
    // LOOP DOOR PERSONEN OM TABS EN CONTENT TE MAKEN
    data.personen.forEach(persoon => {
        const persoonId = persoon.naam.toLowerCase().replace(/\s/g, '');
        
        // Items tellen voor de percentage badge en de titel
        const totalItems = persoon.items.length;
        const unclaimedItems = persoon.items.filter(item => !purchasedItemIds.has(item.id)).length;
        const percentage = totalItems === 0 ? 0 : Math.round((totalItems - unclaimedItems) / totalItems * 100);
        
        // 2a. Maak Tab-knop
        const button = document.createElement('button');
        button.id = `btn-${persoonId}`;
        button.className = 'tab-button';
        // WIJZIGING 1: Voeg het totale aantal items toe aan de tab-titel
        button.textContent = `${persoon.naam} (${totalItems} artikelen)`; 
        button.onclick = (e) => openTab(e, `${persoonId}-content`);
        
        // Voeg percentage badge toe
        const percentageSpan = document.createElement('span');
        percentageSpan.className = 'completion-percentage';
        percentageSpan.textContent = `${percentage}%`;
        if (percentage === 100) {
            percentageSpan.classList.add('complete');
        }
        button.appendChild(percentageSpan);
        tabNav.appendChild(button);
        
        // 2b. Maak Content Container voor de persoon
        const personContentDiv = document.createElement('div');
        personContentDiv.id = `${persoonId}-content`;
        personContentDiv.className = 'tab-content';
        
        // Titel voor de persoon's lijst
        const title = document.createElement('h2');
        // WIJZIGING 2: Voeg het totale aantal items toe aan de content-titel
        title.textContent = `De Wensenlijst van ${persoon.naam} (${totalItems} artikelen)`; 
        personContentDiv.appendChild(title);
        
        // Loop door items om detailweergave te maken
        persoon.items.forEach(item => {
            const isPurchased = purchasedItemIds.has(item.id);
            
            // Item toevoegen aan de globale lijst voor het overzicht
            allItems.push({
                ...item,
                persoonNaam: persoon.naam,
                persoonId: persoonId,
                isPurchased: isPurchased
            });
            
            // Detail Item generatie en toevoeging aan de content div
            const wensItem = createWensItem(persoon.naam, persoonId, item, isPurchased);
            personContentDiv.appendChild(wensItem);
        });
        
        listsContainer.appendChild(personContentDiv);
    });
    
    // --- 3. INVENTARIS TAB-KNOP ---
    const inventoryButton = document.createElement('button');
    inventoryButton.id = 'btn-inventory';
    inventoryButton.className = 'tab-button';
    inventoryButton.textContent = '🏠 Onze Inventaris (Links)'; 
    inventoryButton.onclick = (e) => openTab(e, 'inventory-content');
    tabNav.appendChild(inventoryButton);
    
    // INVENTARIS CONTENT AANMAKEN (Dit is de tab inhoud)
    generateInventoryContent(listsContainer, data.inventaris_links);

    // Update van de laatste update datum
    document.getElementById('last-update-text').textContent = `Laatste update: ${data.datum}`;
    
    // Genereer de overzichtsweergave
    generateOverviewGrid(overviewGridContainer, allItems);
    
    // Extra beveiliging: zorg ervoor dat de Overview-knop actief wordt gemaakt bij start.
    const overviewButtonOnLoad = document.getElementById('btn-overview');
    if (overviewButtonOnLoad) {
        overviewButtonOnLoad.classList.add('active');
    }
}


// --- INITIALISATIE ---

// Functie om de JSON te laden en de pagina op te bouwen
function loadWishlist() {
    // We laden nu twee bestanden parallel: de wensenlijst en de claims
    Promise.all([
        // Laden van de wensenlijst (wishlist.json)
        fetch('wishlist.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Kon wishlist.json niet laden: ' + response.statusText);
                }
                return response.json();
            }),
            
        // Laden van de claims (claims.json)
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
        
    })
    .catch(error => {
        console.error("Fout bij laden van data:", error);
        const container = document.getElementById('overview-grid-container');
        if (container) {
            container.innerHTML = '<p style="color: red; font-weight: bold;">Fout: Kon de wensenlijst niet laden. Controleer of de JSON-bestanden correct zijn en op de juiste locatie staan.</p>';
        }
    });
}

// Start het laadproces wanneer de pagina geladen is
window.onload = loadWishlist;
