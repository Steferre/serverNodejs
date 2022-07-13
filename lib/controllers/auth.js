const jwt = require('jwt-simple');
const models = require('../models.js');
const config = require('../config.js');
const passport = require('passport')
const crypto = require('crypto');

const auth = module.exports = {};

auth.login = function(req, res) {
    passport.authenticate('localStrategy',{ session: false },(error, user) => {
            if (error || !user) {
                if (error)
                    display401(res, error);
                else
                    display401(res);
                return;
            }
            const token = getToken(user);
            res.status(200).send({ token });
        },
    )(req, res);
};

auth.self = function(req, res) {
    res.json(req.user || null);
}

function display401(res, error=null) {
    res.status(401);
    res.json({
        "status": 401,
        "message": error ? error : "Invalid credentials (auth)"
    });
}

function getToken(user) {
    const token = jwt.encode({
        id: user.userId,
        hash: user.userKey,
        origin: user.userOrigin,
        timestamp: new Date()
    }, config.tokenKey);
    return token;
}

