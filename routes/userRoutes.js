// *******************************************------------------------*************************************
// Importation d'express et du fichier pour contrôler les routes utilisateurs
// Création du routeur (router)
const express = require('express');
const router = express.Router();
const userControl = require('../controllers/userControl');

// *******************************************------------------------*************************************
// Authentification
// Route pour l'inscription (signup)
// Route pour la connexion (login)
router.post('/signup', userControl.signup);
router.post('/login', userControl.login);

//Exportation du routeur
module.exports = router;

