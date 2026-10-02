// ============================================================
// Viikon liikuntaseuranta
// Lomakkeella lisätään suorituksia, jotka tallennetaan selaimen
// localStorageen. Sivu näyttää listan ja yhteenvedon tunneista.
// ============================================================


// ---------- VAKIOT ----------

// Viikonpäivien nimet. Merkintään tallennetaan päivän indeksi (0 = maanantai).
const DAYS = ["Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai"];
const DAYS_SHORT = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

// Avain, jolla tiedot löytyvät localStoragesta
const STORAGE_KEY = "liikuntaseuranta-merkinnat";

// Aiempien viikkojen yhteenvedot tallennetaan omalla avaimellaan
const HISTORY_KEY = "liikuntaseuranta-historia";

// Yhdelle päivälle ei voi kirjata enempää tunteja kuin vuorokaudessa on
const MAX_HOURS_PER_DAY = 24;

// Lajit, joissa liikutaan matkaa. Näille näytetään Kilometrit-kenttä.
const DISTANCE_CATEGORIES = ["Juoksu", "Kävely", "Pyöräily", "Uinti"];

// Lepopäivä on valikossa lajien joukossa, mutta sille ei kirjata kestoa
const REST_CATEGORY = "Lepopäivä";

// Suurin sallittu matka yhdelle suoritukselle (estää näppäilyvirheet)
const MAX_DISTANCE = 1000;


// ---------- HTML-ELEMENTIT ----------

const formCard = document.getElementById("form-card");
const formTitle = document.getElementById("form-title");
const form = document.getElementById("entry-form");

const viewingCard = document.getElementById("viewing-card");
const viewingTitle = document.getElementById("viewing-title");
const viewingText = document.getElementById("viewing-text");
const viewingNote = document.getElementById("viewing-note");
const backButton = document.getElementById("back-button");
const dayInput = document.getElementById("day");
const categoryInput = document.getElementById("category");
const customField = document.getElementById("custom-field");
const customInput = document.getElementById("custom");
const workoutField = document.getElementById("workout-field");
const workoutInput = document.getElementById("workout");
const distanceField = document.getElementById("distance-field");
const distanceInput = document.getElementById("distance");
const hoursField = document.getElementById("hours-field");
const hoursInput = document.getElementById("hours");
const descriptionInput = document.getElementById("description");

const summarySection = document.getElementById("summary");
const totalHours = document.getElementById("total-hours");
const totalLabel = document.getElementById("total-label");
const distanceTotal = document.getElementById("distance-total");
const totalDistance = document.getElementById("total-distance");
const categoryList = document.getElementById("category-list");
const dayChart = document.getElementById("day-chart");

const entriesTitle = document.getElementById("entries-title");
const entryList = document.getElementById("entry-list");
const emptyMessage = document.getElementById("empty-message");
const clearButton = document.getElementById("clear-button");
const newWeekButton = document.getElementById("new-week-button");

const historySection = document.getElementById("history");
const historyList = document.getElementById("history-list");


// ---------- SOVELLUKSEN TILA ----------

// Kaikki merkinnät ovat tässä taulukossa. Yksi merkintä on olio:
// { id, day, category, custom, workout, distance, hours, description }
let entries = loadList(STORAGE_KEY);

// Aiemmat viikot. Yhdestä viikosta tallennetaan yhteenveto ja sen suoritukset:
// { id, date, entries, hours, distance, workouts, restDays }
let weekHistory = loadList(HISTORY_KEY);

// Sen aiemman viikon id, joka on avattu tarkasteltavaksi (null = mikään ei ole auki)
let openWeekId = null;


// ---------- TALLENNUS (localStorage) ----------

// Lukee taulukon localStoragesta annetulla avaimella. Jos mitään ei ole
// tallennettu tai tieto on rikki, palautetaan tyhjä taulukko.
function loadList(key) {
    const saved = localStorage.getItem(key);

    if (saved === null) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log("Tallennettujen tietojen lukeminen epäonnistui:", error);
        return [];
    }
}

