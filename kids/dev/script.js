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

function openTab(evt, tabId) {
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove("active");
    }

    const buttons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
        buttons[i].style.backgroundColor = "";
        buttons[i].style.color = "";
    }

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add("active");
    }

    let targetBtn = evt ? evt.currentTarget : document.querySelector(`button[onclick*="${tabId}"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
        const name = targetBtn.innerText.toLowerCase();
        
        targetBtn.style.color = "#fff";
        if (name.includes('jonas')) targetBtn.style.backgroundColor = "#b71c1c";
        else if (name.includes('milan')) targetBtn.style.backgroundColor = "#1976d2";
        else if (name.includes('gezamenlijk')) targetBtn.style.backgroundColor = "#2e7d32";
        else targetBtn.style.backgroundColor = "#333";
    }
    window.scrollTo(0, 0);
}

function scrollToItem(persoonNaam, itemId) {
    const tabId = persoonNaam.toLowerCase() + '-list-content';
    openTab(null, tabId); 
    setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function generateWishlistContent(data, purchasedIds) {
    const listContainer = document.getElementById('person-lists-container');
    const nav = document.getElementById('dynamic-tab-nav');
    const overview = document.getElementById('overview-grid-container');
    
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')" style="background-color: #333; color: #fff;">Overzicht</button>`;
    let listsHtml = '';
    let overviewHtml = '';

    const groups = [...data.personen];
    if (data.gezamenlijke_items) groups.push(data.gezamenlijke_items);

    groups.forEach(person => {
        const tabId = person.naam.toLowerCase() + '-list-content';
        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')">${person.naam}</button>`;
        
        listsHtml += `<div id="${tabId}" class="tab-content"><h2>Wensen van ${person.naam}</h2><div class="wens-lijst">`;
        overviewHtml += `<div class="overview-person-section"><h3>Lijst van ${person.naam}</h3><div class="overview-grid">`;

        person.items.forEach(item => {
            const isPurchased = purchasedIds.has(item.id);
            const overlay = isPurchased ? `<div class="purchased-overlay">GEKOCHT</div>` : '';
            
            listsHtml += `
                <div id="${item.id}" class="wens-item ${isPurchased ? 'purchased' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">${overlay}<img src="${item.afbeelding_url}"></div>
                        <span style="display:block; margin-top:5px; color:#b71c1c; font-weight:bold;">${item.winkels?.[0]?.prijs || ''}</span>
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="winkel-links">
                            ${item.winkels.map(w => `<a href="${w.link}" target="_blank" style="display:inline-block; padding:8px 12px; background:#d4af37; color:black; font-weight:bold; text-decoration:none; margin:5px; border-radius:3px;">${w.naam}</a>`).join('')}
                        </div>
                        ${!isPurchased ? `<button style="background:#b71c1c; color:white; border:none; padding:10px; cursor:pointer;" onclick="window.location.href='mailto:${recipientEmail}'">Ik koop dit!</button>` : ''}
                    </div>
                </div>`;
            
            overviewHtml += `
                <div class="overview-grid-item ${isPurchased ? 'purchased' : ''}" onclick="scrollToItem('${person.naam}', '${item.id}')">
                    <div class="overview-image-wrapper">${overlay}<img src="${item.afbeelding_url}"></div>
                    <div class="overview-caption">${item.naam}</div>
                </div>`;
        });
        listsHtml += `</div></div>`;
        overviewHtml += `</div></div>`;
    });

    nav.innerHTML = navHtml + `<button class="tab-button" onclick="openTab(event, 'inventory-content')">Inventaris</button>`;
    overview.innerHTML = overviewHtml;
    
    const invHtml = `<div id="inventory-content" class="tab-content"><h2>Inventaris</h2><div class="inventory-section">${data.inventaris_links.map(l => `<div style="margin:15px 0;"><a href="${l.url}" target="_blank" style="color:#b71c1c; font-weight:bold; text-decoration:none;">📜 ${l.naam}</a></div>`).join('')}</div></div>`;
    listContainer.innerHTML = listsHtml + invHtml;
}

async function loadWishlist() {
    createSparks();
    try {
        const config = await fetch('wishlist_data.json').then(r => r.json());
        const claims = await fetch('claims.json').then(r => r.json()).catch(() => ({purchased_items:[]}));
        const pData = await Promise.all(config.personen.map(async p => ({ naam: p.naam, items: await fetch(p.data_file).then(r => r.json()) })));
        const rGezam = await fetch(config.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const rInv = await fetch(config.inventaris_links_file).then(r => r.json()).catch(() => []);

        const fullData = { ...config, personen: pData, gezamenlijke_items: { naam: "Gezamenlijk", items: rGezam }, inventaris_links: rInv };
        generateWishlistContent(fullData, new Set(claims.purchased_items));
        
        document.getElementById('loading-message').style.display = 'none';
    } catch (e) { console.error(e); }
}

window.onload = loadWishlist;
