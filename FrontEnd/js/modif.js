// Acces Modal
const modal = document.getElementById('myModal');

// Acces Bouton Modal
const btn = document.getElementById('openModalBtn');

// Acces croix/close window
const span = document.getElementsByClassName('close')[0];

//Acces Gallerie Modal 
const modalGallery = document.querySelector(".modal-gallery")

// ouverture modal
if (btn) {
    btn.onclick = function(event) {
        event.preventDefault(); // Prevent the default anchor behavior
        modal.style.display = 'block';
        displayWorkModal(allWorks); //Affichage travaux modal
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

function displayWorkModal(works) {
    modalGallery.innerHTML = ''; // Vide la galerie actuelle de la modale

    works.forEach(work => {
        const workElement = document.createElement('figure');
        workElement.classList.add('work');
        workElement.setAttribute('data-id', work.id); // Ajouter l'attribut data-id
        
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        // Ajout de l'icône de suppression
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa fa-trash"></i>'; // Utilisation de Font Awesome pour l'icône de poubelle
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = () => deleteWork(work.id);

        workElement.appendChild(img);
        workElement.appendChild(figcaption);
        workElement.appendChild(deleteBtn);

        modalGallery.appendChild(workElement);
    });
}

async function deleteWork(workId) {
    const token = localStorage.getItem('authToken'); // Récupérer le jeton d'authentification

    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Ajout du jeton d'authentification
            }
        });

        if (response.ok) {
            // Supprimer l'élément du DOM
            document.querySelector(`figure[data-id="${workId}"]`).remove();
            
            // Mettre à jour la liste allWorks
            allWorks = allWorks.filter(work => work.id !== workId);

            alert('Travail supprimé avec succès');
        } else {
            alert('Erreur lors de la suppression du travail');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression du travail');
    }
}