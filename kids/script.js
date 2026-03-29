const recipientEmail = 'bernaertruben@hotmail.com';
let hidePurchased = false;
let globalPurchasedIds = new Set();

const zumaQuotes = [
    "Laten we een duik nemen!", "Klaar voor action in de golven!", "1, 2, Zuma komt eraan!",
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
    const size = (Math.random() * 15 + 10) + "px";
    bubble.style.width = size;
    bubble.style.height = size;
    bubble.style.animationDuration = (Math.random() * 4 + 6) + "s";
    container.appendChild(bubble);
    setTimeout(() => { bubble.remove(); }, 10000);
}

function startCountdown(targetDateStr, targetName) {
    const container = document.getElementById("countdown-container");
    const timerEl = document.getElementById("countdown-timer");
    if (!targetDateStr || !container) return;
    container.style.display = "block";
    let dateToParse = targetDateStr;
    if (!targetDateStr.includes('+') && !targetDateStr.includes('Z')) {
        const testDate = new Date(targetDateStr);
        const isDST = testDate.getMonth() > 2 && testDate.getMonth() < 10;
        dateToParse += isDST ? "+02:00" : "+01:00";
    }
    const targetDate = new Date(dateToParse).getTime();
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

async function refreshClaims() {
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEET_URL);
        const data = await response.json();
        globalPurchasedIds = new Set(data.purchased_items);

        document.querySelectorAll('.wens-item, .overview-grid-item').forEach(el => {
            const id = el.id || el.getAttribute('onclick')?.match(/'([^']+)'\s*\)$/)?.[1];
            if (id && globalPurchasedIds.has(id)) {
                if (!el.classList.contains('purchased')) {
                    el.classList.add('purchased');
                    if (!el.querySelector('.purchased-overlay')) {
                        const imgWrapper = el.querySelector('.item-image-container, .overview-image-wrapper');
                        if (imgWrapper) imgWrapper.insertAdjacentHTML('afterbegin', '<div class="purchased-overlay">GEKOCHT</div>');
                    }
                    const btn = el.querySelector('.buy-button');
                    if (btn) btn.remove();
                }
            }
        });
    } catch (e) { console.warn("Sync mislukt"); }
}

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

// Centrale functie voor Modal UI updates - FIX: Reset cancel btn altijd
function updateModalUI(config) {
    const modal = document.getElementById('customModal');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const confirmBtn = document.getElementById('modal-confirm-btn');

    document.getElementById('modal-icon').innerText = config.icon || "🐾";
    document.getElementById('modal-title').innerText = config.title || "";
    document.getElementById('modal-text').innerText = config.text || "";
    document.getElementById('modal-spinner').style.display = config.showSpinner ? 'block' : 'none';
    document.getElementById('modal-buttons').style.display = config.showButtons ? 'flex' : 'none';

    if (config.confirmText) confirmBtn.innerText = config.confirmText;
    if (config.cancelText) cancelBtn.innerText = config.cancelText;

    // Zorg dat de annuleerknop altijd sluit, tenzij anders opgegeven
    cancelBtn.style.display = config.hideCancel ? 'none' : 'inline-block';
    cancelBtn.onclick = function() { modal.style.display = 'none'; };

    if (config.onConfirm) confirmBtn.onclick = config.onConfirm;
    modal.style.display = 'block';
}

async function claimItem(person, itemName, id) {
    // 1. Direct Laden tonen
    updateModalUI({
        title: "Even geduld...",
        text: "We controleren de beschikbaarheid van dit cadeau...",
        showSpinner: true,
        showButtons: false
    });

    try {
        // 2. Checks uitvoeren
        const [ipRes, claimsRes] = await Promise.all([
            fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ip: "Onbekend"})),
            fetch(CONFIG.GOOGLE_SHEET_URL).then(r => r.json())
        ]);

        const userIp = ipRes.ip;
        globalPurchasedIds = new Set(claimsRes.purchased_items);

        // 3. Verkocht check
        if (globalPurchasedIds.has(id)) {
            updateModalUI({
                icon: "⚠️",
                title: "Te laat!",
                text: "Helaas, dit cadeau is zojuist door iemand anders geclaimd.",
                showSpinner: false,
                showButtons: true,
                confirmText: "Oké, jammer",
                hideCancel: true,
                onConfirm: () => location.reload()
            });
            return;
        }

        // 4. Bevestiging tonen
        updateModalUI({
            title: "Cadeau gekocht?",
            text: `Markeer "${itemName}" als gekocht.\n\n⚠️ Dit wordt direct bijgewerkt op de website.`,
            showSpinner: false,
            showButtons: true,
            confirmText: "Ja, ik koop dit!",
            cancelText: "Annuleren",
            onConfirm: function() {
                updateModalUI({
                    title: "Bezig met opslaan...",
                    text: "De missie wordt voltooid...",
                    showSpinner: true,
                    showButtons: false
                });

                fetch(CONFIG.GOOGLE_SHEET_URL, {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({ itemId: id, ipAddress: userIp })
                })
                .then(r => r.json())
                .then(result => {
                    if (result.result === "already_claimed") {
                        updateModalUI({
                            icon: "⚠️",
                            title: "Net te laat!",
                            text: "Tijdens het klikken is dit item helaas al geclaimd.",
                            showSpinner: false,
                            showButtons: true,
                            confirmText: "Begrepen",
                            hideCancel: true,
                            onConfirm: () => location.reload()
                        });
                    } else {
                        setTimeout(() => location.reload(), 800);
                    }
                })
                .catch(() => location.reload());
            }
        });

    } catch (e) {
        console.error(e);
        location.reload();
    }
}

