// *******************************************------------------------*************************************
//Importation de mongoose et de mongoose unique validator
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//Création d'un schéma mongoose pour enregistrer un utilisateur 
const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type : String, required: true}
});

//Utilisation d'un plugin pour s'assurer que deux utilisateurs n'aient pas le même email.
userSchema.plugin(uniqueValidator)

//Exportation du schéma mongoose 
module.exports = mongoose.model('User', userSchema);