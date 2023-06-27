// *******************************************------------------------*************************************
// Importation d'express
// Création du routeur (router), 
// express.Router() --> permet de créer des routeurs séparer pour chaque route principale.
// Importation des fichiers pour l'authentification,
// la configuration de multer (pour les images) et du contrôleur pour les routes sauces
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauceControl');

// *******************************************------------------------*************************************
// Routes pour --> Créer une sauce, liker et disliker, récupérer une sauce, 
// modifier une sauce, supprimer une sauce, récupérer toutes les sauces
router.post('/', auth, multer, sauceCtrl.createSauce);
router.post('/:id/like', auth,sauceCtrl.like);
router.get('/:id', auth,sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteOneSauce);
router.get('/', auth,sauceCtrl.getAllSauces);

//Exportation du routeur
module.exports = router;