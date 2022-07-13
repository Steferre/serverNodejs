var socket;
const events = require('events');
const fs = require("fs");
const path = require("path");
const config = require('./config.js');
const models = require('./models.js');
const em = new events.EventEmitter();

/* general purpose event handler */
em.on('CustomEventHandler', function (action) {
    console.log('CustomEventHandler:', action);
    if (action==='public.files.cleanup') {
    }
    if (action==='public.attachments.cleanup') {
    }
});

const Redis = require("ioredis");

global.rpub = new Redis({
    db: config.redisDB || 1,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

global.rcli = new Redis({
    db: config.redisDB || 1,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

rcli.on("error", function (err) {
    console.log("REDIS CLIENT ERROR " + err.toString());
});
rcli.on("ready", function () {
    console.log("REDIS CLIENT READY");
});
rcli.on("connect", function () {
    console.log("REDIS CLIENT CONNECT");
});
rcli.on("end", function () {
    console.log("REDIS CLIENT END");
});


rpub.on("error", function (err) {
    console.log("REDIS SUBSCRIBER ERROR " + err.toString());
});
rpub.on("ready", function () {
    console.log("REDIS SUBSCRIBER READY");
});
rpub.on("connect", function () {
    console.log("REDIS SUBSCRIBER CONNECT");
});
rpub.on("end", function () {
    console.log("REDIS SUBSCRIBER END");
});

process.on('SIGINT', () => {
    console.log('SIGINT: quitting redis connections');
    try { rpub.quit(); } catch (Exception) {};
    try { rcli.quit(); } catch (Exception) {};

})

module.exports = {

    start: function(app) {

        if (!socket) {

            const express = require('express');
            const app = express();
            const bodyParser = require('body-parser');

            const api = require('./api.js');

            app.set('port', config.port);
            app.set('trust proxy', '127.0.0.1');
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));

            /* passport related stuff */
            const passport = require('passport');
            const LocalStrategy = require('passport-local').Strategy;
            const passportJWT = require('passport-jwt');
            const JWTStrategy = passportJWT.Strategy;
            const ExtractJWT = require('passport-jwt').ExtractJwt;

            passport.use('localStrategy', new LocalStrategy({}, async function(username, password, callback) {
                    let user = await models.users.validateInternalUser(username, password);

                    console.log(' from validateInternal User');
                    console.log(user);

                    if (user) {
                        return callback(null, user);
                    };
                    return callback('Incorrect username or password', false);
                }
            ));

            const opts = {
                jwtFromRequest: ExtractJWT.fromHeader('x-access-token'),
                secretOrKey: config.tokenKey
            };

            passport.use('jwtStrategy', new JWTStrategy( opts, async function(jwt_payload, callback) {

                let tokenDate = new Date(jwt_payload.timestamp);
                let tokenExpire = tokenDate.getTime() + (config.tokenExpirationOffset * 60 * 1000);

                if (tokenExpire <= Date.now()) {
                    console.log('token expired, new login required');
                    return callback('token expired', false, false);
                }

                const user = await models.users.validateUserFromToken(jwt_payload);
                if (user) {
                    const delta = Math.round((tokenExpire - Date.now()) / 1000 / 60);
                    const renewToken = delta < config.tokenExpirationOffset;
                    return callback(null, user, renewToken);
                }

                return callback('invalid token', false, false);

            }));

            app.use(passport.initialize({}));
            /* passport related stuff */

            app.use(function (req, res, next) {
                res.set('ng-client-version', config.clientVersion);
                next();
            });

            if (config.debug) {
                app.use(function(req, res, next) {
                    console.log(req.url);
                    next();
                });
            }

            /* static files */
            /*
                app.use('/public', express.static(__dirname + '/../public'));
                app.use('/static', express.static(__dirname + '/../static'));
                app.use('/video', express.static(__dirname + '/../files/video_upload'));
                app.use('/videores', express.static(__dirname + '/../files/resources/video'));
                app.use('/pdfres', express.static(__dirname + '/../files/resources/pdf'));
            */

            if (!fs.existsSync(__dirname + '/../public')) fs.mkdirSync(__dirname + '/../public');
            if (!fs.existsSync(__dirname + '/../public/files')) fs.mkdirSync(__dirname + '/../public/files');
            if (!fs.existsSync(__dirname + '/../public/attachments')) fs.mkdirSync(__dirname + '/../public/attachments');

            app.get('/', function (req, res) {
                res.send('<b>'+config.appName+'</b><br>Rest API version: <i>' +config.apiVersion + '</i><br>Client API version: <i>' +config.clientVersion + '</i>');
            });

            app.all(config.apiUrl + '*', api.router);

            socket = app.listen(app.get('port'), function() {
                console.log(config.appName + ' webserver listening on port ' + socket.address().port, 'redisdb:', process.env.REDISDB);
                console.log('current RUNTIME =>' + process.env.RUNTIME);
                console.log('current TOKEN => ' + process.env.tokenKey);
            });

            app.use(function(req, res, next) {
                res.status(404).end('404 - Not found.');
            });


            /* initialize garbage collector */
            setInterval(function() {
                em.emit('CustomEventHandler','public.files.cleanup');
            }, (5 * 60 * 1000) );
            setInterval(function() {
                em.emit('CustomEventHandler','public.attachments.cleanup');
            }, (5 * 60 * 1000) );

            process.on('SIGUSR2', function () {

                console.log('sigusr2 received');

            });
        }
    },

    socket: function() {
        return socket;
    }
}
