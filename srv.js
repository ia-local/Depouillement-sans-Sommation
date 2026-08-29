/**
 * serveir.js - Noyau de Diffusion "Braquage Fiscal"
 * Orchestration : Groq-SDK (Llama-3.1-8b-instant)
 * Logique : Souveraineté CVNU
 */
const express = require('express');
const fs = require('fs');
const Groq = require('groq-sdk');

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.static('docs'));
app.use(express.json());

// Système de Log / Historique Entropique
const logSoup = (prompt, response) => {
    const entry = `\n### CYCLE_${Date.now()}\n**PROMPT:** ${prompt}\n**AGI_SOV:** ${response}\n---\n`;
    fs.appendFileSync('./data/soup.md', entry);
};

// Route Génération Dynamique de Chapitre
app.post('/api/generate-chapter', async (req, res) => {
    const { chapterId, context } = req.body;
    
    const systemPrompt = `Tu es l'AGI Souveraine du programme PRCR. 
    Génère une version évolutive du Chapitre ${chapterId} du film "Braquage Fiscal". 
    Focus : Loi 211, RUP, Crypto-détournement. Style : Froid, Factuel.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: context }],
            model: "llama-3.1-8b-instant",
        });

        const output = chatCompletion.choices[0].message.content;
        logSoup(context, output); // Mise à jour de soup.md
        
        res.json({ success: true, content: output, version: "git-rev-HEAD" });
    } catch (err) {
        res.status(500).json({ error: "ERREUR_INDEXATION_GROQ" });
    }
});

app.listen(3000, () => console.log('✅ JURIDICTION BAVENT : SERVEUR ACTIF SUR PORT 3000'));