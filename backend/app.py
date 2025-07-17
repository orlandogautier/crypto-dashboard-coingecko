from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder='../frontend/static', template_folder='../frontend')
CORS(app) # Habilita CORS para permitir peticiones desde el frontend

# URL base de la API de CoinGecko
COINGECKO_API_BASE_URL = "https://api.coingecko.com/api/v3"

@app.route('/')
def index():
    """
    Sirve la página HTML principal del frontend.
    """
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/api/coins/list', methods=['GET'])
def get_coins_list():
    """
    Endpoint para obtener una lista de criptomonedas disponibles desde CoinGecko.
    Actúa como proxy para la API: GET /api/v3/coins/list
    """
    try:
        # Realiza la petición a la API de CoinGecko
        # La API de CoinGecko para /coins/list no suele requerir una clave de API para uso básico.
        response = requests.get(f"{COINGECKO_API_BASE_URL}/coins/list")
        response.raise_for_status() # Lanza una excepción si la respuesta es un error HTTP
        
        coins_data = response.json()
        
        # Opcional: Filtrar o transformar los datos si es necesario.
        # Por ejemplo, solo devolver 'id' y 'name' para reducir el tamaño de la respuesta.
        filtered_coins = [{'id': coin['id'], 'name': coin['name'], 'symbol': coin['symbol']} for coin in coins_data]
        
        return jsonify(filtered_coins)
    except requests.exceptions.RequestException as e:
        # Manejo de errores de red o de la API de CoinGecko
        print(f"Error al obtener la lista de monedas de CoinGecko: {e}")
        return jsonify({"error": "No se pudo recuperar la lista de criptomonedas. Inténtalo de nuevo más tarde."}), 500
    except Exception as e:
        # Manejo de cualquier otro error inesperado
        print(f"Error inesperado en /api/coins/list: {e}")
        return jsonify({"error": "Ha ocurrido un error interno del servidor."}), 500

@app.route('/api/coin/<string:coin_id>/history', methods=['GET'])
def get_coin_history(coin_id):
    """
    Endpoint para obtener el historial de precios de una criptomoneda específica.
    Actúa como proxy para la API: GET /api/v3/coins/{coin_id}/market_chart
    Parámetros de consulta: vs_currency (defecto: usd), days (defecto: 30)
    """
    vs_currency = request.args.get('vs_currency', 'usd') # Moneda de comparación, defecto USD
    days = request.args.get('days', '30') # Número de días de historial, defecto 30

    if not coin_id:
        return jsonify({"error": "ID de criptomoneda no proporcionado."}), 400

    try:
        # Realiza la petición a la API de CoinGecko para el historial de mercado
        # Los precios se devuelven como [timestamp, price]
        api_url = f"{COINGECKO_API_BASE_URL}/coins/{coin_id}/market_chart?vs_currency={vs_currency}&days={days}"
        response = requests.get(api_url)
        response.raise_for_status() # Lanza una excepción si la respuesta es un error HTTP

        history_data = response.json()
        
        # CoinGecko devuelve 'prices', 'market_caps', 'total_volumes'.
        # Nos interesa solo 'prices' para el gráfico.
        prices = history_data.get('prices', [])
        
        return jsonify(prices)
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            return jsonify({"error": f"Criptomoneda '{coin_id}' no encontrada. Verifica el ID."}), 404
        print(f"Error HTTP al obtener historial de {coin_id}: {e}")
        return jsonify({"error": f"Error al obtener historial de precios para {coin_id}. Código: {response.status_code}"}), response.status_code
    except requests.exceptions.RequestException as e:
        print(f"Error de red al obtener historial de {coin_id}: {e}")
        return jsonify({"error": "No se pudo conectar con la API de CoinGecko. Inténtalo de nuevo más tarde."}), 500
    except Exception as e:
        print(f"Error inesperado en /api/coin/{coin_id}/history: {e}")
        return jsonify({"error": "Ha ocurrido un error interno del servidor."}), 500

if __name__ == '__main__':
    # El backend correrá en http://localhost:5000
    # debug=True permite recarga automática y mensajes de error detallados
    app.run(debug=True, port=5000)
