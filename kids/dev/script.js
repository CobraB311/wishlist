const recipientEmail = 'bernaertruben@hotmail.com';

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

function claimItem(persoonNaam, itemName, itemId) {
    const subject = `CLAIM: ${itemName} voor ${persoonNaam}`;
    const body = `Ik heb dit cadeau gekocht: ${itemName} (ID: ${itemId})`;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function openTab(evt, tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("active");
        btn.style.backgroundColor = "";
        btn.style.borderLeft = "";
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    
    let targetBtn = evt ? evt.currentTarget : document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
        const name = targetBtn.innerText.toLowerCase();
        if (name.includes('jonas')) {
            targetBtn.style.backgroundColor = "#b71c1c";
            targetBtn.style.borderLeft = "8px solid #d4af37";
        } else if (name.includes('milan')) {
            targetBtn.style.backgroundColor = "#1976d2";
            targetBtn.style.borderLeft = "8px solid #d4af37";
        } else if (name.includes('gezamenlijk')) {
            targetBtn.style.backgroundColor = "#2e7d32";
            targetBtn.style.borderLeft = "8px solid #d4af37";
        }
    }
    window.scrollTo(0, 0);
}

function scrollToItem(persoonNaam, itemId) {
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    openTab(null, tabId); 
    setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
}

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
        
        listsHtml += `<div id="${tabId}" class="tab-content"><h2>Wensen van ${person.naam}</h2><div class="wens-lijst">`;
        person.items.forEach(item => {
            const isPurchased = purchasedIds.has(item.id);
            const overlay = isPurchased ? `<div class="purchased-overlay">GEKOCHT</div>` : '';
            
            listsHtml += `
                <div id="${item.id}" class="wens-item">
                    <div class="left-column">
                        <div class="item-image-container">${overlay}<img src="${item.afbeelding_url}"></div>
                        <span style="display:block; text-align:center; margin-top:5px; color:#d4af37; font-weight:bold;">${item.winkels?.[0]?.prijs || ''}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="winkel-links">
                            ${item.winkels.map(w => `<a href="${w.link}" target="_blank" style="display:inline-block; padding:8px 15px; background:#d4af37; color:black; font-weight:bold; text-decoration:none; margin:5px; border-radius:3px;">${w.naam}</a>`).join('')}
                        </div>
                        ${!isPurchased ? `<button class="claim-button" onclick="claimItem('${person.naam}', '${item.naam}', '${item.id}')">Ik koop dit!</button>` : ''}
                    </div>
                </div>`;
            
            overviewHtml += `
                <div class="overview-grid-item" onclick="scrollToItem('${person.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">${overlay}<img src="${item.afbeelding_url}"></div>
                    <div class="overview-caption"><strong>${item.naam}</strong></div>
                </div>`;
        });
        listsHtml += `</div></div>`;
    });

    // VOEG INVENTARIS TOE AAN DE NAVIGATIE
    navHtml += `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    
    // MAAK DE INVENTARIS CONTENT
    const invHtml = `
        <div id="inventory-content" class="tab-content">
            <h2>Inventaris</h2>
            <div class="inventory-section">
                ${data.inventaris_links.map(l => `
                    <div class="inventory-link-item">
                        <a href="${l.url}" target="_blank">📜 ${l.naam}</a>
                    </div>
                `).join('')}
            </div>
        </div>`;

    nav.innerHTML = navHtml;
    container.innerHTML = listsHtml + invHtml;
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
        
        document.getElementById('main-title').innerText = "Verjaardagslijstjes";
        document.getElementById('last-update-text').innerText = "Laatste update: " + fullData.datum;
        
        generateWishlistContent(fullData, new Set(rClaims.purchased_items));
        document.getElementById('loading-message').style.display = 'none';
    } catch (e) { console.error(e); }
}

window.onload = loadWishlist;
