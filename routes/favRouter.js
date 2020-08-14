const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favRouter = express.Router();

favRouter.use(bodyParser.json());

favRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({ user: req.user._id}, (err,favorite)=>{
        if(err){
            return next(err);
        }
        if(!favorite){
            res.statusCode = 403;
            res.end("No favorites found!!");
        }
    })
    .populate('user')//from user.js
    .populate('dishes')//from dishes.js
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
        // check whether this dish has already been added to favorite
        Favorites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favorite){//create a favorite document if such a document corresponding to this user does not already exist in the system
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    for(var dish = 0; dish< req.body.dishes.length; dish++)
                    {
                        favorite.dishes.push(req.body.dishes[dish]);
                    }
                    favorite.save()
                    .then((favorite) =>{
                        console.log('Favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
            }else{//add the dishes specified in the body of the message to the list of favorite dishes for the user, if the dishes do not already exists in the list of favorites
                for(var dish = 0; dish< req.body.dishes.length; dish++)
                {
                    if(favorite.dishes.indexOf(req.body.dishes[dish])< 0){
                        favorite.dishes.push(req.body.dishes[dish]);
                    }
                }   
                favorite.save()
                .then((favorite) =>{
                    console.log('Favorite added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }
        });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})

favRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) =>{
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    Favorites.findById(req.params.dishId)
    .populate('user')
    .populate('dish')
    .then((Favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    // check whether this dish has already been added to favorite
    Favorites.findOne({user: req.user._id}, (err, favorite) =>{
        if(err){ return next(err); }
        if(!favorite){
            Favorites.create({ user: req.user._id})
            .then((favorite) => {
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite) =>{
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
        }, (err) => next(err))
        .catch((err) => next(err));
        }else{
            if(favorite.dishes.indexOf(req.params.dishId)< 0){
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite) =>{
                    console.log('Favorite added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }else{
                res.statusCode = 200;
                res.end("Favorite already added!!");
            }
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    
    Favorites.findOne({user: req.user._id}, (err,favorite) =>{
        if(err){
            return next(err);
        }
        if(!favorite){
            res.statusCode = 200;
            res.end("No favorite to delete");
        }
        var index = favorite.dishes.indexOf(req.params.dishId);
        if(index>-1)
        {
            favorite.dishes.splice(index,1);
            favorite.save()
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    });
});

module.exports = favRouter;