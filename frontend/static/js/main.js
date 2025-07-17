// frontend/static/js/main.js

// Variable global para almacenar la instancia del gráfico de Chart.js
let priceChartInstance = null;
// Variable para almacenar la lista completa de monedas de CoinGecko
let allCoins = [];
// Variable para almacenar el ID de la moneda actualmente seleccionada
let currentCoinId = 'bitcoin'; // Moneda por defecto

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const coinSearchInput = document.getElementById('coinSearchInput');
    const coinListDatalist = document.getElementById('coinList');
    const searchButton = document.getElementById('searchButton');
    const daysSelect = document.getElementById('daysSelect');
    const coinNameSpan = document.getElementById('coinName');
    const coinSymbolSpan = document.getElementById('coinSymbol');
    const currentPriceSpan = document.getElementById('currentPrice');
    const errorMessageElement = document.getElementById('errorMessage');

    // --- Funciones de Utilidad ---

    /**
     * Muestra un mensaje de error en la interfaz.
     * @param {string} message El mensaje de error a mostrar.
     */
    function showError(message) {
        errorMessageElement.textContent = `Error: ${message}`;
        errorMessageElement.style.display = 'block';
    }

    /**
     * Oculta el mensaje de error.
     */
    function hideError() {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }

    /**
     * Formatea un número como moneda USD.
     * @param {number} amount El monto a formatear.
     * @returns {string} El monto formateado como cadena de moneda.
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 8 // Para criptomonedas con muchos decimales
        }).format(amount);
    }

    // --- Funciones de Fetching de Datos (Comunicación con el Backend Flask) ---

    /**
     * Obtiene la lista de todas las criptomonedas disponibles desde el backend.
     * Rellena el datalist del input de búsqueda.
     */
    async function fetchCoinList() {
        hideError();
        try {
            const response = await fetch('/api/coins/list');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allCoins = await response.json(); // Guarda la lista completa
            
            // Rellenar el datalist para el autocompletado
            coinListDatalist.innerHTML = ''; // Limpiar opciones anteriores
            allCoins.forEach(coin => {
                const option = document.createElement('option');
                option.value = coin.name; // Mostrar el nombre de la moneda
                option.setAttribute('data-id', coin.id); // Guardar el ID en un atributo de datos
                option.setAttribute('data-symbol', coin.symbol); // Guardar el símbolo
                coinListDatalist.appendChild(option);
            });
            console.log('Lista de monedas cargada.');
        } catch (error) {
            console.error('Error al cargar la lista de monedas:', error);
            showError('No se pudo cargar la lista de criptomonedas. Inténtalo de nuevo más tarde.');
        }
    }

    /**
     * Obtiene el historial de precios de una criptomoneda específica desde el backend.
     * @param {string} coinId El ID de la criptomoneda (ej. 'bitcoin').
     * @param {string} days El número de días de historial (ej. '30', 'max').
     */
    async function fetchCoinHistory(coinId, days) {
        hideError();
        errorMessageElement.textContent = 'Cargando datos...'; // Indicador de carga
        errorMessageElement.style.display = 'block';
        
        // Limpiar detalles y gráfico mientras carga
        coinNameSpan.textContent = '---';
        coinSymbolSpan.textContent = '---';
        currentPriceSpan.textContent = '---';
        if (priceChartInstance) {
            priceChartInstance.destroy();
            priceChartInstance = null;
        }

        try {
            const response = await fetch(`/api/coin/${coinId}/history?vs_currency=usd&days=${days}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const prices = await response.json();

            if (prices.length === 0) {
                showError('No hay datos históricos disponibles para este período o moneda.');
                return;
            }

            // Actualizar detalles de la moneda (usando el último precio disponible)
            const latestPrice = prices[prices.length - 1][1];
            coinNameSpan.textContent = allCoins.find(c => c.id === coinId)?.name || coinId;
            coinSymbolSpan.textContent = allCoins.find(c => c.id === coinId)?.symbol.toUpperCase() || 'N/A';
            currentPriceSpan.textContent = formatCurrency(latestPrice);

            renderChart(prices); // Renderizar el gráfico con los datos obtenidos
            hideError(); // Ocultar el indicador de carga/error
        } catch (error) {
            console.error(`Error al cargar el historial de ${coinId}:`, error);
            showError(`No se pudo cargar el historial de precios para "${coinId}". ${error.message}`);
        }
    }

    // --- Funciones de Renderizado (Chart.js) ---

    /**
     * Renderiza o actualiza el gráfico de precios.
     * @param {Array<Array<number>>} pricesData Un array de arrays [timestamp, price].
     */
    function renderChart(pricesData) {
        const ctx = document.getElementById('priceChart').getContext('2d');

        // Destruir la instancia anterior del gráfico si existe
        if (priceChartInstance) {
            priceChartInstance.destroy();
        }

        // Preparar los datos para Chart.js
        const labels = pricesData.map(item => {
            const date = new Date(item[0]);
            // Formatear la fecha para el eje X (ej. 'DD/MM/YYYY')
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        });
        const dataValues = pricesData.map(item => item[1]); // Solo los precios

        priceChartInstance = new Chart(ctx, {
            type: 'line', // Tipo de gráfico de línea
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precio (USD)',
                    data: dataValues,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1, // Suaviza las líneas
                    pointRadius: 0, // Oculta los puntos individuales
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Permite que el gráfico se adapte al tamaño del contenedor CSS
                plugins: {
                    title: {
                        display: true,
                        text: 'Historial de Precios (USD)'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Precio: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category', // Para fechas formateadas como cadenas
                        title: {
                            display: true,
                            text: 'Fecha'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true, // Auto-ocultar etiquetas si hay demasiadas
                            maxTicksLimit: 10 // Limitar el número de etiquetas visibles
                        }
                    },
                    y: {
                        beginAtZero: false, // Los precios no siempre empiezan en cero
                        title: {
                            display: true,
                            text: 'Precio (USD)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return formatCurrency(value); // Formatear etiquetas del eje Y
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Manejo de Eventos ---

    /**
     * Maneja la búsqueda de criptomonedas cuando se hace clic en el botón o se presiona Enter.
     */
    function handleSearch() {
        const selectedCoinName = coinSearchInput.value.trim();
        if (!selectedCoinName) {
            showError('Por favor, ingresa el nombre de una criptomoneda.');
            return;
        }

        // Buscar el ID de la moneda por su nombre
        const selectedCoin = allCoins.find(coin => 
            coin.name.toLowerCase() === selectedCoinName.toLowerCase() ||
            coin.symbol.toLowerCase() === selectedCoinName.toLowerCase()
        );

        if (selectedCoin) {
            currentCoinId = selectedCoin.id; // Actualiza el ID de la moneda actual
            const selectedDays = daysSelect.value;
            fetchCoinHistory(currentCoinId, selectedDays);
        } else {
            showError(`Criptomoneda "${selectedCoinName}" no encontrada. Intenta con un nombre exacto o símbolo.`);
        }
    }

    // Evento para el botón de búsqueda
    searchButton.addEventListener('click', handleSearch);

    // Evento para el campo de entrada (permite presionar Enter para buscar)
    coinSearchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Evento para el selector de días
    daysSelect.addEventListener('change', () => {
        if (currentCoinId) { // Solo si ya hay una moneda seleccionada
            const selectedDays = daysSelect.value;
            fetchCoinHistory(currentCoinId, selectedDays);
        }
    });

    // --- Inicialización al cargar la página ---
    fetchCoinList(); // Cargar la lista de monedas al inicio
    fetchCoinHistory(currentCoinId, daysSelect.value); // Cargar datos de Bitcoin por defecto
});
