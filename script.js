// E-MAILADRES VAN DE BEHEERDER/ONTVANGER (OPGESLAGEN INFORMATIE)
const recipientEmail = 'bernaertruben@hotmail.com'; 

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
            const link = document.createElement('a');
            link.href = linkData.url;
            link.target = '_blank';
            link.textContent = `➡️ ${linkData.naam}`;
            link.style.fontSize = '1.1em';
            link.style.color = '#3C84CE'; // Blauw
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

    overviewContainer.innerHTML = '';
    listsContainer.innerHTML = '';
    tabNav.innerHTML = ''; 

    // --- 1. INVENTARIS TAB CONTENT AANMAKEN ---
    generateInventoryContent(listsContainer, data.inventaris_links);

    // --- 2. TABS/KNOPPEN AANMAKEN EN IN DE JUISTE VOLGORDE ZETTEN ---

    // OVERZICHT KNOP (Bovenaan)
    const overviewButton = document.createElement('button');
    overviewButton.id = 'btn-overview';
    overviewButton.className = 'tab-button active';
    overviewButton.textContent = '⭐ Wensen Overzicht Foto\'s';
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    tabNav.appendChild(overviewButton);
    
    for (let i = 0; i < data.personen.length; i++) {
        const persoon = data.personen[i];
        
        // TEL HET AANTAL ARTIKELEN DYNAMISCH HIER
        const aantalArtikelen = persoon.items.length;
        // Bepaal de dynamische naam inclusief het aantal
        const persoonNaamMetTelling = `${persoon.naam} (${aantalArtikelen} artikelen)`;
        
        const persoonNaam = persoon.naam; // Gebruik de originele naam voor ID's en functies
        const persoonId = persoonNaam.toLowerCase();
        
        // 1. MAAK TAB KNOP (Verticaal links)
        const personButton = document.createElement('button');
        personButton.id = `btn-${persoonId}`;
        personButton.className = 'tab-button';
        // Gebruik de naam met telling voor de knoptekst
        personButton.textContent = `${persoonNaamMetTelling}`; 
        personButton.onclick = (e) => openTab(e, `${persoonId}-content`);
        tabNav.appendChild(personButton);

        // 2. MAAK DE INDIVIDUELE LIJST CONTAINER
        const personContentWrapper = document.createElement('div');
        personContentWrapper.id = `${persoonId}-content`;
        personContentWrapper.className = 'tab-content';
        listsContainer.appendChild(personContentWrapper);

        const listSection = document.createElement('div');
        listSection.className = 'person-section';
        
        const listTitle = document.createElement('h2');
        // Gebruik de naam met telling voor de titel bovenaan de lijst
        listTitle.textContent = `Wensenlijst van ${persoonNaamMetTelling}`;
        listSection.appendChild(listTitle);
        
        personContentWrapper.appendChild(listSection);
        
        // 3. MAAK OVERZICHT TITEL VOOR DE PERSOON
        const overviewPersonHeader = document.createElement('div');
        overviewPersonHeader.className = 'overview-person-header';
        // Gebruik de naam met telling voor het overzicht
        overviewPersonHeader.textContent = `Wensen van ${persoonNaamMetTelling}`;
        overviewContainer.appendChild(overviewPersonHeader);
        
        // 4. VOEG ITEMS TOE AAN OVERZICHT EN INDIVIDUELE LIJST
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
            const naamKort = item.naam.replace('LEGO®', '').replace('PLAYMOBIL', '').trim().split(' ').slice(-2).join(' ');
            overviewText.textContent = `${item.nummer} - ${naamKort}`; 
            
            overviewItem.appendChild(overviewImage);
            overviewItem.appendChild(overviewText);
            overviewContainer.appendChild(overviewItem);

            // --- HOOFDLIJST ITEM ---
            const wensItem = document.createElement('div');
            wensItem.className = 'wens-item';
            wensItem.id = item.id;

            // 1. LINKER KOLOM (Afbeelding + Prijs)
            const leftColumn = document.createElement('div');
            leftColumn.className = 'left-column';

            // Afbeelding
            const itemImageDiv = document.createElement('div');
            itemImageDiv.className = 'item-image-container';
            const itemImage = document.createElement('img');
            itemImage.src = item.afbeelding_url;
            itemImage.alt = item.naam;
            itemImageDiv.appendChild(itemImage);
            leftColumn.appendChild(itemImageDiv);

            // Prijs (onder afbeelding - Samengevatte prijs)
            // Gebruik de schone prijs om de laagste prijs te berekenen
            const prijzen = item.winkels.map(w => parseFloat(w.prijs.replace('€ ', '').replace(',', '.').replace('(prijsindicatie)', '').trim()));
            const laagstePrijs = Math.min(...prijzen);
            const prijsElement = document.createElement('p');
            prijsElement.className = 'item-price-under-image';
            
            // Samengevatte prijs toont de tekst "(Indicatie)"
            prijsElement.textContent = `Vanaf: € ${laagstePrijs.toFixed(2).replace('.', ',')} (Indicatie)`; 
            
            leftColumn.appendChild(prijsElement);
            
            wensItem.appendChild(leftColumn);


            // 2. DETAIL CONTAINER
            const itemDetailsDiv = document.createElement('div');
            itemDetailsDiv.className = 'item-details';

            // 2a. TEKST INFO (Titel, nummer, beschrijving)
            const itemTextInfo = document.createElement('div');
            itemTextInfo.className = 'item-text-info';

            const title = document.createElement('h2');
            title.textContent = item.naam;
            itemTextInfo.appendChild(title);

            const nummer = document.createElement('p');
            nummer.innerHTML = `<strong>Item nummer:</strong> ${item.nummer}`;
            itemTextInfo.appendChild(nummer);

            const beschrijving = document.createElement('p');
            beschrijving.innerHTML = `<strong>Beschrijving:</strong> ${item.beschrijving}`;
            itemTextInfo.appendChild(beschrijving);
            
            itemDetailsDiv.appendChild(itemTextInfo);

            // 2b. ACTIE GEBIED (Winkels, knop)
            const itemActionArea = document.createElement('div');
            itemActionArea.className = 'item-action-area';

            // Winkel Links
            const winkelLinksDiv = document.createElement('div');
            winkelLinksDiv.className = 'winkel-links';
            const winkelTitel = document.createElement('p');
            winkelTitel.innerHTML = '<strong>Verkrijgbaar bij:</strong>';
            winkelLinksDiv.appendChild(winkelTitel);
            
            for (const winkel of item.winkels) {
                const winkelParagraaf = document.createElement('p');
                const winkelLink = document.createElement('a');
                winkelLink.href = winkel.link;
                winkelLink.target = '_blank';
                
                // CORRECTIE: Verwijder "(prijsindicatie)" uit de individuele prijs
                const cleanPrice = winkel.prijs.replace('(prijsindicatie)', '').trim(); 
                winkelLink.textContent = `${winkel.naam} (${cleanPrice})`; 
                
                winkelParagraaf.appendChild(winkelLink);
                winkelLinksDiv.appendChild(winkelParagraaf);
            }
            itemActionArea.appendChild(winkelLinksDiv);
            
            // CLAIM/E-MAILKNOP
            const claimButton = document.createElement('a');
            claimButton.className = 'claim-button';

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
            claimButton.textContent = '✅ Claim dit item & Stuur E-mail';
            itemActionArea.appendChild(claimButton);

            itemDetailsDiv.appendChild(itemActionArea);
            wensItem.appendChild(itemDetailsDiv);
            listSection.appendChild(wensItem);
        }
    }

    // INVENTARIS KNOP (Onderaan)
    const inventoryButton = document.createElement('button');
    inventoryButton.id = 'btn-inventory';
    inventoryButton.className = 'tab-button';
    inventoryButton.textContent = '📦 Inventaris Overzicht';
    inventoryButton.onclick = (e) => openTab(e, 'inventory-content');
    tabNav.appendChild(inventoryButton);
    
    
    // Zorgt ervoor dat het overzicht standaard actief is
    document.getElementById('overview-content').classList.add("active");
    document.getElementById('btn-overview').classList.add("active");
    
    // Zorg ervoor dat de andere tabs inactief zijn
    document.getElementById('inventory-content').classList.remove("active");
    document.getElementById('btn-inventory').classList.remove("active");
    
    data.personen.forEach(p => {
        // We moeten nu de oorspronkelijke naam zonder telling gebruiken om de DOM elementen te vinden
        const persoonId = p.naam.toLowerCase();
        document.getElementById(`${persoonId}-content`).classList.remove("active");
        document.getElementById(`btn-${persoonId}`).classList.remove("active");
    });
}

