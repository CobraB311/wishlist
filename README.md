# 🎄🎁 De Grote Eindejaarswenslijst van Jonas & Milan 🎁🎄

Dit is de repository voor de gepersonaliseerde, interactieve wensenlijst voor Jonas en Milan.

De website is ontworpen om een overzichtelijke presentatie te bieden van cadeautips, gesorteerd per persoon en op prijs, inclusief directe links naar winkels om het claimproces te vergemakkelijken.

## ✨ Kernfunctionaliteiten

* **Responsieve Layout:** De wensenlijst werkt goed op zowel desktop (met verticale navigatie links) als mobiele apparaten (met horizontale navigatie bovenaan).
* **Dynamische Tabs:** De tab-navigatie wordt automatisch gegenereerd op basis van de personen in `wishlist_data.json`.
* **Interactief Overzicht:** De hoofdpagina toont alle **niet-geclaimde** items in een fotogalerij. Klikken op een foto springt direct naar de detailpagina van het item.
* **Prijs & Status:** Items worden gesorteerd op prijs (laag naar hoog). Gekochte items worden visueel gemarkeerd (op basis van `claims.json`).
* **Geïntegreerde Claimfunctie:** Via een `mailto:` link kan een bezoeker een item claimen, wat zorgt voor een eenvoudige registratie van aankopen.

## 🛠️ Projectstructuur

| Bestand | Doel | Opmerkingen |
| :--- | :--- | :--- |
| `index.html` | De hoofdstructuur (HTML) van de website. | Bevat de basiscontainers en verwijzingen naar CSS/JS. |
| `style.css` | De styling van de website. | Bevat de CSS voor de verticale tab-layout en responsiviteit. |
| `script.js` | De volledige logica (JavaScript). | Laadt de JSON-data, genereert tabs, sorteert items en bevat de claimfunctie. **Bevat de link-validatie.** |
| `wishlist_data.json` | De hoofdconfiguratie. | Definieert de personen, hun databestanden en de algemene titel/datum. |
| `jonas_items.json` | Itemlijst Jonas. | De individuele wensen en winkellinks van Jonas. |
| `milan_items.json` | Itemlijst Milan. | De individuele wensen en winkellinks van Milan. |
| `inventory_links.json`| Extra informatie/links. | Links naar de Google Foto's albums met bestaande items. |
| `claims.json` | De claim-status van items. | **Leeg starten:** `{"purchased_items": []}`. Wordt handmatig bijgewerkt met item ID's. |

## ✍️ De Wensenlijst Bijwerken (Onderhoud)

De wensenlijst is volledig gedreven door JSON. U hoeft geen HTML of JavaScript aan te passen om items toe te voegen.

1.  **Item Toevoegen:** Voeg een nieuw object toe aan de array in het juiste bestand (`jonas_items.json` of `milan_items.json`). Zorg ervoor dat u een **unieke `id`** toewijst.
2.  **Link Validatie:** Zorg ervoor dat alle `link` velden in de `winkels` array beginnen met `http://` of `https://`. De JavaScript (`script.js`) bevat een check om u te waarschuwen als een link ongeldig is.
3.  **Datum Bijwerken:** Werk de `datum` string in `wishlist_data.json` bij naar de huidige datum, zodat de sitebezoekers weten wanneer de lijst voor het laatst is geactualiseerd.

### 🛑 Belangrijke Beveiligingscontrole

Conform uw vereiste instructie controleert `script.js` altijd of alle `winkels[].link` velden geldig zijn voordat de pagina wordt doorgestuurd.

## 📧 De Claimfunctie

Wanneer een bezoeker op de knop **"Claim dit cadeau!"** klikt, wordt er een e-mail gegenereerd naar de beheerder.

* **Ontvanger E-mail:** `bernaertruben@hotmail.com` (Opgeslagen instelling)
* **E-mail Subject:** `BEVESTIGING: Cadeau Gekocht voor [Naam] - [Itemnaam]`

### Gekochte Items Markeren

Om een item als **gekocht** te markeren, moet de item-ID handmatig worden toegevoegd aan de `purchased_items` array in **`claims.json`**:

```json
{
  "purchased_items": [
    "duplo-set-10443",
    "playmobil-politie-commandocentrum-71873" 
    // Voeg hier de ID van het gekochte item toe
  ]
}
