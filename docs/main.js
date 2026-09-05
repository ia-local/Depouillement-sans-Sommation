document.addEventListener("DOMContentLoaded", () => {
    initStoryboard();
});

async function initStoryboard() {
    try {
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
    // 1. Informations Générales
    document.getElementById('project-title').textContent = data.project_title;
    document.getElementById('project-premise').textContent = data.premise;
    document.getElementById('project-genre').textContent = `Genre : ${data.genre}`;
    document.getElementById('project-format').textContent = `Format : ${data.format}`;

    // 2. Éléments Clés
    const coreContainer = document.getElementById('core-elements');
    const core = data.core_elements;
    coreContainer.innerHTML = `
        <strong>Cibles :</strong> ${core.target_assets}<br><br>
        <strong>Antagonistes :</strong> ${core.antagonists_system}<br><br>
        <strong>Bénéficiaires (RUP) :</strong> ${core.beneficiaries}<br><br>
        <strong>Ancrage Local :</strong> ${core.local_anchoring}
    `;

    // 3. Protagonistes
    const protagonistsContainer = document.getElementById('protagonists-container');
    if (data.protagonists && data.protagonists.length > 0) {
        protagonistsContainer.innerHTML = data.protagonists.map(p => `
            <div class="protagonist-card">
                <div class="fr-text--sm fr-text--bold text-primary">${p.role}</div>
                <div class="fr-text--xs fr-mt-1v">${p.description}</div>
            </div>
        `).join('');
    } else {
        protagonistsContainer.innerHTML = '<p class="fr-text--sm">Aucun protagoniste renseigné.</p>';
    }

    // 4. Actes et Chapitres
    const actsContainer = document.getElementById('acts-container');
    actsContainer.innerHTML = ''; 

    data.narrative_arcs.forEach((arc, index) => {
        const chaptersList = arc.chapters.map(chap => {
            const title = typeof chap === 'string' ? chap : chap.title;
            const rawContent = typeof chap === 'string' ? '' : chap.content;
            
            const formattedContent = formatScriptContent(rawContent);

            return `
                <li class="fr-mb-4w">
                    <div class="fr-text--md fr-text--bold">
                        <span class="fr-icon-arrow-right-line fr-icon--sm fr-mr-1w" aria-hidden="true"></span>
                        ${title}
                    </div>
                    ${formattedContent}
                </li>
            `;
        }).join('');

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

/**
 * Formate le contenu textuel brut du scénario en blocs HTML structurés
 */
function formatScriptContent(rawContent) {
    if (!rawContent || rawContent.trim() === "" || rawContent === "Texte à rédiger...") {
        return `<div class="fr-mt-1w"><span class="fr-badge fr-badge--sm fr-badge--new script-empty-badge">Texte à rédiger...</span></div>`;
    }

    // Découpage du texte par blocs de saut de ligne double ou simple
    const blocks = rawContent.split(/\n\n+/);

    const parsedBlocks = blocks.map(block => {
        const trimmed = block.trim();
        
        // Entête de scène (INT., EXT., MONTAGE)
        if (/^(INT\.|EXT\.|MONTAGE)/i.test(trimmed)) {
            return `<div class="script-scene-header">${trimmed}</div>`;
        }

        // Nom de personnage seul (Majuscules)
        if (/^[A-ZÉÈÊÀÔÙ\s\-\']{2,}\s*(\(.*\))?$/.test(trimmed)) {
            return `<div class="script-character">${trimmed}</div>`;
        }

        // Paragraphe d'action ou réplique (gestion des <br> internes)
        const htmlParagraph = trimmed.replace(/\n/g, '<br>');
        return `<p class="script-paragraph">${htmlParagraph}</p>`;
    }).join('');

    return `<div class="script-container">${parsedBlocks}</div>`;
}