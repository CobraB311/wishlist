const recipientEmail = 'bernaertruben@hotmail.com';

// 1. Vonken generator
function createSparks() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const spark = document.createElement('div');
        spark.className = 'snow';
        container.appendChild(spark);
    }
}

// 2. Claim functie
function claimItem(persoonNaam, itemName, itemId) {
    const subject = `BEVESTIGING: Cadeau Gekocht voor ${persoonNaam} - ${itemName}`;
    const body = `Beste wensenlijstbeheerder,\n\nIk heb het volgende cadeau gekocht:\n\nPersoon: ${persoonNaam}\nItem: ${itemName}\nID: ${itemId}`;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// 3. Tab Logica
function openTab(evt, tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    
    let targetBtn = evt ? evt.currentTarget : document.querySelector(`.tab-button[onclick*="${tabId}"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
        const name = targetBtn.innerText.toLowerCase();
        // Ninja kleur accenten op de actieve tab
        if (name.includes('jonas')) targetBtn.style.borderLeft = "8px solid #b71c1c";
        else if (name.includes('milan')) targetBtn.style.borderLeft = "8px solid #1976d2";
        else if (name.includes('gezamenlijk')) targetBtn.style.borderLeft = "8px solid #2e7d32";
    }
    window.scrollTo(0, 0);
}

function scrollToItem(persoonNaam, itemId) {
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    openTab(null, tabId); 
    setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) {
            document.querySelectorAll('.wens-item').forEach(i => i.classList.remove('highlight'));
            el.classList.add('highlight');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 200);
}

// 4. Content Bouwer
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
        const bought = person.items.filter(i => purchasedIds.has(i.id)).length;
        
        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')">${person.naam} <span class="percentage-bought">${bought}/${person.items.length}</span></button>`;

        listsHtml += `<div id="${tabId}" class="tab-content"><h2>Wensenlijst van ${person.naam}</h2><div class="wens-lijst">`;
        
        person.items.forEach(item => {
            const isPurchased = purchasedIds.has(item.id);
            const prijs = item.winkels?.[0]?.prijs || 'Onbekend';
            
            listsHtml += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">
                            ${isPurchased ? '<span class="purchased-overlay">GEKOCHT</span>' : ''}
                            <img src="${item.afbeelding_url}" alt="${item.naam}">
                        </div>
                        <span class="item-price-under-image">${prijs}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p class="item-description">${item.beschrijving}</p>
                        <div class="winkel-links">
                            ${item.winkels.map(w => `<a href="${w.link}" target="_blank" class="winkel-link-button">${w.naam}</a>`).join('')}
                        </div>
                        <p class="item-nummer">ID: ${item.nummer}</p>
                        <div class="item-action-area">
                            ${isPurchased ? '<span class="purchased-note">🎁 Reeds in bezit van de Ninja\'s!</span>' : `<button class="claim-button" onclick="claimItem('${person.naam}', '${item.naam}', '${item.id}')">Claimen</button>`}
                        </div>
                    </div>
                </div>`;
            
            overviewHtml += `
                <div class="overview-grid-item ${isPurchased ? 'purchased' : ''}" onclick="scrollToItem('${person.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">
                        ${isPurchased ? '<span class="purchased-overlay">GEKOCHT</span>' : ''}
                        <img src="${item.afbeelding_url}" alt="${item.naam}">
                    </div>
                    <div class="overview-caption">${item.naam} <br><small>(${person.naam})</small></div>
                </div>`;
        });
        listsHtml += `</div></div>`;
    });

    nav.innerHTML = navHtml + `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    container.innerHTML = listsHtml;
    overview.innerHTML = overviewHtml;

    // Inventaris toevoegen
    const invHtml = `<div id="inventory-content" class="tab-content"><h2>Inventaris</h2><div class="inventory-link-section">${data.inventaris_links.map(l => `<div class="inventaris-link-item"><a href="${l.url}" target="_blank">📜 ${l.naam}</a></div>`).join('')}</div></div>`;
    container.innerHTML += invHtml;
}

// 5. De Hoofdfunctie
async function loadWishlist() {
    createSparks();
    try {
        const rData = await fetch('wishlist_data.json').then(r => r.json());
        const rClaims = await fetch('claims.json').then(r => r.json()).catch(() => ({purchased_items:[]}));
        const rInv = await fetch(rData.inventaris_links_file).then(r => r.json()).catch(() => []);
        const rGezam = await fetch(rData.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        
        const purchasedIds = new Set(rClaims.purchased_items);
        const personData = await Promise.all(rData.personen.map(async p => ({
            naam: p.naam,
            items: await fetch(p.data_file).then(r => r.json())
        })));

        const fullData = {
            ...rData,
            personen: personData,
            gezamenlijke_items: { naam: "Gezamenlijk", items: rGezam },
            inventaris_links: rInv
        };

        document.getElementById('main-title').innerText = fullData.wenslijst_titel;
        document.getElementById('last-update-text').innerText = `Laatste update: ${fullData.datum}`;
        
        generateWishlistContent(fullData, purchasedIds);
        
    } catch (e) {
        console.error("Fout bij laden:", e);
        document.getElementById('loading-message').innerText = "Fout bij het betreden van de Dojo!";
    }
}

window.onload = loadWishlist;