// Tallentaa merkinnät localStorageen. localStorage osaa tallentaa
// vain tekstiä, joten taulukko muutetaan JSON-muotoon.
function saveEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Tallentaa aiempien viikkojen yhteenvedot
function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(weekHistory));
}


// ---------- APUFUNKTIOT ----------

// Muotoilee tunnit suomalaisittain, esim. 1.5 -> "1,5 h"
function formatHours(hours) {
    return hours.toLocaleString("fi-FI", { maximumFractionDigits: 2 }) + " h";
}

// Muotoilee matkan samalla tavalla, esim. 5.2 -> "5,2 km"
function formatDistance(distance) {
    return distance.toLocaleString("fi-FI", { maximumFractionDigits: 2 }) + " km";
}

// Kertoo, kuuluuko laji niihin, joissa kirjataan kilometrit
function hasDistance(category) {
    return DISTANCE_CATEGORIES.includes(category);
}

// Laskee, kuinka monta tuntia yhdelle päivälle on jo kirjattu
function getDayTotal(day) {
    let total = 0;

    for (const entry of getShownEntries()) {
        if (entry.day === day) {
            total += entry.hours;
        }
    }

    return total;
}

// Palauttaa tarkasteltavaksi avatun aiemman viikon paikan weekHistory-taulukossa.
// Jos mikään aiempi viikko ei ole auki, palauttaa -1.
function getOpenWeekIndex() {
    return weekHistory.findIndex(function (week) {
        return week.id === openWeekId;
    });
}

// Palauttaa merkinnät, jotka sivulla näytetään: avatun aiemman viikon
// merkinnät tai muuten nykyisen viikon merkinnät
function getShownEntries() {
    const index = getOpenWeekIndex();

    if (index !== -1) {
        // Vanhimmista viikoista on tallennettu vain yhteenveto, ei suorituksia
        const saved = weekHistory[index].entries;
        return saved === undefined ? [] : saved;
    }

    return entries;
}

// Kertoo, voiko avattua aiempaa viikkoa muokata. Vanhimmista viikoista on
// tallennettu vain yhteenveto ilman suorituksia, joten niitä voi vain katsella.
function canEditOpenWeek() {
    const index = getOpenWeekIndex();

    return index !== -1 && weekHistory[index].entries !== undefined;
}

// Tallentaa muutokset oikeaan paikkaan: avattuun aiempaan viikkoon tai nykyiseen viikkoon
function saveChanges() {
    const index = getOpenWeekIndex();

    if (index !== -1) {
        // Viikon yhteenveto lasketaan uudelleen muuttuneista suorituksista
        updateWeekTotals(weekHistory[index]);
        saveHistory();
    } else {
        saveEntries();
    }
}

// Kertoo, onko merkintä lepopäivä
function isRest(entry) {
    return entry.category === REST_CATEGORY;
}

// Kertoo, onko päivä merkitty lepopäiväksi
function isRestDay(day) {
    return getShownEntries().some(function (entry) {
        return entry.day === day && isRest(entry);
    });
}

// Kertoo, onko päivälle kirjattu yhtään merkintää
function hasEntriesOnDay(day) {
    return getShownEntries().some(function (entry) {
        return entry.day === day;
    });
}

// Palauttaa merkinnän lajin nimen. "Muu"-lajilla näytetään käyttäjän oma nimi.
function getCategoryName(entry) {
    if (entry.category === "Muu") {
        return entry.custom;
    }

    return entry.category;
}

// Palauttaa merkinnän lisätiedon: kuntosalilla treenin, matkalajeilla kilometrit.
// Jos lisätietoa ei ole, palautetaan tyhjä teksti.
function getEntryDetail(entry) {
    if (entry.workout) {
        return entry.workout;
    }

    if (entry.distance > 0) {
        return formatDistance(entry.distance);
    }

    return "";
}


// ---------- VIRHEILMOITUKSET ----------

