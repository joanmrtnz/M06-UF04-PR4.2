@echo off
REM Activa l'entorn Conda especificat
call conda activate mp06-uf04

REM Estableix la pàgina de codis a UTF-8 per a la sortida
chcp 65001 > nul

REM Executa l'script de Python amb els paràmetres especificats
python descartar_imatges.py

REM Restableix la pàgina de codis a la predeterminada (opcional)
chcp > nul

REM Pausa la finestra perquè puguis veure la sortida abans que es tanqui (opcional)
pause