const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);//mongoose-currency is for storing price of dish
const Currency = mongoose.Types.Currency;

const dishSchema = new Schema({//creating dishSchema
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default:false      
    }
},{
    timestamps: true//adds createdAt and modifiedAt fields
});

var Dishes = mongoose.model('Dish', dishSchema);//creating model using dishSchema

module.exports = Dishes;