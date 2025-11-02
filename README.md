# 🎄🎁 De Grote Wensenlijst 🎁🎄

Dit is de repository voor de gepersonaliseerde, interactieve wensenlijst. De website is ontworpen om een overzichtelijke presentatie te bieden van cadeautips, gesorteerd per persoon en nu ook voor **gezamenlijke wensen**. Het bevat directe links naar winkels en een vereenvoudigd claimproces.

## ✨ Kernfunctionaliteiten

* **Responsieve Layout:** De wensenlijst werkt goed op zowel desktop (met verticale navigatie links) als mobiele apparaten (met horizontale navigatie bovenaan).
* **Verticale Navigatie:** Op desktop staat de navigatie permanent aan de linkerkant, met dynamische tabs voor elke persoon en de gezamenlijke lijst.
* **Dynamische Tabs:** De tab-navigatie wordt automatisch gegenereerd op basis van de personen en de gezamenlijke lijst in de configuratiebestanden.
* **Interactief Overzicht:** De hoofdpagina toont alle **niet-geclaimde** items in een fotogalerij. Klikken op een foto springt direct naar de detailpagina van het item.
* **Prijs & Status:** Items worden gesorteerd op prijs (laag naar hoog). Gekochte items worden visueel gemarkeerd (op basis van `claims.json`) en hebben een "GEKOCHT" label.
* **Percentage-Badges:** Elke personentab en de "Gezamenlijk" tab tonen een percentage (`0/0 (0%)`) dat aangeeft hoeveel items al gekocht zijn.
* **Geïntegreerde Claimfunctie:** Via een `mailto:` link kan een bezoeker een item claimen, wat zorgt voor een eenvoudige registratie van aankopen.

## 🛠️ Projectstructuur

| Bestand | Doel | Opmerkingen |
| :--- | :--- | :--- |
| `index.html` | De hoofdstructuur (HTML) van de website. | Bevat de basiscontainers en verwijzingen naar CSS/JS. |
| `style.css` | De styling van de website. | Bevat de CSS voor de verticale tab-layout (nu **`240px`** breed voor betere weergave van percentages), responsiviteit en achtergrondanimatie. |
| `script.js` | De volledige logica (JavaScript). | Laadt de JSON-data, genereert tabs, sorteert items, toont percentages en bevat de claimfunctie. **Bevat de link-validatie.** |
| `wishlist_data.json` | De hoofdconfiguratie. | Definieert de personen, hun databestanden, de **gezamenlijke lijst** en de algemene titel/datum. |
| `[persoon]_items.json` | Itemlijsten per persoon (e.g., `ruben_items.json`). | De individuele wensen en winkellinks per persoon. |
| `gezamenlijk_items.json` | Itemlijst voor de **gezamenlijke** wensen. | Hier staan de gedeelde cadeaus die voor iedereen relevant zijn. |
| `inventory_links.json` | Extra informatie/links. | Links naar inventaris of andere relevante albums/collecties. |
| `claims.json` | De claim-status van items. | **Leeg starten:** `{"purchased_items": []}`. Wordt handmatig bijgewerkt met de `id`'s van gekochte items. |

## ✍️ De Wensenlijst Bijwerken (Onderhoud)

De wensenlijst is volledig gedreven door JSON. U hoeft geen HTML of JavaScript aan te passen om items toe te voegen of te bewerken.

1.  **Item Toevoegen:** Voeg een nieuw object toe aan de array in het juiste bestand (e.g., `ruben_items.json`, `milan_items.json` of `gezamenlijk_items.json`). Zorg ervoor dat u een **unieke `id`** toewijst aan elk item.
2.  **Link Validatie:** Zorg ervoor dat alle `link` velden in de `winkels` array beginnen met `http://` of `https://`. De JavaScript (`script.js`) bevat een check om u te waarschuwen als een link ongeldig is.
3.  **Datum Bijwerken:** Werk de `datum` string in `wishlist_data.json` bij naar de huidige datum, zodat de sitebezoekers weten wanneer de lijst voor het laatst is geactualiseerd.

### 🛑 Belangrijke Beveiligingscontrole

Conform uw vereiste instructie controleert `script.js` altijd of alle `winkels[].link` velden geldig zijn (`http://` of `https://` prefix) voordat de pagina volledig wordt geladen, om te zorgen dat er geen dode links worden getoond.

## 📧 De Claimfunctie

Wanneer een bezoeker op de knop **"Cadeau Kopen & Claimen"** klikt, wordt er een e-mail gegenereerd naar de beheerder.

* **Ontvanger E-mail:** `bernaertruben@hotmail.com` (Deze instelling staat in `script.js` en kan daar gewijzigd worden.)
* **E-mail Subject:** `BEVESTIGING: Cadeau Gekocht voor [Naam] - [Itemnaam]`
    (De naam is de persoon, of "Gezamenlijk" voor gedeelde items).

### Gekochte Items Markeren

Om een item als **gekocht** te markeren, moet de `item.id` handmatig worden toegevoegd aan de `purchased_items` array in **`claims.json`**:

```json
{
  "purchased_items": [
    "duplo-set-10443",
    "playmobil-politie-commandocentrum-71873",
    "gezamenlijk-walkies-fox" // Voorbeeld van een gekocht gezamenlijk item
    // Voeg hier de ID van elk gekochte item toe
  ]
}
