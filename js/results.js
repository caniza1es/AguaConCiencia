import { auth, database } from './firebase-config.js';
import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
    ref,
    get,
    child,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const comparisonChartCanvas = document.getElementById('comparisonChart');
const demographicInfoParagraph = document.getElementById('demographic-info');
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        fetchUserData(user.uid);
    } else {
    
        window.location.href = 'login.html';
    }
});


async function fetchUserData(uid) {
    const dbRef = ref(database);
    try {
        const userSnapshot = await get(child(dbRef, `users/${uid}`));
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            fetchDemographicData(userData);
        } else {
            alert('No se encontraron datos de usuario. Por favor, completa el formulario primero.');
            window.location.href = 'user.html';
        }
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
    }
}


async function fetchDemographicData(userData) {
    const dbRef = ref(database, 'users');
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const allUsersData = snapshot.val();
            const demographicData = [];

            for (const uid in allUsersData) {
                const data = allUsersData[uid];
 
                if (uid === currentUser.uid) continue;
     
                if (data.sector === userData.sector && data.userType === userData.userType) {
                    if (userData.userType === 'persona') {
                        if (data.familySize === userData.familySize) {
                            demographicData.push(data);
                        }
                    } else if (userData.userType === 'empresa') {
                        if (data.companySize === userData.companySize) {
                            demographicData.push(data);
                        }
                    }
                }
            }

       
            displayDemographicInfo(userData);

            generateChart(userData, demographicData);
        } else {
            console.log("No hay datos de otros usuarios.");

            displayDemographicInfo(userData);
         
            generateChart(userData, []);
        }
    } catch (error) {
        console.error("Error al obtener datos demográficos:", error);
    }
}


function displayDemographicInfo(userData) {
    let demographicText = '';

    if (userData.userType === 'persona') {
        demographicText = `Estás siendo comparado con otras personas del sector ${userData.sector} que tienen una familia de ${userData.familySize} miembro(s).`;
    } else if (userData.userType === 'empresa') {
        demographicText = `Estás siendo comparado con otras empresas del sector ${userData.sector} de tamaño "${userData.companySize}".`;
    }

    demographicInfoParagraph.textContent = demographicText;
}


function generateSuggestions(userData) {
    const suggestionsContent = document.getElementById('suggestions-content');
    suggestionsContent.innerHTML = ''; 

    let suggestions = [];

    if (userData.userType === 'persona') {

        if (!userData.strategies || userData.strategies.length < 3) {
            suggestions.push("¡Convierte el ahorro de agua en un juego familiar! ¿Quién puede tomar la ducha más corta sin perder una gota de diversión?");
        }
        if (userData.hasWaterSavingDevices === 'no') {
            suggestions.push("¡Los dispositivos ahorradores de agua son los superhéroes ocultos del hogar! Invita a uno a tu casa y salva el planeta juntos.");
        }
        suggestions.push("Comparte tus secretos de ahorro de agua con tus vecinos. ¡La competencia amistosa nunca fue tan ecológica!");
    } else if (userData.userType === 'empresa') {

        if (!userData.measures || userData.measures.length < 3) {
            suggestions.push("¡Haz que el ahorro de agua sea parte de la cultura de tu empresa! Organiza desafíos y recompensas para el equipo más ahorrador.");
        }
        if (userData.installationScore < 7) {
            suggestions.push("Actualiza tus sistemas y conviértete en la empresa más 'cool' del barrio. ¡La tecnología verde está de moda!");
        }
        suggestions.push("¡Comparte tus logros en sostenibilidad en las redes sociales y haz que tus clientes se unan a la fiesta ecológica!");
    }


    suggestions.forEach(suggestion => {
        const p = document.createElement('p');
        p.classList.add('suggestion-text');
        p.textContent = suggestion;
        suggestionsContent.appendChild(p);
    });
}


function generateChart(userData, demographicData) {

    let labels = [];
    let userValues = [];
    let demographicValues = [];

    if (userData.userType === 'persona') {
        labels = ['Estrategias Aplicadas', 'Uso de Dispositivos Ahorradores'];


        const userStrategiesCount = userData.strategies ? userData.strategies.length : 0;
        const userHasDevices = userData.hasWaterSavingDevices === 'sí' ? 1 : 0;

        userValues = [userStrategiesCount, userHasDevices];


        let totalStrategies = 0;
        let totalDevices = 0;

        demographicData.forEach(data => {
            totalStrategies += data.strategies ? data.strategies.length : 0;
            totalDevices += data.hasWaterSavingDevices === 'sí' ? 1 : 0;
        });

        const count = demographicData.length || 1; 
        demographicValues = [
            demographicData.length > 0 ? (totalStrategies / count).toFixed(2) : 0,
            demographicData.length > 0 ? (totalDevices / count).toFixed(2) : 0,
        ];
    } else if (userData.userType === 'empresa') {
        labels = ['Medidas Aplicadas', 'Calidad de Sistemas (1-10)'];


        const userMeasuresCount = userData.measures ? userData.measures.length : 0;
        const userInstallationScore = userData.installationScore || 0;

        userValues = [userMeasuresCount, userInstallationScore];


        let totalMeasures = 0;
        let totalInstallationScore = 0;

        demographicData.forEach(data => {
            totalMeasures += data.measures ? data.measures.length : 0;
            totalInstallationScore += data.installationScore || 0;
        });

        const count = demographicData.length || 1;
        demographicValues = [
            demographicData.length > 0 ? (totalMeasures / count).toFixed(2) : 0,
            demographicData.length > 0 ? (totalInstallationScore / count).toFixed(2) : 0,
        ];
    }


    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Tú',
                data: userValues,
                backgroundColor: 'rgba(46, 204, 113, 0.7)', 
                borderColor: 'rgba(39, 174, 96, 1)',
                borderWidth: 1,
            },
            {
                label: 'Promedio del Grupo',
                data: demographicValues,
                backgroundColor: 'rgba(52, 152, 219, 0.7)', 
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 1,
            },
        ],
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'x', 
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                    title: {
                        display: true,
                        text: 'Cantidad',
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Categorías',
                    },
                },
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    enabled: true,
                },
            },
        },
    };


    if (window.myChart) {
        window.myChart.destroy();
    }


    window.myChart = new Chart(comparisonChartCanvas, config);

    generateSuggestions(userData);
}
