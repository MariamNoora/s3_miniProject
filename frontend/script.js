const locationRiskData = {
    "trivandrum": "Medium Risk",
    "idukki": "High Risk",
    "ernakulam": "Low Risk",
    "wayanad": "High Risk",
    "kottayam": "Medium Risk",
    "alappuzha": "Low Risk",
    "palakkad": "Medium Risk",
    "malappuram": "High Risk",
    "thrissur": "Medium Risk",
    "kollam": "Low Risk",
    "kannur": "Low Risk",
    "kasaragod": "Low Risk",
    "pathanamthitta": "High Risk"
  };
  
  // List of all valid districts for suggestions
  const districtList = Object.keys(locationRiskData);
  
  function showSuggestions(input) {
    const suggestionsBox = document.getElementById("suggestions");
    const query = input.toLowerCase();
  
    // Clear previous suggestions
    suggestionsBox.innerHTML = "";
  
    if (!query) return;
  
    // Filter matching suggestions
    const matches = districtList.filter(district =>
      district.toLowerCase().startsWith(query)
    );
  
    // Add suggestions to dropdown
    matches.forEach(district => {
      const li = document.createElement("li");
      li.textContent = capitalize(district);
      li.onclick = () => {
        document.getElementById("searchInput").value = capitalize(district);
        suggestionsBox.innerHTML = ""; // Clear suggestions
      };
      suggestionsBox.appendChild(li);
    });
  }
  
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
  
  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  