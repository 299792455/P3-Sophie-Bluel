// Accès Modal
const modal = document.getElementById('myModal');

// Accès Bouton Modal
const openModalBtn = document.getElementById('openModalBtn');

// Accès croix/close window pour la modale
const closeModalBtn = modal.querySelector('.close');

// Accès Retour à la galerie
const backToGalleryBtn = modal.querySelector('.close-form');

// Accès vues modales
const galleryView = document.getElementById('galleryView');
const addPhotoView = document.getElementById('addPhotoView');

// Accès Formulaire d'ajout de projet
const addProjectForm = document.getElementById('addProjectForm');
const errorMessage = document.getElementById('error-message');
const preview = document.getElementById('preview');

// Bouton de soumission du formulaire
const submitButton = addProjectForm.querySelector('button[type="submit"]');

// Affichage Formulaire d'ajout
document.querySelector('.modifBtn').addEventListener('click', function(event) {
    event.preventDefault();
    galleryView.style.display = 'none';
    addPhotoView.style.display = 'block';
    resetForm();
    resetAddPhotoElements(); // Réinitialise l'état des éléments
});

// Ouverture de la modale
openModalBtn.addEventListener('click', async function(event) {
    event.preventDefault(); 
    modal.style.display = 'block';
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
    displayWorkModal(allWorks); // Affichage travaux modal

    const categories = await fetchCategories(); // Récupérer les catégories
    console.log('Catégories pour la modale :', categories); // Log pour vérifier les catégories récupérées pour la modale
    populateCategorySelect(categories); // Remplir le menu déroulant

    resetForm(); // Initialise l'état du bouton de soumission
});

// Fermeture de la modale
closeModalBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Retour à la galerie depuis l'ajout photo
backToGalleryBtn.addEventListener('click', function() {
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
    resetForm();
    resetAddPhotoElements(); // Réinitialise l'état des éléments
});

// Fermeture de la modale par clic hors champ
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Affichage travaux modal
function displayWorkModal(works) {
    const modalGallery = document.querySelector(".modal-gallery");
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

    if (!validTypes.includes(file.type) || file.size > maxSize) {
        return false;
    }

    return true;
}

// Confirmation du bouton de soumission
function updateSubmitButtonState() {
    const title = document.getElementById('title').value.trim(); 
    const imageInput = document.getElementById('image').files[0];
    const category = document.getElementById('category').value;

    if (title && imageInput && category && validateFile(imageInput)) {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = "#1D6154";
    } else {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = "gray";
    }
}

// Réinitialisation du formulaire et du bouton de soumission
function resetForm() {
    addProjectForm.reset();
    document.getElementById('category').selectedIndex = 0; // Sélectionne l'option par défaut
    updateSubmitButtonState();
    errorMessage.style.display = 'none';
    preview.style.display = 'none';
    resetAddPhotoElements(); // Réinitialise l'état des éléments
}

// Réinitialisation des éléments
function resetAddPhotoElements() {
    document.querySelector('.custom-button').style.display = 'inline-block';
    document.querySelector('.back-ajout p').style.display = 'block';
    document.querySelector('.back-ajout i').style.display = 'block';
}

// Écouteurs pour mettre à jour l'état du bouton de soumission et la prévisualisation de l'image
addProjectForm.addEventListener('input', updateSubmitButtonState);
addProjectForm.addEventListener('change', updateSubmitButtonState);

document.getElementById('image').addEventListener('change', function(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const isValid = validateFile(file);

    if (isValid) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
             // Masquer le bouton "Ajouter une photo" et la phrase de restriction
             document.querySelector('.custom-button').style.display = 'none';
             document.querySelector('.back-ajout p').style.display = 'none';
             document.querySelector('.back-ajout i').style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
        fileInput.value = ''; // Réinitialiser le champ de fichier
        alert("Fichier invalide. Veuillez choisir un fichier JPG ou PNG de moins de 4 Mo.");
    }
    updateSubmitButtonState();
});

// Soumission du formulaire
addProjectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const imageInput = document.getElementById('image').files[0];
    const category = document.getElementById('category').value;

    // Validation du fichier
    const fileError = !validateFile(imageInput);
    if (fileError) {
        errorMessage.textContent = 'Fichier invalide. Veuillez choisir un fichier JPG ou PNG de moins de 4 Mo.';
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
            const modalGallery = document.querySelector(".modal-gallery");
            modalGallery.appendChild(newWorkElement);

            // Réinitialiser le formulaire
            resetForm();
            modal.style.display = 'none';

            // Mettre à jour les catégories filtrées
            filterWorks(currentCategoryId); // Actualiser la vue de la catégorie actuelle
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
    deleteBtn.onclick = (event) => {
        event.stopPropagation();
        confirmAndDeleteWork(work.id);
    };

    workElement.appendChild(img);
    workElement.appendChild(figcaption);
    workElement.appendChild(deleteBtn);

    return workElement;
}

// Fonction de confirmation et suppression des travaux
async function confirmAndDeleteWork(workId) {
    const confirmDeletion = window.confirm('Êtes-vous sûr de vouloir supprimer ce travail ?');
    if (confirmDeletion) {
        await deleteWork(workId);
        alert('Le travail a été supprimé avec succès.');
    }
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
            // Mettre à jour la liste allWorks
            allWorks = allWorks.filter(work => work.id !== workId);

            // Supprime l'élément du DOM dans la galerie principale
            const workElement = document.querySelector(`.gallery figure[data-id="${workId}"]`);
            if (workElement) {
                workElement.remove();
            } else {
                console.warn(`Element with data-id="${workId}" not found in main gallery.`);
            }

            // Supprime l'élément du DOM dans la modale sans la fermer
            const modalWorkElement = document.querySelector(`.modal-gallery figure[data-id="${workId}"]`);
            if (modalWorkElement) {
                modalWorkElement.remove();
            } else {
                console.warn(`Element with data-id="${workId}"] not found in modal gallery.`);
            }
        } else {
            console.error('Erreur lors de la suppression du travail');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}