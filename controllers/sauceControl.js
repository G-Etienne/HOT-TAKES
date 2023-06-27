// *******************************************------------------------*************************************
// Importation du modèle mongoose pour les sauces
// Importation du module fs pour la suppression d'un fichier image
const Sauce = require('../models/sauces');
const fs = require('fs');

// *******************************************------------------------*************************************
//Regex pour la validation des entrées
const regexNames = (value) => { return  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\ \-]{0,50}$/i.test(value) };
const regexNameSauce = (value) => { return  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð0-9\ \-]{0,50}$/i.test(value) };
const regexHeat = (value) => { return /^[0-9]{1,2}$/i.test(value)};
const regexLike = (value) => { return /^\-?[0-9]{1}$/i.test(value)};
const regexDescription = (value) => { return  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð0-9\ \-\(\)\'\.\"\@\!\:\;\,\?\#\$\€\r\n]{0,5000}$/i.test(value) };
const regexSauceId = (value) => { return /^[a-zA-Z0-9]+$/i.test(value)};

// *******************************************------------------------*************************************
//CRÉATION D'UN OBJET SAUCE
exports.createSauce = (req, res, next) => {
    //Récupération du body sous forme d'objet JS
    const sauceObject = JSON.parse(req.body.sauce);
    //Récupération des valeurs des inputs pour valider les entrées
    const inputName = sauceObject.name;
    const inputManufacturer = sauceObject.manufacturer;
    const inputDescription = sauceObject.description;
    const inputMainpepper = sauceObject.mainPepper;
    const inputHeat = sauceObject.heat;

    //Validation des entrées
    if (regexNameSauce(inputName) && regexNames(inputManufacturer) && regexNames(inputMainpepper) && regexHeat(inputHeat) && regexDescription(inputDescription)){
        //Supression de l'_id envoyé par le frontend
        delete sauceObject._id;
        //Création d'un nouvel objet sauce 
        const sauce = new Sauce({
            ...sauceObject,
            //Utilisation de l'id utilisateur récupérer du token.
            userId : req.auth.userId,
            //Création de l'URL complète de l'image
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        });
        //Enregistrement d'une nouvelle sauce (objet sauce) dans la base de données MongoDB
        sauce.save()
            .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
            .catch(error => { res.status(400).json( { error })});
    }else{
        throw new Error(res.status(401).json({message : 'Non autorisé.'}));
    }

};

// *******************************************------------------------*************************************
//RÉCUPÉRATION D'UN OBJET SAUCE SPÉCIFIQUE
exports.getOneSauce = (req, res, next) => {
    //Récupération de l'id dans l'URL pour valider l'entrée
    const idParameter = req.params.id;
    //Validation d'entrée
    if (regexSauceId(idParameter)){
        //Utilisation de findOne du modèle mongoose pour trouver la sauce avec le bon ID dans la base de données 
        Sauce.findOne({_id: req.params.id})
            .then((sauce) => res.status(200).json(sauce))
            .catch((error) => res.status(404).json({error}));
    }else{
        throw new Error(res.status(401).json({message : 'Non autorisé.'}));
    }
};

// *******************************************------------------------*************************************
//MODIFICATION D'UNE SAUCE
exports.modifySauce = (req, res, next) => {
    // Vérification pour voir si un fichier (file) est présent dans la requête
    // Si oui --> traite la nouvelle image
    // Sinon --> traite l'objet entrant
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    //Récupération de la valeur des champs d'inputs pour la validation des entrées
    const inputName = sauceObject.name;
    const inputManufacturer = sauceObject.manufacturer;
    const inputDescription = sauceObject.description;
    const inputMainpepper = sauceObject.mainPepper;
    const inputHeat = sauceObject.heat;
    //Récupération de l'id dans l'URL pour valider l'entrée
    const idParameter = req.params.id;

    //Validation des entrées
    if (regexSauceId(idParameter) && regexNameSauce(inputName) && regexNames(inputManufacturer) && regexNames(inputMainpepper) && regexHeat(inputHeat) && regexDescription(inputDescription)){
        //Supression de l'ID envoyé par le frontend
        delete sauceObject._userId;

        //Récupérere la sauce avec le bon ID dans la base de données
        Sauce.findOne({_id: req.params.id})
            .then((sauce) => {
                //Vérifie que l'utilisateur qui veut modifier la sauce est bien celui qui la créée
                if(sauce.userId != req.auth.userId){
                    res.status(403).json({message : 'Requête non autorisé.'});
                }else if (req.file && sauce.userId === req.auth.userId){
                    // Mise à jour avec une nouvelle image
                    // Récupération du nom de l'ancienne image 
                    const filename = sauce.imageUrl.split('/images/')[1];
                    //Suppression de l'ancienne image
                    fs.unlink(`images/${filename}`, () => {
                        //Mise à jour de la ressource sauce ciblée
                        Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
                            .then(() => res.status(200).json({message : 'Objet modifié.'}))
                            .catch((error) => res.status(400).json({error}));
                    });                
                }else if (sauce.userId === req.auth.userId){
                    //Mise à jour de la ressource sauce ciblée
                    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
                            .then(() => res.status(200).json({message : 'Objet modifié.'}))
                            .catch((error) => res.status(400).json({error}));
                }
            })
            .catch((error) => res.status(500).json({error}));
    }else{
        throw new Error(res.status(401).json({message : 'Non autorisé.'}));
    }
};

// *******************************************------------------------*************************************
//SUPPRESSION D'UNE SAUCE
exports.deleteOneSauce = (req, res, next) => {   
    //Récupération de l'id dans l'URL pour valider l'entrée
    const idParameter = req.params.id;
    //Validation d'entrée
    if (regexSauceId(idParameter)){
        //Récupération de l'objet sauce ciblé
        Sauce.findOne({_id: req.params.id})
            .then(sauce => {
                //Vérifie que l'utilisateur qui veut supprimer la sauce est bien celui qui la créée
                if (sauce.userId != req.auth.userId){
                    res.status(403).json({message : 'Requête non autorisée.'})
                }else{
                    //Récupération du nom de l'image
                    const filename = sauce.imageUrl.split('/images/')[1];
                    //Suppression de l'image
                    fs.unlink(`images/${filename}`, () => {
                        //Suppression de la ressource sauce dans la base de données
                        Sauce.deleteOne({_id:req.params.id})
                            .then(() => res.status(200).json({message: 'Objet supprimé.'}))
                            .catch(error => res.status(400).json({error}));
                    });
                }
            })
            .catch(error => res.status(500).json({error}))
    }else{
        throw new Error(res.status(401).json({message : 'Non autorisé.'}));
    } 
};

// *******************************************------------------------*************************************
//RÉCUPÉRATION DE LA LISTE DE TOUTES LES SAUCES
exports.getAllSauces = (req, res, next) => {
    //Utilisation de find() du modèle sauce qui renvoie un tableau de toutes les sauces
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => { res.status(400).json({error})});
};

