// E-MAILADRES VAN DE BEHEERDER/ONTVANGER (OPGESLAGEN INFORMATIE)
const recipientEmail = 'bernaertruben@hotmail.com'; // Gebruikt opgeslagen e-mailadres

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
    
    // 1. Deactiveer alle tabs en knoppen (Gebruik querySelectorAll voor robuustheid)
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
    
    // 2. Activeer de tab-inhoud
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add("active");
    }
    
    // 3. Activeer de bijbehorende tab-knop (met fix voor scrollToItem)
    let targetButton;
    if (evt && evt.currentTarget) {
        // De knop is direct geklikt
        targetButton = evt.currentTarget;
    } else {
        // De functie wordt aangeroepen vanuit scrollToItem. Zoek de knop op basis van de tabId.
        targetButton = document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
    }

    if (targetButton) {
        targetButton.classList.add("active");
    }

    // 4. Scroll naar de top van de pagina-inhoud
    const pageWrapper = document.querySelector('.page-wrapper');
    if (pageWrapper) {
        pageWrapper.scrollTop = 0;
    }
}

// Functie om te scrollen naar een item na een klik in het overzicht
function scrollToItem(persoonNaam, itemId) {
    // 1. Open de juiste tab (de wensenlijst van de persoon)
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    
    // Roep openTab aan zonder event (evt = null). De nieuwe openTab zal de juiste knop vinden.
    openTab(null, tabId); 
    
    // 2. Wacht even tot de browser de tab heeft geopend (belangrijk!)
    setTimeout(() => {
        const itemElement = document.getElementById(itemId);
        if (itemElement) {
            // Verwijder eerst eventuele highlight classes
            document.querySelectorAll('.wens-item').forEach(el => el.classList.remove('highlight'));
            
            // Voeg highlight toe en scroll ernaartoe
            itemElement.classList.add('highlight');
            itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Verwijder de highlight na een paar seconden
            setTimeout(() => {
                itemElement.classList.remove('highlight');
            }, 3000); 
        }
    }, 100); 
}


// --- DYNAMISCHE TITEL FUNCTIE ---

// Functie om de HTML titel dynamisch in te stellen op basis van de geladen data
function updateHtmlTitle(wishlistData) {
    // Haal de namen uit de 'personen' array
    const names = wishlistData.personen.map(p => p.naam);
    
    // Maak de lijst van namen: "Jonas & Milan" of "Kitty & Ruben"
    const namesString = names.join(' & ');
    
    // Gebruik de titel uit de JSON, met de dynamische namen
    const newTitle = `🎄🎁 De Grote Wenslijst van ${namesString} 🎁🎄`;
    
    // Update de <title> tag van de pagina
    document.title = newTitle;
}


// --- FUNCTIES VOOR HET GENEREREN VAN HTML CONTENT ---

// Functie om de overzichtskaartjes te genereren
function generateOverviewGrid(wishlistData) {
    const gridContainer = document.getElementById('overview-grid-container');
    let overviewHtml = '';

    wishlistData.personen.forEach(person => {
        // Een sectie per persoon (voor het geval de overzichtspagina wordt gegroepeerd)
        overviewHtml += `<div class="overview-person-section">
                            <h3>Wensenlijst van ${person.naam}</h3>
                            <div class="overview-grid-inner">`;
        
        person.items.forEach(item => {
            // Gebruik de eerste winkelprijs als er winkels zijn
            const prijs = item.winkels && item.winkels.length > 0 ? item.winkels[0].prijs : 'Prijs Onbekend';
            const isPurchased = item.isPurchased; 
            const itemClass = isPurchased ? 'overview-grid-item purchased' : 'overview-grid-item';
            
            // Overlay HTML toevoegen voor het overzicht
            let purchasedOverlayHtml = '';
            if (isPurchased) {
                purchasedOverlayHtml = `<span class="purchased-overlay">GEKOCHT</span>`;
            }

            // Voeg de onClick toe om naar het item te scrollen
            overviewHtml += `<div class="${itemClass}" onclick="scrollToItem('${person.naam}', '${item.id}')">
                                <div class="overview-image-wrapper">
                                    ${purchasedOverlayHtml}
                                    <img src="${item.afbeelding_url}" alt="${item.naam}">
                                </div>
                                <div class="overview-caption">
                                    ${item.naam}
                                    <span class="overview-person">(${person.naam})</span>
                                </div>
                                <span class="item-price-under-image">${prijs}</span>
                            </div>`;
        });
        
        overviewHtml += `</div></div>`; // Sluit grid-inner en section
    });

    gridContainer.innerHTML = overviewHtml;
}


