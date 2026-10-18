const recipientEmail = 'bernaertruben@hotmail.com';
let hidePurchased = false;
let globalPurchasedIds = new Set();

const zumaQuotes = [
    "Laten we een duik nemen!", "Klaar voor actie in de golven!", "1, 2, Zuma komt eraan!",
    "Deze pup houdt van water!", "Geen klus te groot, geen pup te klein!", "Zuma staat paraat!"
];

function setPupGreeting() {
    const greetingEl = document.getElementById('pup-greeting');
    if (!greetingEl) return;
    const randomQuote = zumaQuotes[Math.floor(Math.random() * zumaQuotes.length)];
    const hour = new Date().getHours();
    let timeGreeting = (hour >= 6 && hour < 12) ? "Goedemorgen!" : (hour >= 12 && hour < 18) ? "Goedemiddag!" : (hour >= 18 && hour < 23) ? "Goedenavond." : "Goedenacht.";
    greetingEl.innerText = `${timeGreeting} Welkom bij de missie. ${randomQuote}`;
}

function createBubbles() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = 'snow';
    bubble.style.left = Math.random() * 100 + "%";
    const sizeNum = Math.random() * 20 + 10;
    const size = sizeNum + "px";
    bubble.style.width = size; bubble.style.height = size;
    bubble.style.animationDuration = (Math.random() * 4 + 5) + "s";
    container.appendChild(bubble);
    setTimeout(() => bubble.remove(), 9000);
}

function startCountdown(targetDateStr, targetName) {
    const container = document.getElementById("countdown-container");
    const timerEl = document.getElementById("countdown-timer");
    if (!targetDateStr || !container) return;
    container.style.display = "block";
    const targetDate = new Date(targetDateStr).getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance < 0) {
            timerEl.innerHTML = `🎉 GELUKKIGE VERJAARDAG ${targetName.toUpperCase()}! 🎉`;
        } else {
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            timerEl.innerHTML = `${d}d ${h}u ${m}m ${s}s`;
        }
    }, 1000);
}

function normalizeText(text) {
    return text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

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

async function refreshClaims() {
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEET_URL);
        const data = await response.json();
        globalPurchasedIds = new Set(data.purchased_items);

        document.querySelectorAll('.wens-item, .overview-grid-item').forEach(el => {
            const id = el.id || el.getAttribute('data-id');
            if (id && globalPurchasedIds.has(id)) {
                if (!el.classList.contains('purchased')) {
                    el.classList.add('purchased');
                    const imgContainer = el.querySelector('.item-image-container, .overview-image-wrapper');
                    if (imgContainer && !el.querySelector('.purchased-overlay')) {
                        imgContainer.insertAdjacentHTML('afterbegin', '<div class="purchased-overlay">GEKOCHT</div>');
                    }
                    const btn = el.querySelector('.buy-button'); if (btn) btn.remove();
                }
            }
        });

        document.querySelectorAll('.tab-button').forEach(btn => {
            const targetId = btn.getAttribute('data-target');
            if (targetId && !['overview-content', 'inventory-list'].includes(targetId)) {
                const container = document.getElementById(targetId);
                if (container) {
                    const total = container.querySelectorAll('.wens-item').length;
                    const bought = container.querySelectorAll('.wens-item.purchased').length;
                    const perc = total > 0 ? Math.round((bought / total) * 100) : 0;
                    const stats = btn.querySelector('.tab-stats'); if (stats) stats.innerText = `${bought}/${total} gekocht`;
                    const blade = btn.querySelector('.katana-blade'); if (blade) blade.style.width = perc + "%";
                }
            }
        });
    } catch (e) { console.warn("Sync mislukt"); }
}

function openTab(evt, tabId) {
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    if (evt) evt.currentTarget.classList.add("active");
    window.scrollTo(0, 0);
}

function openVideoModal(videoId) {
    const frame = document.getElementById('youtube-frame');
    frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    document.getElementById('youtubeModal').style.display = 'block';
}

function closeVideoModal() {
    const frame = document.getElementById('youtube-frame');
    frame.src = "";
    document.getElementById('youtubeModal').style.display = 'none';
}

function updateModalUI(config) {
    const modal = document.getElementById('customModal');
    const modalContent = modal.querySelector('.custom-modal-content');

    // Reset naar standaard (niet-fout) state
    modalContent.classList.remove('modal-error');

    document.getElementById('modal-icon').innerText = config.icon || "🐾";
    document.getElementById('modal-title').innerText = config.title || "";
    document.getElementById('modal-text').innerText = config.text || "";
    document.getElementById('modal-spinner').style.display = config.showSpinner ? 'block' : 'none';
    document.getElementById('modal-buttons').style.display = config.showButtons ? 'flex' : 'none';

    // Als het een error is, voeg de class toe
    if (config.isError) {
        modalContent.classList.add('modal-error');
    }

    modal.style.display = 'block';
}

