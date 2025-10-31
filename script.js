// E-MAILADRES VAN DE BEHEERDER/ONTVANGER (OPGESLAGEN INFORMATIE)
const recipientEmail = 'bernaertruben@hotmail.com'; 

// FUNCTIE: Genereer de inventaris-content
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
        
        inventarisLinks.forEach(linkData => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = linkData.url;
            link.textContent = linkData.naam;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.fontSize = '1.1em';
            link.style.fontWeight = 'bold';
            link.style.display = 'block';
            link.style.padding = '5px 0';

            const icon = document.createElement('span');
            icon.textContent = '🔗 ';
            listItem.appendChild(icon);
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        inventoryWrapper.appendChild(linksList);
    }
    
    listsContainer.appendChild(inventoryWrapper);
}

// Functie om een wens-item kaart te genereren
function generateItemCard(item, persoonNaam, claimedItemsSet) {
    // Hoofdcontainer
    const itemWrapper = document.createElement('div');
    itemWrapper.id = item.id;
    itemWrapper.className = 'wens-item';
    
    // *** LOGICA VOOR GEKOCHT/GECLAIMD: Check de Set ***
    const isClaimed = claimedItemsSet.has(item.id);
    if (isClaimed) {
        itemWrapper.classList.add('claimed-item');
    }
    // *** EINDE LOGICA ***

    // Linker kolom: Afbeelding
    const leftColumn = document.createElement('div');
    leftColumn.className = 'left-column';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'item-image-container';

    const image = document.createElement('img');
    image.src = item.afbeelding_url;
    image.alt = item.naam;
    image.loading = 'lazy'; 
    imageContainer.appendChild(image);
    leftColumn.appendChild(imageContainer);
    
    // Prijs onder de afbeelding 
    if (item.winkels && item.winkels.length > 0) {
        // Zoek de laagste prijs
        const lowestPrice = item.winkels.reduce((min, w) => {
            const prijsNum = parseFloat(w.prijs.replace(/[^0-9,.]/g, '').replace(',', '.'));
            return (min === null || prijsNum < min) ? prijsNum : min;
        }, null);
        
        if (lowestPrice !== null) {
            const priceUnderImage = document.createElement('p');
            priceUnderImage.className = 'item-price-under-image';
            priceUnderImage.textContent = `Vanaf ${new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(lowestPrice)}`;
            leftColumn.appendChild(priceUnderImage);
        }
    }
    
    itemWrapper.appendChild(leftColumn);


    // Rechter kolom: Details en Acties
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-column';

    const itemDetails = document.createElement('div');
    itemDetails.className = 'item-details';

    // Titel
    const title = document.createElement('h3');
    title.textContent = item.naam;
    itemDetails.appendChild(title);

    // Beschrijving
    const description = document.createElement('p');
    description.textContent = item.beschrijving;
    itemDetails.appendChild(description);

    rightColumn.appendChild(itemDetails);


    // Actiegebied (Knoppen en Links)
    const itemActionArea = document.createElement('div');
    itemActionArea.className = 'item-action-area';


    // Winkel Links
    const winkelLinksContainer = document.createElement('div');
    winkelLinksContainer.className = 'winkel-links';
    
    if (item.winkels && item.winkels.length > 0) {
        const linksTitle = document.createElement('h4');
        linksTitle.textContent = 'Verkrijgbaar bij:';
        winkelLinksContainer.appendChild(linksTitle);

        const linksList = document.createElement('ul');
        item.winkels.forEach(winkel => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = winkel.link;
            link.textContent = `${winkel.naam} (${winkel.prijs})`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        winkelLinksContainer.appendChild(linksList);
    } else {
        const info = document.createElement('p');
        info.textContent = 'Geen winkellinks beschikbaar. Gelieve zelf te zoeken.';
        winkelLinksContainer.appendChild(info);
    }
    
    
    // Claim Knop
    const claimButton = document.createElement('a');
    
    // *** LOGICA VOOR GEKOCHT/GECLAIMD ***
    if (isClaimed) {
        claimButton.textContent = '✅ Gekocht!';
        claimButton.className = 'claim-button bought-button';
        claimButton.href = 'javascript:void(0);'; // Maak de knop inactief
    } else {
        claimButton.textContent = '🎁 Claim dit cadeau!';
        claimButton.className = 'claim-button';
        // Mailto body met instructie om claimed_items.json bij te werken
        claimButton.href = `mailto:${recipientEmail}?subject=Cadeau Claim: ${persoonNaam} - ${item.naam}&body=Hallo Ruben,%0D%0AIk wil graag claimen dat ik het volgende cadeau voor ${persoonNaam} koop:%0D%0AItem: ${item.naam}%0D%0AID: ${item.id}%0D%0A%0D%0AZou je dit item als 'gekocht' willen markeren in de aparte claimed_items.json lijst (door ID ${item.id} toe te voegen)?`;
        claimButton.setAttribute('target', '_blank');
    }
    // *** EINDE LOGICA ***
    

    itemActionArea.appendChild(winkelLinksContainer);
    itemActionArea.appendChild(claimButton);

    rightColumn.appendChild(itemActionArea);
    itemWrapper.appendChild(rightColumn);

    return itemWrapper;
}


// Functie om de tab-content te tonen/verbergen
function openTab(evt, tabName) {
    // Verberg alle tab-content
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

    // Toon de huidige tab
    document.getElementById(tabName).classList.add("active");
    
    // Activeer de knop
    evt.currentTarget.classList.add("active");
    
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}

// Functie om naar de detailtab te wisselen en naar het item te scrollen
function switchToDetail(persoonId, itemId) {
    // Verberg alle tab-content
    var i, tabcontent;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    // Deactiveer alle tab-knoppen
    var tablinks = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Activeer de persoon's tab en knop
    document.getElementById(`${persoonId}-content`).classList.add("active");
    document.getElementById(`btn-${persoonId}`).classList.add("active");
    
    const itemElement = document.getElementById(itemId);
    if (itemElement) {
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Initialisatie: Start...
function initializeWishlist(data, claimedItemsSet) {
    const personListsContainer = document.getElementById('person-lists-container');
    const overviewGridContainer = document.getElementById('overview-grid-container');
    const tabNav = document.getElementById('dynamic-tab-nav');
    
    // Hoofdtitel aanpassen
    document.getElementById('main-title').textContent = `🎄🎁 ${data.wenslijst_titel || 'De Grote Wenslijst'} 🎁🎄`;

    // Activeer de eerste knop: Overzicht (wordt later vooraan geplaatst)
    const overviewButton = document.createElement('button');
    overviewButton.className = 'tab-button active';
    overviewButton.id = 'btn-overview';
    overviewButton.textContent = 'Overzicht';
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    
    // Voeg de Overzichtsknop toe aan het begin van de navigatie
    tabNav.appendChild(overviewButton); 
    
    // Wensenlijsten genereren
    data.personen.forEach(persoon => {
        const persoonId = persoon.naam.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // 1. Maak de Tab-knop
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.id = `btn-${persoonId}`;
        tabButton.textContent = persoon.naam;
        tabButton.onclick = (e) => openTab(e, `${persoonId}-content`);
        tabNav.appendChild(tabButton);

        // 2. Maak de Tab-Content voor de persoon
        const contentWrapper = document.createElement('div');
        contentWrapper.id = `${persoonId}-content`;
        contentWrapper.className = 'tab-content';
        
        const listTitle = document.createElement('h2');
        listTitle.textContent = `Wensenlijst van ${persoon.naam}`;
        contentWrapper.appendChild(listTitle);

        persoon.items.forEach(item => {
            // Voeg de item-kaart toe aan de persoonlijke lijst
            const itemCard = generateItemCard(item, persoon.naam, claimedItemsSet);
            contentWrapper.appendChild(itemCard);

            // Voeg de item-kaart toe aan het Overzicht
            const overviewItem = generateOverviewCard(item, persoonId, persoon.naam, claimedItemsSet);
            overviewGridContainer.appendChild(overviewItem);
        });

        personListsContainer.appendChild(contentWrapper);
    });
    
    // 3. Maak de Inventaris-knop en -content
    if (data.inventaris_links && data.inventaris_links.length > 0) {
        const inventoryButton = document.createElement('button');
        inventoryButton.className = 'tab-button';
        inventoryButton.id = 'btn-inventory';
        inventoryButton.textContent = 'Inventaris';
        inventoryButton.onclick = (e) => openTab(e, 'inventory-content');
        tabNav.appendChild(inventoryButton);
        
        generateInventoryContent(personListsContainer, data.inventaris_links);
    }

    document.getElementById('loading-message').style.display = 'none'; // Verberg de laadmelding
}


// Functie om de kaartjes voor het overzicht te maken
function generateOverviewCard(item, persoonId, persoonNaam, claimedItemsSet) {
    const overviewItem = document.createElement('div');
    overviewItem.className = 'overview-item';
    
    // *** LOGICA VOOR GEKOCHT/GECLAIMD: Check de Set ***
    const isClaimed = claimedItemsSet.has(item.id);
    if (isClaimed) {
        overviewItem.classList.add('claimed-item-overview');
    }
    // *** EINDE LOGICA ***
    
    overviewItem.onclick = () => switchToDetail(persoonId, item.id);

    const image = document.createElement('img');
    image.src = item.afbeelding_url;
    image.alt = item.naam;
    image.loading = 'lazy';
    overviewItem.appendChild(image);
    
    const caption = document.createElement('p');
    caption.innerHTML = `**${item.naam}**<br>(${persoonNaam})`;
    caption.style.fontWeight = 'bold'; 
    
    // Voeg 'GEKOCHT' label toe aan het overzicht
    if (isClaimed) {
        const boughtLabel = document.createElement('span');
        boughtLabel.textContent = '✅ GEKOCHT!';
        boughtLabel.className = 'bought-label-overview';
        overviewItem.appendChild(boughtLabel);
    }
    
    overviewItem.appendChild(caption);
    return overviewItem;
}

// Data laden en initialiseren
Promise.all([
    // 1. Fetch de wensenlijst
    fetch('wishlist.json').then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for wishlist.json`);
        }
        return response.json();
    }),
    // 2. Fetch de claimed items (kan 404 zijn als het bestand nog niet bestaat)
    fetch('claimed_items.json')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            // Als claimed_items.json niet bestaat (404), stuur dan een lege lijst
            if (response.status === 404) {
                console.warn('claimed_items.json niet gevonden, start met lege claimlijst.');
                return { claimed_items: [] };
            }
            throw new Error(`HTTP error! status: ${response.status} for claimed_items.json`);
        })
        .catch(error => {
             // Als de fetch faalt (netwerk, CORS), start met lege lijst
            console.error("Fout bij het laden van claimed_items.json, start met lege claimlijst:", error);
            return { claimed_items: [] };
        })
])
.then(([wishlistData, claimedData]) => {
    // Maak een Set voor snelle lookups van claimed ID's
    const claimedItemsSet = new Set(claimedData.claimed_items || []);
    initializeWishlist(wishlistData, claimedItemsSet);
})
.catch(error => {
    console.error("Fout bij het laden van de wensenlijsten:", error);
    document.getElementById('loading-message').textContent = 'Fout bij het laden van de wensenlijst. Controleer de console voor details.';
});
