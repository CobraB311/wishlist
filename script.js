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
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Activeer de gevraagde tab
    document.getElementById(tabId).classList.add("active");
    
    // Activeer de juiste tab-knop
    evt.currentTarget.classList.add("active");
    
    // Scroll naar de top van de pagina
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


// --- FUNCTIES VOOR ELEMENTEN CREËREN ---

// Functie om een overzichtstegel te maken
function createOverviewTile(persoonId, item) {
    const tile = document.createElement('div');
    tile.className = 'overview-tile';
    // Link naar de detailpagina
    tile.onclick = () => switchToDetail(persoonId, item.id); 

    const imageContainer = document.createElement('div');
    imageContainer.className = 'overview-image-container';

    const image = document.createElement('img');
    image.src = item.afbeelding_url;
    image.alt = item.naam;
    image.loading = 'lazy'; // Verbeter de prestaties
    imageContainer.appendChild(image);
    
    const name = document.createElement('p');
    name.className = 'overview-name';
    name.textContent = item.naam;

    tile.appendChild(imageContainer);
    tile.appendChild(name);
    return tile;
}

// Functie om de detail-elementen van een wens te maken
function createWishItemElement(persoonNaam, item, isPurchased) {
    const wensItem = document.createElement('div');
    wensItem.id = item.id;
    wensItem.className = 'wens-item';

    if (isPurchased) {
        wensItem.classList.add('purchased'); // Voor de detail achtergrond/strikethrough
    }

    // --- LEFT COLUMN (IMAGE, PRICE) ---
    const leftColumn = document.createElement('div');
    leftColumn.className = 'left-column';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'item-image-container';

    const image = document.createElement('img');
    image.src = item.afbeelding_url;
    image.alt = item.naam;
    imageContainer.appendChild(image);

    leftColumn.appendChild(imageContainer);
    
    const priceText = item.winkels.length > 0 ? item.winkels[0].prijs : 'Prijs Onbekend';
    const priceUnderImage = document.createElement('p');
    priceUnderImage.className = 'item-price-under-image';
    priceUnderImage.textContent = `Prijsindicatie: ${priceText}`;
    leftColumn.appendChild(priceUnderImage);

    wensItem.appendChild(leftColumn);

    // --- RIGHT COLUMN (DETAILS, LINKS, CLAIM) ---
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-column';

    // 1. Naam en Beschrijving
    const title = document.createElement('h3');
    title.textContent = item.naam;
    rightColumn.appendChild(title);

    const description = document.createElement('p');
    description.className = 'item-description';
    description.textContent = item.beschrijving;
    rightColumn.appendChild(description);

    if (item.nummer) {
        const itemNumber = document.createElement('p');
        itemNumber.className = 'item-number';
        itemNumber.textContent = `Art.nr: ${item.nummer}`;
        rightColumn.appendChild(itemNumber);
    }
    
    // 2. Winkellinks
    const linksTitle = document.createElement('h4');
    linksTitle.textContent = 'Beschikbaar bij:';
    rightColumn.appendChild(linksTitle);

    const linksContainer = document.createElement('div');
    linksContainer.className = 'winkel-links';

    item.winkels.forEach(winkel => {
        const link = document.createElement('a');
        link.href = winkel.link;
        link.textContent = `${winkel.naam} (${winkel.prijs})`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'winkel-link-button';
        linksContainer.appendChild(link);
    });

    rightColumn.appendChild(linksContainer);

    // 3. Actiegebied (Claim-knop of Gekocht-melding)
    const actionArea = document.createElement('div');
    actionArea.className = 'item-action-area';

    if (isPurchased) {
        const purchasedMessage = document.createElement('p');
        purchasedMessage.className = 'purchased-message';
        purchasedMessage.textContent = '🎉 Dit cadeau is al GECLAIMD/GEKOCHT! Dankjewel! 🎉';
        actionArea.appendChild(purchasedMessage);
    } else {
        const claimButton = document.createElement('button');
        claimButton.className = 'claim-button';
        claimButton.textContent = 'Claim dit cadeau!';
        claimButton.onclick = () => claimItem(persoonNaam, item.naam, item.id);
        actionArea.appendChild(claimButton);
    }

    rightColumn.appendChild(actionArea);

    wensItem.appendChild(rightColumn);
    return wensItem;
}