async function claimItem(name, id) {
    updateModalUI({ title: "Even geduld...", text: "We controleren de beschikbaarheid...", showSpinner: true, showButtons: false });
    try {
        const claimsRes = await fetch(CONFIG.GOOGLE_SHEET_URL).then(r => r.json());
        globalPurchasedIds = new Set(claimsRes.purchased_items);

        if (globalPurchasedIds.has(id)) {
            updateModalUI({
                icon: "🚫",
                title: "Te laat!",
                text: "Helaas, dit cadeau is zojuist door iemand anders geclaimd.",
                showSpinner: false,
                showButtons: true,
                isError: true
            });
            const confirmBtn = document.getElementById('modal-confirm-btn');
            confirmBtn.innerText = "Oké, jammer";
            confirmBtn.onclick = () => location.reload();
            document.getElementById('modal-cancel-btn').style.display = 'none';
            return;
        }

        updateModalUI({ title: "Cadeau gekocht?", text: `Wil je "${name}" markeren als gekocht? Dit wordt direct bijgewerkt.`, showSpinner: false, showButtons: true });
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        confirmBtn.innerText = "Ja, ik koop dit!";
        cancelBtn.style.display = 'inline-block';

        confirmBtn.onclick = async () => {
            updateModalUI({ title: "Bezig met opslaan...", text: "De missie wordt voltooid...", showSpinner: true, showButtons: false });
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ip:"Onbekend"}));
                const response = await fetch(CONFIG.GOOGLE_SHEET_URL, {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({ itemId: id, ipAddress: ipRes.ip })
                });
                const result = await response.json();

                if (result.result === "already_claimed") {
                    updateModalUI({
                        icon: "🚫",
                        title: "Net te laat!",
                        text: "Iemand anders was je net een fractie voor.",
                        showSpinner: false,
                        showButtons: true,
                        isError: true
                    });
                    document.getElementById('modal-confirm-btn').innerText = "Begrepen";
                    document.getElementById('modal-confirm-btn').onclick = () => location.reload();
                    document.getElementById('modal-cancel-btn').style.display = 'none';
                } else {
                    location.reload();
                }
            } catch (e) {
                location.reload();
            }
        };
    } catch (e) {
        console.error("Fout bij claim:", e);
    }
}

