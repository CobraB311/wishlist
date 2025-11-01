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
    
    // Scroll naar de bovenkant van de pagina
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


// --- FUNCTIES VOOR HET GENEREREN VAN CONTENT ---

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
            link.target = '_blank';
            link.textContent = linkData.naam;
            
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        
        inventoryWrapper.appendChild(linksList);
    } else {
        const noLinks = document.createElement('p');
        noLinks.textContent = 'Er zijn momenteel geen inventaris links beschikbaar.';
        inventoryWrapper.appendChild(noLinks);
    }
    
    listsContainer.appendChild(inventoryWrapper);
}

// UPDATE FUNCTIE: Genereer de navigatie knoppen (NU MET PERCENTAGE)
function generateTabNav(personen, inventarisLinks, purchasedItemIds) {
    const tabNav = document.getElementById('dynamic-tab-nav');
    tabNav.innerHTML = ''; // Leeg de nav
    const listsContainer = document.getElementById('person-lists-container');
    
    // 1. Maak de 'Overzicht' knop
    const overviewButton = document.createElement('button');
    overviewButton.id = 'btn-overview';
    overviewButton.className = 'tab-button active';
    overviewButton.textContent = '🏠 Overzicht (Foto\'s)';
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    tabNav.appendChild(overviewButton);
    
    // 2. Maak de Persoonsknoppen (NU MET PERCENTAGE)
    personen.forEach(persoon => {
        const button = document.createElement('button');
        const persoonId = persoon.naam.toLowerCase().replace(/\s/g, '-');
        button.id = `btn-${persoonId}`;
        button.className = 'tab-button';
        
        // *** NIEUW: Bereken en voeg het voltooiingspercentage toe ***
        const totalItems = persoon.items.length;
        let purchasedCount = 0;
        
        persoon.items.forEach(item => {
            if (purchasedItemIds.has(item.id)) {
                purchasedCount++;
            }
        });
        
        const percentage = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;

        // Hoofdtekst van de knop
        button.textContent = persoon.naam;

        // Percentage badge
        const percentageSpan = document.createElement('span');
        percentageSpan.className = 'completion-percentage';
        percentageSpan.textContent = `${percentage}%`;
        
        if (percentage === 100) {
            percentageSpan.classList.add('complete');
        }

        button.appendChild(percentageSpan);
        // *** EINDE NIEUW PERCENTAGE ***

        button.onclick = (e) => openTab(e, `${persoonId}-content`);
        tabNav.appendChild(button);
    });

    // 3. Maak de 'Inventaris' knop
    const inventoryButton = document.createElement('button');
    inventoryButton.id = 'btn-inventory';
    inventoryButton.className = 'tab-button';
    inventoryButton.textContent = '🏠 Onze Inventaris (Links)'; 
    inventoryButton.onclick = (e) => openTab(e, 'inventory-content');
    tabNav.appendChild(inventoryButton);
    
    // INVENTARIS CONTENT AANMAKEN (Dit is de tab inhoud)
    generateInventoryContent(listsContainer, inventarisLinks);
}


// UPDATE FUNCTIE: Functie om de content voor een persoon's tab aan te maken
function createPersonTab(persoon, purchasedItemIds) { 
    const persoonId = persoon.naam.toLowerCase().replace(/\s/g, '-');
    const personContent = document.createElement('div');
    personContent.id = `${persoonId}-content`;
    personContent.className = 'tab-content';
    
    // Titel
    const title = document.createElement('h2');
    title.textContent = `Wenslijst van ${persoon.naam}`;
    personContent.appendChild(title);

    persoon.items.forEach(item => {
        // Item element aanmaken
        const isPurchased = purchasedItemIds.has(item.id);
        const itemElement = createWishItemElement(persoon.naam, item, isPurchased); 
        personContent.appendChild(itemElement);
    });
    
    return personContent;
}


