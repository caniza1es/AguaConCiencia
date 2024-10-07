// graficos.js

// Las variables 'firebase' y 'database' ya están disponibles gracias a 'firebase-config.js'

// Variables para almacenar datos
let usuariosData = [];

// Función para obtener datos de Firebase y generar gráficas
function obtenerDatosYGenerarGraficas() {
    database.ref('usuarios').once('value').then(function(snapshot) {
        usuariosData = [];
        snapshot.forEach(function(childSnapshot) {
            usuariosData.push(childSnapshot.val());
        });

        // Verificar que se están obteniendo los datos
        console.log('Datos de usuarios:', usuariosData);

        generarGraficos();
        generarMapaInteractivo();
    }).catch(function(error) {
        console.error('Error al obtener datos de Firebase:', error);
    });
}

// Llamar a la función al cargar la página
window.onload = obtenerDatosYGenerarGraficas;

function generarGraficos() {
    // Limpiar los gráficos existentes
    if (window.consumoChart && typeof window.consumoChart.destroy === 'function') window.consumoChart.destroy();
    if (window.dispositivosChart && typeof window.dispositivosChart.destroy === 'function') window.dispositivosChart.destroy();
    if (window.fugasChart && typeof window.fugasChart.destroy === 'function') window.fugasChart.destroy();
    if (window.concienciaChart && typeof window.concienciaChart.destroy === 'function') window.concienciaChart.destroy();

    // Verificar si hay datos
    if (usuariosData.length === 0) {
        console.log('No hay datos para mostrar en las gráficas.');
        return;
    }

    // 1. Gráfico de Consumo diario promedio por persona en cada hogar
    // Limitar a los primeros 20 hogares para mejorar la legibilidad
    const hogaresLimitados = usuariosData.slice(0, 20);
    const consumoPorPersona = hogaresLimitados.map(usuario => usuario.consumoDiario / usuario.tamanoHogar);
    const labelsHogares = hogaresLimitados.map((usuario, index) => `Hogar ${index + 1}`);

    const ctxConsumo = document.getElementById('consumoPromedioChart').getContext('2d');
    window.consumoChart = new Chart(ctxConsumo, {
        type: 'bar',
        data: {
            labels: labelsHogares,
            datasets: [{
                label: 'Consumo promedio por persona (L)',
                data: consumoPorPersona,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });

    // 2. Gráfico de Uso de dispositivos de ahorro de agua
    const totalUsuarios = usuariosData.length;
    const usuariosConDispositivos = usuariosData.filter(usuario => usuario.dispositivosAhorro === 'Sí').length;
    const usuariosSinDispositivos = totalUsuarios - usuariosConDispositivos;

    const ctxDispositivos = document.getElementById('dispositivosAhorroChart').getContext('2d');
    window.dispositivosChart = new Chart(ctxDispositivos, {
        type: 'pie',
        data: {
            labels: ['Usan dispositivos de ahorro', 'No usan dispositivos de ahorro'],
            datasets: [{
                data: [usuariosConDispositivos, usuariosSinDispositivos],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });

    // 3. Gráfico de Porcentaje de hogares con fugas
    const hogaresConFugas = usuariosData.filter(usuario => usuario.fugas === 'Sí').length;
    const hogaresSinFugas = totalUsuarios - hogaresConFugas;

    const ctxFugas = document.getElementById('fugasChart').getContext('2d');
    window.fugasChart = new Chart(ctxFugas, {
        type: 'bar',
        data: {
            labels: ['Con fugas', 'Sin fugas'],
            datasets: [{
                label: 'Número de hogares',
                data: [hogaresConFugas, hogaresSinFugas],
                backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                borderColor: ['rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision:0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });

    // 4. Gráfico de Nivel promedio de conciencia sobre el uso del agua
    // Cambiar a un histograma para mejor legibilidad
    const nivelesConciencia = usuariosData
        .filter(usuario => usuario.concienciaAgua)
        .map(usuario => parseInt(usuario.concienciaAgua));

    const ctxConciencia = document.getElementById('concienciaAguaChart').getContext('2d');
    window.concienciaChart = new Chart(ctxConciencia, {
        type: 'bar', // Cambiado de 'line' a 'bar' para mejor representación de frecuencias
        data: {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [{
                label: 'Número de usuarios',
                data: [
                    nivelesConciencia.filter(nivel => nivel === 1).length,
                    nivelesConciencia.filter(nivel => nivel === 2).length,
                    nivelesConciencia.filter(nivel => nivel === 3).length,
                    nivelesConciencia.filter(nivel => nivel === 4).length,
                    nivelesConciencia.filter(nivel => nivel === 5).length
                ],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Nivel de Conciencia'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision:0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}

function generarMapaInteractivo() {
    if (window.myMap) {
        window.myMap.off();
        window.myMap.remove();
    }

    window.myMap = L.map('map').setView([4.5954, -74.0743], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(window.myMap);

    var sectores = [
        { nombre: 'La Catedral', coordenadas: [4.5980, -74.0758], consumoTotal: 0, numUsuarios: 0 },
        { nombre: 'La Concordia', coordenadas: [4.5930, -74.0730], consumoTotal: 0, numUsuarios: 0 },
        { nombre: 'Las Aguas', coordenadas: [4.6000, -74.0710], consumoTotal: 0, numUsuarios: 0 },
        { nombre: 'Belén', coordenadas: [4.5920, -74.0780], consumoTotal: 0, numUsuarios: 0 },
        { nombre: 'Egipto', coordenadas: [4.5940, -74.0690], consumoTotal: 0, numUsuarios: 0 },
        { nombre: 'Santa Bárbara', coordenadas: [4.5970, -74.0730], consumoTotal: 0, numUsuarios: 0 },
        { nombre: 'Centro Administrativo', coordenadas: [4.6010, -74.0770], consumoTotal: 0, numUsuarios: 0 },
        { nombre: 'Santa Inés', coordenadas: [4.5950, -74.0720], consumoTotal: 0, numUsuarios: 0 }
    ];

    // Calcular consumo promedio para cada sector
    sectores.forEach(function(sector) {
        const usuariosEnSector = usuariosData.filter(usuario => usuario.sector === sector.nombre);
        sector.numUsuarios = usuariosEnSector.length;
        sector.consumoTotal = usuariosEnSector.reduce((total, usuario) => total + usuario.consumoDiario, 0);
        sector.consumoPromedio = sector.numUsuarios > 0 ? sector.consumoTotal / sector.numUsuarios : 0;
    });

    // Obtener el consumo promedio máximo y mínimo
    let consumosPromedios = sectores.map(sector => sector.consumoPromedio);
    let maxConsumo = Math.max(...consumosPromedios);
    let minConsumo = Math.min(...consumosPromedios);

    // Definir una escala de colores
    function getColor(consumo) {
        let consumoNormalizado = (consumo - minConsumo) / (maxConsumo - minConsumo);
        if (isNaN(consumoNormalizado)) {
            consumoNormalizado = 0.5; // Valor medio si no hay variación
        }
        // Retorna un color entre verde (bajo consumo) y rojo (alto consumo)
        let r = Math.floor(255 * consumoNormalizado);
        let g = Math.floor(255 * (1 - consumoNormalizado));
        return `rgb(${r},${g},0)`;
    }

    // Función para calcular el radio basado en la raíz cuadrada del consumo
    function getRadio(consumo, maxRadio = 500) {
        const maxConsumo = Math.max(...sectores.map(sector => sector.consumoPromedio));
        if (maxConsumo === 0) return 100; // Radio mínimo
        const radio = Math.sqrt(consumo / maxConsumo) * maxRadio;
        return radio < 100 ? 100 : radio; // Radio mínimo de 100
    }

    sectores.forEach(function(sector) {
        let color = getColor(sector.consumoPromedio);
        let radioProporcional = getRadio(sector.consumoPromedio, 500); // Ajusta '500' según necesites

        // Crear el círculo
        L.circle(sector.coordenadas, {
            color: 'black',
            fillColor: color,
            fillOpacity: 0.5,
            radius: radioProporcional
        }).addTo(window.myMap)
        .bindPopup(`
            <b>${sector.nombre}</b><br>
            Usuarios: ${sector.numUsuarios}<br>
            Consumo promedio: ${sector.consumoPromedio.toFixed(2)} L/día
        `);
    });

    // Agregar una leyenda al mapa
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend');
        let grades = [minConsumo, (minConsumo + maxConsumo) / 2, maxConsumo];
        let labels = [];

        // Generar etiquetas para la leyenda
        for (let i = 0; i < grades.length; i++) {
            let color = getColor(grades[i]);
            div.innerHTML +=
                '<i style="background:' + color + '"></i> ' +
                grades[i].toFixed(2) + (grades[i + 1] ? '&ndash;' + grades[i + 1].toFixed(2) + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(window.myMap);
}