// Functie om de volledige wensenlijsten (tabs) te genereren
function generatePersonLists(wishlistData, purchasedItemIds) {
    const personListsContainer = document.getElementById('person-lists-container');
    let listsHtml = '';

    wishlistData.personen.forEach(person => {
        const tabId = person.naam.toLowerCase() + '-list-content';

        // Maak de content container voor elke persoon
        listsHtml += `<div id="${tabId}" class="tab-content">
                        <h2>Wensenlijst van ${person.naam}</h2>
                        <div class="wens-lijst">`;
        
        person.items.forEach(item => {
            const isPurchased = purchasedItemIds.has(item.id);
            const itemClass = isPurchased ? 'wens-item purchased' : 'wens-item';
            
            // Links genereren
            let winkelsHtml = '';
            item.winkels.forEach(winkel => {
                winkelsHtml += `<a href="${winkel.link}" target="_blank" class="winkel-link-button">${winkel.naam} (${winkel.prijs})</a>`;
            });

            // Claim actie gebied genereren
            let actionAreaHtml = '';
            if (isPurchased) {
                actionAreaHtml = `<span class="purchased-note">🎁 Dit cadeau is reeds gekocht!</span>`;
            } else {
                actionAreaHtml = `<button class="claim-button" onclick="claimItem('${person.naam}', '${item.naam}', '${item.id}')">Cadeau Kopen & Claimen</button>`;
            }
            
            // Overlay HTML voor gekochte items (detaillijst)
            let purchasedOverlayHtml = '';
            if (isPurchased) {
                purchasedOverlayHtml = `<span class="purchased-overlay">GEKOCHT</span>`;
            }

            // Volledig item
            listsHtml += `<div id="${item.id}" class="${itemClass}">
                            <div class="left-column">
                                <div class="item-image-container">
                                    ${purchasedOverlayHtml}
                                    <img src="${item.afbeelding_url}" alt="${item.naam}">
                                </div>
                                <span class="item-price-under-image">${item.winkels.length > 0 ? item.winkels[0].prijs : 'Prijs Onbekend'}</span>
                            </div>
                            <div class="right-column">
                                <h3>${item.naam}</h3>
                                <p class="item-description">${item.beschrijving}</p>
                                <div class="winkel-links">${winkelsHtml}</div>
                                <p class="item-nummer">Artikelnummer: ${item.nummer}</p>
                                <div class="item-action-area">
                                    ${actionAreaHtml}
                                </div>
                            </div>
                        </div>`;
        });
        
        listsHtml += `</div></div>`; // Sluit wens-lijst en tab-content
    });

    personListsContainer.innerHTML = listsHtml;
}


// Functie om de inventaris links te genereren
function generateInventoryLinks(inventoryLinks) {
    const inventarisHtml = `<div id="inventory-content" class="tab-content">
                                <h2>Inventaris/Collectie Overzicht</h2>
                                <p>Dit overzicht toont wat reeds aanwezig is in de collectie om dubbele aankopen te vermijden.</p>
                                <div class="inventory-link-section">`;

    let linksHtml = '';
    inventoryLinks.forEach(link => {
        linksHtml += `<div class="inventaris-link-item"><a href="${link.url}" target="_blank">🔗 ${link.naam}</a></div>`;
    });

    const endHtml = `</div></div>`;
    
    document.getElementById('person-lists-container').innerHTML += inventarisHtml + linksHtml + endHtml;
}


