# Viikon liikuntaseuranta

JavaScript-kurssin projektityö (vaihtoehto 2: Smart Form). Selaimessa toimiva sovellus, jolla seurataan viikon liikuntasuorituksia.

- **Tekijä:** Joona Jehkonen
- **Julkaistu sovellus:** https://jehkis.github.io/liikuntaseuranta/
- **Esitysvideo:** TODO: lisää linkki, kun video on valmis

## Suunnitelma

Sovelluksen idea on yksinkertainen: käyttäjä kirjaa lomakkeella, minä päivänä ja mitä lajia hän harrasti ja kuinka kauan. Sovellus näyttää kirjaukset listana ja laskee niistä yhteenvedon.

Sivulla on kolme osaa:

1. **Lomake** – päivä, laji, kesto tunteina ja vapaaehtoinen fiilis (vapaa teksti).
2. **Yhteenveto** – tunnit ja kilometrit yhteensä, tunnit ja prosenttiosuudet lajeittain sekä pylväskaavio viikonpäivistä.
3. **Viikon suoritukset** – lista kirjauksista, joista jokaisen voi poistaa.
4. **Aiemmat viikot** – päättyneiden viikkojen yhteenvedot.

### Rautalankakaavio

```
+---------------------------------------------------------------+
|  Viikon liikuntaseuranta                                      |
|  Kirjaa viikon liikuntasuoritukset ...                        |
+---------------------+-----------------------------------------+
|  Lisää suoritus     |  Yhteenveto                             |
|                     |  3 h  yhteensä, 3 suoritusta            |
|  Päivä   [ v ]      |                                         |
|  Laji    [ v ]      |  LAJEITTAIN                             |
|  (lajin lisäkenttä) |  Juoksu      1,5 h · 50 %  [=====    ]  |
|  Kesto   [    ]     |  Uinti       0,5 h · 17 %  [==       ]  |
|  Fiilis  [    ]     |                                         |
|                     |  PÄIVITTÄIN                             |
|  [ Lisää suoritus ] |  █  _  ▄  _  _  _  _                    |
|                     |  Ma Ti Ke To Pe La Su                   |
|                     +-----------------------------------------+
|                     |  Viikon suoritukset   [Tyhjennä viikko] |
|                     |  Ma  Juoksu / Lenkki        1,5 h   x   |
|                     |  Ke  Sulkapallo             1 h     x   |
+---------------------+-----------------------------------------+
```

Kapealla näytöllä (puhelin) osiot asettuvat allekkain.

## Tietoa sovelluksesta

### Ominaisuudet

- Suorituksen lisääminen lomakkeella: päivä ja laji alasvetovalikoista, kesto tunteina, vapaamuotoinen fiilis-teksti.
- Lomake mukautuu valittuun lajiin, ja lisäkentät ovat muuten piilossa:
  - **Juoksu, kävely, pyöräily, uinti:** esiin tulee Kilometrit-kenttä.
  - **Kuntosali:** esiin tulee Treeni-valikko (esim. yläkroppa, alakroppa, rinta).
  - **Muu laji:** esiin tulee tekstikenttä oman lajin nimelle.
  - **Lepopäivä:** kesto-kenttä piilotetaan. Lepopäivää ei lasketa tunteihin, mutta se näkyy listassa ja päiväkaaviossa.
- Yhteenveto: tunnit ja kilometrit yhteensä, tunnit, prosenttiosuudet ja kilometrit lajeittain sekä tunnit viikonpäivittäin.
- Visualisointi: vaakapalkit lajeille ja pylväskaavio viikonpäiville (tehty CSS:llä, ei kirjastoja).
- Yksittäisen suorituksen poisto ja koko viikon tyhjennys (varmistetaan käyttäjältä).
- **Aloita uusi viikko** -painike tallentaa viikon yhteenvedon (tunnit, kilometrit, suoritusten ja lepopäivien määrä) Aiemmat viikot -listaan ja tyhjentää suoritukset. Aiemman viikon saa auki napsauttamalla sen riviä (rivi korostuu, kun hiiri on sen päällä): sivun yhteenveto, kaaviot ja lista näyttävät silloin sen viikon tiedot, ja lomakkeen yläpuolella on paluupainike nykyiseen viikkoon. Avattua viikkoa voi muokata jälkikäteen: suorituksia voi lisätä ja poistaa, ja viikon yhteenveto päivittyy. Viikon voi myös poistaa listasta.
- Tiedot tallentuvat selaimen `localStorage`en, joten ne säilyvät sivun uudelleenlatauksen yli.
- Osiot näytetään vain tarvittaessa: yhteenveto ja painikkeet, kun viikolla on suorituksia, ja Aiemmat viikot, kun historiaa on. Tyhjälle listalle näytetään ohjeteksti.
- Responsiivinen ulkoasu ja tumma teema laitteen asetuksen mukaan.

### Syötteen tarkistus

Virheellinen kenttä saa punaisen reunuksen ja sen alle tulee virheilmoitus. Ilmoitus poistuu, kun kenttää muokataan.