// UPDATE FUNCTIE: Functie om een individueel wens item (detail view) aan te maken
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
    
    // 1. IMAGE CONTAINER
    const imgContainer = document.createElement('div');
    imgContainer.className = 'item-image-container';
    
    if (isPurchased) {
        imgContainer.classList.add('purchased'); // Voor de grayscale filter
    }
    
    const img = document.createElement('img');
    img.src = item.afbeelding_url;
    img.alt = `Afbeelding van ${item.naam}`;
    imgContainer.appendChild(img);
    
    // 2. PRIJS (enkel onder de foto op mobiel)
    const priceUnderImage = document.createElement('p');
    priceUnderImage.className = 'item-price-under-image';
    
    if (item.winkels && item.winkels.length > 0) {
        // Maak de prijs weergave op basis van de eerste link
        const firstStore = item.winkels[0];
        priceUnderImage.innerHTML = `<strong>Prijsindicatie:</strong> ${firstStore.prijs} (${firstStore.naam})`;
    } else {
        priceUnderImage.textContent = 'Prijs niet gespecificeerd';
    }
    
    if (isPurchased) {
        // *** NIEUW: Verberg de prijs als gekocht (Extra Idee) ***
        priceUnderImage.style.display = 'none';
        
        // Toon een 'GEKOCHT' melding waar de prijs stond
        const boughtText = document.createElement('p');
        boughtText.className = 'item-price-under-image';
        boughtText.style.fontWeight = 'bold';
        boughtText.style.color = '#888';
        boughtText.textContent = 'Status: 🎁 GEKOCHT';
        leftColumn.appendChild(boughtText);
    } else {
        leftColumn.appendChild(priceUnderImage);
    }
    
    leftColumn.appendChild(imgContainer);
    
    wensItem.appendChild(leftColumn);
    
    // --- RIGHT COLUMN (DESCRIPTION, ACTIONS) ---
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-column';
    
    // 1. NAAM
    const itemName = document.createElement('h3');
    itemName.className = 'item-name';
    itemName.textContent = item.naam;
    rightColumn.appendChild(itemName);

    // 2. NUMMER/CODE
    if (item.nummer) {
        const itemNumber = document.createElement('p');
        itemNumber.className = 'item-number';
        itemNumber.textContent = `Artikelcode: ${item.nummer}`;
        rightColumn.appendChild(itemNumber);
    }
    
    // 3. BESCHRIJVING
    const itemDescription = document.createElement('p');
    itemDescription.className = 'item-description';
    itemDescription.textContent = item.beschrijving;
    rightColumn.appendChild(itemDescription);

    // 4. ACTIEGEBIED (Links & Claim Knop)
    const actionArea = document.createElement('div');
    actionArea.className = 'item-action-area';
    
    // Winkel Links (links van de Claim knop)
    const winkelLinksDiv = document.createElement('div');
    winkelLinksDiv.className = 'winkel-links';
    
    if (item.winkels && item.winkels.length > 0) {
        item.winkels.forEach(winkel => {
            const link = document.createElement('a');
            link.href = winkel.link;
            link.target = '_blank';
            link.textContent = `${winkel.naam} (${winkel.prijs})`;
            winkelLinksDiv.appendChild(link);
        });
    }
    
    // *** NIEUW: Verberg winkel links als gekocht (Extra Idee) ***
    if (isPurchased) {
        winkelLinksDiv.style.display = 'none';
    }
    actionArea.appendChild(winkelLinksDiv);
    
    // Claim Knop OF Gekocht Knop
    if (isPurchased) {
        // *** NIEUW: Vervang Claim knop door Gekocht knop ***
        const purchasedButton = document.createElement('button');
        purchasedButton.className = 'purchased-button'; // Nieuwe CSS klasse
        purchasedButton.textContent = '🎁 GEKOCHT';
        actionArea.appendChild(purchasedButton);
    } else {
        // OUDE Claim knop
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


// UPDATE FUNCTIE: Functie om een individueel item in de overview grid aan te maken
function createOverviewGridItem(persoonNaam, item, isPurchased) { 
    const gridItem = document.createElement('div');
    gridItem.className = 'overview-grid-item';
    gridItem.onclick = () => switchToDetail(persoonNaam.toLowerCase().replace(/\s/g, '-'), item.id);

    // Afbeelding
    const img = document.createElement('img');
    img.src = item.afbeelding_url;
    img.alt = `Afbeelding van ${item.naam}`;
    
    // *** NIEUW: Grayscale filter en 'GEKOCHT' Stempel ***
    if (isPurchased) {
        gridItem.classList.add('purchased'); // Voor de grayscale img CSS
        
        const stamp = document.createElement('div');
        stamp.className = 'purchased-stamp';
        stamp.textContent = 'GEKOCHT';
        gridItem.appendChild(stamp);
    }

    gridItem.appendChild(img);

    // Naam onder de afbeelding
    const itemName = document.createElement('p');
    itemName.className = 'overview-grid-item-name';
    itemName.textContent = item.naam;
    gridItem.appendChild(itemName);
    
    return gridItem;
}


// ** GEFIXTE FUNCTIE: Functie om de totale content op te bouwen (met titels in overview) **
function generateWishlistContent(data, purchasedItemIds) { 
    // Hoofdtitel aanpassen
    document.getElementById('main-title').textContent = `🎄🎁 ${data.wenslijst_titel} 🎁🎄`;
    
    // Verberg de loading message
    document.getElementById('loading-message').style.display = 'none';
    
    const listsContainer = document.getElementById('person-lists-container');
    const overviewContent = document.getElementById('overview-content'); 
    const overviewGridContainer = document.getElementById('overview-grid-container'); 
    
    // Verberg de oorspronkelijke (lege) grid container in de HTML, we bouwen een nieuwe structuur
    overviewGridContainer.style.display = 'none'; 
    
    // Maak een container voor de dynamische overzichtsindeling met titels
    let dynamicOverviewContent = document.getElementById('dynamic-overview-content');
    if (!dynamicOverviewContent) {
        dynamicOverviewContent = document.createElement('div');
        dynamicOverviewContent.id = 'dynamic-overview-content';
        // Plaats de nieuwe container direct in overview-content
        overviewContent.appendChild(dynamicOverviewContent); 
    }
    dynamicOverviewContent.innerHTML = ''; // Leeg de nieuwe container
    
    // Genereer navigatie tabs. De tab-nav moet nu de claims kennen.
    generateTabNav(data.personen, data.inventaris_links, purchasedItemIds); 
    
    data.personen.forEach(persoon => {
        // 1. Maak de tab-inhoud voor de persoon aan. Geef purchasedItemIds mee
        const personContent = createPersonTab(persoon, purchasedItemIds); 
        listsContainer.appendChild(personContent);

        // 2. Voeg een titel toe aan de OVERVIEW CONTENT
        const personTitle = document.createElement('h3');
        personTitle.textContent = `Wensen van ${persoon.naam}`;
        personTitle.className = 'overview-person-title';
        dynamicOverviewContent.appendChild(personTitle); 

        // 3. Maak een sub-container voor de items van deze persoon (DEZE KRIJGT NU DE GRID STYLING)
        const personGridSection = document.createElement('div');
        personGridSection.className = 'overview-grid'; // HERGEBRUIK DE BESTAANDE GRID CLASS
        dynamicOverviewContent.appendChild(personGridSection);
        
        // 4. Voeg items toe aan de nieuwe Grid
        persoon.items.forEach(item => {
            const isPurchased = purchasedItemIds.has(item.id);
            // Geef de status mee aan de functie die de overview grid items maakt
            const overviewItem = createOverviewGridItem(persoon.naam, item, isPurchased); 
            personGridSection.appendChild(overviewItem);
        });
    });

    // Update van de laatste update datum
    document.getElementById('last-update-text').textContent = `Laatste update: ${data.datum}`;
}


// --- INITIALISATIE (NU MET CLAIMS.JSON) ---

// UPDATE FUNCTIE: Functie om de JSON te laden en de pagina op te bouwen
function loadWishlist() {
    // Haal zowel wishlist.json als claims.json tegelijk op
    Promise.all([
        fetch('wishlist.json').then(res => {
            if (!res.ok) throw new Error('Kon wishlist.json niet laden: ' + res.statusText);
            return res.json();
        }),
        // claims.json is optioneel, als het faalt, gebruiken we een lege claims lijst
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
