// === PREDICT RISK ===
async function searchLocation() {
  const place = document.getElementById("searchInput").value.trim();
  const resultBox = document.getElementById("result-box");
  const modal = document.getElementById("result-modal");
  const modalContent = document.getElementById("result-content");

  resultBox.textContent = "";

  if (!place) {
    resultBox.textContent = "⚠️ Please enter a location.";
    return;
  }

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place: place })
    });

    const data = await response.json();

    if (!response.ok) {
      resultBox.textContent = `❌ ${data.error || "Prediction failed."}`;
      return;
    }

    const timestamp = new Date().toLocaleString();

    modalContent.innerHTML = `
    <div class="modal-section-container">
        <div class="modal-section left">
        <h3>🌤️Weather Info</h3>
        <p><strong>Location:</strong> ${data.place}</p>
        <p><strong>Date & Time:</strong> <br>${new Date().toLocaleString()}</p>
        <ul>
            <li><strong>Temperature:</strong> ${data.weather?.Temperature_C}°C </li>
            <li><strong>Rainfall:</strong> ${data.weather?.Rainfall_mm} mm</li>
            <li><strong>Humidity:</strong> ${data.weather?.Humidity_percent}%</li>
        </ul>
        </div>
        <div class="vertical-divider"></div>
        <div class="modal-section right">
        <h3>📊Risk Prediction</h3><br><br>
        <p style="font-size: 1.6rem;">${data.risk}</p>
        ${data.note ? `<p style="font-style: italic;">${data.note}</p>` : ""}
        </div>
    </div>
    `;


    modal.style.display = "block";

  } catch (err) {
    console.error("Prediction error:", err);
    resultBox.textContent = "❌ Server error. Please try again.";
  }
}

// === MODAL CONTROL ===
document.getElementById("modal-close").onclick = () => {
  document.getElementById("result-modal").style.display = "none";
};

window.onclick = (event) => {
  const modal = document.getElementById("result-modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// === ENTER KEY TO SUBMIT ===
document.getElementById("searchInput").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    searchLocation();
  }
});
