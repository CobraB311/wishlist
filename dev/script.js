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
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add("active");
    } else {
        console.error(`Tab content met ID ${tabId} niet gevonden.`);
    }

    // Activeer de juiste tab-knop
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    } else {
         // Als dit aangeroepen wordt zonder event (bv. bij initialisatie), zoek de knop op ID
         const buttonId = `btn-${tabId.replace('-content', '')}`;
         const button = document.getElementById(buttonId);
         if (button) {
             button.classList.add('active');
         }
    }
    
    // Scroll naar de bovenkant van de pagina (na de fixed header)
    const headerHeight = document.querySelector('.fixed-header').offsetHeight;
    if (window.innerWidth <= 900) {
        // Op mobiel: scroll naar de bovenkant van de .page-wrapper
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Op desktop (met verticale nav): scroll naar de bovenkant van de inhoud
         const pageWrapperTop = document.querySelector('.page-wrapper').offsetTop;
         window.scrollTo({ 
            top: pageWrapperTop, 
            behavior: 'smooth' 
         });
    }
}


// --- FUNCTIE VOOR HET GENEREREN VAN DE WENSENLIJST CONTENT ---

function generateWishlistContent(wishlistData, purchasedItemIds) {
    
    // Bijwerken Hoofdtitel en Datum
    document.getElementById('main-title').innerHTML = `&#127873;&#127873; ${wishlistData.wenslijst_titel} &#127873;&#127873;`;
    document.getElementById('last-update-text').textContent = `Laatste update: ${wishlistData.datum}`;

    const dynamicTabNav = document.getElementById('dynamic-tab-nav');
    const overviewGridContainer = document.getElementById('overview-grid-container');
    const personListsContainer = document.getElementById('person-lists-container');
    
    // 1. OVERVIEW TAB
    
    // Overview knop (altijd aanwezig)
    const overviewButton = document.createElement('button');
    overviewButton.className = 'tab-button'; // Start ZONDER active class
    overviewButton.id = 'btn-overview';
    overviewButton.textContent = 'Overzicht';
    overviewButton.onclick = (e) => openTab(e, 'overview-content');
    dynamicTabNav.appendChild(overviewButton);
    
    // 2. PERSONEN EN HUN ITEMS
    
    // Array om alle items te verzamelen voor de Overview-pagina
    const allItems = []; 
    
    wishlistData.personen.forEach(persoon => {
        const naamKort = persoon.naam.toLowerCase().replace(/\s/g, ''); // Jonas, Milan
        const tabId = `${naamKort}-list`;

        // 2a. Maak de Tab-knop voor de persoon
        const personButton = document.createElement('button');
        personButton.className = 'tab-button';
        personButton.id = `btn-${naamKort}`;
        personButton.textContent = persoon.naam;
        personButton.onclick = (e) => openTab(e, tabId);
        dynamicTabNav.appendChild(personButton);

        // 2b. Maak de Tab-Inhoud voor de persoon
        const personContent = document.createElement('div');
        personContent.id = tabId;
        personContent.className = 'tab-content'; // Start inactief
        personListsContainer.appendChild(personContent);

        // Voeg de lijst van items toe aan de persoon zijn tab
        const personList = document.createElement('div');
        personList.className = 'wens-lijst';
        personContent.appendChild(personList);
        
        // Items sorteren op prijs (laag naar hoog)
        const sortedItems = [...persoon.items].sort((a, b) => {
             // Zorg ervoor dat items met een lege winkellijst achteraan komen
             if (!a.winkels || a.winkels.length === 0) return 1;
             if (!b.winkels || b.winkels.length === 0) return -1;
             
             // Extract prices (assuming price is always the lowest listed price in the first element after sorting)
             const priceA = parseFloat(a.winkels[0].prijs.replace('€', '').replace(',', '.').trim());
             const priceB = parseFloat(b.winkels[0].prijs.replace('€', '').replace(',', '.').trim());

             // Sort by price
             if (priceA < priceB) return -1;
             if (priceA > priceB) return 1;
             return 0;
        });

        sortedItems.forEach(item => {
            const isPurchased = purchasedItemIds.has(item.id);
            const wensItem = createWishItemElement(persoon.naam, item, isPurchased);
            personList.appendChild(wensItem);
            
            // Verzamel item voor de overview grid
            if (!isPurchased) {
                 allItems.push({
                    item: item, 
                    persoonNaam: persoon.naam 
                 });
            }
        });
    });
    
    // 3. INVENTARIS LINKS TOEVOEGEN AAN OVERZICHTS PAGINA
    const overviewContentDiv = document.getElementById('overview-content');
    if (wishlistData.inventaris_links && wishlistData.inventaris_links.length > 0) {
        
        // Maak de link-sectie in de Overview tab
        const inventoryWrapper = document.createElement('div');
        inventoryWrapper.className = 'inventory-link-section';
        overviewContentDiv.appendChild(inventoryWrapper); // Voeg toe AAN de overview-content
        
        const linkSectionTitle = document.createElement('h2');
        linkSectionTitle.textContent = 'Inventaris Overzichten:';
        linkSectionTitle.style.marginTop = '30px';
        inventoryWrapper.appendChild(linkSectionTitle);
        
        const linksList = document.createElement('ul');
        linksList.style.listStyleType = 'none';
        linksList.style.paddingLeft = '0';
        
        // LOOP DOOR LINKS UIT DE JSON
        wishlistData.inventaris_links.forEach(linkData => {
            const listItem = document.createElement('li');
            listItem.className = 'inventaris-link-item';
            const link = document.createElement('a');
            link.href = linkData.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = linkData.naam;
            link.title = `Bekijk de ${linkData.naam}`;
            listItem.appendChild(link);
            linksList.appendChild(listItem);
        });
        inventoryWrapper.appendChild(linksList);
    }
    
    // 4. OVERVIEW GRID VULLEN
    
    // Sorteer allItems (niet-gekochte) items voor de grid op alfabetische naam
    allItems.sort((a, b) => a.item.naam.localeCompare(b.item.naam));
    
    // Zorg dat de grid container leeg is voordat we hem vullen
    overviewGridContainer.innerHTML = ''; 
    
    allItems.forEach(({ item, persoonNaam }) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'overview-grid-item';
        gridItem.setAttribute('data-item-id', item.id);
        
        // Navigatie naar het detail item
        gridItem.onclick = () => {
             // Open de juiste tab
             const naamKort = persoonNaam.toLowerCase().replace(/\s/g, '');
             const personButton = document.getElementById(`btn-${naamKort}`);
             if (personButton) {
                // Simuleer klik om de tab te openen, gebruik 'e' als mock-event
                openTab({ currentTarget: personButton }, `${naamKort}-list`); 
             }
             // Scroll naar het item 
             setTimeout(() => {
                const targetItem = document.getElementById(item.id);
                if (targetItem) {
                    // Bereken de offset op basis van de scrollpositie en de header
                    const offset = 30; // Extra padding
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = targetItem.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Visuele feedback op het gescrollde item
                    targetItem.classList.add('highlight');
                    setTimeout(() => targetItem.classList.remove('highlight'), 2000); 
                }
             }, 100); // Korte vertraging zodat de tab-wissel eerst plaatsvindt
        };
        
        const img = document.createElement('img');
        img.src = item.afbeelding_url;
        img.alt = item.naam;
        img.loading = 'lazy';
        gridItem.appendChild(img);
        
        const caption = document.createElement('p');
        caption.className = 'overview-caption';
        caption.innerHTML = `${item.naam} <span class="overview-person">(${persoonNaam})</span>`;
        gridItem.appendChild(caption);
        
        overviewGridContainer.appendChild(gridItem);
    });
    
    // Laadbericht verwijderen wanneer de content klaar is
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }

    // Activeer de Overview tab bij het starten
    openTab(null, 'overview-content');
}


