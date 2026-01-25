const recipientEmail = 'bernaertruben@hotmail.com';

// 1. Vonken generator
function createSparks() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const spark = document.createElement('div');
        spark.className = 'snow';
        spark.style.left = Math.random() * 100 + "%";
        spark.style.animationDelay = Math.random() * 8 + "s";
        container.appendChild(spark);
    }
}

// 2. Tab Logica
function openTab(evt, tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    
    let targetBtn = evt ? evt.currentTarget : document.querySelector(`.tab-button[onclick*="${tabId}"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
        const name = targetBtn.innerText.toLowerCase();
        // Elementaire kleuren
        if (name.includes('jonas')) targetBtn.style.borderLeft = "8px solid #b71c1c";
        else if (name.includes('milan')) targetBtn.style.borderLeft = "8px solid #1976d2";
        else if (name.includes('gezamenlijk')) targetBtn.style.borderLeft = "8px solid #2e7d32";
    }
}

// 3. Scroll functie
function scrollToItem(persoonNaam, itemId) {
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    openTab(null, tabId); 
    setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
}

// 4. Content Generatie
function generateWishlistContent(data, purchasedIds) {
    const listContainer = document.getElementById('person-lists-container');
    const nav = document.getElementById('dynamic-tab-nav');
    const overview = document.getElementById('overview-grid-container');
    
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')">Overzicht</button>`;
    let listsHtml = '';
    let overviewHtml = '';

    const groups = [...data.personen];
    if (data.gezamenlijke_items) groups.push(data.gezamenlijke_items);

    groups.forEach(person => {
        const tabId = person.naam.toLowerCase() + '-list-content';
        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')">${person.naam}</button>`;
        
        listsHtml += `<div id="${tabId}" class="tab-content"><h2>${person.naam}</h2><div class="wens-lijst">`;
        person.items.forEach(item => {
            const isPurchased = purchasedIds.has(item.id);
            listsHtml += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''}">
                    <div class="left-column">
                        <div class="item-image-container"><img src="${item.afbeelding_url}"></div>
                        <span class="item-price-under-image">${item.winkels?.[0]?.prijs || ''}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="winkel-links">
                            ${item.winkels.map(w => `<a href="${w.link}" target="_blank" class="winkel-link-button">${w.naam}</a>`).join('')}
                        </div>
                    </div>
                </div>`;
            overviewHtml += `<div class="overview-grid-item" onclick="scrollToItem('${person.naam}', '${item.id}')"><img src="${item.afbeelding_url}" style="width:100px"><br>${item.naam}</div>`;
        });
        listsHtml += `</div></div>`;
    });

    nav.innerHTML = navHtml + `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    listContainer.innerHTML = listsHtml;
    overview.innerHTML = overviewHtml;
}

// 5. Hoofdfunctie (FIX LIJN 107 HIER)
async function loadWishlist() {
    createSparks();
    try {
        const config = await fetch('wishlist_data.json').then(r => r.json());
        const claims = await fetch('claims.json').then(r => r.json()).catch(() => ({purchased_items:[]}));
        
        const personData = await Promise.all(config.personen.map(async p => ({
            naam: p.naam,
            items: await fetch(p.data_file).then(r => r.json())
        })));

        const gezamenlijk = await fetch(config.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const inventory = await fetch(config.inventaris_links_file).then(r => r.json()).catch(() => []);

        const data = { ...config, personen: personData, gezamenlijke_items: { naam: "Gezamenlijk", items: gezamenlijk }, inventaris_links: inventory };
        generateWishlistContent(data, new Set(claims.purchased_items));
        
        // Fix voor lijn 107: Check of element bestaat voor het aanpassen
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
        }

    } catch (e) {
        console.error("Fout bij laden:", e);
    }
}

window.onload = loadWishlist;
