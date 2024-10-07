// sugerencias.js

// Inicializar Firebase (asegúrate de que firebase-config.js está correctamente configurado)

// Función para obtener sugerencias y razones de los usuarios
function obtenerSugerencias() {
    database.ref('usuarios').once('value').then(function(snapshot) {
        let sugerencias = [];
        let razones = [];
        snapshot.forEach(function(childSnapshot) {
            let usuario = childSnapshot.val();
            if (usuario.practicaAhorro && usuario.practicaAhorro.trim() !== '') {
                sugerencias.push(usuario.practicaAhorro.trim());
            }
            if (usuario.razonesNoAhorro && usuario.razonesNoAhorro.trim() !== '') {
                razones.push(usuario.razonesNoAhorro.trim());
            }
        });

        mostrarSugerencias(sugerencias, razones);
    }).catch(function(error) {
        console.error('Error al obtener sugerencias:', error);
    });
}

// Función para mostrar las sugerencias y razones en la página
function mostrarSugerencias(sugerencias, razones) {
    const listaSugerencias = document.getElementById('listaSugerencias');
    const listaRazones = document.getElementById('listaRazones');
    listaSugerencias.innerHTML = '';
    listaRazones.innerHTML = '';

    if (sugerencias.length === 0) {
        listaSugerencias.innerHTML = '<li>No hay sugerencias para mostrar.</li>';
    } else {
        sugerencias.forEach(function(sugerencia) {
            const li = document.createElement('li');
            li.textContent = sugerencia;
            listaSugerencias.appendChild(li);
        });
    }

    if (razones.length === 0) {
        listaRazones.innerHTML = '<li>No hay razones para mostrar.</li>';
    } else {
        razones.forEach(function(razon) {
            const li = document.createElement('li');
            li.textContent = razon;
            listaRazones.appendChild(li);
        });
    }
}

// Ejecutar la función al cargar la página
window.onload = obtenerSugerencias;
