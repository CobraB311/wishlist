const recipientEmail = 'bernaertruben@hotmail.com';
let hidePurchased = false;
let globalPurchasedIds = new Set();
let quotes = [];
let currentConfig = null;

function setGreeting(customGreeting) {
    const greetingEl = document.getElementById('header-greeting') || document.getElementById('pup-greeting');
    if (!greetingEl) return;
    const quoteList = (quotes && quotes.length > 0) ? quotes : [
        "Welkom bij de wensenlijst!"
    ];
    const randomQuote = quoteList[Math.floor(Math.random() * quoteList.length)];
    const hour = new Date().getHours();
    let timeGreeting = (hour >= 6 && hour < 12) ? "Goedemorgen!" : (hour >= 12 && hour < 18) ? "Goedemiddag!" : (hour >= 18 && hour < 23) ? "Goedenavond." : "Goedenacht.";
    const themeGreeting = customGreeting || (currentConfig && currentConfig.groet_tekst) || "";
    greetingEl.innerText = `${timeGreeting} ${themeGreeting} ${randomQuote}`.replace(/\s+/g, ' ').trim();
}

function setPupGreeting() { setGreeting(); }

function createBubbles() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    const snowflake = document.createElement('div');
    snowflake.className = 'snow';
    snowflake.style.left = Math.random() * 100 + "%";
    const size = (Math.random() * 7 + 4) + "px";
    snowflake.style.width = size;
    snowflake.style.height = size;
    snowflake.style.animationDuration = (Math.random() * 3 + 4) + "s";
    container.appendChild(snowflake);
    setTimeout(() => { snowflake.remove(); }, 8000);
}

