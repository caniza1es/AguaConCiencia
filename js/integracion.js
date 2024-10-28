

import { auth, database } from './firebase-config.js';
import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
    ref,
    set,
    push,
    get,
    onValue,
    query,
    orderByChild,
    equalTo,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const filterForm = document.getElementById('filter-form');
const suggestionsList = document.getElementById('suggestions-list');
const addSuggestionForm = document.getElementById('add-suggestion-form');
const suggestionTextInput = document.getElementById('suggestion-text');

let currentUser = null;
let currentUserData = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        fetchCurrentUserData();
    } else {
 
        window.location.href = 'login.html';
    }
});


function fetchCurrentUserData() {
    const userRef = ref(database, `users/${currentUser.uid}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            currentUserData = snapshot.val();
            loadSuggestions();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Completa tu perfil',
                text: 'Por favor, completa el formulario de usuario primero.',
            }).then(() => {
                window.location.href = 'user.html';
            });
        }
    }).catch((error) => {
        console.error("Error al obtener datos del usuario:", error);
    });
}


function loadSuggestions(filters = {}) {
    suggestionsList.innerHTML = ''; 

    let suggestionsRef = ref(database, 'suggestions');


    if (Object.keys(filters).length > 0) {

        get(suggestionsRef).then((snapshot) => {
            if (snapshot.exists()) {
                let suggestions = Object.values(snapshot.val());
                suggestions = suggestions.filter(suggestion => {
                    let match = true;
                    if (filters.sector) {
                        match = match && suggestion.sector === filters.sector;
                    }
                    if (filters.userType) {
                        match = match && suggestion.userType === filters.userType;
                    }
                    return match;
                });
                displaySuggestions(suggestions);
            }
        });
    } else {

        get(suggestionsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const suggestions = Object.values(snapshot.val());
                displaySuggestions(suggestions);
            }
        });
    }
}


function displaySuggestions(suggestions) {
    if (suggestions.length === 0) {
        suggestionsList.innerHTML = '<p>No hay sugerencias o reflexiones para mostrar.</p>';
        return;
    }


    suggestions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    suggestions.forEach(suggestion => {
        const card = document.createElement('div');
        card.classList.add('suggestion-card');

        const meta = document.createElement('p');
        meta.classList.add('suggestion-meta');
        meta.textContent = `${suggestion.userType === 'persona' ? 'Persona' : 'Empresa'} de ${suggestion.sector}: `;

        const text = document.createElement('p');
        text.classList.add('suggestion-text');
        text.textContent = suggestion.text;

        card.appendChild(meta);
        card.appendChild(text);

        suggestionsList.appendChild(card);
    });
}


filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const sector = filterForm['sector'].value;
    const userType = filterForm['userType'].value;

    const filters = {};
    if (sector) filters.sector = sector;
    if (userType) filters.userType = userType;

    loadSuggestions(filters);
});


addSuggestionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = suggestionTextInput.value.trim();

    if (text === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Por favor, escribe una sugerencia o reflexión antes de enviar.',
        });
        return;
    }

    const newSuggestionRef = push(ref(database, 'suggestions'));
    const suggestionData = {
        uid: currentUser.uid,
        text: text,
        sector: currentUserData.sector,
        userType: currentUserData.userType,
        timestamp: new Date().toISOString(),
    };

    set(newSuggestionRef, suggestionData)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: '¡Gracias!',
                text: 'Tu sugerencia o reflexión ha sido compartida con la comunidad.',
            });
            suggestionTextInput.value = '';
            loadSuggestions();
        })
        .catch((error) => {
            console.error("Error al enviar la sugerencia:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al enviar tu sugerencia. Por favor, inténtalo de nuevo más tarde.',
            });
        });
});
