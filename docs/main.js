document.addEventListener("DOMContentLoaded", () => {
    initStoryboard();
});

async function initStoryboard() {
    try {
        // Chargement asynchrone du fichier JSON (assure-toi qu'il soit à la racine du projet ou adapte le chemin)
        const response = await fetch('./storyboard.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        renderUI(data);

    } catch (error) {
        console.error("Erreur lors du chargement du storyboard :", error);
        document.getElementById('project-title').textContent = "Erreur de chargement des données.";
    }
}

function renderUI(data) {
    // 1. Hydratation de l'en-tête (Callout DSFR)
    document.getElementById('project-title').textContent = data.project_title;
    document.getElementById('project-premise').textContent = data.premise;
    document.getElementById('project-genre').textContent = `Genre : ${data.genre}`;
    document.getElementById('project-format').textContent = `Format : ${data.format}`;

    // 2. Hydratation des éléments clés (Tile DSFR)
    const coreContainer = document.getElementById('core-elements');
    const core = data.core_elements;
    coreContainer.innerHTML = `
        <strong>Cibles :</strong> ${core.target_assets}<br><br>
        <strong>Antagonistes :</strong> ${core.antagonists_system}<br><br>
        <strong>Bénéficiaires (RUP) :</strong> ${core.beneficiaries}<br><br>
        <strong>Ancrage Local :</strong> ${core.local_anchoring}
    `;

    // 3. Rendu dynamique des Actes (Accordéons DSFR)
    const actsContainer = document.getElementById('acts-container');
    actsContainer.innerHTML = ''; // Nettoyage au cas où

    data.narrative_arcs.forEach((arc, index) => {
        // Construction des chapitres sous forme de liste stylisée
        const chaptersList = arc.chapters.map(chap => 
            `<li class="fr-mb-1w"><span class="fr-icon-arrow-right-line fr-icon--sm fr-mr-1w" aria-hidden="true"></span>${chap}</li>`
        ).join('');

        // Utilisation de la structure officielle DSFR pour les accordéons
        const accordionHTML = `
            <section class="fr-accordion">
                <h3 class="fr-accordion__title">
                    <button class="fr-accordion__btn" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="accordion-act-${arc.act}">
                        Acte ${arc.act} : ${arc.title}
                    </button>
                </h3>
                <div class="fr-collapse" id="accordion-act-${arc.act}">
                    <ul style="list-style: none; padding-left: 0;" class="fr-mt-2w">
                        ${chaptersList}
                    </ul>
                </div>
            </section>
        `;
        actsContainer.insertAdjacentHTML('beforeend', accordionHTML);
    });
}