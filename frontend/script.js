const locationRiskData = {
  trivandrum: "Medium Risk",
  idukki: "High Risk",
  ernakulam: "Low Risk",
  wayanad: "High Risk",
  kottayam: "Medium Risk",
  alappuzha: "Low Risk",
  palakkad: "Medium Risk",
  malappuram: "High Risk",
  thrissur: "Medium Risk",
  kollam: "Low Risk",
  kannur: "Low Risk",
  kasaragod: "Low Risk",
  pathanamthitta: "High Risk"
};

const districtList = Object.keys(locationRiskData);

// Show district suggestions
function showSuggestions(input) {
  const suggestionsBox = document.getElementById("suggestions");
  const query = input.toLowerCase();
  suggestionsBox.innerHTML = "";

  if (!query) return;

  const matches = districtList.filter(district =>
    district.toLowerCase().startsWith(query)
  );

  matches.forEach(district => {
    const li = document.createElement("li");
    li.textContent = capitalize(district);
    li.classList.add("list-group-item");
    li.onclick = () => {
      document.getElementById("searchInput").value = capitalize(district);
      suggestionsBox.innerHTML = "";
    };
    suggestionsBox.appendChild(li);
  });
}

// Capitalize the first letter
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Handle Search Button Click
function searchLocation() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultBox = document.getElementById("result-box");
  const suggestionsBox = document.getElementById("suggestions");
  suggestionsBox.innerHTML = "";

  if (input === "") {
    resultBox.innerHTML = "⚠️ Please enter a location in Kerala.";
    return;
  }

  const risk = locationRiskData[input];

  if (risk) {
    resultBox.innerHTML = `📍 <strong>${capitalize(input)}</strong> has a <strong>${risk}</strong> of landslides.`;
  } else {
    resultBox.innerHTML = "🚫 No data available for that location.";
  }
}

// Handle Check Result button click
document.getElementById('check-result-btn').addEventListener('click', async () => {
  const modal = document.getElementById('result-modal');
  const contentDiv = document.getElementById('result-content');

  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const districtName = capitalize(input);
  const risk = locationRiskData[input];

  if (!districtName || !risk) {
    contentDiv.innerHTML = `<p>❌ Please enter a valid district from Kerala.</p>`;
    modal.style.display = 'flex';
    return;
  }

  contentDiv.innerHTML = `<p>Loading weather data for ${districtName}...</p>`;
  modal.style.display = 'flex';

  try {
    // OpenWeather API call
    const apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your actual API key
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${districtName},IN&units=metric&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      throw new Error(weatherData.message || "Unable to fetch weather.");
    }

    const temp = weatherData.main.temp;
    const desc = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;

    contentDiv.innerHTML = `
      <h3>📍 ${districtName}</h3>
      <p><strong>Landslide Risk:</strong> ${risk}</p>
      <hr>
      <h4>🌦️ Current Weather</h4>
      <p><strong>Temperature:</strong> ${temp}°C</p>
      <p><strong>Condition:</strong> ${capitalize(desc)}</p>
      <p><strong>Humidity:</strong> ${humidity}%</p>
    `;
  } catch (error) {
    contentDiv.innerHTML = `<p>❌ Error fetching weather: ${error.message}</p>`;
  }
});

// Modal close logic
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('result-modal').style.display = 'none';
});

windo