// Näyttää virheilmoituksen kentän alla ja korostaa kentän punaisella.
// Virhe-elementin id on aina kentän id + "-error".
function showError(input, message) {
    const errorElement = document.getElementById(input.id + "-error");

    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
}

// Poistaa kentän virheilmoituksen ja punaisen reunuksen
function clearError(input) {
    const errorElement = document.getElementById(input.id + "-error");

    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    errorElement.textContent = "";
}

const allInputs = [dayInput, categoryInput, customInput, workoutInput, distanceInput, hoursInput, descriptionInput];

function clearAllErrors() {
    for (const input of allInputs) {
        clearError(input);
    }
}


// ---------- LOMAKKEEN TARKISTUS ----------

// Tarkistaa lomakkeen kentät. Jos kaikki on kunnossa, palauttaa
// uuden merkinnän oliona. Jos jossain on virhe, palauttaa null.
function validateForm() {
    let isValid = true;

    clearAllErrors();

    // Päivä: pitää olla valittu
    const dayValue = dayInput.value;

    if (dayValue === "") {
        showError(dayInput, "Valitse päivä.");
        isValid = false;
    }

    // Laji: pitää olla valittu
    const category = categoryInput.value;

    if (category === "") {
        showError(categoryInput, "Valitse laji.");
        isValid = false;
    }

    // Lepopäivä ja suoritukset eivät sovi samalle päivälle.
    // Tarkistetaan vasta, kun sekä päivä että laji on valittu.
    const restSelected = category === REST_CATEGORY;

    if (dayValue !== "" && category !== "") {
        const day = Number(dayValue);

        if (restSelected && isRestDay(day)) {
            showError(categoryInput, DAYS[day] + " on jo merkitty lepopäiväksi.");
            isValid = false;
        } else if (restSelected && hasEntriesOnDay(day)) {
            showError(categoryInput, "Päivälle " + DAYS[day].toLowerCase() + " on jo kirjattu suorituksia, joten se ei voi olla lepopäivä.");
            isValid = false;
        } else if (!restSelected && isRestDay(day)) {
            showError(dayInput, DAYS[day] + " on merkitty lepopäiväksi. Poista lepopäivä ensin, jos haluat lisätä suorituksen.");
            isValid = false;
        }
    }

    // Oma laji: tarkistetaan vain, jos lajiksi on valittu "Muu"
    const custom = customInput.value.trim();

    if (category === "Muu") {
        if (custom === "") {
            showError(customInput, "Kirjoita lajin nimi.");
            isValid = false;
        } else if (custom.length < 3) {
            showError(customInput, "Lajin nimessä pitää olla vähintään 3 merkkiä.");
            isValid = false;
        }
    }

    // Treeni: pitää valita, jos lajiksi on valittu "Kuntosali"
    const workout = workoutInput.value;

    if (category === "Kuntosali" && workout === "") {
        showError(workoutInput, "Valitse treeni.");
        isValid = false;
    }

    // Kilometrit: vapaaehtoinen, tarkistetaan vain matkalajeilla.
    // badInput on true, jos number-kenttään on kirjoitettu jotain muuta kuin luku.
    const distanceValue = distanceInput.value.trim();
    const distance = Number(distanceValue);

    if (hasDistance(category)) {
        if (distanceInput.validity.badInput) {
            showError(distanceInput, "Syötä matka numerona, esim. 5,2.");
            isValid = false;
        } else if (distanceValue !== "" && distance <= 0) {
            showError(distanceInput, "Matkan täytyy olla suurempi kuin 0.");
            isValid = false;
        } else if (distance > MAX_DISTANCE) {
            showError(distanceInput, "Matka voi olla enintään " + MAX_DISTANCE + " km.");
            isValid = false;
        }
    }

    // Tunnit: pitää olla luku, joka on yli 0 ja mahtuu vuorokauteen.
    // Number-kenttä palauttaa tyhjän tekstin myös silloin, kun syöte ei ole luku.
    // Lepopäivällä kestoa ei kysytä, jolloin tunneiksi tallennetaan 0.
    const hoursValue = hoursInput.value.trim();
    const hours = Number(hoursValue);

    if (restSelected) {
        // ei tarkistettavaa
    } else if (hoursValue === "" || Number.isNaN(hours)) {
        showError(hoursInput, "Syötä kesto numerona, esim. 1,5.");
        isValid = false;
    } else if (hours <= 0) {
        showError(hoursInput, "Keston täytyy olla suurempi kuin 0.");
        isValid = false;
    } else if (hours > MAX_HOURS_PER_DAY) {
        showError(hoursInput, "Yhdessä päivässä on vain 24 tuntia.");
        isValid = false;
    } else if (dayValue !== "" && getDayTotal(Number(dayValue)) + hours > MAX_HOURS_PER_DAY) {
        // Saman päivän aiemmat merkinnät + uusi merkintä eivät saa ylittää 24 tuntia
        const dayName = DAYS[Number(dayValue)].toLowerCase();
        showError(hoursInput, "Päivälle " + dayName + " on jo kirjattu " + formatHours(getDayTotal(Number(dayValue))) + ". Päivän tunnit eivät voi ylittää 24 tuntia.");
        isValid = false;
    }

    // Fiilis: vapaaehtoinen, mutta jos jotain kirjoitetaan, vähintään 3 merkkiä
    const description = descriptionInput.value.trim();

    if (description !== "" && description.length < 3) {
        showError(descriptionInput, "Fiilis on liian lyhyt (vähintään 3 merkkiä).");
        isValid = false;
    }

    if (!isValid) {
        return null;
    }

    return {
        id: Date.now(), // aikaleima toimii yksilöllisenä tunnisteena
        day: Number(dayValue),
        category: category,
        custom: category === "Muu" ? custom : "",
        workout: category === "Kuntosali" ? workout : "",
        distance: hasDistance(category) ? distance : 0, // tyhjä kenttä -> 0
        hours: restSelected ? 0 : hours,
        description: description
    };
}


