const recipientEmail = 'bernaertruben@hotmail.com';
let hidePurchased = false;

const zumaQuotes = [
    "Laten we een duik nemen!",
    "Klaar voor actie in de golven!",
    "1, 2, Zuma komt eraan!",
    "Deze pup houdt van water!",
    "Geen klus te groot, geen pup te klein!",
    "Zuma staat paraat!",
    "Tijd voor een redding op zee!",
    "Klaar voor een natte missie!"
];

function setPupGreeting() {
    const greetingEl = document.getElementById('pup-greeting');
    if (!greetingEl) return;

    // Willekeurige quote kiezen
    const randomQuote = zumaQuotes[Math.floor(Math.random() * zumaQuotes.length)];

    const hour = new Date().getHours();
    let timeGreeting = (hour >= 6 && hour < 12) ? "Goedemorgen!" : (hour >= 12 && hour < 18) ? "Goedemiddag!" : (hour >= 18 && hour < 23) ? "Goedenavond." : "Goedenacht.";

    // Algemene welkomsttekst voor de familie
    greetingEl.innerText = `${timeGreeting} Welkom bij de missie. ${randomQuote}`;
}

function createBubbles() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'snow';
        bubble.style.left = Math.random() * 100 + "%";
        const size = (Math.random() * 12 + 8) + "px";
        bubble.style.width = size; bubble.style.height = size;
        bubble.style.animationDuration = (Math.random() * 4 + 4) + "s";
        bubble.style.animationDelay = (Math.random() * 5) + "s";
        container.appendChild(bubble);
    }
}