function generateWishlistContent(data, purchasedIds, favoriteIds) {
    const nav = document.getElementById('dynamic-tab-nav'), listContainer = document.getElementById('person-lists-container'), overview = document.getElementById('overview-grid-container');
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')"><span class="tab-info">Overzicht</span></button>`;
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
                        <h3>${item.naam}</h3>
                        <p>${item.beschrijving}</p>
                        <div class="price-links">
                            ${item.winkels.map((w, idx) => `<a href="${w.link}" target="_blank" class="price-link ${idx === low.index ? 'lowest' : ''}"><span class="shop-name">${w.naam}</span><span class="shop-price">${w.prijs}</span><span class="shop-go">Bekijk</span></a>`).join('')}
                        </div>
                        ${!isP ? `<button class="buy-button" onclick="claimItem('${person.naam}', '${item.naam.replace(/'/g, "\\'")}', '${item.id}')">Ik koop dit!</button>` : ''}
                    </div>
                </div>`;

            overviewHtml += `<div class="overview-grid-item ${isP ? 'purchased' : ''} ${isF ? 'favorite-item' : ''}" onclick="scrollToItem('${person.naam}', '${item.id}')"><div class="overview-image-wrapper">${overlay}<img src="${item.afbeelding_url}"></div>${isF ? '<div class="mini-star">★</div>' : ''}<div class="overview-caption">${item.naam}</div><div style="font-size:0.85em; color:#ff6600; font-weight:bold;">Vanaf ${low.prijs}</div></div>`;
        });
        listsHtml += `</div>`; overviewHtml += `</div>`;
    });
    nav.innerHTML = navHtml;
    overview.innerHTML = overviewHtml;
    listContainer.innerHTML = listsHtml;
}

function openTab(evt, tabId) {
    setPupGreeting();
    refreshClaims();
    if (document.getElementById('gift-search')) { document.getElementById('gift-search').value = ""; filterGifts(); }
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    const target = document.getElementById(tabId);
    if(target) target.classList.add("active");
    if (evt) evt.currentTarget.classList.add("active");
    window.scrollTo(0,0);
}

function scrollToItem(p, id) {
    openTab(null, personIdToTabId(p));
    setTimeout(() => {
        const el = document.getElementById(id);
        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function personIdToTabId(naam) { return (naam.toLowerCase() === 'gezamenlijk' ? 'gezamenlijk' : naam.toLowerCase()) + '-list-content'; }

function getLowestPriceInfo(winkels) {
    if (!winkels || winkels.length === 0) return { prijs: "N.v.t.", index: -1 };
    let lowestVal = Infinity, lowestIndex = 0;
    winkels.forEach((w, i) => {
        const val = parseFloat(w.prijs.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (val < lowestVal) { lowestVal = val; lowestIndex = i; }
    });
    return { prijs: `€ ${lowestVal.toFixed(2).replace('.', ',')}`, index: lowestIndex };
}

async function loadWishlist() {
    setPupGreeting();
    setInterval(createBubbles, 800);
    setInterval(refreshClaims, 30000);

    try {
        const config = await fetch('wishlist_data.json').then(r => r.json());
        if (config.aftel_datum) startCountdown(config.aftel_datum, config.aftel_naam || "Milan");
        const claims = await fetch(CONFIG.GOOGLE_SHEET_URL).then(r => r.json()).catch(() => ({purchased_items:[]}));
        globalPurchasedIds = new Set(claims.purchased_items);
        const favs = await fetch('favorites.json').then(r => r.json()).catch(() => ({favorite_ids:[]}));
        const pData = await Promise.all(config.personen.map(async p => ({ naam: p.naam, items: await fetch(p.data_file).then(r => r.json()) })));
        const rGez = await fetch(config.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        generateWishlistContent({...config, personen: pData, gezamenlijke_items: {naam: "Gezamenlijk", items: rGez}}, globalPurchasedIds, new Set(favs.favorite_ids));
        document.getElementById('loading-message').style.display = 'none';
    } catch (e) { console.error(e); }
}

window.onscroll = function() {
    const btn = document.getElementById("scrollToTopBtn");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) { btn.style.display = "block"; } else { btn.style.display = "none"; }
};
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.onload = loadWishlist;