// ---------- MERKINTÖJEN LISTA ----------

// Piirtää merkintöjen listan uudelleen näytettävän viikon perusteella
function renderEntries() {
    // Tyhjennetään vanha lista
    entryList.innerHTML = "";

    const shown = getShownEntries();
    const isViewing = getOpenWeekIndex() !== -1;

    // Näytetään joko "ei suorituksia" -teksti tai painikkeet.
    // Uuden viikon aloitus ja tyhjennys koskevat vain nykyistä viikkoa.
    const hasEntries = shown.length > 0;
    emptyMessage.hidden = hasEntries;

    if (isViewing && !canEditOpenWeek()) {
        emptyMessage.textContent = "Tämän viikon yksittäisiä suorituksia ei ole tallennettu.";
    } else {
        emptyMessage.textContent = "Ei vielä suorituksia. Lisää ensimmäinen lomakkeella.";
    }
    clearButton.hidden = !hasEntries || isViewing;
    newWeekButton.hidden = !hasEntries || isViewing;

    for (const entry of sortEntries(shown)) {
        entryList.appendChild(createEntryElement(entry, true));
    }
}

// Palauttaa merkinnöistä järjestetyn kopion: ensin päivän, sitten lisäysajan mukaan
function sortEntries(list) {
    return list.slice().sort(function (a, b) {
        if (a.day !== b.day) {
            return a.day - b.day;
        }
        return a.id - b.id;
    });
}

