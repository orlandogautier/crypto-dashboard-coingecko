Visualizador de Datos de Criptomonedas

Este proyecto es una aplicación web interactiva que permite a los usuarios buscar criptomonedas, ver su precio actual y un gráfico histórico de precios. Utiliza la API de CoinGecko para obtener los datos y Chart.js para la visualización. El backend de Flask actúa como un proxy para la API externa, mejorando la seguridad y gestionando posibles problemas de CORS.

Características
Búsqueda de Criptomonedas: Campo de búsqueda con autocompletado para encontrar criptomonedas por nombre o símbolo.

Precio Actual: Muestra el precio actual de la criptomoneda seleccionada en USD.

Gráfico Histórico: Visualiza el historial de precios de la criptomoneda en un gráfico de línea interactivo (Chart.js).

Selección de Rango de Días: Permite elegir el período de tiempo del historial (7, 30, 90 días, 1 año, o máximo).

Backend Proxy (Flask): Intermedia las peticiones a la API de CoinGecko, ocultando la clave de API (si fuera necesaria) y gestionando CORS.

Diseño Responsivo: Interfaz de usuario adaptable a diferentes tamaños de pantalla (escritorio, tableta, móvil).

Manejo de Errores: Notificaciones claras al usuario si hay problemas al cargar los datos o si una criptomoneda no se encuentra.

Tecnologías Utilizadas
Backend:

Python 3.x

Flask: Microframework web para la API RESTful.

Flask-CORS: Extensión para manejar las políticas de Cross-Origin Resource Sharing.

Requests: Librería HTTP para hacer peticiones a la API de CoinGecko.

Frontend:

HTML5: Estructura de la página web.

CSS3: Estilos y diseño responsivo.

JavaScript (ES6+): Lógica del lado del cliente, manejo de eventos, manipulación del DOM.

Fetch API: Para realizar peticiones asíncronas al backend de Flask.

Chart.js: Librería de JavaScript para crear gráficos interactivos.

Instalación y Configuración
Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

Prerrequisitos
Python 3.x instalado.

pip (gestor de paquetes de Python).

Conexión a Internet para descargar dependencias y acceder a la API de CoinGecko.

Pasos
Clonar el Repositorio:
Abre tu terminal y clona el repositorio de GitHub:

git clone https://github.com/orlandogautier/crypto-dashboard-coingecko.git
cd crypto-dashboard-coingecko

Configurar el Backend:

Navega al directorio backend:

cd backend

Crea y activa un entorno virtual (recomendado):

python3 -m venv venv
source venv/bin/activate  # En Linux/macOS
# venv\Scripts\activate   # En Windows

Instala las dependencias de Python:

pip install -r requirements.txt

Ejecutar el Backend:

python3 app.py

El backend se ejecutará en http://127.0.0.1:5000/. Déjalo corriendo en esta terminal.

Acceder al Frontend:

Abre tu navegador web.

Ve a la dirección: http://127.0.0.1:5000/

El backend de Flask servirá el archivo index.html y los recursos del frontend.

Estructura del Proyecto
crypto_dashboard/
├── backend/
│   ├── app.py              # Aplicación Flask (proxy API)
│   └── requirements.txt    # Dependencias de Python
├── frontend/
│   ├── index.html          # Interfaz de usuario principal
│   └── static/
│       ├── css/
│       │   └── style.css   # Estilos CSS de la aplicación
│       └── js/
│           └── main.js     # Lógica JavaScript del frontend
└── .gitignore              # Archivos y directorios a ignorar por Git
└── README.md               # Este archivo

📸 Capturas de Pantalla
Vista de escritorio del Visualizador de Criptomonedas
![Vista de escritorio](images/desktop-screenshot.png)

Vista móvil del Visualizador de Criptomonedas

Posibles Mejoras Futuras
Más Detalles de Criptomonedas: Añadir capitalización de mercado, volumen de 24h, cambio porcentual, etc.

Selección de Moneda Base: Permitir al usuario elegir la moneda base (ej., EUR, JPY) además de USD.

Gráficos Múltiples: Comparar varias criptomonedas en el mismo gráfico.

Cacheo en Backend: Implementar un sistema de caché en Flask para reducir las llamadas repetidas a la API de CoinGecko y mejorar el rendimiento.

Autenticación/Favoritos: Permitir a los usuarios guardar sus criptomonedas favoritas.

Despliegue: Preparar la aplicación para un despliegue en un servicio de hosting (ej., Heroku, Render, Vercel para frontend estático + Flask en otro servicio).

Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

Autor: Orlando Gautier
Contacto: orlando.gauthier@gmail.com / https://www.linkedin.com/in/orlando-gautier-7011bb1a/
