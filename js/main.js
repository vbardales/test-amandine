/* ========================================
   AMANDINE — Script principal
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  chargerCreations();
  initNavigation();
  initLightbox();
});

/* --- Chargement des créations depuis le JSON --- */
async function chargerCreations() {
  try {
    const reponse = await fetch('creations.json');
    const donnees = await reponse.json();
    const creations = donnees.creations || [];

    // Trier par date décroissante (les plus récentes en premier)
    creations.sort((a, b) => new Date(b.date) - new Date(a.date));

    afficherCreations(creations);
    initFiltres(creations);
  } catch (erreur) {
    console.error('Erreur lors du chargement des créations:', erreur);
    document.querySelector('.grille').innerHTML =
      '<p class="pas-de-resultat">Impossible de charger les créations pour le moment.</p>';
  }
}

/* --- Affichage des cartes --- */
function afficherCreations(creations) {
  const grille = document.querySelector('.grille');
  grille.innerHTML = '';

  if (creations.length === 0) {
    grille.innerHTML = '<p class="pas-de-resultat">Aucune création dans cette catégorie pour le moment.</p>';
    return;
  }

  creations.forEach((creation, index) => {
    const carte = document.createElement('article');
    carte.className = 'carte';
    carte.style.animationDelay = `${index * 0.1}s`;
    carte.dataset.categorie = creation.categorie;

    const dateFormatee = new Date(creation.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    carte.innerHTML = `
      <div class="carte-image">
        <img src="${escapeHtml(creation.image)}"
             alt="${escapeHtml(creation.titre)} — ${escapeHtml(creation.categorie)} par Amandine"
             loading="lazy"
             onerror="this.parentElement.innerHTML='<div style=&quot;display:flex;align-items:center;justify-content:center;height:100%;color:#6b6b6b;font-size:0.9rem;&quot;>Image à venir</div>'">
        <span class="carte-categorie">${escapeHtml(creation.categorie)}</span>
        <div class="carte-overlay">
          <span>Voir en grand</span>
        </div>
      </div>
      <div class="carte-contenu">
        <h3>${escapeHtml(creation.titre)}</h3>
        <p>${escapeHtml(creation.description)}</p>
        <time class="carte-date" datetime="${escapeHtml(creation.date)}">${dateFormatee}</time>
      </div>
    `;

    carte.addEventListener('click', () => ouvrirLightbox(creation));
    grille.appendChild(carte);
  });
}

/* --- Filtres par catégorie --- */
function initFiltres(creations) {
  const conteneur = document.querySelector('.filtres');
  const categories = [...new Set(creations.map(c => c.categorie))].sort();

  conteneur.innerHTML = '<button class="filtre-btn active" data-categorie="Toutes">Toutes</button>';
  categories.forEach(cat => {
    conteneur.innerHTML += `<button class="filtre-btn" data-categorie="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
  });

  conteneur.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filtre-btn')) return;

    conteneur.querySelectorAll('.filtre-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const categorie = e.target.dataset.categorie;
    const filtrees = categorie === 'Toutes'
      ? creations
      : creations.filter(c => c.categorie === categorie);

    afficherCreations(filtrees);
  });
}

/* --- Lightbox --- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const fermer = lightbox.querySelector('.lightbox-fermer');

  fermer.addEventListener('click', fermerLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) fermerLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fermerLightbox();
  });
}

function ouvrirLightbox(creation) {
  const lightbox = document.getElementById('lightbox');
  lightbox.querySelector('img').src = creation.image;
  lightbox.querySelector('img').alt = creation.titre;
  lightbox.querySelector('h3').textContent = creation.titre;
  lightbox.querySelector('p').textContent = creation.description;
  lightbox.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function fermerLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('visible');
  document.body.style.overflow = '';
}

/* --- Navigation mobile --- */
function initNavigation() {
  const burger = document.querySelector('.menu-burger');
  const navLinks = document.querySelector('.nav-links');

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Fermer le menu au clic sur un lien
  navLinks.querySelectorAll('a').forEach(lien => {
    lien.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

/* --- Utilitaire anti-XSS --- */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