// Functie om een individueel wens-item element te creëren
function createWishItemElement(persoonNaam, item, isPurchased) {
    // ... (Deze functie blijft ongewijzigd) ...
    const wensItem = document.createElement('div');
    wensItem.id = item.id;
    wensItem.className = 'wens-item';
    if (isPurchased) {
        wensItem.classList.add('purchased'); // Voor de detail achtergrond/strikethrough
    }

    // --- LEFT COLUMN (IMAGE, PRICE) ---
    const leftColumn = document.createElement('div');
    leftColumn.className = 'left-column';

    const itemImageContainer = document.createElement('div');
    itemImageContainer.className = 'item-image-container';

    const img = document.createElement('img');
    img.src = item.afbeelding_url;
    img.alt = item.naam;
    img.loading = 'lazy';
    itemImageContainer.appendChild(img);
    
    leftColumn.appendChild(itemImageContainer);

    // Toon de beste prijs onder de afbeelding (voor desktop en mobiel)
    if (item.winkels && item.winkels.length > 0) {
        const lowestPrice = item.winkels.sort((a, b) => {
            const priceA = parseFloat(a.prijs.replace('€', '').replace(',', '.').trim());
            const priceB = parseFloat(b.prijs.replace('€', '').replace(',', '.').trim());
            return priceA - priceB;
        })[0];
        
        const priceElement = document.createElement('p');
        priceElement.className = 'item-price-under-image';
        priceElement.innerHTML = `Vanaf: <span class="price-value">${lowestPrice.prijs}</span>`;
        leftColumn.appendChild(priceElement);
    }
    
    wensItem.appendChild(leftColumn);

    // --- RIGHT COLUMN (DETAILS, LINKS, ACTION) ---
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-column';

    // Titel en Beschrijving
    const title = document.createElement('h3');
    title.textContent = item.naam;
    rightColumn.appendChild(title);

    const description = document.createElement('p');
    description.className = 'item-description';
    description.textContent = item.beschrijving;
    rightColumn.appendChild(description);

    const nummer = document.createElement('p');
    nummer.className = 'item-nummer';
    nummer.textContent = `Artikelnr: ${item.nummer}`;
    rightColumn.appendChild(nummer);
    
    // Winkel Links
    const winkelLinksContainer = document.createElement('div');
    winkelLinksContainer.className = 'winkel-links';

    if (item.winkels) {
        // Sorteer de winkel links op prijs
        const sortedWinkels = item.winkels.sort((a, b) => {
            const priceA = parseFloat(a.prijs.replace('€', '').replace(',', '.').trim());
            const priceB = parseFloat(b.prijs.replace('€', '').replace(',', '.').trim());
            return priceA - priceB;
        });
        
        // CONTROLE OP KAPOTTE LINKS (opgeslagen instructie)
        let hasBrokenLink = false;
        sortedWinkels.forEach(winkel => {
            if (!winkel.link || winkel.link.trim() === '' || !winkel.link.startsWith('http')) {
                hasBrokenLink = true;
                console.error(`Kapotte link gevonden voor item ${item.naam} (${winkel.naam})`);
            }
        });
        
        if (hasBrokenLink) {
            // Voeg een waarschuwing toe aan de gebruiker op de site
            const warning = document.createElement('p');
            warning.textContent = 'Waarschuwing: Er is een ongeldige link gevonden voor dit item. Controleer de JSON.';
            warning.style.color = 'red';
            rightColumn.appendChild(warning);
        }

        sortedWinkels.forEach(winkel => {
            const link = document.createElement('a');
            link.href = winkel.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'winkel-link-button';
            link.textContent = `${winkel.naam}: ${winkel.prijs}`;
            winkelLinksContainer.appendChild(link);
        });
    }

    rightColumn.appendChild(winkelLinksContainer);
    
    // Actie Area (Claim Button)
    const actionArea = document.createElement('div');
    actionArea.className = 'item-action-area';

    if (isPurchased) {
        const purchasedText = document.createElement('p');
        purchasedText.className = 'purchased-note';
        purchasedText.textContent = 'Gekocht! Bedankt. \u2764\uFE0F'; // Hartje
        actionArea.appendChild(purchasedText);
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


// --- HOOFDFUNCTIE OM DATA TE LADEN ---

function loadWishlist() {
    // 1. Haal de hoofd-configuratie en de claims op
    Promise.all([
        fetch('wishlist_data.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Kon wishlist_data.json niet laden. Controleer de bestandsnaam.');
                }
                return res.json();
            })
            .catch(error => {
                console.error("Fout bij laden van wishlist_data.json:", error.message);
                // Toon een foutmelding op de pagina als de kritieke file faalt
                document.getElementById('overview-grid-container').innerHTML = `<p style="color: red; font-weight: bold;">Fout: Hoofdconfiguratie (wishlist_data.json) kon niet geladen worden. ${error.message}</p>`;
                throw error; // Propagate error
            }),
        fetch('claims.json')
            .then(res => {
                if (!res.ok) {
                    // Als de claims file niet gevonden wordt (404), val terug op leeg
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
    .then(([mainData, claimsData]) => {
        // 2. Definieer de fetches voor de afzonderlijke databestanden
        const fileFetches = [];
        const personNames = [];
        const personIndices = {}; // Index om de namen later correct te koppelen

        // 2a. Fetch item lijsten voor elke persoon
        mainData.personen.forEach((person, index) => {
            fileFetches.push(
                fetch(person.data_file)
                    .then(res => {
                        if (!res.ok) {
                             throw new Error(`Kon de items voor ${person.naam} niet laden: ${person.data_file}`);
                        }
                        return res.json();
                    })
                    .catch(error => {
                        console.error(`Fout bij laden van items voor ${person.naam}: ${error.message}`);
                        // Laat het item fetch falen, de promise.all zal dit opvangen
                        throw error;
                    })
            );
            personNames.push(person.naam);
            personIndices[person.naam] = index; // Onthoud de volgorde
        });

        // 2b. Fetch inventaris links (niet-kritiek, kan leeg zijn)
        let inventoryFetch = Promise.resolve([]); // Default leeg array
        if (mainData.inventaris_links_file) {
             inventoryFetch = fetch(mainData.inventaris_links_file)
                .then(res => {
                    if (!res.ok) {
                         console.warn("inventory_links.json niet gevonden. Start met lege links.");
                         return [];
                    }
                    return res.json();
                })
                .catch(error => {
                     console.error("Fout bij laden van inventory_links.json:", error.message);
                     return []; // Ga verder zonder inventaris links
                });
        }
        fileFetches.push(inventoryFetch);

        // 3. Wacht op alle afzonderlijke bestanden en herstructureer de data
        return Promise.all(fileFetches).then(results => {
            // Het laatste resultaat is de inventaris links (of een leeg array)
            const inventoryLinks = results.pop(); 
            const personItemLists = results; // De overige zijn de item lijsten

            // Herstructureer naar de oorspronkelijke wishlistData structuur voor compatibiliteit
            const reconstructedWishlist = {
                wenslijst_titel: mainData.wenslijst_titel,
                datum: mainData.datum,
                personen: personItemLists.map((items, index) => ({
                    naam: personNames[index],
                    items: items
                })),
                inventaris_links: inventoryLinks
            };

            return [reconstructedWishlist, claimsData];
        });
    })
    .then(([wishlistData, claimsData]) => {
        // 4. Genereer de content
        const purchasedItemIds = new Set(claimsData.purchased_items || []);
        generateWishlistContent(wishlistData, purchasedItemIds);
        
        // Activeer de Overview tab bij het starten (dubbelcheck, al in generateWishlistContent)
        // openTab(null, 'overview-content');
        
    })
    .catch(error => {
        // De kritieke foutafhandeling gebeurt reeds in stap 1.
        console.error("Onverwachte fout in laadproces:", error);
    });
}

// Start het laadproces wanneer de pagina geladen is
window.onload = loadWishlist;