| Kenttä | Tarkistus |
| --- | --- |
| Päivä | Pitää olla valittu. Lepopäiväksi merkitylle päivälle ei voi lisätä suoritusta |
| Laji | Pitää olla valittu. Lepopäivää ei voi lisätä päivälle, jolla on jo suorituksia tai lepopäivä |
| Mikä laji? | Pakollinen, jos laji on "Muu laji"; vähintään 3 merkkiä |
| Treeni | Pakollinen, jos laji on "Kuntosali" |
| Kilometrit | Vapaaehtoinen; jos täytetään, luku joka on suurempi kuin 0 ja enintään 1000 |
| Kesto | Ei kysytä lepopäivältä. Pitää olla luku, suurempi kuin 0 ja enintään 24. Saman päivän suoritukset yhteensä eivät saa ylittää 24 tuntia |
| Fiilis | Vapaaehtoinen; jos täytetään, vähintään 3 merkkiä |

### Tekniikat ja tiedostot

Sovellus on tehty pelkällä HTML:llä, CSS:llä ja natiivilla JavaScriptillä ilman ulkoisia kirjastoja.

```
index.html      sivun rakenne ja lomake
css/style.css   ulkoasu
js/script.js    sovelluksen logiikka
```

`script.js` toimii niin, että kaikki suoritukset ovat `entries`-taulukossa. Aina kun taulukko muuttuu (lisäys, poisto, tyhjennys), se tallennetaan `localStorage`en ja näkymä piirretään uudelleen `render()`-funktiolla.

## Tekoälyn käyttö

Sovelluksen koodi (HTML, CSS ja JavaScript) on tuotettu tekoälyllä (Claude Code, Anthropic). Annoin tekoälylle tehtävänannon ja kuvasin, millaisen sovelluksen halusin, ja ohjasin työtä palautteella. Omia ideoitani olivat esimerkiksi lajikohtaiset lisäkentät (kilometrit, kuntosalitreeni, oma laji), lepopäivä ja aiempien viikkojen tallentaminen.

Tekoälyä käytettiin:

- **koko koodin kirjoittamiseen**, koska halusin nähdä, millainen toimiva ja hyvin jäsennelty sovellus vaatimuksista syntyy
- **README:n rungon kirjoittamiseen** (suunnitelma, rautalankakaavio, ominaisuudet ja tarkistukset)
- **koodin selittämiseen**: kävin `script.js`:n läpi osa kerrallaan tekoälyn kanssa, jotta ymmärrän sen ja osaan selittää sen esitysvideolla.

Testasin sovelluksen itse selaimessa ja selaimen kehitystyökaluilla (Elements, Console, Application → Local Storage).

## Itsearviointi

**Mikä onnistui hyvin?** Sovellus täyttää tehtävänannon vaatimukset: syötteet tarkistetaan (tyhjät, liian lyhyet, negatiiviset ja liian suuret arvot), virheellinen kenttä saa punaisen reunuksen ja virheilmoituksen, tiedot tallentuvat `localStorage`en ja yhteenveto näyttää tunnit yhteensä, lajeittain ja prosentteina. Lisäksi mukana on valinnaisia ominaisuuksia: alasvetovalikot, lajin mukaan näkyvät ja piilotettavat kentät, kaaviot ilman kirjastoja ja aiempien viikkojen historia. Sovellus on julkaistu GitHub Pagesissa ja toimii myös puhelimella.

**Mikä oli vaikeaa ja mitä opin?** Koska koodi tehtiin tekoälyllä, suurin työ oli ymmärtää valmis, melko laaja koodi. Opin, miten lomakkeen arvot luetaan ja tarkistetaan, miksi tieto pitää muuttaa `JSON.stringify`:llä tekstiksi ennen `localStorage`en tallentamista ja miten koko näkymä piirretään uudelleen yhdestä taulukosta (`render()`). Vaikeinta oli seurata lepopäivän ja aiempien viikkojen logiikkaa, koska ne vaikuttavat moneen kohtaan koodissa.

**Mitä parantaisin?** Kirjoittaisin seuraavaksi enemmän koodia itse, jotta oma osaaminen kehittyisi. Ominaisuuksista lisäisin suorituksen muokkaamisen, vedä ja pudota -järjestämisen ja viikkojen vertailun kaaviona.

**Pistearvio: 8/10.** Tekniset kriteerit (toimivuus, kommentit, ulkoasu, GitHub, README ja julkaisu) täyttyvät. Vähennän arviosta, koska koodi on pääosin tekoälyn kirjoittamaa ja oma osuuteni on suunnittelua, ohjaamista, testaamista ja koodin ymmärtämistä.

## Lähteet

Sovelluksessa käytettyjen tekniikoiden dokumentaatio ja kurssin materiaali:

- Laurea-ammattikorkeakoulu. Web Development 1 -kurssin työpajamateriaalit (WS04 DOM, WS05 Forms and localStorage). Viitattu 19.10.2026. https://github.com/juhkast/laurea-web-development-1
- MDN Web Docs. Window: localStorage property. Viitattu 19.10.2026. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- MDN Web Docs. JSON.stringify(). Viitattu 19.10.2026. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
- MDN Web Docs. Client-side form validation. Viitattu 19.10.2026. https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
- MDN Web Docs. Element: classList property. Viitattu 19.10.2026. https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
- MDN Web Docs. Document: createElement() method. Viitattu 19.10.2026. https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
- MDN Web Docs. aria-invalid. Viitattu 19.10.2026. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid
- MDN Web Docs. prefers-color-scheme. Viitattu 19.10.2026. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- Anthropic. Claude Code. Käytetty koodin tuottamiseen ja selittämiseen syys–lokakuussa 2026. https://claude.com/claude-code