function startCountdown(targetDateStr, targetName) {
    const container = document.getElementById("countdown-container");
    const timerEl = document.getElementById("countdown-timer");
    if (!targetDateStr || !container) return;
    container.style.display = "block";
    const targetDate = new Date(targetDateStr).getTime();
    const updateTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance < 0) {
            clearInterval(updateTimer);
            timerEl.innerHTML = `🎉 GELUKKIGE VERJAARDAG ${targetName.toUpperCase()}! 🎉`;
        } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timerEl.innerHTML = `${days}d ${hours}u ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

function openVideo(videoId) {
    const modal = document.getElementById('videoModal'), frame = document.getElementById('videoFrame');
    frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.style.display = "block";
}
function closeVideo() {
    const modal = document.getElementById('videoModal'), frame = document.getElementById('videoFrame');
    frame.src = ""; modal.style.display = "none";
}
window.onclick = function(e) { if (e.target == document.getElementById('videoModal')) closeVideo(); }

function normalizeText(text) { return text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function filterGifts() {
    const input = normalizeText(document.getElementById('gift-search').value);
    document.querySelectorAll('.overview-grid-item, .wens-item').forEach(card => {
        const title = normalizeText(card.querySelector('h3, .overview-caption')?.innerText || "");
        const matchesSearch = title.includes(input);
        const matchesFilter = !hidePurchased || !card.classList.contains('purchased');
        card.style.display = (matchesSearch && matchesFilter) ? "" : "none";
    });
}

function togglePurchasedFilter() {
    hidePurchased = !hidePurchased;
    const btn = document.getElementById('filter-purchased-btn');
    btn.innerHTML = hidePurchased ? '<span class="icon">🙈</span> Verberg' : '<span class="icon">👁️</span> Toon alles';
    btn.classList.toggle('active', hidePurchased);
    filterGifts();
}

function getLowestPriceInfo(winkels) {
    if (!winkels || winkels.length === 0) return { prijs: "N.v.t.", index: -1 };
    let lowestVal = Infinity, lowestIndex = 0;
    winkels.forEach((w, i) => {
        const val = parseFloat(w.prijs.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (val < lowestVal) { lowestVal = val; lowestIndex = i; }
    });
    return { prijs: `€ ${lowestVal.toFixed(2).replace('.', ',')}`, index: lowestIndex };
}

function personIdToTabId(naam) { return (naam.toLowerCase() === 'gezamenlijk' ? 'gezamenlijk' : naam.toLowerCase()) + '-list-content'; }

function openTab(evt, tabId) {
    // Wissel van quote bij elke tab-klik voor variatie
    setPupGreeting();

    if (document.getElementById('gift-search')) { document.getElementById('gift-search').value = ""; filterGifts(); }
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(b => {
        b.classList.remove("active");
        b.style.backgroundColor = "";
    });
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    let btn = evt ? evt.currentTarget : document.querySelector(`button[onclick*="'${tabId}'"]`);
    if (btn) {
        btn.classList.add("active");
        btn.style.backgroundColor = "#ff6600";
    }
    window.scrollTo(0, 0);
}

function generateWishlistContent(data, purchasedIds, favoriteIds) {
    const nav = document.getElementById('dynamic-tab-nav'), listContainer = document.getElementById('person-lists-container'), overview = document.getElementById('overview-grid-container');
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')" style="background-color: #333;"><span class="tab-info">Overzicht</span></button>`;
    let listsHtml = '', overviewHtml = '';

    const sortedPeople = [...data.personen].sort((a, b) => a.naam.toLowerCase() === 'milan' ? -1 : 1);
    const groups = [...sortedPeople];
    if (data.gezamenlijke_items) groups.push(data.gezamenlijke_items);

    groups.forEach(person => {
        const tabId = personIdToTabId(person.naam);
        const total = person.items.length, bought = person.items.filter(i => purchasedIds.has(i.id)).length, perc = total > 0 ? Math.round((bought / total) * 100) : 0;

        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')"><span class="tab-info">${person.naam}</span><span class="tab-stats">${bought}/${total} gekocht</span><div class="katana-progress"><div class="katana-blade" style="width: ${perc}%"></div></div></button>`;
        listsHtml += `<div id="${tabId}" class="tab-content"><h2>Wensen van ${person.naam}</h2>`;
        overviewHtml += `<h3>${person.naam}</h3><div class="overview-grid">`;

        person.items.sort((a,b) => (favoriteIds.has(b.id)?1:0) - (favoriteIds.has(a.id)?1:0)).forEach(item => {
            const isP = purchasedIds.has(item.id), isF = favoriteIds.has(item.id), low = getLowestPriceInfo(item.winkels), overlay = isP ? `<div class="purchased-overlay">GEKOCHT</div>` : '';

            listsHtml += `
                <div id="${item.id}" class="wens-item ${isP ? 'purchased' : ''} ${isF ? 'favorite-item' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">${overlay}<img src="${item.afbeelding_url}"></div>
                        ${isF ? '<div class="favorite-badge">★ FAVORIET</div>' : ''}
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3><p>${item.beschrijving}</p>
                        <div class="price-links">
                            ${item.winkels.map((w, idx) => `<a href="${w.link}" target="_blank" class="price-link ${idx === low.index ? 'lowest' : ''}">${w.naam}: ${w.prijs}</a>`).join('')}
                        </div>
                        <div class="button-row">
                            ${!isP ? `<button class="buy-button" onclick="claimItem('${person.naam}', '${item.naam.replace(/'/g, "\\'")}', '${item.id}')">Ik koop dit!</button>` : ''}
                            ${item.video_id ? `<button class="video-button" onclick="openVideo('${item.video_id}')">🎬 Video</button>` : ''}
                        </div>
                    </div>
                </div>`;

            overviewHtml += `<div class="overview-grid-item ${isP ? 'purchased' : ''} ${isF ? 'favorite-item' : ''}" onclick="scrollToItem('${person.naam}', '${item.id}')"><div class="overview-image-wrapper">${overlay}<img src="${item.afbeelding_url}"></div><div class="overview-caption">${item.naam}</div><div style="font-size:0.85em; color:#ff6600; font-weight:bold;">Vanaf ${low.prijs}</div></div>`;
        });
        listsHtml += `</div>`; overviewHtml += `</div>`;
    });
    nav.innerHTML = navHtml + `<button class="tab-button" onclick="openTab(event, 'inventory-content')"><span class="tab-info">Inventaris</span></button>`;
    overview.innerHTML = overviewHtml;
    listContainer.innerHTML = listsHtml + `<div id="inventory-content" class="tab-content"><h2>Inventaris</h2><div id="inventory-list"></div></div>`;
    if (data.inventaris_links) document.getElementById('inventory-list').innerHTML = data.inventaris_links.map(l => `<div style="margin:15px 0;"><a href="${l.url}" target="_blank" style="color:#ff6600; font-weight:bold; text-decoration:none;">📜 ${l.naam}</a></div>`).join('');
}

function claimItem(p, i, id) { window.location.href = `mailto:${recipientEmail}?subject=CLAIM: ${i} voor ${p}&body=Ik heb dit gekocht: ${i} (ID: ${id})`; }
function scrollToItem(p, id) { openTab(null, personIdToTabId(p)); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }

async function loadWishlist() {
    setPupGreeting(); createBubbles();
    try {
        const config = await fetch('wishlist_data.json').then(r => r.json());
        if (config.aftel_datum) startCountdown(config.aftel_datum, config.aftel_naam || "Milan");
        const claims = await fetch('claims.json').then(r => r.json()).catch(() => ({purchased_items:[]}));
        const favs = await fetch('favorites.json').then(r => r.json()).catch(() => ({favorite_ids:[]}));
        const pData = await Promise.all(config.personen.map(async p => ({ naam: p.naam, items: await fetch(p.data_file).then(r => r.json()) })));
        const rGez = await fetch(config.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const rInv = await fetch(config.inventaris_links_file).then(r => r.json()).catch(() => []);
        generateWishlistContent({...config, personen: pData, gezamenlijke_items: {naam: "Gezamenlijk", items: rGez}, inventaris_links: rInv}, new Set(claims.purchased_items), new Set(favs.favorite_ids));

        const loader = document.getElementById('loading-message');
        if (loader) loader.style.display = 'none';
    } catch (e) { console.error(e); }
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.onload = loadWishlist;