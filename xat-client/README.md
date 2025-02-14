# Xat Client

Una aplicació de línia de comandes per interactuar amb models de llenguatge.

## Prerequisits

- Node.js (v20 o superior)
- npm

## Instal·lació

1. Clona el repositori:
```bash
cd xat-client
```

2. Instal·la les dependències:
```bash
npm install
```

3. Crea un fitxer `.env` a l'arrel del projecte que apunti a la URL en la que s'executa Xat-API:
```bash
API_ENDPOINT=http://127.0.0.1:3000/api
```

## Execució

Hi ha dues maneres d'executar l'aplicació:

### Mode desenvolupament (amb hot-reload):
```bash
npm run dev
```

### Mode producció:
```bash
npm start
```

## Ús

1. Quan s'inicia l'aplicació, et demanarà seleccionar un model de llenguatge
2. Després podràs escollir si vols utilitzar streaming per les respostes
3. Comandes especials dins del xat:
   - `exit`: Surt de l'aplicació
   - `new`: Inicia una nova conversa

## Notes

- Assegura't que el servidor de l'API està en execució a l'adreça especificada al `.env`
- El model per defecte és `qwen2.5-coder:latest` si està disponible