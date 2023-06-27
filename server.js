// *******************************************------------------------*************************************
//Importation du module http et du fichier de l'application (app.js)
//Importation des varibables d'environnement.
const http = require('http');
const app = require('./app');
require('dotenv').config({path: './config/.env'})


// *******************************************------------------------*************************************
//NORMALISATION DU PORT
//Renvoie un port valide, qu'il soit sous forme d'un numéro ou d'une chaîne
const normalizePort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }  
    if (port >= 0) {
        return port;
    }
    return false;
};
//------------------------------------------**
//Utilisation de variable d'environnement.
const port = normalizePort(process.env.PORT);
//------------------------------------------**
app.set('port', port);

// *******************************************------------------------*************************************
// GESTION DES ERREURS
// Recherche les différentes erreurs
// Les gères de manière appropriée.
// Elles sont ensuite enregistrées par le serveur
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' privilège plus élevé requis.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' déjà utilisé.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// *******************************************------------------------*************************************
// Création du serveur avec http.
// Il consigne le port ou le canal nommé sur lequel le serveur s'exécute dans la console.
// Un écouteur d'événement est enregistré, il consigne le port ou canal nommé
// sur lequel le serveur s'exécute.
const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

server.listen(port);