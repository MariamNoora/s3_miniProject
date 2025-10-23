from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import requests
import joblib
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Load model and dataset
model = joblib.load("model/landslide_model.pkl")
features_df = pd.read_csv("extracted_features.csv")

# Weather API Key
weather_api_key = "e74b5bd3d37343e59bd171525241408"

# === Get Coordinates from Place Name ===
def get_coordinates(place):
    url = f"https://nominatim.openstreetmap.org/search?q={place}&format=json&limit=1"
    response = requests.get(url, headers={"User-Agent": "TerrainAlert-App"})
    if response.status_code != 200 or not response.json():
        return None
    data = response.json()[0]
    return float(data["lat"]), float(data["lon"])

# === Get Static Terrain Features from Coordinates ===
def get_static_features(lat, lon):
    df = features_df.copy()
    df["latitude"] = df["latitude"].astype(float)
    df["longitude"] = df["longitude"].astype(float)
    df["distance"] = ((df["latitude"] - lat)**2 + (df["longitude"] - lon)**2)**0.5

    nearest = df.loc[df["distance"].idxmin()]
    print(f"Nearest point at distance {nearest['distance']}°")
    print(f"Elevation: {nearest['elevation']}, Slope: {nearest['slope']}")
    
    return nearest  # Always return nearest point, even if far

# === Get Weather Data ===
def get_weather(lat, lon):
    url = f"http://api.weatherapi.com/v1/current.json?key={weather_api_key}&q={lat},{lon}"
    response = requests.get(url)
    if response.status_code != 200:
        return None
    current = response.json()["current"]
    return {
        "Rainfall_mm": current.get("precip_mm", 0),
        "Temperature_C": current.get("temp_c", 0),
        "Humidity_percent": current.get("humidity", 0)
    }

# === Serve Frontend ===
@app.route('/')
def serve_frontend_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_frontend_files(path):
    full_path = os.path.join(app.static_folder, path)
    if os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    else:
        return "File not found", 404

# === Predict Risk Endpoint ===
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    place = data.get("place")

    if not place:
        return jsonify({"error": "Missing place name"}), 400

    coords = get_coordinates(place)
    if not coords:
        return jsonify({"error": "Location not found"}), 404

    lat, lon = coords

    static = get_static_features(lat, lon)
    if static is None:
        return jsonify({"error": "Location not in dataset"}), 404

    weather = get_weather(lat, lon)
    if weather is None:
        return jsonify({"error": "Weather data fetch failed"}), 500

    input_data = pd.DataFrame([{
        "Rainfall_mm": weather["Rainfall_mm"],
        "Slope_Angle": static["slope"],
        "Aspect": static["aspect"],
        "Elevation_m": static["elevation"],
        "Temperature_C": weather["Temperature_C"],
        "Humidity_percent": weather["Humidity_percent"]
    }])

    print("DEBUG: Prediction input values:")
    print(input_data.to_dict(orient="records")[0])

    # === Use predict_proba to get risk probability ===
    proba = model.predict_proba(input_data)[0][1]
    print(f"Risk probability for '{place.title()}': {proba:.4f}")
    # === Interpret Probability into Risk Level ===
    if proba >= 0.8:
        risk_label = "🔴HIGH RISK"
    elif proba >= 0.6:
        risk_label = "🟠MEDIUM RISK"
    elif proba >= 0.4:
        risk_label = "🟡LOW RISK"
    else:
        risk_label = "✅SAFE"

    return jsonify({
        "place": place.title(),
        "latitude": lat,
        "longitude": lon,
        "risk": risk_label,
        "weather": weather
    })

if __name__ == '__main__':
    app.run(debug=True)
