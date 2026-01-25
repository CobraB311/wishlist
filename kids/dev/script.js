const recipientEmail = 'bernaertruben@hotmail.com';

// 1. Vonken Generator
function createSparks() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const spark = document.createElement('div');
        spark.className = 'snow';
        spark.style.left = Math.random() * 100 + "%";
        spark.style.animationDelay = Math.random() * 10 + "s";
        container.appendChild(spark);
    }
}

// 2. Claim Functie
function claimItem(persoonNaam, itemName, itemId) {
    const subject = `BEVESTIGING: Cadeau Gekocht voor ${persoonNaam} - ${itemName}`;
    const body = `Beste wensenlijstbeheerder,\n\nIk heb het volgende cadeau gekocht van de wensenlijst:\n\nPersoon: ${persoonNaam}\nItem: ${itemName}\nID: ${itemId}\n\nBedankt!`;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// 3. Tab Navigatie
function openTab(evt, tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    
    let targetBtn = evt ? evt.currentTarget : document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
        
        // Elementaire Kleuren
        const name = targetBtn.innerText.toLowerCase();
        if (name.includes('jonas')) targetBtn.style.backgroundColor = "#b71c1c"; // Kai
        else if (name.includes('milan')) targetBtn.style.backgroundColor = "#1976d2"; // Jay
        else if (name.includes('gezamenlijk')) targetBtn.style.backgroundColor = "#2e7d32"; // Lloyd
    }
    window.scrollTo(0, 0);
}

function scrollToItem(persoonNaam, itemId) {
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    openTab(null, tabId); 
    setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
}

// 4. Bouw de Content
function generateWishlistContent(data, purchasedIds) {
    const container = document.getElementById('person-lists-container');
    const nav = document.getElementById('dynamic-tab-nav');
    const overview = document.getElementById('overview-grid-container');
    
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')">Overzicht</button>`;
    let listsHtml = '';
    let overviewHtml = '';

    const allGroups = [...data.personen];
    if (data.gezamenlijke_items) allGroups.push(data.gezamenlijke_items);

    allGroups.forEach(person => {
        const tabId = person.naam.toLowerCase() + '-list-content';
        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')">${person.naam}</button>`;

        listsHtml += `<div id="${tabId}" class="tab-content"><h2>Wensenlijst van ${person.naam}</h2><div class="wens-lijst">`;
        
        person.items.forEach(item => {
            const isPurchased = purchasedIds.has(item.id);
            const prijs = item.winkels?.[0]?.prijs || 'Onbekend';
            
            listsHtml += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">
                            ${isPurchased ? '<span class="purchased-overlay">GEKOCHT</span>' : ''}
                            <img src="${item.afbeelding_url}">
                        </div>
                        <span class="item-price-under-image">${prijs}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="winkel-links">
                            ${item.winkels.map(w => `<a href="${w.link}" target="_blank" class="winkel-link-button">${w.naam}</a>`).join('')}
                        </div>
                        ${!isPurchased ? `<button class="claim-button" onclick="claimItem('${person.naam}', '${item.naam}', '${item.id}')">Ik koop dit!</button>` : '<p>🎁 Reeds gekocht!</p>'}
                    </div>
                </div>`;
            
            overviewHtml += `
                <div class="overview-grid-item" onclick="scrollToItem('${person.naam}', '${item.id}')">
                    <img src="${item.afbeelding_url}"><br>${item.naam}
                </div>`;
        });
        listsHtml += `</div></div>`;
    });

    nav.innerHTML = navHtml + `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    container.innerHTML = listsHtml;
    overview.innerHTML = overviewHtml;
}

// 5. De Hoofdfunctie
async function loadWishlist() {
    createSparks();
    try {
        const rData = await fetch('wishlist_data.json').then(r => r.json());
        const rClaims = await fetch('claims.json').then(r => r.json()).catch(() => ({purchased_items:[]}));
        const purchasedIds = new Set(rClaims.purchased_items);

        const personData = await Promise.all(rData.personen.map(async p => ({
            naam: p.naam,
            items: await fetch(p.data_file).then(r => r.json())
        })));

        const rGezam = await fetch(rData.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const rInv = await fetch(rData.inventaris_links_file).then(r => r.json()).catch(() => []);

        const fullData = { 
            ...rData, 
            personen: personData, 
            gezamenlijke_items: { naam: "Gezamenlijk", items: rGezam },
            inventaris_links: rInv
        };

        document.getElementById('main-title').innerText = fullData.wenslijst_titel;
        generateWishlistContent(fullData, purchasedIds);
        
        // Inventaris
        const invHtml = `<div id="inventory-content" class="tab-content"><h2>Inventaris</h2><div class="inventory-links">${fullData.inventaris_links.map(l => `<div><a href="${l.url}" target="_blank" style="color:#d4af37">📜 ${l.naam}</a></div>`).join('')}</div></div>`;
        document.getElementById('person-lists-container').innerHTML += invHtml;

        document.getElementById('loading-message').style.display = 'none';
    } catch (e) { console.error(e); }
}

window.onload = loadWishlist;
