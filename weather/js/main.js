const API_KEY = 'b197bfc6ce9a58ea446d4d4f2dd63820';
let lat = 0;
let lon = 0;
const ipUrl = 'https://api.ipify.org?format=json';
const ipKEY = '826a8770-6f8a-43a1-bb2e-b6555f6268c3';

async function getIp() {
    let data = await fetch(ipUrl);
    return await data.json();
}

async function getLoc(){
    const ip = await getIp();
    const loc = await fetch(`https://ipfind.co/?ip=${ip.ip}&auth=${ipKEY}`);
    return await loc.json();
   
}

async function getCurrLocation (){
    try {
        const currGeo = await  getLoc();
        lat = currGeo.latitude;
        lon = currGeo.longitude;
    }
    catch {
        lat = 51.509865;
        lon = -0.118092;
    };
    
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const days = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",];

let currentWeather = {};
let forecast = {};
async function collectData() {
    let url1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    let url2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    currentWeather = await (await fetch(url1)).json();
    forecast = await (await fetch(url2)).json();
}

function fillCurrentWeather() {
    const img = document.getElementById('main-temp-img');
    const tempSpan = document.getElementById('main-temp-value');
    const weatherDesc = document.getElementById('main-weather-desc');
    const locationP = document.getElementById('location');
    const date = document.getElementById('date');
    const lowTemp = document.getElementById('low-temp-val');
    const hightTemp = document.getElementById('hight-temp-val');
    const windSpeed = document.getElementById('wind-speed');
    const sunrise = document.getElementById('sunrise-value');
    const sunset = document.getElementById('sunset-value');
    const humidity = document.getElementById('humidity-value');

    const currDate = new Date(currentWeather.dt * 1000);

    img.setAttribute('src', `assets/weather_icons/${currentWeather.weather[0].icon}.png`)
    tempSpan.innerText = Math.round(currentWeather.main.temp - 273,15);
    weatherDesc.innerText = currentWeather.weather[0].description;
    locationP.innerText = `${currentWeather.sys.country}, ${currentWeather.name}`;
    date.innerText = `${days[currDate.getDay()]} ${currDate.getDate()} ${months[currDate.getMonth()]} ${currDate.getHours()}:${currDate.getMinutes()}`;
    lowTemp.innerText = Math.round(currentWeather.main.temp_min - 273,15) + '°';
    hightTemp.innerText = Math.round(currentWeather.main.temp_max - 273,15) + '°';
    windSpeed.innerText = (currentWeather.wind.speed * 3.6).toFixed(2);  // meter/sec => km/h
    const rise = new Date(currentWeather.sys.sunrise * 1000);
    sunrise.innerText = `${rise.getHours()}:${rise.getMinutes()}`;
    const set = new Date(currentWeather.sys.sunset * 1000);
    sunset.innerText = `${set.getHours()}:${set.getMinutes()}`;
    humidity.innerText = currentWeather.main.humidity;
}
function createForecatCard(date, img, temp, desc) {
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('swiper-slide', 'card');
    const dateSpan = document.createElement('span');
    dateSpan.classList.add('date');
    dateSpan.innerText = date;
    const icon = document.createElement('img');
    icon.classList.add('icon');
    icon.setAttribute('src', `assets/weather_icons/${img}.png`);
    const tempSpan = document.createElement('span');
    tempSpan.classList.add('main-temp-value');
    tempSpan.innerText = temp + '°';
    const descSpan = document.createElement('span');
    descSpan.classList.add('weather-desc');
    descSpan.innerText = desc;

    mainDiv.appendChild(dateSpan);
    mainDiv.appendChild(icon);
    mainDiv.appendChild(tempSpan);
    mainDiv.appendChild(descSpan);
    
    return mainDiv;
}
 
function fillForecast(){ 
    function fillToday() {
        const day = new Date(forecast.list[0].dt * 1000).getDay();
        let i = 0;
        while (new Date(forecast.list[i].dt * 1000).getDay() === day) {
            let date = new Date(forecast.list[i].dt * 1000);
            date = `${days[date.getDay()].slice(0, 3)} ${date.getHours()}:00`;
            const temp = Math.round(forecast.list[i].main.temp - 273.15);
            const desc = forecast.list[i].weather[0].description;
            const icon = forecast.list[i].weather[0].icon;
            wrapper.appendChild(createForecatCard(date, icon, temp, desc));
            i ++;
        }
    }
    function fillDaily() {
        let i = 0 ;
        while (i < forecast.cnt) {
            const day = new Date(forecast.list[i].dt * 1000).getDay();
            let moy = forecast.list[i].main.temp;
            let cnt = 1;
            i += 1;
            while (i < forecast.cnt && new Date(forecast.list[i].dt * 1000).getDay() === day) {
                moy += forecast.list[i].main.temp;
                cnt ++;
                i ++;
            }
            const temp = Math.round(moy / cnt - 273.15);
            const desc = forecast.list[i - Math.ceil(cnt / 2)].weather[0].description;
            const icon = forecast.list[i - Math.ceil(cnt / 2)].weather[0].icon;
            wrapper.appendChild(createForecatCard(days[day], icon, temp, desc));
        }
    }
    function fillHourly() {
        forecast.list.forEach((elem) => {
            let date = new Date(elem.dt * 1000);
            date = `${days[date.getDay()].slice(0, 3)} ${date.getHours()}:00`;
            const temp = Math.round(elem.main.temp - 273.15);
            const desc = elem.weather[0].description;
            const icon = elem.weather[0].icon;
            wrapper.appendChild(createForecatCard(date, icon, temp, desc));
        });
    }
    const wrapper = document.getElementById('forecast-wrapper');
    wrapper.style.transform = 'translate3d(0px, 0px, 0px)';
    wrapper.innerHTML = '';
    const filter = document.getElementById('forecast-filter').value.toLowerCase();
    switch (filter) {
        case 'today' : fillToday(); break;
        case 'daily' : fillDaily(); break;
        default : fillHourly();
    }
    let swiper =  createNewSwipper();
}

function createNewSwipper() {
    return new Swiper('.swiper', {
        direction: 'horizontal',
        loop: false,
        pagination: {
        el: '.swiper-pagination',
        },
        navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        },
        slidesPerView: 6,
        spaceBetween: 10,
        breakpoints: {
            100: {
                slidesPerView: 1,
            },
            380: {
            slidesPerView: 2,
            },
            480: {
            slidesPerView: 3,
            },
            720: {
            slidesPerView: 4,
            },
            1024: {
                slidesPerView: 6,
            }
        }
    });
}

async function main(){
    const loader = document.querySelector('main .loading');
    const main = document.querySelector('main .todays-weather');
    loader.style.display = 'block';
    main.style.display = 'none';
    
    try {
        await collectData();
    }
    catch (err) {
        document.body.innerHTML = `
            <h1 style= 'color: red; width: fit-content; margin: auto';>Something Went Wrong</h1>
        `;
        return;
    }
    fillCurrentWeather();
    fillForecast();
    document.querySelector('.weather-vid > video').play();
    let swiper = createNewSwipper();
    document.getElementById('forecast-filter').onchange = () => {
        fillForecast();
        // swiper =  createNewSwipper();
    } 
    main.style.display = 'flex';
    loader.style.display = 'none';
}

async function firstFct() {
    await getCurrLocation();
    main();
}

firstFct();