// *******************************************------------------------*************************************
//LIKE ET DISLIKE D'UNE SAUCE
exports.like = (req,res,next) => {
    //Récupération de l'id dans l'URL pour valider l'entrée
    const idParameter = req.params.id;
    //Récupération de la valeur du like pour valider l'entrée
    const likeRequete = req.body.like;
    //Validation d'entrées    
    if (regexSauceId(idParameter) && regexLike(likeRequete)){
        //Récupération de la sauce ciblée 
        Sauce.findOne({_id: req.params.id})
            .then((sauce) => { 
                //Récupération dans l'objet sauce de la liste des ID utilisateurs qui ont likés ou dislikés la sauce.
                const userLike = sauce.usersLiked;
                const userDislike = sauce.usersDisliked;
                //Vérification pour voir si l'utilisateur a déjà liker ou disliker la sauce
                const hereLike = userLike.find(user => user === req.body.userId);
                const hereDislike = userDislike.find(user => user === req.body.userId);
                
                //Si l'utilisateur veut liker la sauce et qu'il ne la pas déjà liké
                if (hereLike == undefined && req.body.like === 1){
                    //Mise à jour de la ressource sauce ciblée
                    Sauce.updateOne({_id: req.params.id}, {$push: {usersLiked : req.body.userId}, $inc: {likes : +1}, _id: req.params.id, _id: req.params.id})
                        .then(() => res.status(200).json({message: 'Ajout du like'}))
                        .catch(error => res.status(400).json({error}));

                //Si l'utilisateur veut disliker la sauce et qu'il ne la pas déjà disliké
                } else if(hereDislike == undefined && req.body.like === -1){
                    //Mise à jour de la ressource sauce ciblée
                    Sauce.updateOne({_id: req.params.id}, {$push: {usersDisliked : req.body.userId}, $inc: {dislikes : +1}, _id: req.params.id})
                        .then(() => res.status(200).json({message: 'Ajout du dislike'}))
                        .catch((error) => { res.status(400).json({error})});

                //Si l'utilisateur veut enlever sont like.
                } else if (hereLike === req.body.userId && req.body.like === 0){
                    //Mise à jour de la ressource sauce ciblée
                    Sauce.updateOne({_id: req.params.id}, {$pull: {usersLiked : {$in : req.body.userId}}, $inc: {likes : -1}, _id: req.params.id})
                        .then(() => res.status(200).json({message: 'Suppression du like'}))
                        .catch((error) => { res.status(400).json({error})});

                //Si l'utilisateur veut enlever sont dislike.
                }else if(hereDislike === req.body.userId && req.body.like === 0){
                    //Mise à jour de la ressource sauce ciblée
                    Sauce.updateOne({_id: req.params.id}, {$pull: {usersDisliked : {$in : req.body.userId}}, $inc: {dislikes : -1}, _id: req.params.id})
                        .then(() => res.status(200).json({message: 'Suppression du dislike'}))
                        .catch((error) => { res.status(400).json({error})});
                }else{
                    throw new Error(res.status(401).json({message : 'Non autorisé.'}))
                }
            })
            .catch(() => res.status(404).json({error}));
    }else{
        throw new Error(res.status(401).json({message : 'Non autorisé.'}));
    }
};

