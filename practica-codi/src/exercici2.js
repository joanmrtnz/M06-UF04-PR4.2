// Importacions
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Constants
const DATA_SUBFOLDER = 'steamreviews';
const CSV_GAMES_FILE_NAME = 'games.csv';
const CSV_REVIEWS_FILE_NAME = 'reviews.csv';
const OUTPUT_FILE_NAME = process.env.OUTPUT_FILE_NAME || 'output.json';

// Funció per llegir el CSV de forma asíncrona
async function readCSV(filePath) {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Funció per fer la petició a Ollama amb més detalls d'error
async function analyzeSentiment(text) {
    try {
        console.log('Enviant petició a Ollama...');
        console.log('Model:', process.env.CHAT_API_OLLAMA_MODEL_TEXT);
        
        const response = await fetch(`${process.env.CHAT_API_OLLAMA_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.CHAT_API_OLLAMA_MODEL_TEXT,
                prompt: `Analyze the sentiment of this text and respond with only one word (positive/negative/neutral): "${text}"`,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Depuració de la resposta
        console.log('Resposta completa d\'Ollama:', JSON.stringify(data, null, 2));
        
        // Verificar si tenim una resposta vàlida
        if (!data || !data.response) {
            throw new Error('La resposta d\'Ollama no té el format esperat');
        }

        return data.response.trim().toLowerCase();
    } catch (error) {
        console.error('Error detallat en la petició a Ollama:', error);
        console.error('Detalls adicionals:', {
            url: `${process.env.CHAT_API_OLLAMA_URL}/generate`,
            model: process.env.CHAT_API_OLLAMA_MODEL_TEXT,
            promptLength: text.length
        });
        return 'error';
    }
}

async function main() {
    try {
        const dataPath = process.env.DATA_PATH;
        if (!dataPath || !process.env.CHAT_API_OLLAMA_URL || !process.env.CHAT_API_OLLAMA_MODEL_TEXT) {
            throw new Error('Algunes variables d\'entorn no estan definides');
        }

        const gamesFilePath = path.join(__dirname, dataPath, DATA_SUBFOLDER, CSV_GAMES_FILE_NAME);
        const reviewsFilePath = path.join(__dirname, dataPath, DATA_SUBFOLDER, CSV_REVIEWS_FILE_NAME);

        if (!fs.existsSync(gamesFilePath) || !fs.existsSync(reviewsFilePath)) {
            throw new Error('Algun dels fitxers CSV no existeix');
        }

        const games = await readCSV(gamesFilePath);
        const reviews = await readCSV(reviewsFilePath);

        const output = {
            timestamp: new Date().toISOString(),
            games: []
        };

        for (const game of games.slice(0, 2)) {
            const gameReviews = reviews.filter(r => r.app_id === game.appid).slice(0, 2);

            const statistics = {
                positive: 0,
                negative: 0,
                neutral: 0,
                error: 0
            };

            for (const review of gameReviews) {
                const sentiment = await analyzeSentiment(review.content);
                if (statistics[sentiment] !== undefined) {
                    statistics[sentiment]++;
                } else {
                    statistics.error++;
                }
            }

            output.games.push({
                appid: game.appid,
                name: game.name,
                statistics
            });
        }

        const outputFilePath = path.join(__dirname, dataPath, OUTPUT_FILE_NAME);
        fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));

        console.log(`Les estadístiques s'han guardat al fitxer: ${outputFilePath}`);
    } catch (error) {
        console.error('Error durant l\'execució:', error.message);
    }
}

main();
