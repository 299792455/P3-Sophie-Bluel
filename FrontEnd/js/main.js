// Fonction pour récupérer les travaux depuis l'API
async function fetchWorks() {
    const response = await fetch('http://localhost:5678/api/works');
    const works = await response.json();
    return works;
}

// Fonction pour récupérer les catégories depuis l'API
async function fetchCategories() {
    const response = await fetch('http://localhost:5678/api/categories');
    const categories = await response.json();
    console.log('Catégories récupérées :', categories); // Log pour vérifier les catégories récupérées
    return categories;
}

// Fonction pour afficher les travaux dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Vide la galerie actuelle

    works.forEach(work => {
        const workElement = document.createElement('figure');
        workElement.classList.add('work');
        workElement.setAttribute('data-id', work.id); // Ajouter l'attribut data-id
        
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        workElement.appendChild(img);
        workElement.appendChild(figcaption);

        gallery.appendChild(workElement);
    });
}

// Fonction pour afficher les catégories dans le menu
function displayCategories(categories) {
    const categoryMenu = document.querySelector('#category-menu');
    categoryMenu.innerHTML = ''; // Vide le menu actuel

    // Ajout bouton pour "Tous"
    const allButton = document.createElement('button');
    allButton.textContent = 'Tous';
    allButton.addEventListener('click', () => {
        filterWorks(null);
    });
    categoryMenu.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.addEventListener('click', () => {
            filterWorks(category.id);
        });
        categoryMenu.appendChild(button);
    });
}

// Fonction pour filtrer les travaux par catégorie
function filterWorks(categoryId) {
    if (categoryId === null) {
        displayWorks(allWorks);
    } else {
        const filteredWorks = allWorks.filter(work => work.categoryId === categoryId);
        displayWorks(filteredWorks);
    }
}

// Fonction pour remplir le menu déroulant des catégories
function populateCategorySelect(categories) {
    const categorySelect = document.getElementById('category');
    console.log('Remplissage du menu déroulant des catégories :', categories); // Log pour vérifier les catégories passées
    if (categorySelect) {
        categorySelect.innerHTML = ''; // Vide les options actuelles
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
}

let allWorks = [];

// Charger les travaux et les catégories après le chargement du DOM
document.addEventListener('DOMContentLoaded', async () => {
    allWorks = await fetchWorks();
    const categories = await fetchCategories();
    displayWorks(allWorks);
    displayCategories(categories);
    populateCategorySelect(categories); // Appel pour remplir le menu déroulant
});