// Functie om de navigatieknoppen (tabs) te genereren
function generateTabNavigation(wishlistData) {
    const tabNav = document.getElementById('dynamic-tab-nav');
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')">Overzicht (Galerij)</button>`;
    
    wishlistData.personen.forEach(person => {
        const tabId = person.naam.toLowerCase() + '-list-content';
        
        // Bereken percentage gekocht voor de badge
        const totalItems = person.items.length;
        const purchasedCount = person.items.filter(item => item.isPurchased).length;
        const percentage = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;
        
        // Tekst is ingekort om overloop te voorkomen
        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')">
                        ${person.naam}
                        <span class="percentage-bought">${purchasedCount}/${totalItems} (${percentage}%)</span>
                    </button>`;
    });

    navHtml += `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris Links</button>`;
    
    tabNav.innerHTML = navHtml;
    
    // Zorg ervoor dat de eerste tab geopend is bij de start
    openTab(null, 'overview-content');
}


// Functie om de hoofdtitel en datum bij te werken
function updatePageTitle(wishlistData) {
    document.getElementById('main-title').innerHTML = `🎄🎁 ${wishlistData.wenslijst_titel} 🎁🎄`;
    document.getElementById('last-update-text').textContent = `Laatste update: ${wishlistData.datum}`;
}


// De hoofdgenerator functie
function generateWishlistContent(wishlistData, purchasedItemIds) {
    // Voeg de 'isPurchased' status toe aan de item objecten
    wishlistData.personen.forEach(person => {
        person.items.forEach(item => {
            item.isPurchased = purchasedItemIds.has(item.id);
        });
    });

    // Genereer HTML elementen in de juiste volgorde
    updatePageTitle(wishlistData);
    
    // We moeten eerst de lijsten genereren om de percentages correct te berekenen, 
    // daarna de navigatie, en als laatste het overzicht.
    generatePersonLists(wishlistData, purchasedItemIds);
    generateTabNavigation(wishlistData);
    generateOverviewGrid(wishlistData); 
    
    // Inventaris Links toevoegen indien aanwezig
    if (wishlistData.inventaris_links && wishlistData.inventaris_links.length > 0) {
        generateInventoryLinks(wishlistData.inventaris_links);
    }
}


// --- HOOFD LAAD LOGICA ---

// Foutafhandeling voor fetch
const handleErrors = (response) => {
    if (!response.ok) {
        throw Error(`${response.statusText} (${response.url})`);
    }
    return response;
}

// De hoofdfunctie die alle data laadt
function loadWishlist() {
    // 1. Laad de hoofdwenslijst data (wishlist_data.json)
    return fetch('wishlist_data.json')
    .then(handleErrors)
    .then(response => response.json())
    .then(mainData => {
        // Controleer of de JSON de minimale structuur heeft
        if (!mainData.personen || !mainData.wenslijst_titel) {
             throw new Error("wishlist_data.json is onjuist geformatteerd.");
        }
        
        // Definieer de bestanden die geladen moeten worden
        const personFiles = mainData.personen.map(p => p.data_file);
        const personNames = mainData.personen.map(p => p.naam);
        
        // claims.json is verplicht
        const claimsFetch = fetch('claims.json')
            .then(handleErrors)
            .then(response => response.json())
            .catch(() => ({ purchased_items: [] })); // Ga door als claims.json niet bestaat
        
        // 2. Wacht op claims.json
        return claimsFetch.then(claimsData => {
            const fileFetches = [];
            
            // Laad de individuele item lijsten van de personen
            personFiles.forEach((file) => {
                const personFetch = fetch(file)
                    .then(handleErrors)
                    .then(response => response.json())
                    .catch(error => {
                        console.error(`Fout bij het laden van ${file}:`, error);
                        // Bij een fout, retourneer een lege lijst, zodat de app niet crasht
                        return []; 
                    });
                fileFetches.push(personFetch);
            });

            // Laad de inventaris links (indien gespecificeerd)
            let inventoryFetch;
            if (mainData.inventaris_links_file) {
                inventoryFetch = fetch(mainData.inventaris_links_file)
                    .then(handleErrors)
                    .then(response => response.json())
                    .catch(error => {
                        console.warn(`Kon inventaris links niet laden (${mainData.inventaris_links_file}):`, error);
                        return [];
                    });
            } else {
                inventoryFetch = Promise.resolve([]);
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
                        items: items // Dit zijn de items die geladen zijn uit de data_file
                    })),
                    inventaris_links: inventoryLinks // Hier voegen we de geladen links toe
                };

                return [reconstructedWishlist, claimsData];
            });
        });
    })
    .then(([wishlistData, claimsData]) => {
        // 4. Genereer de content
        const purchasedItemIds = new Set(claimsData.purchased_items || []);
        
        // DYNAMISCHE TITEL INSTELLEN
        updateHtmlTitle(wishlistData); 
        
        generateWishlistContent(wishlistData, purchasedItemIds);
        
    })
    .catch(error => {
        // De kritieke foutafhandeling gebeurt reeds in stap 1.
        console.error("Onverwachte fout in laadproces:", error);
        document.getElementById('loading-message').textContent = `Fout bij het laden van de wensenlijst. Controleer de console voor details. (${error.message})`;
    });
}

// Start het laadproces wanneer de pagina geladen is
window.onload = loadWishlist;
