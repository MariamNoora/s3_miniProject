import requests

url = "http://127.0.0.1:5000/predict"
data = {"place": "Idukki"}

response = requests.post(url, json=data)

if response.status_code == 200:
    print("Prediction Result:")
    print(response.json())
else:
    print(f"Error {response.status_code}: {response.text}")
