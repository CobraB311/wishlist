# 🥷 🧱 De Ninja Wensenlijst 🧱 🥷

Dit is de repository voor de gepersonaliseerde, interactieve wensenlijst in **Ninjago-stijl**. De website is ontworpen om een overzichtelijke en sfeervolle presentatie te bieden van cadeautips, gesorteerd per persoon en voor gezamenlijke wensen.

## ✨ Kernfunctionaliteiten

* **Ninjago Thema:** Een volledig visueel thema met Ninja-banners, rode en gouden accenten en Master Wu-stijl typografie.
* **Ninja Countdown:** Een dynamische aftelklok die live aftelt naar de verjaardag. De datum en naam worden centraal beheerd in `wishlist_data.json`.
* **Dynamische Ninja-groet:** Een begroeting die verandert op basis van het tijdstip van de dag (bijv. *"Goedemorgen Ninja!"* of *"Goedenavond Sensei"*).
* **Katana Progressiebalken:** De navigatietabs tonen visueel hoeveel items van de lijst al gekocht zijn via een progressiebalk in de stijl van een zwaard.
* **Interactieve Video's:** Items kunnen een "🎬 Video" knop bevatten die een YouTube-preview opent in een overlay (modal).
* **Favorieten Systeem:** Belangrijke wensen krijgen een gouden gloed, een ster-icoon en worden automatisch bovenaan de lijst geplaatst.
* **Responsieve Layout:** Verticale navigatie aan de linkerkant op desktop; een compacte horizontale navigatie op mobiele apparaten.

## 🛠️ Projectstructuur

| Bestand | Doel | Opmerkingen |
| :--- | :--- | :--- |
| `index.html` | De hoofdstructuur. | Bevat de basiscontainers voor de countdown en video-modal. |
| `style.css` | De Ninja-styling. | Bevat alle CSS voor de layout, animaties en sfeer-effecten. |
| `script.js` | De Ninja-logica. | Beheert de countdown, tabs, sortering en de claimfunctie via e-mail. |
| `wishlist_data.json` | Hoofdconfiguratie. | Definieert personen, bestandslocaties en de **countdown metadata**. |
| `[persoon]_items.json` | Itemlijsten per persoon. | De individuele wensen en winkellinks (bijv. `jonas_items.json`). |
| `favorites.json` | Favorieten. | Bevat de ID's van items die de gouden status en prioriteit krijgen. |
| `claims.json` | De claim-status. | Bevat de ID's van items die visueel als "GEKOCHT" gemarkeerd worden. |

## ✍️ Onderhoud & Updates

De website is volledig data-gedreven via JSON. U hoeft geen code aan te passen om items te beheren.

### 1. De Countdown aanpassen
Pas de datum en naam aan in `wishlist_data.json`. Gebruik het ISO-formaat voor de datum:

```json
{
  "aftel_datum": "2026-03-08T12:00:00",
  "aftel_naam": "Jonas"
}
```

### 2. Gekochte Items Markeren
Om een item als **gekocht** te markeren, voegt u de unieke `id` van het cadeau toe aan de array in `claims.json`. Let op de aanhalingstekens en de komma's tussen de verschillende ID's:

```json
{
  "purchased_items": [
    "lego-set-71741",
    "pokemon-tincase-2026",
    "gezamenlijk-spel-123"
  ]
}
```

### 3. Favorieten instellen
Voeg de `id` van een item toe aan de array in `favorites.json` om het item bovenaan de lijst te plaatsen met een gouden markering en een ster-icoon.

## 📧 De Claimfunctie

Wanneer een bezoeker op de knop **"Ik koop dit!"** klikt, wordt er automatisch een e-mail gegenereerd naar de beheerder via een `mailto:` link.

* **Ontvanger:** `bernaertruben@hotmail.com`
* **Onderwerp:** `CLAIM: [Itemnaam] voor [Persoon]`
* **Inhoud:** De mail bevat de specifieke Item ID. Dit zorgt voor een foutloze verwerking wanneer de beheerder de ID overneemt in `claims.json`.

## 🛑 Belangrijke Controle

Het script (`script.js`) voert bij het laden een automatische validatie uit. Het controleert of alle links in de `winkels[]` array beginnen met `http://` of `https://`. Als een link ongeldig is of ontbreekt, wordt dit gemeld in de browser-console. Dit voorkomt dat gebruikers op "dode" of onveilige links klikken.

---
*Ninja's never quit!*