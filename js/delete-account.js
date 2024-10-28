

import { auth, database } from './firebase-config.js';
import {
    onAuthStateChanged,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
    ref,
    remove
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const userEmailSpan = document.getElementById('user-email');
const deleteAccountButton = document.getElementById('delete-account-button');

onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailSpan.textContent = user.email;

    }
});


deleteAccountButton.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {

        const confirmation = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción eliminará todos tus datos y no se puede deshacer.");
        if (confirmation) {

            const userRef = ref(database, `users/${user.uid}`);
            remove(userRef)
                .then(() => {

                    deleteUser(user).then(() => {
                        alert("Tu cuenta y datos han sido eliminados exitosamente.");
                        window.location.href = 'index.html';
                    }).catch((error) => {
                        if (error.code === 'auth/requires-recent-login') {

                            reauthenticateUserAndDelete(user);
                        } else {
                            console.error("Error al eliminar la cuenta:", error);
                            alert("Hubo un error al eliminar tu cuenta: " + error.message);
                        }
                    });
                })
                .catch((error) => {
                    console.error("Error al eliminar los datos del usuario:", error);
                    alert("Hubo un error al eliminar tus datos: " + error.message);
                });
        }
    }
});


function reauthenticateUserAndDelete(user) {
    const reauthEmail = prompt("Por favor, introduce tu correo electrónico para reautenticarte:");
    const reauthPassword = prompt("Por favor, introduce tu contraseña para reautenticarte:");
    if (reauthEmail && reauthPassword) {
        const credential = EmailAuthProvider.credential(reauthEmail, reauthPassword);
        reauthenticateWithCredential(user, credential).then(() => {

            const userRef = ref(database, `users/${user.uid}`);
            remove(userRef)
                .then(() => {
                    deleteUser(user).then(() => {
                        alert("Tu cuenta y datos han sido eliminados exitosamente.");
                        window.location.href = 'index.html';
                    }).catch((error) => {
                        console.error("Error al eliminar la cuenta después de reautenticar:", error);
                        alert("Hubo un error al eliminar tu cuenta: " + error.message);
                    });
                })
                .catch((error) => {
                    console.error("Error al eliminar los datos del usuario después de reautenticar:", error);
                    alert("Hubo un error al eliminar tus datos: " + error.message);
                });
        }).catch((error) => {
            console.error("Error al reautenticar:", error);
            alert("No se pudo reautenticar. Por favor, verifica tus credenciales.");
        });
    } else {
        alert("Reautenticación cancelada.");
    }
}
