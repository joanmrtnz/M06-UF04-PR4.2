
const fs = require('fs').promises;
const path = require('path');
const { imageToBase64 } = require('./exercici3'); // Assumeixo que exportes les funcions des d'aquest fitxer

describe('imageToBase64', () => {

    it('Cas positiu: Donat un imagePath vàlid, retorna una cadena Base64 que no està buida', async () => {
        // Crea un fitxer d'imatge temporal per al test
        const tempImagePath = path.join(__dirname, 'temp_image.jpg');
        await fs.writeFile(tempImagePath, Buffer.from('fake image data', 'utf-8')); // Crea un fitxer fake

        const base64String = await imageToBase64(tempImagePath);

        expect(base64String).toBeDefined();
        expect(typeof base64String).toBe('string');
        expect(base64String.length).toBeGreaterThan(0);

        // Neteja: elimina el fitxer temporal
        await fs.unlink(tempImagePath);
    });

    it('Cas negatiu: Donat un imagePath a un fitxer que no existeix, retorna null', async () => {
        const nonExistentImagePath = path.join(__dirname, 'non_existent_image.jpg');
        const base64String = await imageToBase64(nonExistentImagePath);
        expect(base64String).toBeNull();
    });

    it('Cas negatiu: Donat un imagePath a un fitxer existent però no una imatge vàlida, retorna null', async () => {
         // Crea un fitxer de text temporal per al test
         const tempTextPath = path.join(__dirname, 'temp_text.txt');
         await fs.writeFile(tempTextPath, 'This is not an image', 'utf-8');

        const base64String = await imageToBase64(tempTextPath);

        expect(base64String).toBeNull();

        // Neteja: elimina el fitxer temporal
        await fs.unlink(tempTextPath);
    });

    // Test de rendiment (opcional, necessitaria una imatge més gran per ser rellevant)
    it.skip('Test de rendiment: Converteix un fitxer d\'imatge gran a Base64 dins un temps acceptable', async () => {
        // Aquest test requeriria un fitxer d'imatge gran real
        const largeImagePath = path.join(__dirname, 'large_image.jpg'); // Aquest fitxer hauria d'existir
        const startTime = Date.now();
        await imageToBase64(largeImagePath);
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Temps per convertir la imatge gran a Base64: ${duration}ms`);
        expect(duration).toBeLessThan(1000); // Ajusta aquest valor segons el que consideris acceptable
    });
});