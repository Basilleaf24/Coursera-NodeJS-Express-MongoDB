const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,//it has to be used like this if population is used
        ref: 'User'//exported from user.js
    },
    dishes : [{
        type: mongoose.Schema.Types.ObjectId,//it has to be used like this if population is used
        ref: 'Dish'//exported from dishes.js        
    }]
},{
    timestamps: true
});

var Favorites = mongoose.model('Favorite', favoriteSchema);//creating model using favoriteSchema

module.exports = Favorites;