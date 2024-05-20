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
    return categories;
}

// Fonction pour afficher les travaux dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Vider la galerie actuelle

    works.forEach(work => {
        const workElement = document.createElement('figure');
        workElement.classList.add('work');
        
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
    categoryMenu.innerHTML = ''; // Vider le menu actuel

    // Ajouter un bouton pour "Tous"
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

let allWorks = [];

// Charger les travaux et les catégories après le chargement du DOM
document.addEventListener('DOMContentLoaded', async () => {
    allWorks = await fetchWorks();
    const categories = await fetchCategories();
    displayWorks(allWorks);
    displayCategories(categories);
});