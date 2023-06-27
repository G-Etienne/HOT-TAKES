// *******************************************------------------------*************************************
//Importation d'express
const express = require('express');
//------------------------------------------**
//Importation de helmet et express-rate-limit
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
//------------------------------------------**
// Création de l'application (app)
// Importation des routes et mongoose
// Importation de path pour accéder au path du serveur.
const app = express();
const userRoutes = require('./routes/userRoutes');
const saucesRoutes = require('./routes/sauceRoutes');
const path = require('path');
//------------------------------------------**
//Configuration pour les variables d'environnement.
require('dotenv').config({path: './config/.env'});

//Importation de mongoose et du plugin pour les erreurs
const mongoose = require('mongoose');
const mongoError =require('mongoose-mongodb-errors');

mongoose.plugin(mongoError);

//Configuration du module express-rate-limit
//Limite les requêtes à 100 pour une fenêtre de 15 minutes.
const limiter = rateLimit({
    windowMs:15 * 60 * 1000,
    max: 100,
    standardHeaders : true ,  // Renvoie les informations de limite de débit dans les en-têtes `RateLimit-*` 
	legacyHeaders : false // Désactive les en-têtes `X-RateLimit-* 
});

//Utilisation d'express-rate-limit
app.use(limiter);

//Utilisation du module helmet 
//Permet l'ajout d'en-tête HTTP sécurisée.
//Désactivation de cross-origin-ressource-policy pour éviter les erreurs lors de la récupération des images.
app.use(helmet({crossOriginResourcePolicy: false }));
//------------------------------------------**

// Utilisation de express.json() pour l'analyse du corps de la requête
app.use(express.json());

// *******************************************------------------------*************************************
//Connexion à la base de données MongoDB Atlas avec une variable d'environnement qui contient le mot de passe.
//------------------------------------------**
mongoose.connect('mongodb+srv://e-gUser_31:'+process.env.MONGODB_USER_PASS+'@cluster0.thnn26q.mongodb.net/?retryWrites=true&w=majority',
//------------------------------------------**
{useNewUrlParser: true,
useUnifiedTopology: true})
    .then(() => console.log('Connexion à MongoDB réussit.'))
    .catch(() => console.log('Échec de la connexion à MongoDB.'));

// *******************************************------------------------*************************************
//Ajout des headers nécessaires

app.use((req, res, next) => {
    //Toutes les origines peuvent accéder à l'API
    res.setHeader('Access-Control-Allow-Origin', '*');
    //Ajoute les headers nécessaires aux requêtes envoyées à l'API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    //Définit les routes pour nous permettre d'envoyer différentes requêtes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// *******************************************------------------------*************************************
// Indique à l'application comment traiter la requête vers la route image
// Utilisation des routes pour le parcours utilisateur
// Utilisation des routes pour le parcours des sauces
// Exportation de l'application
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);

module.exports = app;

