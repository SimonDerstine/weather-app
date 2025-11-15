// Get elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const body = document.body;
const sun = document.querySelector('.sun');
const clouds = document.querySelectorAll('.cloud');
const rainContainer = document.querySelector('.rain-container');
const snowContainer = document.querySelector('.snow-container');
let map = null;

// Add click event to button
searchBtn.addEventListener('click', getWeather);

// Also allow Enter key to search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Main function to fetch weather
function getWeather() {
    const city = cityInput.value.trim();
    
    if (city === '') {
        weatherResult.innerHTML = '<p class="error">Please enter a city name!</p>';
        return;
    }

    weatherResult.innerHTML = '<p>Loading...</p>';

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            updateBackground(data.weather[0].main.toLowerCase());
        })
        .catch(error => {
            weatherResult.innerHTML = '<p class="error">City not found. Please try again!</p>';
            console.error('Error:', error);
        });
}

// Display the weather data
function displayWeather(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const cityName = data.name;

    weatherResult.innerHTML = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <p class="temp">${temp}°F</p>
            <p>${description}</p>
            <p> Humidity: ${humidity}%</p>
            <p> Wind Speed: ${windSpeed} mph</p>
        </div>
    `;

    showMap(data.coord.lat, data.coord.lon, cityName);
}

// Update background animation based on weather
function updateBackground(weather) {
    // Reset all animations
    body.className = '';
    sun.style.display = 'none';
    clouds.forEach(cloud => cloud.style.display = 'none');
    rainContainer.style.display = 'none';
    snowContainer.style.display = 'none';
    rainContainer.innerHTML = '';
    snowContainer.innerHTML = '';

    // Show appropriate animation
    if (weather.includes('clear')) {
        body.classList.add('clear');
        sun.style.display = 'block';
    } else if (weather.includes('cloud')) {
        body.classList.add('clouds');
        clouds.forEach(cloud => cloud.style.display = 'block');
    } else if (weather.includes('rain') || weather.includes('drizzle')) {
        body.classList.add('rain');
        createRain();
    } else if (weather.includes('snow')) {
        body.classList.add('snow');
        createSnow();
    } else {
        body.classList.add('clear');
    }
}

// Create rain animation
function createRain() {
    rainContainer.style.display = 'block';
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        rainContainer.appendChild(drop);
    }
}

// Create snow animation
function createSnow() {
    snowContainer.style.display = 'block';
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = Math.random() * 100 + '%';
        flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        flake.style.animationDelay = Math.random() * 2 + 's';
        flake.style.opacity = Math.random();
        snowContainer.appendChild(flake);
    }
}

// Show map with city location
function showMap(lat, lon, cityName) {
    const mapDiv = document.getElementById('map');
    mapDiv.style.display = 'block';
    
    // If map already exists, just update it
    if (map !== null) {
        map.setView([lat, lon], 10);
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${cityName}</b>`)
            .openPopup();
    } else {
        // Create new map first time
        map = L.map('map').setView([lat, lon], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${cityName}</b>`)
            .openPopup();
    }
}