function generateWishlistContent(data, purchasedIds, favoriteIds, inventoryLinks) {
    const nav = document.getElementById('dynamic-tab-nav');
    const lists = document.getElementById('person-lists-container');
    const overview = document.getElementById('overview-grid-container');

    let navHtml = `<button class="tab-button active" data-target="overview-content" onclick="openTab(event, 'overview-content')"><span class="tab-info">Overzicht</span></button>`;
    let listsHtml = '', overviewHtml = '';

    const sortedPeople = [...data.personen].sort((a, b) => a.naam.toLowerCase() === 'milan' ? -1 : 1);
    const groups = [...sortedPeople];
    if (data.gezamenlijke_items) groups.push(data.gezamenlijke_items);

    groups.forEach(person => {
        const tabId = person.naam.toLowerCase() + "-list";
        navHtml += `
            <button class="tab-button" data-target="${tabId}" onclick="openTab(event, '${tabId}')">
                <span class="tab-info">${person.naam}</span>
                <span class="tab-stats">Laden...</span>
                <div class="katana-progress"><div class="katana-blade"></div></div>
            </button>`;

        listsHtml += `<div id="${tabId}" class="tab-content"><h2>Wensen van ${person.naam}</h2>`;
        overviewHtml += `<h3>${person.naam}</h3><div class="overview-grid">`;

        const sortedItems = [...person.items].sort((a, b) => (favoriteIds.has(b.id) ? 1 : 0) - (favoriteIds.has(a.id) ? 1 : 0));

        sortedItems.forEach(item => {
            const isP = purchasedIds.has(item.id), isF = favoriteIds.has(item.id), low = getLowestPrice(item.winkels);
            const overlay = isP ? '<div class="purchased-overlay">GEKOCHT</div>' : '';
            const vidBtn = (item.video_id && !isP) ? `<button class="video-button" onclick="openVideoModal('${item.video_id}')">🎬 Video</button>` : '';

            listsHtml += `
                <div id="${item.id}" class="wens-item ${isP ? 'purchased' : ''} ${isF ? 'favorite-item' : ''}">
                    <div class="left-column">
                        <div class="item-image-container">${overlay}<img src="${item.afbeelding_url}"></div>
                        ${isF ? '<div class="favorite-badge">★ FAVORIET</div>' : ''}
                    </div>
                    <div class="right-column">
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="price-links">
                            ${item.winkels.map((w, idx) => `<a href="${w.link}" target="_blank" class="price-link ${idx === low.idx ? 'lowest' : ''}"><span class="shop-name">${w.naam}</span><span class="shop-price">${w.prijs}</span></a>`).join('')}
                        </div>
                        <div style="display:flex; gap:10px; margin-top:auto;">
                            ${!isP ? `<button class="buy-button" onclick="claimItem('${item.naam.replace(/'/g, "\\'")}', '${item.id}')">Ik koop dit!</button>` : ''}
                            ${vidBtn}
                        </div>
                    </div>
                </div>`;

            overviewHtml += `
                <div class="overview-grid-item ${isP ? 'purchased' : ''} ${isF ? 'favorite-item' : ''}" data-id="${item.id}" onclick="openTab(null, '${tabId}'); setTimeout(() => document.getElementById('${item.id}').scrollIntoView({behavior:'smooth', block:'center'}), 100)">
                    <div class="overview-image-wrapper">${overlay}<img src="${item.afbeelding_url}"></div>
                    ${isF ? '<div class="mini-star">★</div>' : ''}
                    <div class="overview-caption">${item.naam}</div>
                    <div style="color:#ff6600; font-weight:bold; margin-top:5px;">Vanaf ${low.val} ${item.video_id ? '🎬' : ''}</div>
                </div>`;
        });
        listsHtml += `</div>`; overviewHtml += `</div>`;
    });

    if (inventoryLinks && inventoryLinks.length > 0) {
        navHtml += `<button class="tab-button" data-target="inventory-list" onclick="openTab(event, 'inventory-list')"><span class="tab-info">Inventaris</span></button>`;
        listsHtml += `<div id="inventory-list" class="tab-content"><h2>Onze Inventaris</h2><div class="price-links" style="padding:20px; background:white; border-radius:15px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">`;
        inventoryLinks.forEach(link => {
            listsHtml += `<a href="${link.url}" target="_blank" class="price-link" style="min-width:200px;"><span class="shop-name">Bekijk lijst</span><span class="shop-price">${link.naam}</span></a>`;
        });
        listsHtml += `</div></div>`;
    }

    nav.innerHTML = navHtml;
    lists.innerHTML = listsHtml;
    overview.innerHTML = overviewHtml;
    refreshClaims();
}

function getLowestPrice(winkels) {
    if (!winkels || winkels.length === 0) return { val: "€ 0", idx: 0 };
    let low = { val: "€ 0", idx: 0, num: Infinity };
    winkels.forEach((w, i) => {
        const n = parseFloat(w.prijs.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (n < low.num) low = { val: w.prijs, idx: i, num: n };
    });
    return low;
}

async function loadWishlist() {
    setPupGreeting(); setInterval(createBubbles, 600); setInterval(refreshClaims, 30000);
    try {
        const config = await fetch('wishlist_data.json').then(r => r.json());
        if (config.aftel_datum) startCountdown(config.aftel_datum, config.aftel_naam || "Milan");

        const [claims, favs, inv] = await Promise.all([
            fetch(CONFIG.GOOGLE_SHEET_URL).then(r => r.json()).catch(() => ({purchased_items:[]})),
            fetch('favorites.json').then(r => r.json()).catch(() => ({favorite_ids:[]})),
            fetch(config.inventaris_links_file).then(r => r.json()).catch(() => [])
        ]);

        globalPurchasedIds = new Set(claims.purchased_items);
        const pData = await Promise.all(config.personen.map(async p => ({ naam: p.naam, items: await fetch(p.data_file).then(r => r.json()) })));
        const rGez = await fetch(config.gezamenlijke_items_file).then(r => r.json()).catch(() => []);

        generateWishlistContent({...config, personen: pData, gezamenlijke_items: {naam: "Gezamenlijk", items: rGez}}, globalPurchasedIds, new Set(favs.favorite_ids), inv);
        document.getElementById('loading-message')?.remove();
    } catch (e) { console.error(e); }
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.onscroll = () => {
    const btn = document.getElementById("scrollToTopBtn");
    if(btn) btn.style.display = window.scrollY > 300 ? "block" : "none";
};
window.onclick = (e) => {
    if (e.target.id === 'youtubeModal') closeVideoModal();
    if (e.target.id === 'customModal') {
        if (document.getElementById('modal-spinner').style.display === 'none') {
            document.getElementById('customModal').style.display='none';
        }
    }
};
window.onload = loadWishlist;