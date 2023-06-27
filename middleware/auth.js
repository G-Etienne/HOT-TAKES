// *******************************************------------------------*************************************
//Importation de jsonwebtoken pour travailler avec le token de l'utilisateur
//importation des variables d'environnement.
const jwt = require('jsonwebtoken');
require('dotenv').config({path: './config/.env'});


module.exports = (req, res, next) => {
    try {
        //Récupération du token dans le header Authorization (split --> récupère les éléments après l'espace du header)
        const token = req.headers.authorization.split(' ')[1];
        //Décodage du token
        //------------------------------------------**
        //Utilisation de variable d'environnement
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
        //------------------------------------------**
        //Extraction de l'ID utilisateur se trouvant dans le token
        const userId = decodedToken.userId;
        //Ajout de l'ID dans req.auth
        req.auth = {
            userId : userId
        };
        // Vérification --> l'id utilisateur de la requête et celui placer dans le token sont les mêmes
        // Renvoie une erreur en cas d'une authentification incorrect
        if(req.body.userId && req.body.userId !== userId){
            throw new Error(res.status(401).json({message : 'Id utilisateur non autorisé.'}));
        }else{
            next()
        }
    } catch(error) {
        res.status(401).json({error});
    }
};