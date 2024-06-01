// Acces Modal
const modal = document.getElementById('myModal');

// Acces Bouton Modal
const btn = document.getElementById('openModalBtn');

// Acces croix/close window
const span = document.getElementsByClassName('close')[0];

// ouverture modal
if (btn) {
    btn.onclick = function(event) {
        event.preventDefault(); // Prevent the default anchor behavior
        modal.style.display = 'block';
    }
}

// fermeture modal
if (span) {
    span.onclick = function() {
        modal.style.display = 'none';
    }
}

// fermeture modal par clic hors champs
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}