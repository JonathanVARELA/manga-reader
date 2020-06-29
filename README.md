(version française du readme à la fin)
# Manga Reader App
Manga reader is a solution to read manga from other websites using endless scrolling feature and more !
  
  Current features :
  - Read manga with endless scrolling
  - Store your collection and history (client side ; use web navigator database)
  - Add/Remove a manga to your collection
  - Display your current manga collection
  - Display new chapters (as visual label)
  - Export/Import your collection as JSON file
 
## Installation
clone this repo where you want   
go to ```manga-parser``` and rename ```.env.example``` to ```.env```  
go to ```manga-reader``` and rename ```.env.example``` to ```.env```  
run it using docker-compose or npm commands (instructions below)

### run using docker-compose
goto manga-app folder in a command prompt then run:  
```docker-compose up -d manga-reader && docker-compose up -d manga-parser```  
then navigate to ```localhost:3000```   
enjoy ! 🥳

### run using npm
#### Windows
goto manga-app/windows 
run install-windows.cmd if it's your first time (or updated) 
run start-windows.cmd to launch backend and frontend apps
Enjoy ! 🥳
#### Linux 
🚧 todo

## limiations
the scrapper is using https://cors-anywhere.herokuapp.com/ by default to bypass cors issues,
it's works but it as a usage over time limitation.

If you are using this application often, please think about hosting your own cors-anywhere server (local hosting will not work)
for more informations => https://github.com/Rob--W/cors-anywhere/
then you just need to modify ```CORS_ANYWHERE_URL``` from ```.env ``` locate in ```./manga-parser```

## Licence
WTFPL 👍

# Application Manga Reader
Manga Reader est une solution permettant de lire des mangas d'autres sites web en utilisant des fonctionnalités supplémentaire tel que le défilement vertical infini 🍻

Fonctionnalités :
- Lecture vertical infini
- Stockage de la bibliothèque des manga lus (côté client uniquement, utilise la base de donnée du navigateur web)
- Ajout/Suppression d'un manga
- Affiche la bibliothèque
- Signal les nouveaux chapitres disponibles à l'aide d'une vignette
- Import/Export de la bibliothèque au format JSON

## Installation
cloner le repository ou vous voulez  
Rendez-vous dans le repertoire ```manga-parser``` puis renommer ```.env.example``` en ```.env```  
Rendez-vous dans le repertoire ```manga-reader``` puis renommer ```.env.example``` en ```.env```  
Lancer l'application en utilisant docker-compose ou les commandes npm (instruction ci-dessous)
 
 ### Lancer en utilisant docker-compose
Assurez-vous que docker soit en cours d'éxecution  
Rendez-vous dans le repertoire ```manga-app``` depuis un invté de commande et lancer l'instruction suivante :   
```docker-compose up -d manga-reader && docker-compose up -d manga-parser```   
Depuis votre navigateur, rendez-vous à l'addresse ```http://localhost:3000```   
Enjoy ! 🥳  
 
 ### Lancer en utilisant les commandes npm
#### Windows
Rendez vous dans le répertoir ```manga-app/windows```
éxecutez ```install-windows.cmd``` si c'est la première fois que vous lancer l'application (ou si mise à jour)
éxecutez ```start-windows.cmd``` pour lancer les applications backend et frontend
Enjoy ! 🥳
#### Linux 
🚧 todo
 
 ## limiations
 Le scrapper utilise par défaut l'url https://cors-anywhere.herokuapp.com/ pour éviter les problèmes liés au CORS mais l'application hébergé sur Heroku à une limite d'usage dans le temps (x requêtes/min).  
 Si vous utilisez l'application Manga Reader de façon quotidienne, envisagez l'hébergement de votre propre serveur cors-anywhere (un serveur local ne fonctionnera pas).  
 Plus d'information => https://github.com/Rob--W/cors-anywhere/  
 Une fois votre serveur cors-anywhere en place, il ne vous restera plus qu'a modifier la variable d'environnement ```CORS_ANYWHERE_URL``` dans le fichier ```.env ``` situé dans le répertoire ```./manga-parser``` 

 ## Licence
 WTFPL 👍 (c'est 🎁)


