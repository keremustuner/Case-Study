from flask import Flask, jsonify
import json
import os
import requests
from dotenv import load_dotenv
from flask_cors import CORS


load_dotenv()

app = Flask(__name__)
CORS(app) 


APILAYER_API_KEY = os.getenv('APILAYER_API_KEY')
if not APILAYER_API_KEY:
    print("Error: APILAYER_API_KEY not found in .env file.")
    print("Please ensure your APILAYER_API_KEY is correctly set in your .env file.")
    exit() 


def load_products():
    try:
        with open('products.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: products.json not found.")
        return []

products_data = load_products()

def get_gold_price_per_gram():
    url = "https://api.apilayer.com/currency_data/live?currencies=XAU&source=USD"
    headers = {
        "apikey": APILAYER_API_KEY
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status() 
        data = response.json()
        
        print(f"APILayer Response (for XAU): {data}") 
        if data and data.get('success') and 'quotes' in data and 'USDXAU' in data['quotes']:
            usd_to_xau_rate = data['quotes']['USDXAU']
            if usd_to_xau_rate > 0:
                gold_price_per_troy_ounce = 1 / usd_to_xau_rate 
                gold_price_per_gram = gold_price_per_troy_ounce / 31.1035
                print(f"Calculated Gold Price per Gram: {gold_price_per_gram:.2f} USD")
                return gold_price_per_gram
            else:
                print("Error: USDXAU rate is zero or invalid.")
                return None
        else:
            print(f"Warning: XAU rate not found in APILayer Currency Data API response. Using fallback constant.")
            return 70.0 
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching gold price from APILayer: {e}")
        return 70.0 
    except KeyError as e:
        print(f"Error parsing APILayer data (KeyError: {e}). Response: {data}")
        return 70.0 
    except Exception as e:
        print(f"An unexpected error occurred while fetching gold price from APILayer: {e}")
        return 70.0 


def calculate_product_price(popularity_score, weight, gold_price):
    if gold_price is None:
        return None

    price = (popularity_score + 1) * weight * gold_price
    return round(price, 2) 

@app.route('/')
def home():
    return "Welcome to the Product Listing API!"

@app.route('/api/products', methods=['GET'])
def get_products():
    current_gold_price = get_gold_price_per_gram()
    if current_gold_price is None:
        return jsonify({"error": "Could not retrieve real-time gold price. Please check API key and service availability."}), 500

    products_with_prices = []
    for product in products_data:
        product_copy = product.copy() 
        price = calculate_product_price(product_copy['popularityScore'], product_copy['weight'], current_gold_price)
        product_copy['price'] = price 


        popularity_5_scale = round(product_copy['popularityScore'] * 5, 1)
        product_copy['popularity_5_scale'] = popularity_5_scale

        products_with_prices.append(product_copy)
    
    return jsonify(products_with_prices)

if __name__ == '__main__':
    app.run(debug=True)