const recipientEmail = 'bernaertruben@hotmail.com';

function createSparks() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const spark = document.createElement('div');
        spark.className = 'snow';
        spark.style.left = Math.random() * 100 + "%";
        spark.style.animationDuration = (Math.random() * 4 + 4) + "s";
        spark.style.animationDelay = Math.random() * 5 + "s";
        container.appendChild(spark);
    }
}

function getLowestPriceInfo(winkels) {
    if (!winkels || winkels.length === 0) return { prijs: "N.v.t.", index: -1 };
    let lowestVal = Infinity;
    let lowestIndex = 0;
    winkels.forEach((w, index) => {
        const numericValue = parseFloat(w.prijs.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (!isNaN(numericValue) && numericValue < lowestVal) {
            lowestVal = numericValue;
            lowestIndex = index;
        }
    });
    return {
        prijs: lowestVal === Infinity ? winkels[0].prijs : `€ ${lowestVal.toFixed(2).replace('.', ',')}`,
        index: lowestIndex
    };
}

function claimItem(persoonNaam, itemName, itemId) {
    const subject = `CLAIM: ${itemName} voor ${persoonNaam}`;
    const body = `Ik heb dit cadeau gekocht: ${itemName} (ID: ${itemId})`;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function scrollToItem(persoonNaam, itemId) {
    const tabId = personIdToTabId(persoonNaam);
    openTab(null, tabId);
    setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function personIdToTabId(naam) {
    const n = naam.toLowerCase();
    if (n === 'gezamenlijk') return 'gezamenlijk-list-content';
    return n + '-list-content';
}

function openTab(evt, tabId) {
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) contents[i].classList.remove("active");

    const buttons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
        buttons[i].style.backgroundColor = "";
    }

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");

    let targetBtn = evt ? evt.currentTarget : document.querySelector(`button[onclick*="'${tabId}'"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
        if (tabId.includes('jonas')) targetBtn.style.backgroundColor = "#b71c1c";
        else if (tabId.includes('milan')) targetBtn.style.backgroundColor = "#1976d2";
        else if (tabId.includes('gezamenlijk')) targetBtn.style.backgroundColor = "#2e7d32";
        else targetBtn.style.backgroundColor = "#333";
    }
    window.scrollTo(0, 0);
}

function generateWishlistContent(data, purchasedIds, favoriteIds) {
    const nav = document.getElementById('dynamic-tab-nav');
    const listContainer = document.getElementById('person-lists-container');
    const overview = document.getElementById('overview-grid-container');

    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')" style="background-color: #333;">Overzicht</button>`;
    let listsHtml = '';
    let overviewHtml = '';

    const groups = [...data.personen];
    if (data.gezamenlijke_items) groups.push(data.gezamenlijke_items);

    groups.forEach(person => {
        const tabId = personIdToTabId(person.naam);
        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')">${person.naam}</button>`;

        listsHtml += `<div id="${tabId}" class="tab-content"><h2>Wensen van ${person.naam}</h2>`;
        overviewHtml += `<h3>${person.naam}</h3><div class="overview-grid">`;

        const sortedItems = [...person.items].sort((a, b) => (favoriteIds.has(b.id) ? 1 : 0) - (favoriteIds.has(a.id) ? 1 : 0));

        sortedItems.forEach(item => {
            const isPurchased = purchasedIds.has(item.id);
            const isFavorite = favoriteIds.has(item.id);
            const lowest = getLowestPriceInfo(item.winkels);
            const overlay = isPurchased ? `<div class="purchased-overlay">GEKOCHT</div>` : '';

            // Detail Lijst
            listsHtml += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''} ${isFavorite ? 'favorite-item' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">${overlay}<img src="${item.afbeelding_url}" alt="${item.naam}"></div>
                        ${isFavorite ? '<div class="favorite-badge">★ FAVORIET</div>' : ''}
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="price-links">
                            ${item.winkels.map((w, idx) => `
                                <a href="${w.link}" target="_blank" class="price-link ${idx === lowest.index ? 'lowest' : ''}">
                                    ${w.naam}: ${w.prijs}
                                </a>
                            `).join('')}
                        </div>
                        ${!isPurchased ? `<button class="buy-button" onclick="claimItem('${person.naam}', '${item.naam.replace(/'/g, "\\'")}', '${item.id}')">Ik koop dit!</button>` : ''}
                    </div>
                </div>`;

            // Compact Overzicht
            overviewHtml += `
                <div class="overview-grid-item ${isPurchased ? 'purchased' : ''} ${isFavorite ? 'favorite-item' : ''}" onclick="scrollToItem('${person.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">${overlay}<img src="${item.afbeelding_url}" alt="${item.naam}"></div>
                    ${isFavorite ? '<div class="mini-star">★</div>' : ''}
                    <div class="overview-caption">${item.naam}</div>
                    <div style="font-size:0.85em; color:#b71c1c; font-weight:bold;">Vanaf ${lowest.prijs}</div>
                </div>`;
        });
        listsHtml += `</div>`;
        overviewHtml += `</div>`;
    });

    nav.innerHTML = navHtml + `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    overview.innerHTML = overviewHtml;

    const invHtml = `<div id="inventory-content" class="tab-content"><h2>Inventaris</h2><div id="inventory-list"></div></div>`;
    listContainer.innerHTML = listsHtml + invHtml;

    if (data.inventaris_links) {
        document.getElementById('inventory-list').innerHTML = data.inventaris_links.map(l =>
            `<div style="margin:15px 0;"><a href="${l.url}" target="_blank" style="color:#b71c1c; font-weight:bold; text-decoration:none;">📜 ${l.naam}</a></div>`
        ).join('');
    }
}

async function loadWishlist() {
    createSparks();
    try {
        const config = await fetch('wishlist_data.json').then(r => r.json());
        const claims = await fetch('claims.json').then(r => r.json()).catch(() => ({purchased_items:[]}));
        const favorites = await fetch('favorites.json').then(r => r.json()).catch(() => ({favorite_ids:[]}));

        const pData = await Promise.all(config.personen.map(async p => ({
            naam: p.naam,
            items: await fetch(p.data_file).then(r => r.json())
        })));

        const rGezam = await fetch(config.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const rInv = await fetch(config.inventaris_links_file).then(r => r.json()).catch(() => []);

        generateWishlistContent(
            {...config, personen: pData, gezamenlijke_items: {naam: "Gezamenlijk", items: rGezam}, inventaris_links: rInv},
            new Set(claims.purchased_items),
            new Set(favorites.favorite_ids)
        );

        const loader = document.getElementById('loading-message');
        if (loader) loader.style.display = 'none';
    } catch (e) {
        console.error("Fout bij laden:", e);
    }
}

window.onload = loadWishlist;