

import { auth, database } from './firebase-config.js';
import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
    ref,
    set,
    get,
    child,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const userEmailSpan = document.getElementById('user-email');
const startFormButton = document.getElementById('start-form-button');
const formContainer = document.getElementById('dynamic-form-container');
const deleteAccountButton = document.getElementById('delete-account-button');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userEmailSpan.textContent = user.email;
        checkIfFormCompleted(user.uid);
    }
});


function checkIfFormCompleted(uid) {
    const dbRef = ref(database);
    get(child(dbRef, `users/${uid}/formCompleted`)).then((snapshot) => {
        if (snapshot.exists() && snapshot.val() === true) {
            startFormButton.textContent = 'Rehacer Formulario';
        } else {
            startFormButton.textContent = 'Completar Formulario';
        }
    }).catch((error) => {
        console.error("Error al verificar el formulario:", error);
    });
}


startFormButton.addEventListener('click', () => {
    displaySectorForm();
});


function displaySectorForm() {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <h3>Selecciona tu sector en La Candelaria</h3>
        <form id="sector-form" class="styled-form">
            <div class="form-group">
                <label for="sector">Sector:</label>
                <select id="sector" name="sector" required>
                    <option value="">Selecciona una opción</option>
                    <option value="Belén">Belén</option>
                    <option value="Las Aguas">Las Aguas</option>
                    <option value="Santa Bárbara">Santa Bárbara</option>
                    <option value="La Concordia">La Concordia</option>
                    <option value="Egipto">Egipto</option>
                    <option value="Centro Administrativo">Centro Administrativo</option>
                    <option value="Catedral">Catedral</option>
                </select>
            </div>
            <button type="submit" class="btn">Continuar</button>
        </form>
    `;

    const sectorForm = document.getElementById('sector-form');
    sectorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const sector = sectorForm.elements['sector'].value;
        displayUserTypeForm(sector);
    });
}


function displayUserTypeForm(sector) {
    formContainer.innerHTML = `
        <h3>Selecciona tu tipo de usuario</h3>
        <form id="user-type-form" class="styled-form">
            <div class="form-group">
                <label class="radio-label">
                    <input type="radio" name="userType" value="persona" required> Persona
                </label>
                <label class="radio-label">
                    <input type="radio" name="userType" value="empresa" required> Empresa
                </label>
            </div>
            <button type="submit" class="btn">Continuar</button>
        </form>
    `;

    const userTypeForm = document.getElementById('user-type-form');
    userTypeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userType = userTypeForm.elements['userType'].value;
        displayDynamicForm(userType, sector);
    });
}


function displayDynamicForm(userType, sector) {
    let formContent = '';
    if (userType === 'persona') {
        formContent = `
            <h3>Formulario para Personas</h3>
            <form id="dynamic-form" class="styled-form">
                <div class="form-group">
                    <label for="familySize">Tamaño de la familia:</label>
                    <select id="familySize" name="familySize" required>
                        <option value="">Selecciona una opción</option>
                        <option value="1">1 Persona</option>
                        <option value="2">2 Personas</option>
                        <option value="3">3 Personas</option>
                        <option value="4">4 o más Personas</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>¿Qué estrategias aplicas para optimizar el consumo de agua? (Selecciona todas las que apliquen):</label>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            Cerrar el grifo mientras te cepillas los dientes
                            <input type="checkbox" name="strategies" value="cierre_grifo">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Tomar duchas más cortas
                            <input type="checkbox" name="strategies" value="duchas_cortas">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Reutilizar agua para regar plantas
                            <input type="checkbox" name="strategies" value="reutilizacion_agua">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Usar la lavadora solo con carga completa
                            <input type="checkbox" name="strategies" value="carga_completa_lavadora">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Reparar fugas inmediatamente
                            <input type="checkbox" name="strategies" value="reparacion_fugas">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label for="hasWaterSavingDevices">¿Utilizas dispositivos ahorradores de agua?</label>
                    <select id="hasWaterSavingDevices" name="hasWaterSavingDevices" required>
                        <option value="">Selecciona una opción</option>
                        <option value="sí">Sí</option>
                        <option value="no">No</option>
                    </select>
                </div>

                <button type="submit" class="btn">Enviar</button>
            </form>
        `;
    } else if (userType === 'empresa') {
        formContent = `
            <h3>Formulario para Empresas</h3>
            <form id="dynamic-form" class="styled-form">
                <div class="form-group">
                    <label for="companySize">Tamaño de la empresa:</label>
                    <select id="companySize" name="companySize" required>
                        <option value="">Selecciona una opción</option>
                        <option value="pequeña">Pequeña</option>
                        <option value="mediana">Mediana</option>
                        <option value="grande">Grande</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="industryType">Tipo de industria:</label>
                    <input type="text" id="industryType" name="industryType" required>
                </div>

                <div class="form-group">
                    <label>¿Qué medidas aplicas para optimizar el consumo de agua? (Selecciona todas las que apliquen):</label>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            Reciclaje de agua
                            <input type="checkbox" name="measures" value="reciclaje_agua">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Sistemas de riego eficientes
                            <input type="checkbox" name="measures" value="sistemas_riego_eficientes">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Capacitación al personal sobre ahorro de agua
                            <input type="checkbox" name="measures" value="capacitacion_personal">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Uso de equipos de bajo consumo de agua
                            <input type="checkbox" name="measures" value="equipos_bajo_consumo">
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-label">
                            Monitoreo constante del consumo de agua
                            <input type="checkbox" name="measures" value="monitoreo_consumo">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label for="installationScore">Califica tus sistemas de guardado y optimización de consumo de agua (1-10):</label>
                    <input type="number" id="installationScore" name="installationScore" min="1" max="10" required>
                </div>

                <button type="submit" class="btn">Enviar</button>
            </form>
        `;
    }

    formContainer.innerHTML = formContent;

    const dynamicForm = document.getElementById('dynamic-form');
    dynamicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitFormData(userType, sector, dynamicForm);
    });
}


function submitFormData(userType, sector, form) {
    const uid = currentUser.uid;
    const userDataRef = ref(database, `users/${uid}`);

    let formData = {
        userType: userType,
        sector: sector,
        formCompleted: true,
        timestamp: new Date().toISOString(),
    };

    if (userType === 'persona') {
        formData.familySize = form.elements['familySize'].value;
        formData.strategies = Array.from(form.elements['strategies'])
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        formData.hasWaterSavingDevices = form.elements['hasWaterSavingDevices'].value;
    } else if (userType === 'empresa') {
        formData.companySize = form.elements['companySize'].value;
        formData.industryType = form.elements['industryType'].value;
        formData.measures = Array.from(form.elements['measures'])
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        formData.installationScore = parseInt(form.elements['installationScore'].value);
    }

    set(userDataRef, formData)
        .then(() => {
            alert('Formulario enviado exitosamente.');
            formContainer.style.display = 'none';
            startFormButton.textContent = 'Rehacer Formulario';
        })
        .catch((error) => {
            console.error("Error al enviar el formulario:", error);
            alert('Hubo un error al enviar el formulario: ' + error.message);
        });
}
