// *******************************************------------------------*************************************
//Importation de multer pour la gestion des fichiers dans les requêtes HTTP
const multer = require('multer');

//Création d'un dictionnaire MIME-TYPE pour récupérer le format d'une image
const MIME_TYPES = {
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpg',
    'image/png' : 'png'
};

// *******************************************------------------------*************************************
//Logique pour renommer le fichier image et l'enregistrer dans le dossier 'images' du backend.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now()+ '.' + extension);
    }
});

//Exportation du module
module.exports = multer({storage: storage}).single('image');