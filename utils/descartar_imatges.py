import os
import shutil
import logging

# Configuració del logging per a un millor seguiment i depuració.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def process_animal_directories(root_dir, destination_dir):
    """
    Processa els subdirectoris d'animals, movent tots els fitxers excepte els dos primers a un directori de destinació.

    Args:
        root_dir (str): Ruta al directori arrel que conté els subdirectoris d'animals (data\imatges).
        destination_dir (str): Ruta al directori on es mouran les imatges descartades (data\imatgesdescartades).
    """
    try:
        # Verifica si existeix el directori arrel
        if not os.path.exists(root_dir):
            raise FileNotFoundError(f"Directori arrel no trobat: {root_dir}")

        # Crea el directori de destinació si no existeix. exist_ok=True evita errors si ja existeix.
        os.makedirs(destination_dir, exist_ok=True)

        # Itera sobre els subdirectoris del directori arrel.
        for animal_dir_name in os.listdir(root_dir):
            animal_dir_path = os.path.join(root_dir, animal_dir_name)

            # Verifica si es un directori
            if not os.path.isdir(animal_dir_path):
                logging.warning(f"S'ignora l'element no directori: {animal_dir_path}")
                continue
            
            # Crea el subdirectori corresponent dins de 'imatgesdescartades'
            discarded_animal_dir = os.path.join(destination_dir, animal_dir_name)
            os.makedirs(discarded_animal_dir, exist_ok=True)

            files = os.listdir(animal_dir_path)
            # Filtra només fitxers per evitar errors amb subdirectoris ocults o altres elements.
            image_files = [f for f in files if os.path.isfile(os.path.join(animal_dir_path, f))]

            # Comprova si hi ha més de dos fitxers per moure.
            if len(image_files) > 2:
                # Selecciona els fitxers a moure (des del tercer en endavant).
                files_to_move = image_files[2:]
                # Itera sobre els fitxers a moure.
                for file_name in files_to_move:
                    source_path = os.path.join(animal_dir_path, file_name)
                    dest_path = os.path.join(discarded_animal_dir, file_name)
                    try:
                        # Mou el fitxer.
                        shutil.move(source_path, dest_path)
                        logging.info(f"Fitxer mogut: {source_path} -> {dest_path}")
                    except Exception as e:
                        # Gestiona errors al moure fitxers individuals.
                        logging.error(f"Error al moure el fitxer {source_path}: {e}")
            else:
                # Si hi ha menys de 3 fitxers, no es fa res.
                logging.info(f"Menys de 3 fitxers a {animal_dir_path}. No es mou res.")

    except FileNotFoundError as e:
        # Gestiona l'error si no es troba el directori arrel.
        logging.error(e)
    except Exception as e:
        # Gestiona altres errors generals.
        logging.error(f"Error general: {e}")

if __name__ == "__main__":
    # Defineix les rutes dels directoris. Són rutes relatives per a més flexibilitat.
    images_dir = os.path.join("..", "data", "imatges", "animals")
    discarded_images_dir = os.path.join("..", "data", "imatgesdescartades") # Nom corregit

    # Crida a la funció principal per processar els directoris.
    process_animal_directories(images_dir, discarded_images_dir)
    logging.info("Procés completat.")