function startCountdown(targetDateStr, targetName, labelText, finishText) {
    const container = document.getElementById("countdown-container");
    const timerEl = document.getElementById("countdown-timer");
    const labelEl = document.getElementById("countdown-label") || container?.querySelector('.countdown-label');
    if (!targetDateStr || !container) return;
    if (labelEl && labelText) labelEl.innerText = labelText;
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
            const template = finishText || `🎉 Feest voor {naam}! 🎉`;
            timerEl.innerHTML = template.replace('{naam}', (targetName || "").toUpperCase());
        } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timerEl.innerHTML = `${days}d ${hours}u ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

// ACHTERGROND REFRESH VAN CLAIMS + TELLER UPDATE
async function refreshClaims() {
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEET_URL);
        const data = await response.json();
        globalPurchasedIds = new Set(data.purchased_items);

        // 1. Update de items op het scherm (grijs maken/overlay toevoegen)
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
                    const vid = el.querySelector('.video-button');
                    if (vid) vid.remove();
                }
            }
        });

        // 2. Update de tellers en voortgangsbalken in het menu
        document.querySelectorAll('.tab-button').forEach(btn => {
            const tabId = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (!tabId || tabId === 'overview-content' || tabId === 'inventory-content') return;

            const container = document.getElementById(tabId);
            if (container) {
                const totalItems = container.querySelectorAll('.wens-item').length;
                const boughtItems = container.querySelectorAll('.wens-item.purchased').length;
                const percentage = totalItems > 0 ? Math.round((boughtItems / totalItems) * 100) : 0;

                const statsEl = btn.querySelector('.tab-stats');
                if (statsEl) statsEl.innerText = `${boughtItems}/${totalItems} gekocht`;

                const bladeEl = btn.querySelector('.katana-blade');
                if (bladeEl) bladeEl.style.width = `${percentage}%`;
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

function openVideoModal(videoId) {
    const frame = document.getElementById('youtube-frame');
    if (frame) frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    const modal = document.getElementById('youtubeModal');
    if (modal) modal.style.display = 'block';
}

function closeVideoModal() {
    const frame = document.getElementById('youtube-frame');
    if (frame) frame.src = "";
    const modal = document.getElementById('youtubeModal');
    if (modal) modal.style.display = 'none';
}

function updateModalUI(config) {
    const modal = document.getElementById('customModal');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const confirmBtn = document.getElementById('modal-confirm-btn');

    document.getElementById('modal-icon').innerText = config.icon || "🎁";
    document.getElementById('modal-title').innerText = config.title || "";
    document.getElementById('modal-text').innerText = config.text || "";
    document.getElementById('modal-spinner').style.display = config.showSpinner ? 'block' : 'none';
    document.getElementById('modal-buttons').style.display = config.showButtons ? 'flex' : 'none';

    if (config.confirmText) confirmBtn.innerText = config.confirmText;
    if (config.cancelText) cancelBtn.innerText = config.cancelText;

    cancelBtn.style.display = config.hideCancel ? 'none' : 'inline-block';
    cancelBtn.onclick = function() { modal.style.display = 'none'; };

    if (config.onConfirm) confirmBtn.onclick = config.onConfirm;
    modal.style.display = 'block';
}

async function claimItem(person, itemName, id) {
    updateModalUI({
        title: "Even geduld...",
        text: "We controleren de beschikbaarheid...",
        showSpinner: true,
        showButtons: false
    });

    try {
        const [ipRes, claimsRes] = await Promise.all([
            fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ip: "Onbekend"})),
            fetch(CONFIG.GOOGLE_SHEET_URL).then(r => r.json())
        ]);

        const userIp = ipRes.ip;
        globalPurchasedIds = new Set(claimsRes.purchased_items);

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

        const confirmBtnText = (person && person.toLowerCase() !== 'gezamenlijk')
            ? `Ja, ik koop voor ${person}!`
            : "Ja, ik koop dit!";

        updateModalUI({
            title: "Cadeau gekocht?",
            text: `Markeer "${itemName}" als gekocht.\n\n⚠️ Dit wordt direct bijgewerkt op de website.`,
            showSpinner: false,
            showButtons: true,
            confirmText: confirmBtnText,
            cancelText: "Annuleren",
            onConfirm: function() {
                updateModalUI({
                    title: "Bezig met opslaan...",
                    text: (currentConfig && currentConfig.claim_opslaan_tekst) || "Het cadeau wordt geclaimd...",
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
                            text: "Dit item is helaas al geclaimd.",
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

function showClaimsError() {
    const controls = document.querySelector('.controls-container');
    if (controls) controls.style.display = 'none';

    const nav = document.getElementById('dynamic-tab-nav');
    if (nav) nav.innerHTML = '';

    const listContainer = document.getElementById('person-lists-container');
    if (listContainer) listContainer.innerHTML = '';

    const title = (currentConfig && currentConfig.claims_error_titel) || "Onze excuses!";
    const text = (currentConfig && currentConfig.claims_error_tekst) || "We konden de actuele status van de cadeaus momenteel niet ophalen. Om te voorkomen dat cadeaus per ongeluk dubbel worden gekocht, zijn de verlanglijstjes tijdelijk niet zichtbaar.";

    const overview = document.getElementById('overview-grid-container');
    if (overview) {
        overview.innerHTML = `
            <div class="claims-error-card">
                <div class="claims-error-icon">⚠️</div>
                <h2>${title}</h2>
                <p>${text}</p>
                <p class="claims-error-sub">Even geduld alstublieft, je kunt de pagina zo meteen opnieuw proberen te laden.</p>
                <div class="retry-wrapper">
                    <button id="claims-retry-btn" class="retry-btn" disabled onclick="location.reload()">
                        Opnieuw proberen in <span id="retry-countdown">10</span>s
                    </button>
                </div>
            </div>
        `;
    }

    let timeLeft = 10;
    const countdownEl = document.getElementById('retry-countdown');
    const retryBtn = document.getElementById('claims-retry-btn');

    const countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            if (countdownEl) countdownEl.innerText = timeLeft;
        } else {
            clearInterval(countdownInterval);
            if (retryBtn) {
                retryBtn.disabled = false;
                retryBtn.classList.add('ready');
                retryBtn.innerHTML = '🔄 Opnieuw proberen';
            }
        }
    }, 1000);
}

function generateWishlistContent(data, purchasedIds, favoriteIds) {
    const nav = document.getElementById('dynamic-tab-nav'), listContainer = document.getElementById('person-lists-container'), overview = document.getElementById('overview-grid-container');
    let navHtml = `<button class="tab-button active" onclick="openTab(event, 'overview-content')"><span class="tab-info">Overzicht</span></button>`;
    let listsHtml = '', overviewHtml = '';

    const sortedPeople = [...data.personen].sort((a, b) => a.naam.toLowerCase() === 'jonas' ? -1 : 1);
    const groups = [...sortedPeople];
    if (data.gezamenlijke_items && data.gezamenlijke_items.items && data.gezamenlijke_items.items.length > 0) {
        groups.push(data.gezamenlijke_items);
    }

    groups.forEach(person => {
        const tabId = personIdToTabId(person.naam);
        const total = person.items.length, bought = person.items.filter(i => purchasedIds.has(i.id)).length, perc = total > 0 ? Math.round((bought / total) * 100) : 0;

        navHtml += `<button class="tab-button" onclick="openTab(event, '${tabId}')"><span class="tab-info">${person.naam}</span><span class="tab-stats">${bought}/${total} gekocht</span><div class="katana-progress"><div class="katana-blade" style="width: ${perc}%"></div></div></button>`;

        const isGezamenlijk = person.naam.toLowerCase() === 'gezamenlijk';
        const template = (currentConfig && currentConfig.koop_knop_tekst) || "Ik koop voor {naam}!";
        const buyBtnText = isGezamenlijk ? 'Ik koop dit!' : template.replace('{naam}', person.naam);
        const headerTitle = isGezamenlijk ? `Wensen ${person.naam}` : `Wensen van ${person.naam}`;

        listsHtml += `
            <div id="${tabId}" class="tab-content">
                <div class="person-sticky-header">
                    <h2>🎁 ${headerTitle}</h2>
                    <span class="person-sticky-badge">${person.naam}</span>
                </div>`;

        overviewHtml += `
            <div class="overview-section">
                <div class="overview-person-header">
                    <h3>🎁 ${person.naam}</h3>
                </div>
                <div class="overview-grid">`;

        person.items.sort((a,b) => (favoriteIds.has(b.id)?1:0) - (favoriteIds.has(a.id)?1:0)).forEach(item => {
            const isP = purchasedIds.has(item.id), isF = favoriteIds.has(item.id), low = getLowestPriceInfo(item.winkels), overlay = isP ? `<div class="purchased-overlay">GEKOCHT</div>` : '';
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
                            ${item.winkels.map((w, idx) => `<a href="${w.link}" target="_blank" class="price-link ${idx === low.index ? 'lowest' : ''}"><span class="shop-name">${w.naam}</span><span class="shop-price">${w.prijs}</span><span class="shop-go">Bekijk</span></a>`).join('')}
                        </div>
                        <div class="button-row">
                            ${!isP ? `<button class="buy-button" onclick="claimItem('${person.naam}', '${item.naam.replace(/'/g, "\\'")}', '${item.id}')">${buyBtnText}</button>` : ''}
                            ${vidBtn}
                        </div>
                    </div>
                </div>`;

            overviewHtml += `<div class="overview-grid-item ${isP ? 'purchased' : ''} ${isF ? 'favorite-item' : ''}" onclick="scrollToItem('${person.naam}', '${item.id}')"><div class="overview-image-wrapper">${overlay}<img src="${item.afbeelding_url}"></div>${isF ? '<div class="mini-star">★</div>' : ''}<div class="overview-caption">${item.naam}</div><div class="overview-price">Vanaf ${low.prijs} ${item.video_id ? '🎬' : ''}</div></div>`;
        });
        listsHtml += `</div>`; overviewHtml += `</div></div>`;
    });

    if (data.inventaris_links && data.inventaris_links.length > 0) {
        navHtml += `<button class="tab-button" onclick="openTab(event, 'inventory-content')"><span class="tab-info">Inventaris</span></button>`;
        listsHtml += `
            <div id="inventory-content" class="tab-content">
                <div class="person-sticky-header">
                    <h2>📦 Onze Inventaris</h2>
                    <span class="person-sticky-badge">Collectie</span>
                </div>
                <p class="inventory-intro">Dit zijn overzichten van speelgoed en collecties die we al hebben, om dubbele cadeaus te voorkomen.</p>
                <div class="inventory-links-container">
                    ${data.inventaris_links.map(l => `
                        <a href="${l.url}" target="_blank" class="inventory-link-card">
                            <div class="inventory-link-info">
                                <span class="inventory-icon">📦</span>
                                <span class="inventory-name">${l.naam}</span>
                            </div>
                            <span class="inventory-go">Bekijk collectie ➔</span>
                        </a>
                    `).join('')}
                </div>
            </div>`;
    }

    nav.innerHTML = navHtml;
    overview.innerHTML = overviewHtml;
    listContainer.innerHTML = listsHtml;
}

function openTab(evt, tabId) {
    setGreeting();
    refreshClaims();
    if (document.getElementById('gift-search')) { document.getElementById('gift-search').value = ""; filterGifts(); }
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    const target = document.getElementById(tabId);
    if(target) target.classList.add("active");
    const targetBtn = evt ? evt.currentTarget : document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
    if (targetBtn) targetBtn.classList.add("active");
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
    setInterval(createBubbles, 500);

    try {
        const config = await fetch('wishlist_data.json').then(r => r.json());
        currentConfig = config;
        quotes = config.quotes || [];
        setGreeting(config.groet_tekst);

        if (config.wenslijst_titel) {
            document.title = config.wenslijst_titel;
            const titleEl = document.getElementById('main-title');
            if (titleEl) titleEl.innerText = config.wenslijst_titel;
        }

        if (config.datum) {
            const lastUpdateEl = document.getElementById('last-update-text');
            if (lastUpdateEl) {
                lastUpdateEl.innerHTML = `Lijst & prijzen bijgewerkt op: ${config.datum}<br><span class="last-update-sub">(Gekochte items worden direct verwerkt)</span>`;
            }
        }

        if (config.banner_afbeelding) {
            const bannerEl = document.querySelector('.theme-banner, .zuma-banner');
            if (bannerEl) bannerEl.style.backgroundImage = `url('${config.banner_afbeelding}')`;
        }

        if (config.aftel_datum) {
            startCountdown(config.aftel_datum, config.aftel_naam || "Jonas", config.countdown_label, config.countdown_eindtekst);
        }

        // Strikte controle op claims bij initiële load
        let claims = null;
        try {
            const signal = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(10000) : undefined;
            const claimsRes = await fetch(CONFIG.GOOGLE_SHEET_URL, { signal });
            if (!claimsRes.ok) throw new Error("HTTP status " + claimsRes.status);
            const claimsData = await claimsRes.json();
            if (!claimsData || !Array.isArray(claimsData.purchased_items)) {
                throw new Error("Ongeldig claims formaat");
            }
            claims = claimsData;
        } catch (claimsErr) {
            console.error("Claims ophalen mislukt bij start:", claimsErr);
        }

        if (!claims) {
            showClaimsError();
            return;
        }

        globalPurchasedIds = new Set(claims.purchased_items);
        const favs = await fetch('favorites.json').then(r => r.json()).catch(() => ({favorite_ids:[]}));
        const pData = await Promise.all(config.personen.map(async p => ({ naam: p.naam, items: await fetch(p.data_file).then(r => r.json()) })));
        const rGez = await fetch(config.gezamenlijke_items_file).then(r => r.json()).catch(() => []);
        const rInv = config.inventaris_links_file ? await fetch(config.inventaris_links_file).then(r => r.json()).catch(() => []) : [];
        generateWishlistContent({...config, personen: pData, gezamenlijke_items: {naam: "Gezamenlijk", items: rGez}, inventaris_links: rInv}, globalPurchasedIds, new Set(favs.favorite_ids));
        
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.style.display = 'none';

        // Start achtergrond-refresh pas nadat initiële claims succesvol geladen zijn
        setInterval(refreshClaims, 30000);

    } catch (e) {
        console.error(e);
        showClaimsError();
    }
}

window.onscroll = function() {
    const btn = document.getElementById("scrollToTopBtn");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) { btn.style.display = "block"; } else { btn.style.display = "none"; }
};
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.onclick = function(e) {
    if (e.target && e.target.id === 'youtubeModal') {
        closeVideoModal();
    }
    if (e.target && e.target.id === 'customModal') {
        const spinner = document.getElementById('modal-spinner');
        if (!spinner || spinner.style.display === 'none') {
            document.getElementById('customModal').style.display = 'none';
        }
    }
};
window.onload = loadWishlist;
