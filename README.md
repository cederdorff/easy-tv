# Easy TV

> Find den tv-pakke, der har de kanaler, du rent faktisk vil se.

Easy TV er en lille prototype på en sammenligningstjeneste for danske tv-pakker. Du vælger dit område og op til fem kanaler, du ikke vil undvære – og så viser siden kun de pakker, der indeholder dem alle.

Projektet er mit **1. semesterprojekt på PBA i Webudvikling** fra 2013 og ligger her som et stykke historik. Koden er bevaret, som den blev afleveret (med let oprydning), så den afspejler, hvad jeg kunne dengang – ikke hvordan jeg ville bygge den i dag.

## Funktioner

- **Område-søgning** med autocomplete på 592 danske postnumre og bynavne (efter 3 tegn).
- **Kanalvælger** med logoer, opdelt i danske og udenlandske kanaler (41 kanaler i alt).
- **Kanalsøgning** med autocomplete (efter 2 tegn), som alternativ til at klikke på logoerne.
- **Live filtrering** af tv-pakker: tabellen viser kun pakker, der indeholder _alle_ valgte kanaler.
- **Valgte kanaler som "chips"**, der kan fjernes igen med et klik.
- **Notifikationer** (bootstrap-growl) ved tilføjelse, dubletter, maks. 5 kanaler og tomme resultater.
- **Responsivt layout**: antallet af viste kanallogoer tilpasses skærmbredden, og mindre vigtige kolonner skjules på små skærme.

## Teknologi

Ren HTML, CSS og JavaScript – intet build-step, ingen backend.

| Bibliotek                                                          | Version | Bruges til                       |
| ------------------------------------------------------------------ | ------- | -------------------------------- |
| [jQuery](https://jquery.com/)                                      | 1.10.2  | DOM, events og `$.getJSON`       |
| [jQuery UI](https://jqueryui.com/)                                 | 1.10.3  | Autocomplete                     |
| [Bootstrap](https://getbootstrap.com/docs/3.3/)                    | 3.0.2   | Grid, komponenter og Glyphicons  |
| [bootstrap-growl](https://github.com/ifightcrime/bootstrap-growl) | –       | Toast-notifikationer             |

Alle biblioteker ligger lokalt i `js/` og `css/`.

## Kom i gang

Siden henter sine data med `$.getJSON`, så den skal serveres over HTTP – åbner du `index.html` direkte fra filsystemet, blokerer de fleste browsere JSON-filerne.

```bash
git clone https://github.com/cederdorff/easy-tv.git
cd easy-tv

# vælg én:
python3 -m http.server 8000
npx serve .
```

Åbn derefter <http://localhost:8000> (eller den adresse, `serve` skriver). I VS Code virker udvidelsen _Live Server_ også.

## Projektstruktur

```
easy-tv/
├── index.html          # Hele siden: område, kanalvælger og pakketabel
├── css/
│   ├── bootstrap.css
│   └── custom.css      # Easy TV's eget design
├── js/
│   ├── functions.js    # Al applikationslogik
│   └── ...             # jQuery, jQuery UI, Bootstrap, bootstrap-growl
├── json/
│   ├── kanaler.json    # Kanaler: navn, id, logo, HD, sprog, beskrivelse
│   ├── pakker.json     # Tv-pakker: udbyder, pris, mindstepris, bredbånd, kanaler
│   └── postnumre.json  # Danske postnumre (fra geo.oiorest.dk)
├── img/                # Kanal- og udbyderlogoer
└── fonts/              # Glyphicons
```

## Sådan virker det

Al logik ligger i [js/functions.js](js/functions.js):

1. Ved `document.ready` indlæses de tre JSON-filer, og autocomplete sættes op på område- og kanalfelterne.
2. Kanalknapperne renderes i to kolonner. Ved `resize` renderes de igen, så rækkerne altid er lige lange (`calculateLimit()`).
3. Når en kanal vælges (klik eller søgning), lægges den i `selectedChannels`, og `filterPackages()` kører.
4. `filterPackages()` gennemløber alle pakker og beholder kun dem, hvor hver valgt kanal findes i pakkens kanalliste. Resultatet skrives ind i tabellen.

Data er dummy-data fra 2013 med tre udbydere (Fullrate, Waoo! og YouSee) og syv pakker – priser og kanaludbud er ikke opdaterede.

## Kendte begrænsninger

Det er et semesterprojekt, og nogle ting nåede aldrig at blive færdige:

- **Området bruges ikke** til at filtrere pakkerne – det vises kun i søgeresultatet.
- **Rækkerne i pakketabellen** kan foldes ud, men indeholder kun pladsholderen "Mere info".
- **Footer-links** (Om Easy TV, Hjælp, Kontakt) går ingen steder hen.
- **Kanalmatchning** sker på kanalnavn, men nogle pakker refererer til `dr1`/`dr2` med småt, så DR1 og DR2 giver ikke altid det forventede resultat.
- **Udbydernavn** læses fra `navn` i koden, mens JSON-filen bruger `udbyder`, så logoernes `alt`-tekst er tom.
- Kanalvælgeren viser højst 20 kanaler pr. kolonne – resten kan kun findes via søgefeltet.

## Forfatter

**Rasmus Cederdorff** – udviklet som 1. semesterprojekt på PBA i Webudvikling, 2013.
