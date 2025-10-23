import rasterio
import numpy as np
import pandas as pd
import richdem as rd
from tqdm import tqdm

# === File path ===
tif_path = "C:/Users/hp/Desktop/mca notes/proj/data/kerala_dem.tif"  # Update this if your file is named differently

# === Read DEM using rasterio ===
with rasterio.open(tif_path) as src:
    elevation = src.read(1)  # 2D elevation array
    transform = src.transform
    crs = src.crs
    width, height = src.width, src.height
    bounds = src.bounds

# === Convert to richdem format for slope/aspect ===
dem = rd.rdarray(elevation, no_data=-9999)
dem.geotransform = transform.to_gdal()

# === Compute slope and aspect ===
slope = rd.TerrainAttribute(dem, attrib='slope_degrees')
aspect = rd.TerrainAttribute(dem, attrib='aspect')

# === Helper function to get lat/lon from pixel ===
def pixel_to_latlon(row, col, transform):
    lon, lat = rasterio.transform.xy(transform, row, col)
    return lat, lon

# === Collect data ===
data = []
print("[INFO] Extracting data from DEM (this may take time)...")

for row in tqdm(range(0, elevation.shape[0], 10)):  # step=10 to reduce size
    for col in range(0, elevation.shape[1], 10):
        elev = elevation[row, col]
        slp = slope[row, col]
        asp = aspect[row, col]

        if np.isnan(elev) or np.isnan(slp) or np.isnan(asp):
            continue

        lat, lon = pixel_to_latlon(row, col, transform)

        data.append({
            'latitude': lat,
            'longitude': lon,
            'elevation': elev,
            'slope': slp,
            'aspect': asp
        })

# === Convert to DataFrame ===
df = pd.DataFrame(data)

# === Save to CSV ===
output_path = "extracted_features.csv"
df.to_csv(output_path, index=False)

print(f"[✅] Extraction complete. Saved to: {output_path}")
