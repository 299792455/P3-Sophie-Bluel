// Acces Modal
const modal = document.getElementById('myModal');

// Acces Bouton Modal
const btn = document.getElementById('openModalBtn');

// Acces croix/close window
const span = document.getElementsByClassName('close')[0];

// Acces Gallerie Modal 
const modalGallery = document.querySelector(".modal-gallery");

// Acces Retour Modal
const spanContent = document.getElementsByClassName('close-form')[0];

// Acces Bouton "Ajouter une photo"
const addPhotoBtn = document.querySelector('.modifBtn');

// Acces Formulaire d'ajout de projet
const addProjectForm = document.getElementById('addProjectForm');
const errorMessage = document.getElementById('error-message');
const preview = document.getElementById('preview');

// Bouton de soumission du formulaire
const submitButton = addProjectForm.querySelector('button[type="submit"]');

// Affichage Formulaire d'ajout
if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', function(event) {
        event.preventDefault();
        addProjectForm.style.display = 'block'; // Affiche le formulaire
        resetForm();
    });
}

// Ouverture modale
if (btn) {
    btn.addEventListener('click', async function(event) {
        event.preventDefault(); 
        modal.style.display = 'block';
        displayWorkModal(allWorks); // Affichage travaux modal

        const categories = await fetchCategories(); // Récupérer les catégories
        console.log('Catégories pour la modale :', categories); // Log pour vérifier les catégories récupérées pour la modale
        populateCategorySelect(categories); // Remplir le menu déroulant

        resetForm(); // Initialise l'état du bouton de soumission
    });
}

// Fermeture modale
if (span) {
    span.addEventListener('click', function() {
        modal.style.display = 'none';
    });
}

// Retour modal
if (spanContent) {
    spanContent.addEventListener('click', function() {
        addProjectForm.style.display = 'none';
    });
}

// Fermeture modal par clic hors champs
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

// Validation du fichier
function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 4 * 1024 * 1024; // 4 Mo

    if (!validTypes.includes(file.type)) {
        return 'Le fichier doit être au format JPG ou PNG.';
    }

    if (file.size > maxSize) {
        return 'Le fichier ne doit pas dépasser 4 Mo.';
    }

    return null;
}

// Mise à jour de l'état du bouton de soumission
function updateSubmitButtonState() {
    const title = document.getElementById('title').value;
    const imageInput = document.getElementById('image').files[0];
    const category = document.getElementById('category').value;

    if (title && imageInput && category && !validateFile(imageInput)) {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = "#1D6154"; // couleur activée
    } else {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = "gray"; // couleur désactivée
    }
}

// Réinitialisation du formulaire et du bouton de soumission
function resetForm() {
    addProjectForm.reset();
    updateSubmitButtonState();
    errorMessage.style.display = 'none';
    preview.style.display = 'none';
}

// Écouteurs pour mettre à jour l'état du bouton de soumission et la prévisualisation de l'image
addProjectForm.addEventListener('input', updateSubmitButtonState);
addProjectForm.addEventListener('change', updateSubmitButtonState);

document.getElementById('image').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileError = validateFile(file);
    if (!fileError) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

// Soumission du formulaire
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire

        const title = document.getElementById('title').value;
        const imageInput = document.getElementById('image').files[0];
        const category = document.getElementById('category').value;

        // Validation du fichier
        const fileError = validateFile(imageInput);
        if (fileError) {
            errorMessage.textContent = fileError;
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
                displayWorks(allWorks); // Mettre à jour la galerie principale

                // Ajouter le nouveau projet à la modale
                const newWorkElement = createWorkElement(newWork);
                modalGallery.appendChild(newWorkElement);

                // Réinitialiser le formulaire
                resetForm();
                addProjectForm.style.display = 'none';
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
}

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
    deleteBtn.onclick = (event) => {
        event.stopPropagation();
        deleteWork(work.id);
    };

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

            // Supprime l'élément du DOM dans la modale sans la fermer
            document.querySelector(`.modal-gallery figure[data-id="${workId}"]`).remove();

            // Afficher un message visuel
            errorMessage.textContent = 'Travail supprimé avec succès';
            errorMessage.style.display = 'block';
            errorMessage.style.color = 'green';
        } else {
            errorMessage.textContent = 'Erreur lors de la suppression du travail';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        errorMessage.textContent = 'Erreur lors de la suppression du travail';
        errorMessage.style.display = 'block';
    }
}