// NIEUWE FUNCTIE: Genereer de inventaris-content
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
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'inventaris-link-button';
            
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        inventoryWrapper.appendChild(linksList);
    } else {
        const noLinksMessage = document.createElement('p');
        noLinksMessage.textContent = 'Er zijn momenteel geen inventaris-links beschikbaar.';
        inventoryWrapper.appendChild(noLinksMessage);
    }

    listsContainer.appendChild(inventoryWrapper);
}


// --- HOOFDFUNCTIE: BOUW DE WISHLIST UI ---

function generateWishlistContent(data, purchasedItemIds) {
    // WISHLIST TITEL EN DATUM
    document.getElementById('main-title').textContent = data.wenslijst_titel;
    document.getElementById('last-update-text').textContent = `Laatste update: ${data.datum}`;

    const tabNav = document.getElementById('dynamic-tab-nav');
    const listsContainer = document.getElementById('person-lists-container');
    const overviewGrid = document.getElementById('overview-grid-container');
    overviewGrid.innerHTML = ''; // Leeg het laadbericht

    // 1. MAAK DE OVERZICHT TAB KNOP
    const overviewButton = document.createElement('button');
    overviewButton.id = 'btn-overview';
    overviewButton.className = 'tab-button active';
    overviewButton.textContent = 'Alle Wensen (Overzicht)'; 
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    tabNav.appendChild(overviewButton);


    // 2. LOOP DOOR PERSONEN
    data.personen.forEach(person => {
        const persoonNaam = person.naam;
        const persoonId = persoonNaam.toLowerCase().replace(/\s/g, '-');
        const listContainer = document.createElement('div');
        listContainer.id = `${persoonId}-content`;
        listContainer.className = 'tab-content';

        // BEREKEN HET AANTAL ITEMS
        const itemCount = person.items.length; 

        // MAAK DE TAB KNOP MET DE TELLER
        const button = document.createElement('button');
        button.id = `btn-${persoonId}`;
        button.className = 'tab-button';
        // AANPASSING: Voeg de item-teller toe aan de knoptekst
        button.textContent = `${persoonNaam} (${itemCount} items)`; 
        button.onclick = (e) => openTab(e, `${persoonId}-content`);
        tabNav.appendChild(button);

        // Titel van de persoonslijst
        const title = document.createElement('h2');
        title.textContent = `🎁 De Wensen van ${persoonNaam} (Totaal: ${itemCount} items)`;
        listContainer.appendChild(title);

        // Creëer de lijst items
        person.items.forEach(item => {
            const isPurchased = purchasedItemIds.has(item.id);
            listContainer.appendChild(createWishItemElement(persoonNaam, item, isPurchased));
            
            // Voeg de tegel toe aan het overzicht
            overviewGrid.appendChild(createOverviewTile(persoonId, item));
        });

        listsContainer.appendChild(listContainer);
    });

    // 3. MAAK DE INVENTARIS TAB KNOP
    const inventoryButton = document.createElement('button');
    inventoryButton.id = 'btn-inventory';
    inventoryButton.className = 'tab-button';
    inventoryButton.textContent = '🏠 Onze Inventaris (Links)'; 
    inventoryButton.onclick = (e) => openTab(e, 'inventory-content');
    tabNav.appendChild(inventoryButton);
    
    // INVENTARIS CONTENT AANMAKEN (Dit is de tab inhoud)
    generateInventoryContent(listsContainer, data.inventaris_links);
}


// --- INITIALISATIE ---

// Functie om de JSON te laden en de pagina op te bouwen
function loadWishlist() {
    // Laad claims.json en wishlist.json parallel
    Promise.all([
        // Laad de wensenlijst
        fetch('wishlist.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Kon wishlist.json niet laden: ' + response.statusText);
                }
                return response.json();
            }),
        // Laad de claims lijst
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
        
        generateWishlistContent(wishlistData, purchasedItemIds); // Geef de claims mee
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