// Luo yhden merkinnän <li>-elementin. Teksti lisätään textContentilla,
// jolloin käyttäjän kirjoittama teksti ei voi sisältää HTML-koodia.
// canDelete kertoo, lisätäänkö riville poistopainike.
function createEntryElement(entry, canDelete) {
    const item = document.createElement("li");
    item.className = "entry";

    const day = document.createElement("span");
    day.className = "entry-day";
    day.textContent = DAYS_SHORT[entry.day];
    day.title = DAYS[entry.day];

    const text = document.createElement("div");
    text.className = "entry-text";

    const name = document.createElement("span");
    name.className = "entry-name";
    name.textContent = getCategoryName(entry);
    text.appendChild(name);

    // Treeni tai kilometrit näytetään lajin nimen perässä
    const detailText = getEntryDetail(entry);

    if (detailText !== "") {
        const detail = document.createElement("span");
        detail.className = "entry-detail";
        detail.textContent = " · " + detailText;
        name.appendChild(detail);
    }

    if (entry.description !== "") {
        const description = document.createElement("span");
        description.className = "entry-description";
        description.textContent = entry.description;
        text.appendChild(description);
    }

    const hours = document.createElement("span");
    hours.className = "entry-hours";
    hours.textContent = isRest(entry) ? "" : formatHours(entry.hours); // lepopäivällä ei ole kestoa

    item.appendChild(day);
    item.appendChild(text);
    item.appendChild(hours);

    if (canDelete) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Poista suoritus: " + getCategoryName(entry) + ", " + DAYS[entry.day]);
        deleteButton.addEventListener("click", function () {
            deleteEntry(entry.id);
        });
        item.appendChild(deleteButton);
    }

    return item;
}


// ---------- YHTEENVETO ----------

// Laskee ja piirtää yhteenvedon: tunnit yhteensä, lajeittain ja päivittäin
function renderSummary() {
    const shown = getShownEntries();

    // Yhteenveto piilotetaan kokonaan, jos merkintöjä ei ole
    if (shown.length === 0) {
        summarySection.hidden = true;
        return;
    }

    summarySection.hidden = false;

    // Lasketaan summat yhdellä läpikäynnillä
    let total = 0;
    let distanceSum = 0;
    const categoryTotals = {};            // esim. { Juoksu: 2.5, Uinti: 1 }
    const categoryDistances = {};         // esim. { Juoksu: 12.4 }
    const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // indeksi 0 = maanantai
    const restDays = [];                  // lepopäivien indeksit, esim. [2, 6]

    for (const entry of shown) {
        // Lepopäivä ei ole suoritus, joten sitä ei lasketa tunteihin eikä lajeihin
        if (isRest(entry)) {
            restDays.push(entry.day);
            continue;
        }

        total += entry.hours;
        dayTotals[entry.day] += entry.hours;

        if (categoryTotals[entry.category] === undefined) {
            categoryTotals[entry.category] = 0;
            categoryDistances[entry.category] = 0;
        }
        categoryTotals[entry.category] += entry.hours;

        // Vanhoissa merkinnöissä ei ole matkaa, joten lasketaan vain yli 0:n arvot
        if (entry.distance > 0) {
            categoryDistances[entry.category] += entry.distance;
            distanceSum += entry.distance;
        }
    }

    // Kokonaismäärä
    totalHours.textContent = formatHours(total);
    const workoutCount = shown.length - restDays.length;
    totalLabel.textContent = "yhteensä, " + workoutCount + (workoutCount === 1 ? " suoritus" : " suoritusta");

    if (restDays.length > 0) {
        totalLabel.textContent += " ja " + restDays.length + (restDays.length === 1 ? " lepopäivä" : " lepopäivää");
    }

    // Kilometrit yhteensä: piilotetaan, jos matkaa ei ole kirjattu lainkaan
    distanceTotal.hidden = distanceSum === 0;
    totalDistance.textContent = formatDistance(distanceSum);

    renderCategories(categoryTotals, categoryDistances, total);
    renderDayChart(dayTotals, restDays);
}

