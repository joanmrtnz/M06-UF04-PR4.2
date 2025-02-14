# Chat API + Ollama Project

## Prerequisits
- Node.js (v20 o superior)
- Docker
- Docker Compose

## Programari necessari

### 1. MySQL/MariaDB

#### 1a. Iniciar MySQL amb Docker
Revisar el fitxers docker-compose-dev.yml i docker-compose-test.yml del del directori "docker"

#### 1b. Accés remot via SSH Tunnel
```bash
ssh -i <id_rsa_user_proxmox> -p 20127 -L 3307:3306 <user>@ieticloudpro.ieti.cat
```

#### 1c. MySQL instal·lat en local

Instal·lar el programari a Linux o Windows i caldrà crear la base de dades.

### 2. Ollama, alternatives

Hi ha diverses maneres de configurar i accedir a Ollama per al projecte:

#### 2a. Docker (Recomanat si es disposa de GPU)
```bash
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```


#### 2b. Instal·lació nativa
##### Linux
```bash
curl https://ollama.ai/install.sh | sh
```

##### Windows
1. Descarregar l'instal·lador de [https://ollama.ai/download](https://ollama.ai/download)
2. Executar l'instal·lador
3. Iniciar Ollama des del menú d'inici


#### 2c. Accés remot via SSH Tunnel
```bash
ssh -i <id_rsa_user_proxmox> -p 20127 -L 11434:192.168.1.14:11434 <user>@ieticloudpro.ieti.cat
```


#### Notes importants sobre Ollama
- Totes les opcions utilitzen el port 11434 per defecte
- Assegurar-se que el port 11434 està disponible i no bloquejat pel firewall
- L'SSH tunnel permet accedir a una instància remota d'Ollama sense necessitat d'instal·lació local
- L'opció Docker és recomanada per treballar en local si es disposa de GPU compatible
- La instal·lació nativa pot ser més senzilla per desenvolupament local
- Pots treballar amb diferents instàncies d'Ollama i canviar entre elles. Haurà de tenir en compte el port.


#### Verificació
Per verificar que Ollama està funcionant correctament:
```bash
curl http://localhost:11434/api/tags
```

Si la resposta mostra una llista de models disponibles, la configuració és correcta.


## Configuració de les aplicacions

En el README de cadasdun dels 3 projecte trobaràs instruccions sobre com configurar-los i executar-los
