// E-MAILADRES VAN DE BEHEERDER/ONTVANGER (OPGESLAGEN INFORMATIE)
const recipientEmail = 'bernaertruben@hotmail.com'; 

// --- FUNCTIES VOOR TAB-NAVIGATIE EN SCROLLEN ---

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

// Functie om een tab te openen (de tab-knop functionaliteit)
function openTab(evt, tabName) {
    // Deactiveer alle inhoud
    document.getElementById('overview-content').classList.remove("active");
    const allPersonTabs = document.getElementById('person-lists-container').children;
    for (const tab of allPersonTabs) {
        tab.classList.remove("active");
    }
    const inventoryContent = document.getElementById('inventory-content');
    if(inventoryContent) inventoryContent.classList.remove("active");
    
    // Activeer de gevraagde inhoud
    document.getElementById(tabName).classList.add("active");

    // Deactiveer alle knoppen
    var tablinks = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Activeer de geklikte knop
    evt.currentTarget.classList.add("active");
    
    // Scroll naar de bovenkant van de pagina (of de content wrapper) bij het wisselen van tab
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}

// NIEUWE FUNCTIE: Genereer de inventaris-content
function generateInventoryContent(listsContainer, inventarisLinks) {
    // Maak de content div
    const inventoryWrapper = document.createElement('div');
    inventoryWrapper.id = 'inventory-content';
    inventoryWrapper.className = 'tab-content';
    
    // Inhoud
    const title = document.createElement('h2');
    title.textContent = '🏠 Onze Speelgoed Inventaris';
    inventoryWrapper.appendChild(title);
    
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
            // Dit is de plek om op kapotte links te controleren, hoewel dit technisch 
            // gezien client-side lastig is zonder serverside hulp (zoals fetch/HEAD-requests).
            // We controleren nu alleen de aanwezigheid van de URL.
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            
            // Controleer of de URL leeg is (eenvoudige "kapotte" link check)
            if (!linkData.url || linkData.url.trim() === "") {
                link.textContent = `❌ ${linkData.naam} (Link ontbreekt of is gebroken)`;
                link.style.color = 'red';
            } else {
                link.href = linkData.url;
                link.target = '_blank';
                link.textContent = `➡️ ${linkData.naam}`;
            }

            link.style.fontSize = '1.1em';
            link.style.color = linkData.url && linkData.url.trim() !== "" ? '#3C84CE' : 'red';
            link.style.fontWeight = 'bold';
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        
        inventoryWrapper.appendChild(linksList);
    } else {
        const noLinks = document.createElement('p');
        noLinks.textContent = 'Geen inventaris links gevonden in de JSON.';
        inventoryWrapper.appendChild(noLinks);
    }
    
    // Voeg de inhoud toe aan de container
    listsContainer.appendChild(inventoryWrapper);
}


