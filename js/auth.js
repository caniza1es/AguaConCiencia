
import { auth, database } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


function updateNav(user) {
    const nav = document.getElementById('main-nav');
    if (user) {
        nav.classList.remove('unauthenticated');
        nav.classList.add('authenticated');
    } else {
        nav.classList.remove('authenticated');
        nav.classList.add('unauthenticated');
    }
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = registerForm['email'].value;
        const password = registerForm['password'].value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {

                window.location.href = 'user.html';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}


const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['email'].value;
        const password = loginForm['password'].value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {

                window.location.href = 'user.html';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}


const logoutButton = document.getElementById('nav-logout');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault(); 
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        }).catch((error) => {
            alert(error.message);
        });
    });
}


onAuthStateChanged(auth, (user) => {
    updateNav(user);

    if (user) {

        const currentPage = window.location.pathname.split('/').pop();


        if (currentPage === 'login.html' || currentPage === 'register.html') {
            window.location.href = 'user.html';
        }
    } else {

        const currentPage = window.location.pathname.split('/').pop();


        if (currentPage === 'user.html') {
            window.location.href = 'login.html';
        }
    }
});