// Piirtää lajikohtaiset tunnit, prosenttiosuudet, kilometrit ja palkit
function renderCategories(categoryTotals, categoryDistances, total) {
    categoryList.innerHTML = "";

    // Lajit suurimmasta pienimpään
    const names = Object.keys(categoryTotals).sort(function (a, b) {
        return categoryTotals[b] - categoryTotals[a];
    });

    for (const name of names) {
        const hours = categoryTotals[name];
        const percent = Math.round(hours / total * 100);

        const item = document.createElement("li");
        item.className = "category";

        const label = document.createElement("span");
        label.className = "category-name";
        label.textContent = name === "Muu" ? "Muut lajit" : name;

        const value = document.createElement("span");
        value.className = "category-value";
        value.textContent = formatHours(hours) + " · " + percent + " %";

        // Kilometrit näytetään, jos lajille on kirjattu matkaa
        if (categoryDistances[name] > 0) {
            value.textContent += " · " + formatDistance(categoryDistances[name]);
        }

        // Palkin leveys on lajin prosenttiosuus kaikista tunneista
        const bar = document.createElement("div");
        bar.className = "bar";

        const fill = document.createElement("div");
        fill.className = "bar-fill";
        fill.style.width = percent + "%";
        bar.appendChild(fill);

        item.appendChild(label);
        item.appendChild(value);
        item.appendChild(bar);
        categoryList.appendChild(item);
    }
}

// Piirtää pylväskaavion viikonpäivistä. Korkein pylväs on päivä,
// jolla on eniten tunteja, ja muut suhteutetaan siihen.
// Lepopäivän kohdalla lukee "Lepo".
function renderDayChart(dayTotals, restDays) {
    dayChart.innerHTML = "";

    const highest = Math.max(...dayTotals);

    for (let day = 0; day < DAYS.length; day++) {
        const hours = dayTotals[day];

        const column = document.createElement("div");
        column.className = "day-column";

        const value = document.createElement("span");
        value.className = "day-value";

        if (restDays.includes(day)) {
            value.textContent = "Lepo";
        } else if (hours > 0) {
            value.textContent = formatHours(hours);
        }

        const track = document.createElement("div");
        track.className = "day-track";

        const fill = document.createElement("div");
        fill.className = "day-fill";
        // Jos tunteja ei ole yhtään (pelkkiä lepopäiviä), pylväät jäävät tyhjiksi
        fill.style.height = (highest > 0 ? hours / highest * 100 : 0) + "%";
        track.appendChild(fill);

        const label = document.createElement("span");
        label.className = "day-label";
        label.textContent = DAYS_SHORT[day];

        column.appendChild(value);
        column.appendChild(track);
        column.appendChild(label);
        dayChart.appendChild(column);
    }
}


// ---------- TOIMINNOT ----------

// ---------- AIEMMAT VIIKOT ----------

// Muotoilee määrän ja oikean sanamuodon, esim. "1 suoritus" tai "3 suoritusta"
function formatCount(count, singular, plural) {
    return count + " " + (count === 1 ? singular : plural);
}

// Luo nykyisestä viikosta historiaan tallennettavan olion
function createWeek() {
    const week = {
        id: Date.now(),
        date: new Date().toLocaleDateString("fi-FI"), // esim. "2.10.2026"
        entries: entries // viikon suoritukset talteen, jotta viikkoa voi tarkastella ja muokata
    };

    updateWeekTotals(week);

    return week;
}

// Laskee viikon yhteenvedon (tunnit, kilometrit, määrät) sen suorituksista.
// Kutsutaan, kun viikko tallennetaan ja aina, kun sen suorituksia muokataan.
function updateWeekTotals(week) {
    week.hours = 0;
    week.distance = 0;
    week.workouts = 0;
    week.restDays = 0;

    for (const entry of week.entries) {
        if (isRest(entry)) {
            week.restDays += 1;
            continue;
        }

        week.workouts += 1;
        week.hours += entry.hours;

        if (entry.distance > 0) {
            week.distance += entry.distance;
        }
    }
}

// Piirtää aiempien viikkojen listan, uusin viikko ylimpänä
function renderHistory() {
    historyList.innerHTML = "";

    // Koko osio piilotetaan, jos aiempia viikkoja ei ole
    historySection.hidden = weekHistory.length === 0;

    for (let i = weekHistory.length - 1; i >= 0; i--) {
        historyList.appendChild(createWeekElement(weekHistory[i], i + 1));
    }
}

