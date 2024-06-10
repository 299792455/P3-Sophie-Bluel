//Etape 2.2 
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const authvalid = document.getElementById("authvalid");
    const modifier = document.getElementById("modifier");
    const editionMode = document.getElementById("editionmode");

    // Vérifie le token d'authentification au chargement de la page
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        authvalid.innerHTML = "Logout";
        authvalid.href = "#"; // Empêche la redirection par défaut
        modifier.style.display="flex"; //Affiche le bouton modifier
        editionMode.style.display="flex"; 
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Empêche le comportement par défaut du formulaire

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const isAuthenticated = await authenticateUser(email, password);

            if (isAuthenticated) {
                window.location.href = 'index.html'; // Redirige vers la page d'accueil
            } else {
                const errorMessage = document.getElementById('error-message');
                errorMessage.style.display = 'block'; // Affiche le message d'erreur
            }
        });
    }

    authvalid.addEventListener('click', () => {
        if (authToken) {
            localStorage.removeItem('authToken'); // Supprime le token d'authentification
            authvalid.innerHTML = "Login";
            window.location.href = 'login.html'; // Redirige vers la page de connexion
        }
    });
});

async function authenticateUser(email, password) {
    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.token); // Stocke le token d'authentification
            const authvalid = document.getElementById("authvalid");
            authvalid.innerHTML = "Logout";
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erreur lors de la tentative d\'authentification', error);
        return false;
    }
}