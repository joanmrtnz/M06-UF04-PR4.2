// Importacions
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Constants des de variables d'entorn
const IMAGES_SUBFOLDER = 'imatges/animals';
const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif'];
const OLLAMA_URL = process.env.CHAT_API_OLLAMA_URL;
const OLLAMA_MODEL = process.env.CHAT_API_OLLAMA_MODEL_VISION;
const MAX_IMAGES_PER_DIRECTORY = parseInt(process.env.MAX_IMAGES_PER_DIRECTORY) || 5; // Límite per defecte de 5 imatges per directori
const MAX_TOTAL_IMAGES = parseInt(process.env.MAX_TOTAL_IMAGES) || 10; // Límite total d'imatges a processar, per defecte 10

// Funció per llegir un fitxer i convertir-lo a Base64
async function imageToBase64(imagePath) {
    try {
        const data = await fs.readFile(imagePath);
        return Buffer.from(data).toString('base64');
    } catch (error) {
        console.error(`Error al llegir o convertir la imatge ${imagePath}:`, error);
        console.error(error.stack); // Incloure la pila de l'error per depuració
        return null;
    }
}

// Funció per fer la petició a Ollama amb més detalls d'error
async function queryOllama(base64Image, prompt) {
    const requestBody = {
        model: OLLAMA_MODEL,
        prompt: prompt,
        images: [base64Image],
        stream: false
    };

    try {
        console.log('Enviant petició a Ollama...');
        console.log(`URL: ${OLLAMA_URL}/generate`);
        console.log('Model:', OLLAMA_MODEL);

        const response = await fetch(`${OLLAMA_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}.  Body: ${errorBody}`);
        }

        const data = await response.json();

        // Depuració de la resposta
        console.log('Resposta completa d\'Ollama:', JSON.stringify(data, null, 2));

        // Verificar si tenim una resposta vàlida
        if (!data || !data.response) {
            throw new Error('La resposta d\'Ollama no té el format esperat');
        }

        return data.response;
    } catch (error) {
        console.error('Error detallat en la petició a Ollama:', error);
        console.error(error.stack); // Incloure la pila de l'error per depuració
        console.error('Detalls adicionals:', {
            url: `${OLLAMA_URL}/generate`,
            model: OLLAMA_MODEL,
            promptLength: prompt.length,
            imageLength: base64Image.length
        });
        return null;
    }
}

// Crear el fitxer de sortida si no existeix la carpeta
async function createOutputFile(result) {
    const outputDir = path.join(__dirname, 'data');
    const outputFilePath = path.join(outputDir, 'exercici3_resposta.json');

    try {
        await fs.access(outputDir);
    } catch (error) {
        await fs.mkdir(outputDir, { recursive: true });
    }

    // Guardem el resultat al fitxer JSON
    await fs.writeFile(outputFilePath, JSON.stringify(result, null, 2));
    console.log(`Resultat guardat a: ${outputFilePath}`);
}

// Funció per processar una imatge individual
async function processImage(imagePath) {
    try {
        const ext = path.extname(imagePath).toLowerCase();
        if (!IMAGE_TYPES.includes(ext)) {
            console.log(`S'ignora fitxer no vàlid: ${imagePath}`);
            return null;
        }

        const base64String = await imageToBase64(imagePath);
        if (!base64String) {
            return null;
        }

        console.log(`\nProcessant imatge: ${imagePath}`);
        console.log(`Mida de la imatge en Base64: ${base64String.length} caràcters`);

        const prompt = "Identifica quin tipus d'animal apareix a la imatge";
        console.log('Prompt:', prompt);

        const response = await queryOllama(base64String, prompt);
        if (!response) {
            console.error(`\nNo s'ha rebut resposta vàlida per ${path.basename(imagePath)}`);
            return null;
        }

        console.log(`\nResposta d'Ollama per ${path.basename(imagePath)}:`);
        console.log(response);

        return {
            imatge: { nom_fitxer: path.basename(imagePath) },
            analisi: response
        };
    } catch (error) {
        console.error(`Error al processar la imatge ${imagePath}:`, error);
        console.error(error.stack); // Incloure la pila de l'error per depuració
        return null;
    } finally {
        console.log('------------------------');
    }
}

// Funció principal
async function main() {
    try {
        // Validem les variables d'entorn necessàries
        if (!process.env.DATA_PATH) {
            throw new Error('La variable d\'entorn DATA_PATH no està definida.');
        }
        if (!OLLAMA_URL) {
            throw new Error('La variable d\'entorn CHAT_API_OLLAMA_URL no està definida.');
        }
        if (!OLLAMA_MODEL) {
            throw new Error('La variable d\'entorn CHAT_API_OLLAMA_MODEL no està definida.');
        }

        const imagesFolderPath = path.join(__dirname, process.env.DATA_PATH, IMAGES_SUBFOLDER);
        try {
            await fs.access(imagesFolderPath);
        } catch (error) {
            throw new Error(`El directori d'imatges no existeix: ${imagesFolderPath}`);
        }

        const animalDirectories = await fs.readdir(imagesFolderPath);
        const result = { analisis: [] };
        let totalImagesProcessed = 0;  // Contador per al número total d'imatges processades

        // Iterem per cada element dins del directori d'animals
        for (const animalDir of animalDirectories) {
            const animalDirPath = path.join(imagesFolderPath, animalDir);

            try {
                const stats = await fs.stat(animalDirPath);

                // Si no és un directori, l'ignorem i continuem amb el següent
                if (!stats.isDirectory()) {
                    console.log(`S'ignora l'element no directori: ${animalDirPath}`);
                    continue;
                }
            } catch (error) {
                console.error(`Error al obtenir informació del directori: ${animalDirPath}`, error);
                console.error(error.stack); // Incloure la pila de l'error per depuració
                continue;
            }

            const imageFiles = await fs.readdir(animalDirPath);
            let imagesProcessedInDirectory = 0; // Contador per imatges processades en aquest directori

            // Iterem per cada fitxer dins del directori de l'animal
            for (const imageFile of imageFiles) {
                if (imagesProcessedInDirectory >= MAX_IMAGES_PER_DIRECTORY || totalImagesProcessed >= MAX_TOTAL_IMAGES) {
                    console.log(`S'ha arribat al límit d'imatges per directori o al límit total d'imatges.  Se salta ${imageFile}`);
                    break; // Saltar a la següent carpeta si s'ha arribat al límit d'imatges per carpeta o al límit total
                }

                const imagePath = path.join(animalDirPath, imageFile);
                try {
                    const analysisResult = await processImage(imagePath);
                    if (analysisResult) {
                        result.analisis.push(analysisResult);
                    }
                } catch (err) {
                    console.error(`Error processant ${imageFile}: `, err);
                } finally {
                    imagesProcessedInDirectory++;
                    totalImagesProcessed++;
                }
            }

            console.log(`S'ha processat el contingut del directori: ${animalDir}`);
            //break; // Només processa el primer directori. Comentar per processar-los tots.
        }

        // Guardem el resultat al fitxer de sortida
        await createOutputFile(result);

    } catch (error) {
        console.error('Error durant l\'execució:', error);
        console.error(error.stack); // Incloure la pila de l'error per depuració
    }
}

// Executem la funció principal
main();