// Luo yhden aiemman viikon <li>-elementin. Koko viikon rivi on painike:
// sitä napsauttamalla viikko avautuu tarkasteltavaksi (tai sulkeutuu).
function createWeekElement(week, number) {
    const isOpen = week.id === openWeekId;

    const item = document.createElement("li");
    item.className = isOpen ? "week week-open" : "week";

    // Rivi on <button>, jotta sen voi avata myös näppäimistöllä
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "week-button";
    openButton.title = isOpen ? "Sulje viikko ja palaa nykyiseen viikkoon" : "Avaa viikko";
    openButton.addEventListener("click", function () {
        toggleWeek(week.id);
    });

    const text = document.createElement("span");
    text.className = "entry-text";

    const name = document.createElement("span");
    name.className = "entry-name";
    name.textContent = "Viikko " + number + (isOpen ? " (avattu)" : "");

    const details = document.createElement("span");
    details.className = "entry-description";
    details.textContent = "Tallennettu " + week.date + " · " + formatCount(week.workouts, "suoritus", "suoritusta");

    if (week.restDays > 0) {
        details.textContent += " · " + formatCount(week.restDays, "lepopäivä", "lepopäivää");
    }

    text.appendChild(name);
    text.appendChild(details);

    const totals = document.createElement("span");
    totals.className = "entry-hours";
    totals.textContent = formatHours(week.hours);

    if (week.distance > 0) {
        totals.textContent += " · " + formatDistance(week.distance);
    }

    openButton.appendChild(text);
    openButton.appendChild(totals);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Poista viikko " + number + " historiasta");
    deleteButton.addEventListener("click", function () {
        deleteWeek(week.id);
    });

    item.appendChild(openButton);
    item.appendChild(deleteButton);

    return item;
}

// Avaa aiemman viikon tarkasteltavaksi tai sulkee sen, jos se oli jo auki.
// Koko näkymä piirretään uudelleen, koska yhteenveto ja lista vaihtuvat.
function toggleWeek(id) {
    openWeekId = openWeekId === id ? null : id;
    clearAllErrors();
    render();

    // Avattu viikko näkyy sivun yläosassa, joten vieritetään sinne
    window.scrollTo(0, 0);
}

// Näyttää lomakkeen yläpuolella tiedon siitä, mitä aiempaa viikkoa muokataan
function renderViewing() {
    const index = getOpenWeekIndex();
    const isViewing = index !== -1;
    const number = index + 1;

    viewingCard.hidden = !isViewing;

    // Lomake piilotetaan vain, jos avattua viikkoa ei voi muokata
    formCard.hidden = isViewing && !canEditOpenWeek();

    if (isViewing) {
        viewingTitle.textContent = "Viikko " + number;
        viewingText.textContent = "Tarkastelet aiempaa viikkoa, joka tallennettiin " + weekHistory[index].date + ".";

        if (canEditOpenWeek()) {
            viewingNote.textContent = "Voit lisätä ja poistaa suorituksia. Muutokset tallentuvat tähän viikkoon.";
        } else {
            viewingNote.textContent = "Tästä viikosta on tallennettu vain yhteenveto, joten sitä ei voi muokata.";
        }
    }

    // Otsikot kertovat, mitä viikkoa lomake ja lista koskevat
    formTitle.textContent = isViewing ? "Lisää suoritus viikolle " + number : "Lisää suoritus";
    entriesTitle.textContent = isViewing ? "Viikon " + number + " suoritukset" : "Viikon suoritukset";
}

// Poistaa yhden viikon historiasta id:n perusteella
function deleteWeek(id) {
    weekHistory = weekHistory.filter(function (week) {
        return week.id !== id;
    });

    // Jos poistettu viikko oli auki, palataan nykyiseen viikkoon
    if (id === openWeekId) {
        openWeekId = null;
    }

    saveHistory();
    render();
}

