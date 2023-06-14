const url = 'https://api.ipify.org?format=json';
const KEY = '051990c5-e79f-432b-a0a1-3aac77bbacdd';

async function getIp() {
    let data = await fetch(url);
    return await data.json();
}

async function getLoc(){
    const ip = await getIp();
    console.log(ip);
    const loc = await fetch(`https://ipfind.co/?ip=${ip.ip}&auth=${KEY}`);
    return await loc.json();
}
async function changeLocation() {
    console.log('clicked')
    const location = await getLoc();
    console.log(location);
    lat = location.latitude;
    lon = location.longitude;
    main();
}

const detectLocBtn = document.getElementById('detect-location-btn');
detectLocBtn.onclick = () => {
    changeLocation();
    detectLocBtn.disabled = true;
    setTimeout(() => {detectLocBtn.disabled = false}, 3000);
}
detectLocBtn.click();
const countryInput = document.getElementById('country-input');
const stateInput = document.getElementById('state-input');
const countryAutoComplete = document.getElementById('country-auto-complete');
const stateAutoComplete = document.getElementById('state-auto-complete');
let countryChanged = true;
let CountriesInfos = []


async function loadAllCountries(){
    CountriesInfos = await (await fetch('./js/states.json')).json();
}
loadAllCountries();


function showCountries(val) {
    countryChanged = true;
    states = [];
    if (val.trim() === "") {
        countryAutoComplete.style.display = 'none';
        return;
    } 
    const ctrs = countries.filter((elem) => elem.toLowerCase().includes(val.toLowerCase()));
    countryAutoComplete.innerHTML = "";
    const len = ctrs.length;
    if (len !== 0) {
        countryAutoComplete.style.display = 'block';
        let i = 0;
        while (i < 5 && i < len) {
            newLi = document.createElement('li');
            newLi.innerText = ctrs[i];
            newLi.addEventListener('click',(ev) => {
                countryInput.value= ev.target.innerText;
                countryAutoComplete.style.display = 'none';
            });
            countryAutoComplete.appendChild(newLi);
            i += 1;
        }
    }
    else {
        countryAutoComplete.style.display = 'none';
    }
}
countryInput.addEventListener('input', (ev) => {
    const val = ev.target.value;
    showCountries(val);
});

let states = [];
function searchCountryStates(ctr, begin=0, end=CountriesInfos.length-1) {
    // i'll use binary search since the coutries are ordered
    if (begin > end) return [];

    const mid = Math.round((begin + end) / 2);
    const c = CountriesInfos[mid].name.toLowerCase();

    if (c === ctr )return CountriesInfos[mid].states;
    else if (c > ctr) return searchCountryStates(ctr, begin, mid-1);
    else return searchCountryStates(ctr, mid+1, end);
}
async function showStates(val) {
    const country = countryInput.value;
    if (val === "" || country.trim === "" || !countries.includes(country)){ 
        stateAutoComplete.style.display = 'none';
        return;
    }
    console.log(countryChanged)
    if (countryChanged) {
        states = await searchCountryStates(country.toLowerCase());
        countryChanged = false;
    }
    let sts = [];
    for (i in states) {
        if (states[i].name.toLowerCase().includes(val)){
            sts.push(states[i].name);
            if (sts.lenght > 4) break;
        }
    }
    stateAutoComplete.innerHTML = "";
    const len = sts.length;
    if (len !== 0) {
        stateAutoComplete.style.display = 'block';
        for (i in sts) {
            newLi = document.createElement('li');
            newLi.innerText = sts[i];
            newLi.addEventListener('click',(ev) => {
                stateInput.value= ev.target.innerText;
                stateAutoComplete.style.display = 'none';
                console.log(sts[i])
            });
            stateAutoComplete.appendChild(newLi);
        }
    }
    else stateAutoComplete.style.display = 'none';

    console.log('im here yuo');
    console.log(country)
    console.log(states)
}

function searchCountry(c, begin=0, end=countries.length - 1) {
    if (begin > end) return false;

    const mid = Math.round((begin + end) / 2);

    if (countries[mid].toLocaleLowerCase() === c) return true;
    else if (countries[mid].toLocaleLowerCase() > c) return searchCountry(c, begin, mid - 1);
    else return searchCountry(c, mid + 1, end);
}

stateInput.addEventListener('input', (ev)  => showStates(ev.target.value.toLowerCase()));

const getLocationBtn = document.getElementById('get-location-btn');
getLocationBtn.onclick = async () => {
    const country = countryInput.value.toLowerCase();
    const state = stateInput.value.toLowerCase();

    if (!searchCountry(country.toLocaleLowerCase())) {
        console.log('country not found');
        return
    }
    const states = searchCountryStates(country);
    for (i in states) {
        console.log(states[i].name)
        if (states[i].name.toLowerCase() === state) {
            lat = states[i].latitude;
            lon = states[i].longitude;
            main();
            break;
        }
    }
}



