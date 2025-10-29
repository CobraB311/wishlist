// ... (start van script.js)

// Functie om de volledige HTML-inhoud te genereren met de ingeladen data
function generateWishlistContent(data) {
    // ... (onveranderd)

    for (let i = 0; i < data.personen.length; i++) {
        const persoon = data.personen[i];
        const persoonNaam = persoon.naam;
        const persoonId = persoonNaam.toLowerCase();
        
        // ... (onveranderd)

        // 4. VOEG ITEMS TOE AAN OVERZICHT EN INDIVIDUELE LIJST
        for (const item of persoon.items) {
            // ... (onveranderd: OVERZICHT ITEM)
            
            // --- HOOFDLIJST ITEM ---
            const wensItem = document.createElement('div');
            wensItem.className = 'wens-item';
            wensItem.id = item.id;

            // 1. LINKER KOLOM (Afbeelding + Prijs)
            const leftColumn = document.createElement('div');
            leftColumn.className = 'left-column';

            // ... (onveranderd: Afbeelding)

            // Prijs (onder afbeelding)
            const prijzen = item.winkels.map(w => parseFloat(w.prijs.replace('€ ', '').replace(',', '.')));
            const laagstePrijs = Math.min(...prijzen);
            const prijsElement = document.createElement('p');
            prijsElement.className = 'item-price-under-image';
            
            // AANPASSING HIER: Toevoeging van "(Indicatie)"
            prijsElement.textContent = `Vanaf: € ${laagstePrijs.toFixed(2).replace('.', ',')} (Indicatie)`; 
            
            leftColumn.appendChild(prijsElement);
            
            wensItem.appendChild(leftColumn);
            
            // ... (rest van de code onveranderd)
        }
    }
    
    // ... (einde van script.js)
}

// ... (rest van script.js)