// Aloittaa uuden viikon: tämän viikon yhteenveto siirretään historiaan
// ja merkinnät tyhjennetään
function startNewWeek() {
    weekHistory.push(createWeek());
    saveHistory();

    entries = [];
    saveEntries();

    clearAllErrors();
    render();
}


// Päivittää koko näkymän. Kutsutaan aina, kun tiedot tai tarkasteltava viikko muuttuu.
function render() {
    renderEntries();
    renderSummary();
    renderHistory();
    renderViewing();
}

// Poistaa yhden merkinnän id:n perusteella näytettävältä viikolta
function deleteEntry(id) {
    const index = getOpenWeekIndex();

    function isOtherEntry(entry) {
        return entry.id !== id;
    }

    if (index !== -1) {
        weekHistory[index].entries = weekHistory[index].entries.filter(isOtherEntry);
    } else {
        entries = entries.filter(isOtherEntry);
    }

    saveChanges();
    render();
}

// Näyttää tai piilottaa yhden lisäkentän. Piilotettaessa kentän
// arvo ja virheilmoitus tyhjennetään.
function toggleField(field, input, isVisible) {
    field.hidden = !isVisible;

    if (!isVisible) {
        input.value = "";
        clearError(input);
    }
}

// Näyttää valitun lajin mukaiset lisäkentät:
// "Muu" -> lajin nimi, "Kuntosali" -> treeni, matkalajit -> kilometrit.
// Lepopäivällä piilotetaan kesto.
function updateExtraFields() {
    const category = categoryInput.value;

    toggleField(customField, customInput, category === "Muu");
    toggleField(workoutField, workoutInput, category === "Kuntosali");
    toggleField(distanceField, distanceInput, hasDistance(category));
    toggleField(hoursField, hoursInput, category !== REST_CATEGORY);
}


// ---------- TAPAHTUMANKÄSITTELIJÄT ----------

// Lomakkeen lähetys: tarkistetaan syöte ja lisätään merkintä
form.addEventListener("submit", function (event) {
    // Estetään sivun uudelleenlataus, joka on lomakkeen oletustoiminto
    event.preventDefault();

    const newEntry = validateForm();

    if (newEntry === null) {
        // Viedään kohdistus ensimmäiseen virheelliseen kenttään
        form.querySelector(".invalid").focus();
        return;
    }

    // Merkintä lisätään näytettävälle viikolle: avatulle aiemmalle tai nykyiselle
    getShownEntries().push(newEntry);
    saveChanges();
    render();

    // Tyhjennetään lomake seuraavaa merkintää varten
    form.reset();
    updateExtraFields();
    dayInput.focus();
});

// Lajin vaihtuessa näytetään tai piilotetaan lajin lisäkentät
categoryInput.addEventListener("change", updateExtraFields);

// Kun käyttäjä korjaa kenttää, sen virheilmoitus poistetaan heti
for (const input of allInputs) {
    input.addEventListener("input", function () {
        clearError(input);
    });
}

// Uuden viikon aloitus varmistetaan käyttäjältä ensin
newWeekButton.addEventListener("click", function () {
    const confirmed = confirm("Aloitetaanko uusi viikko? Tämän viikon yhteenveto tallennetaan kohtaan Aiemmat viikot ja suoritukset tyhjennetään.");

    if (confirmed) {
        startNewWeek();
    }
});

// Paluu aiemman viikon tarkastelusta nykyiseen viikkoon
backButton.addEventListener("click", function () {
    openWeekId = null;
    clearAllErrors();
    render();
});

// Koko viikon tyhjennys varmistetaan käyttäjältä ensin
clearButton.addEventListener("click", function () {
    const confirmed = confirm("Haluatko varmasti poistaa kaikki viikon suoritukset?");

    if (confirmed) {
        entries = [];
        saveEntries();
        render();
    }
});


// ---------- KÄYNNISTYS ----------

// Piirretään tallennetut merkinnät, kun sivu avataan
render();
