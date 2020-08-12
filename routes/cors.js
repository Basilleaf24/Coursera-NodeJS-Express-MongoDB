const express = require('express');
const cors = require('cors');//to allow cross origin resource sharing
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {//checks if origin is present in whitelist
        corsOptions = { origin: true };//includes access control allow origin key in header with wildcard(*)
    }
    else {
        corsOptions = { origin: false };//does not give access control allow origin key
    }
    callback(null, corsOptions);//error is null, returns corsOptions
};

exports.cors = cors();//example is for get requests
exports.corsWithOptions = cors(corsOptionsDelegate);//if options are to be included