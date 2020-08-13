var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config.js');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//adds session
passport.deserializeUser(User.deserializeUser());//removes session

exports.getToken = function(user) {//creates token using jwt, user is the payload while creating token from users.js
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};//options for jwt strategy
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();//specifies how token(jwt) has to be extracted from incoming request message
opts.secretOrKey = config.secretKey;//signing

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {//done is a callback by passport required when Strategy is used
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {//searching user, User is mongoose method
            if (err) {
                return done(err, false);//when error
            }
            else if (user) {
                return done(null, user);//returns user from jwt
            }
            else {
                return done(null, false);//returns null as there is no such user
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});//verifies incoming user
// sessions are not created as jwt is used, token is extracted from
//ExtractJwt.fromAuthHeaderAsBearerToken()

exports.verifyAdmin = function(req, res, next){
    if(req.user.admin)
    {
        next();
        return;
    }else{
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,//extracted from config.js
    clientSecret: config.facebook.clientSecret//extracted from config.js
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {//creating user if user does not exist
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);//user info is generated which will be passed to users.js
            })
        }
    });
}
));