// Functie om de JSON-data in te laden (Cache uitgeschakeld)
async function loadWishlistData() {
    try {
        const response = await fetch('wishlist.json', { cache: 'no-store' });
        
        if (!response.ok) {
            throw new Error(`Fout bij laden van JSON: ${response.statusText}`);
        }
        
        const data = await response.json();
        generateWishlistContent(data);
        
    } catch (error) {
        console.error("Fout bij het inladen of verwerken van de wensenlijst:", error);
        const overviewContainer = document.getElementById('overview-grid-container');
        overviewContainer.innerHTML = `<p style="color: red; font-weight: bold;">Fout: Kon wensenlijst niet laden. Zorg ervoor dat 'wishlist.json' in dezelfde map staat en de JSON-structuur correct is. (${error.message})</p>`;
    }
}

// De tab-wissel functionaliteit
function openTab(evt, tabId) {
    // Haal alle tab-content elementen op (Overview, Inventaris, en alle personen)
    const allTabContent = [document.getElementById('overview-content'), document.getElementById('inventory-content')];
    const allPersonTabs = document.getElementById('person-lists-container').children;

    for (const content of allTabContent) {
        if(content) content.classList.remove("active");
    }
    for (const tab of allPersonTabs) {
        tab.classList.remove("active");
    }
    
    // Activeer de gevraagde tab
    const requestedTab = document.getElementById(tabId);
    if(requestedTab) requestedTab.classList.add("active");

    var tablinks = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

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
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Initialisatie: Start met het inladen van de JSON-data
document.addEventListener("DOMContentLoaded", loadWishlistData);
