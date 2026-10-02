# Viikon liikuntaseuranta

JavaScript-kurssin projektityö (vaihtoehto 2: Smart Form). Selaimessa toimiva sovellus, jolla seurataan viikon liikuntasuorituksia.

- **Tekijä:** TODO: nimi
- **Julkaistu sovellus:** https://jehkis.github.io/liikuntaseuranta/
- **Esitysvideo:** TODO: linkki videoon

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

TODO: tarkista ja täydennä omin sanoin.

Sovelluksen koodi (HTML, CSS ja JavaScript) sekä tämän README:n runko on tuotettu tekoälyn (Claude Code, Anthropic) avulla tehtävänannon pohjalta. Tekoälyä käytettiin myös sovelluksen testaamiseen. Kävin koodin läpi ja ...

## Itsearviointi

TODO: kirjoita oma arvio, esim.

- Mikä onnistui hyvin?
- Mikä oli vaikeaa ja mitä opin?
- Mitä parantaisin tai lisäisin seuraavaksi?
- Oma pistearvio (0–10) arviointikriteerien perusteella.

## Lähteet

TODO: lisää käyttämäsi lähteet Laurean viittausohjeiden mukaisesti, esim.

- MDN Web Docs. Window: localStorage property. Viitattu pp.kk.vvvv. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