// Functie om de volledige HTML-inhoud te genereren met de ingeladen data
function generateWishlistContent(data) {
    document.getElementById('main-title').textContent = `🎄🎁 ${data.wenslijst_titel} 🎁🎄`;

    const tabNav = document.getElementById('dynamic-tab-nav');
    const overviewContainer = document.getElementById('overview-grid-container');
    const listsContainer = document.getElementById('person-lists-container');
    const loadingMessage = document.getElementById('loading-message');

    if (loadingMessage) {
        loadingMessage.remove();
    }

    // Wis alle oude inhoud
    overviewContainer.innerHTML = '';
    listsContainer.innerHTML = '';
    tabNav.innerHTML = ''; 

    // --- 1. OVERZICHT KNOP (Bovenaan) ---
    const overviewButton = document.createElement('button');
    overviewButton.id = 'btn-overview';
    overviewButton.className = 'tab-button active';
    overviewButton.textContent = '⭐ Wensen Overzicht Foto\'s';
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    tabNav.appendChild(overviewButton);
    
    // --- 2. INDIVIDUELE PERSOONS KNOPPEN EN LIJSTEN ---
    for (let i = 0; i < data.personen.length; i++) {
        const persoon = data.personen[i];
        
        // Dynamische telling
        const aantalArtikelen = persoon.items.length;
        const persoonNaamMetTelling = `${persoon.naam} (${aantalArtikelen} artikelen)`;
        
        const persoonNaam = persoon.naam;
        const persoonId = persoonNaam.toLowerCase();
        
        // MAAK TAB KNOP
        const personButton = document.createElement('button');
        personButton.id = `btn-${persoonId}`;
        personButton.className = 'tab-button';
        personButton.textContent = `${persoonNaamMetTelling}`; 
        personButton.onclick = (e) => openTab(e, `${persoonId}-content`);
        tabNav.appendChild(personButton);

        // MAAK DE INDIVIDUELE LIJST CONTAINER
        const personContentWrapper = document.createElement('div');
        personContentWrapper.id = `${persoonId}-content`;
        personContentWrapper.className = 'tab-content';
        listsContainer.appendChild(personContentWrapper);

        const listSection = document.createElement('div');
        listSection.className = 'person-section';
        
        const listTitle = document.createElement('h2');
        listTitle.textContent = `Wensenlijst van ${persoonNaamMetTelling}`;
        listSection.appendChild(listTitle);
        
        personContentWrapper.appendChild(listSection);
        
        // MAAK OVERZICHT TITEL VOOR DE PERSOON
        const overviewPersonHeader = document.createElement('div');
        overviewPersonHeader.className = 'overview-person-header';
        overviewPersonHeader.textContent = `Wensen van ${persoonNaamMetTelling}`;
        overviewContainer.appendChild(overviewPersonHeader);
        
        // VOEG ITEMS TOE AAN OVERZICHT EN INDIVIDUELE LIJST
        for (const item of persoon.items) {
            // --- OVERZICHT ITEM ---
            const overviewItem = document.createElement('a');
            overviewItem.className = 'overview-item';
            overviewItem.href = `#${item.id}`;
            overviewItem.onclick = (e) => {
                e.preventDefault(); 
                switchToDetail(persoonId, item.id);
            };
            const overviewImage = document.createElement('img');
            overviewImage.src = item.afbeelding_url;
            overviewImage.alt = item.naam;
            const overviewText = document.createElement('p');
            // Naam inkorten voor de overzichtstegel
            const naamKort = item.naam.replace('LEGO®', '').replace('PLAYMOBIL', '').trim().split(' ').slice(-2).join(' ');
            overviewText.textContent = `${item.nummer} - ${naamKort}`;
            overviewItem.appendChild(overviewImage);
            overviewItem.appendChild(overviewText);
            overviewContainer.appendChild(overviewItem);

            // --- HOOFDLIJST ITEM ---
            const wensItem = document.createElement('div');
            wensItem.className = 'wens-item';
            wensItem.id = item.id;
            
            // Linkerkolom: Afbeelding en prijs onder afbeelding (mobiel)
            const leftColumn = document.createElement('div');
            leftColumn.className = 'left-column';
            const itemImageContainer = document.createElement('div');
            itemImageContainer.className = 'item-image-container';
            const itemImage = document.createElement('img');
            itemImage.src = item.afbeelding_url;
            itemImage.alt = item.naam;
            itemImageContainer.appendChild(itemImage);
            leftColumn.appendChild(itemImageContainer);

            // Prijs onder afbeelding (zichtbaar op mobiel)
            const mobilePrice = document.createElement('div');
            mobilePrice.className = 'item-price-under-image';
            // We pakken hier de eerste prijs om te tonen
            if (item.winkels && item.winkels.length > 0) {
                 // Verwijder "(prijsindicatie)" uit de prijs
                const cleanPrice = item.winkels[0].prijs.replace('(prijsindicatie)', '').trim();
                mobilePrice.textContent = `Prijs vanaf: ${cleanPrice}`;
            }
            leftColumn.appendChild(mobilePrice);
            wensItem.appendChild(leftColumn);
            
            // Rechterkolom: Tekst en acties
            const rightColumn = document.createElement('div');
            rightColumn.className = 'right-column';

            const itemName = document.createElement('h3');
            itemName.textContent = item.naam;
            rightColumn.appendChild(itemName);

            const itemNumber = document.createElement('p');
            itemNumber.className = 'item-nummer';
            itemNumber.textContent = `Artikelnummer: ${item.nummer}`;
            rightColumn.appendChild(itemNumber);
            
            const itemDescription = document.createElement('p');
            itemDescription.textContent = item.beschrijving;
            rightColumn.appendChild(itemDescription);

            // Actiegebied (Winkels & Claim knop)
            const itemActionArea = document.createElement('div');
            itemActionArea.className = 'item-action-area';

            // Winkel Links
            const winkelLinksDiv = document.createElement('div');
            winkelLinksDiv.className = 'winkel-links';
            
            const winkelTitle = document.createElement('h4');
            winkelTitle.textContent = 'Beschikbaar bij:';
            winkelLinksDiv.appendChild(winkelTitle);

            if (item.winkels && item.winkels.length > 0) {
                // Sorteer de winkels op prijs (laagste eerst)
                item.winkels.sort((a, b) => {
                    const priceA = parseFloat(a.prijs.replace('€', '').replace(',', '.').replace('(prijsindicatie)', '').trim());
                    const priceB = parseFloat(b.prijs.replace('€', '').replace(',', '.').replace('(prijsindicatie)', '').trim());
                    return priceA - priceB;
                });

                item.winkels.forEach(winkel => {
                    // CONTROLE OP KAPOTTE LINK (leeg of niet aanwezig)
                    if (winkel.link && winkel.link.trim() !== "") {
                        const winkelParagraaf = document.createElement('p');
                        const winkelLink = document.createElement('a');
                        winkelLink.href = winkel.link;
                        winkelLink.target = '_blank';
                        
                        // Verwijder "(prijsindicatie)" uit de individuele prijs
                        const cleanPrice = winkel.prijs.replace('(prijsindicatie)', '').trim();
                        winkelLink.textContent = `${winkel.naam} (${cleanPrice})`;
                        
                        winkelParagraaf.appendChild(winkelLink);
                        winkelLinksDiv.appendChild(winkelParagraaf);
                    } else {
                        // Toon melding voor de kapotte link
                        const winkelParagraaf = document.createElement('p');
                        const winkelSpan = document.createElement('span');
                        winkelSpan.textContent = `❌ ${winkel.naam} (${winkel.prijs}) - Link ontbreekt of is gebroken`;
                        winkelSpan.style.color = 'red';
                        winkelParagraaf.appendChild(winkelSpan);
                        winkelLinksDiv.appendChild(winkelParagraaf);
                    }
                });
            } else {
                const noLinks = document.createElement('p');
                noLinks.textContent = 'Geen winkel(s) gevonden.';
                winkelLinksDiv.appendChild(noLinks);
            }
            itemActionArea.appendChild(winkelLinksDiv);

            // CLAIM/E-MAILKNOP
            const claimButton = document.createElement('a');
            claimButton.className = 'claim-button';
            // Gebruik het OPGESLAGEN e-mailadres
            const mailSubject = encodeURIComponent(`[GEKOCHT] ${item.naam} - ${item.nummer} voor ${persoonNaam}`);
            const mailBody = encodeURIComponent(`Hallo,

Ik heb zojuist het volgende item van de wensenlijst gekocht/geclaimd:
Item: ${item.naam}
Nummer: ${item.nummer}
Voor: ${persoonNaam}
Link: ${window.location.href}#${item.id}

Opmerking: [OPTIONEEL: Voeg hier een bericht toe]

Graag deze wens markeren als GEKOCHT.

Vriendelijke groet,
[Jouw Naam]`);
            claimButton.href = `mailto:${recipientEmail}?subject=${mailSubject}&body=${mailBody}`;
            claimButton.textContent = '🎁 CLAIM DIT CADEAU (Stuur E-mail)';
            itemActionArea.appendChild(claimButton);

            rightColumn.appendChild(itemActionArea);
            wensItem.appendChild(rightColumn);
            listSection.appendChild(wensItem);
        }
    }
    
    // --- 3. INVENTARIS KNOP EN CONTENT ---
    
    // INVENTARIS KNOP (Onderaan)
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
}


// --- INITIALISATIE ---

// Functie om de JSON te laden en de pagina op te bouwen
function loadWishlist() {
    fetch('wishlist.json')
        .then(response => {
            if (!response.ok) {
                // Als de JSON-file niet gevonden wordt, toon dan een foutbericht
                throw new Error('Kon wishlist.json niet laden: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            generateWishlistContent(data);
        })
        .catch(error => {
            console.error("Fout bij laden van wensenlijst:", error);
            const container = document.getElementById('overview-grid-container');
            if (container) {
                container.innerHTML = '<p style="color: red; font-weight: bold;">Fout: Kon de wensenlijst niet laden. Controleer of het bestand "wishlist.json" correct is en op de juiste locatie staat.</p>';
            }
        });
}

// Start het laadproces wanneer de pagina geladen is
window.onload = loadWishlist;
