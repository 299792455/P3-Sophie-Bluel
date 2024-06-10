// Acces Modal
const modal = document.getElementById('myModal');

// Acces Bouton Modal
const btn = document.getElementById('openModalBtn');

// Acces croix/close window
const span = document.getElementsByClassName('close')[0];

// Acces Gallerie Modal 
const modalGallery = document.querySelector(".modal-gallery");

// Acces Bouton "Ajouter une photo"
const addPhotoBtn = document.querySelector('.modifBtn');

// Acces Formulaire d'ajout de projet
const addProjectForm = document.getElementById('addProjectForm');
const errorMessage = document.getElementById('error-message');

// Affichage Formulaire d'ajout
if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', function(event) {
        event.preventDefault();
        addProjectForm.style.display = 'block'; // Affiche le formulaire
    });
}

// ouverture modal
if (btn) {
    btn.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default anchor behavior
        modal.style.display = 'block';
        displayWorkModal(allWorks); // Affichage travaux modal
    });
}

// fermeture modal
if (span) {
    span.addEventListener('click', function() {
        modal.style.display = 'none';
    });
}

// fermeture modal par clic hors champs
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Affichage travaux modal
function displayWorkModal(works) {
    modalGallery.innerHTML = ''; // Vide la galerie actuelle de la modale

    works.forEach(work => {
        const workElement = createWorkElement(work);
        modalGallery.appendChild(workElement);
    });
}

// Soumission du formulaire
addProjectForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    const title = document.getElementById('title').value;
    const imageInput = document.getElementById('image').files[0];
    const category = document.getElementById('category').value;

    // Validation du formulaire
    if (!title || !imageInput || !category) {
        errorMessage.textContent = 'Veuillez remplir tous les champs.';
        errorMessage.style.display = 'block';
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', imageInput);
    formData.append('category', category);

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        });

        if (response.ok) {
            const newWork = await response.json();
            allWorks.push(newWork); // Ajouter le nouveau projet à la liste des travaux
            displayWorks(allWorks); // Mettre à jour la galerie

            // Ajouter le nouveau projet à la modale
            const newWorkElement = createWorkElement(newWork);
            modalGallery.appendChild(newWorkElement);

            // Réinitialiser le formulaire et masquer la modale
            addProjectForm.reset();
            addProjectForm.style.display = 'none';
            modal.style.display = 'none';
        } else {
            const errorData = await response.json();
            errorMessage.textContent = `Erreur: ${errorData.message || 'Une erreur s\'est produite.'}`;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        errorMessage.textContent = 'Une erreur s\'est produite lors de l\'ajout du projet.';
        errorMessage.style.display = 'block';
    }
});

// Fonction pour créer un élément de travail
function createWorkElement(work) {
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
    deleteBtn.innerHTML = '<i class="fa fa-trash"></i>'; 
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => deleteWork(work.id);

    workElement.appendChild(img);
    workElement.appendChild(figcaption);
    workElement.appendChild(deleteBtn);

    return workElement;
}

// Suppression travaux modal
async function deleteWork(workId) {
    const token = localStorage.getItem('authToken'); // Récupère le jeton d'authentification

    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Ajout du jeton d'authentification
            }
        });

        if (response.ok) {
            // Supprime l'élément du DOM
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