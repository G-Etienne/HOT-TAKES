// *******************************************------------------------*************************************
// Importation du modèle mongoose pour la création d'un utilisateur (User)
// Importation de bcrypte pour le hash du mot de passe
// Importation de jsonwebtoken pour la création d'un token 
// importation des variables d'environnement.
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: './config/.env'});


// *******************************************------------------------*************************************
//Regex pour le contrôle des entrées
function regexEmail(value) { return /^[a-zA-Z0-9_.+-]+@[A-Za-zÀ-ÖØ-öø-ÿ\- ]+\.[A-Za-zÀ-ÖØ-öø-ÿ]{2,4}$/i.test(value); }
const regexStrongPassword = (value) => { return  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?!.*[=\'"<>\`]).{8,50}$/i.test(value) };

// *******************************************------------------------*************************************
//CRÉATION D'UN UTILISATEUR
exports.signup = (req, res, next) => {
    //Récupération de l'email et du mot de passe pour la validation des entrées
    const inputEmail = req.body.email;
    const inputPassword = req.body.password;
    //Validation des entrées
    if(regexEmail(inputEmail) && regexStrongPassword(inputPassword)){
        //Bcrypt --> hash le mot de passe 10 fois et renvoie le dernier hash dans la réponse.
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                //Création d'un nouvel objet utilisateur avec le modèle mongoose User.
                const user = new User ({
                    email: req.body.email,
                    password: hash
                });

                //Enregistrement de l'objet dans la base de données MongoDB
                user.save() 
                    .then(() => res.status(201).json({message: 'Utilisateur créé.'}))
                    .catch(error => res.status(400).json({error}));

            })
            .catch(error => res.status(500).json({error}));
    }else{
        throw new Error(res.status(401).json({message : 'Non autorisé.'}));
    }
};

// *******************************************------------------------*************************************
//CONNEXION
exports.login = (req, res, next) => {
    //Récupération de l'email et du mot de passe pour la validation des entrées
    const inputEmail = req.body.email;
    const inputPassword = req.body.password;
    
    //Validation des entrées
    if(regexEmail(inputEmail) && regexStrongPassword(inputPassword)){
        //Recherche si l'email dans la requête est présent dans la base de données
        User.findOne({email: req.body.email})
            .then(user => {
                //Renvoie une erreur si l'email ne se trouve pas dans la base de données
                if(!user){
                    return res.status(401).json({message: "Nom d'utilisateur ou mot de passe incorrect."});
                }
                //Compare le mot de passe et le hash de la base de données pour valider le mot de passe.
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        //Renvoie une erreur si le mot de passe est invalide
                        if (!valid){
                            return res.status(401).json({message: "Nom d'utilisateur ou mot de passe incorrect."});
                        }
                        //Si les identifiants sont valides, retourne un objet avec l'id utilisateur et un token
                        res.status(200).json({
                            userId: user._id,
                            //Création d'un token d'authentification
                            token: jwt.sign(
                                {userId: user._id},
                                //------------------------------------------**
                                //utilisation de variable d'environnement.
                                process.env.TOKEN_KEY,
                                //------------------------------------------**
                                {expiresIn: '1h'}
                            )
                        })
                    })
                    .catch(error => res.status(500).json({error}));
            })
            .catch(error => res.status(500).json({error}));
    }else{
        throw new Error(res.status(401).json({message : 'Non autorisé.'}));
    }
};