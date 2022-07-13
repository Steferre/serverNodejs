const passport = require('passport');
const jwt = require('jwt-simple');
const config = require('../config');

module.exports = function(req, res, next) {

    if(req.method == 'OPTIONS') next();

    passport.authenticate('jwtStrategy',{ session: false },(error, user, renew = false) => {
            if (error || !user) {
                display401(res, 'jwtStrategy');
                return;
            }
            if (renew)
                res.set('x-token-refresh', getToken(user));
            req.user = user;
            next();
        },
    )(req, res, next);
};

function display401(res, message = 'Invalid credentials (authenticate)') {
    res.status(401);
    res.json({
        "status": 401,
        "message": message
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

