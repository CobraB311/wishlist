const recipientEmail = 'bernaertruben@hotmail.com';

// 1. Vonken generator
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

// 2. Claim functie
function claimItem(persoonNaam, itemName, itemId) {
    const subject = `CLAIM: ${itemName} voor ${persoonNaam}`;
    const body = `Ik heb dit cadeau gekocht: ${itemName} (ID: ${itemId})`;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// 3. Tab Logica - Reset kleuren bij elke klik
function openTab(evt, tabId) {
    // Verberg alle content
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    
    // Reset alle buttons (kleur en actieve status)
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("active");
        btn.style.backgroundColor = ""; // WIS DE VORIGE KLEUR
        btn.style.borderLeft = "";
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    
    let targetBtn = evt ? evt.currentTarget : document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
        const name = targetBtn.innerText.toLowerCase();
        
        // PAS KLEUR ALLEEN TOE OP DE ACTIEVE TAB
        if (name.includes('jonas')) {
            targetBtn.style.backgroundColor = "#b71c1c"; // Kai Rood
            targetBtn.style.borderLeft = "8px solid #d4af37";
        } else if (name.includes('milan')) {
            targetBtn.style.backgroundColor = "#1976d2"; // Jay Blauw
            targetBtn.style.borderLeft = "8px solid #d4af37";
        } else if (name.includes('gezamenlijk')) {
            targetBtn.style.backgroundColor = "#2e7d32"; // Lloyd Groen
            targetBtn.style.borderLeft = "8px solid #d4af37";
        }
    }
    window.scrollTo(0, 0);
}

// 4. Scroll functie
function scrollToItem(persoonNaam, itemId) {
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    openTab(null, tabId); 
    setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
}

// 5. Content Generatie
function generateWishlistContent(data, purchasedIds) {
    const container = document.getElementById('person-lists-container');
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
            const overlayHtml = isPurchased ? `<div class="purchased-overlay">GEKOCHT</div>` : '';
            
            listsHtml += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">
                            ${overlayHtml}
                            <img src="${item.afbeelding_url}">
                        </div>
                        <span class="item-price-under-image">${item.winkels?.[0]?.prijs || ''}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="winkel-links">
                            ${item.winkels.map(w => `<a href="${w.link}" target="_blank" style="display:inline-block; padding:8px; background:#d4af37; color:black; font-weight:bold; text-decoration:none; margin:5px;">${w.naam}</a>`).join('')}
                        </div>
                        ${!isPurchased ? `<button class="claim-button" onclick="claimItem('${person.naam}', '${item.naam}', '${item.id}')">Ik koop dit!</button>` : ''}
                    </div>
                </div>`;
            
            overviewHtml += `
                <div class="overview-grid-item" onclick="scrollToItem('${person.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">
                        ${overlayHtml}
                        <img src="${item.afbeelding_url}">
                    </div>
                    <div class="overview-caption"><strong>${item.naam}</strong><br><small>(${person.naam})</small></div>
                </div>`;
        });
        listsHtml += `</div></div>`;
    });

    nav.innerHTML = navHtml + `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    container.innerHTML = listsHtml;
    overview.innerHTML = overviewHtml;
}

async function loadWishlist() {
    createSparks();
    try {
        const rData = await fetch('wishlist_data.json').then(r => r.json());
        const rClaims = await fetch('claims.json').then(r => r.json()).catch(() => ({purchased_items:[]}));
        
        const personData = await Promise.all(rData.personen.map(async p => ({
            naam: p.naam,
            items: await fetch(p.data_file).then(r => r.json())
        })));

        const rGezam = await fetch(rData.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const rInv = await fetch(rData.inventaris_links_file).then(r => r.json()).catch(() => []);

        const fullData = { ...rData, personen: personData, gezamenlijke_items: { naam: "Gezamenlijk", items: rGezam }, inventaris_links: rInv };
        
        // TITEL ZONDER EMOJI OM RECHTHOEKEN TE VOORKOMEN
        document.getElementById('main-title').innerText = "Verjaardagslijstjes";
        document.getElementById('last-update-text').innerText = "Update: " + fullData.datum;
        
        generateWishlistContent(fullData, new Set(rClaims.purchased_items));

        const msg = document.getElementById('loading-message');
        if (msg) msg.style.display = 'none';

    } catch (e) { console.error(e); }
}

window.onload = loadWishlist;
