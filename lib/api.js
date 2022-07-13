const config = require('./config.js');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(config.multer);

const routes = {
    auth: require('./controllers/auth.js')

    /*    users: require('./controllers/users.js'),
        products: require('./controllers/products.js'),
        resources: require('./controllers/resources.js'),
        otpcontroller: require('./controllers/otpcontroller.js'),
     */
};

router.all(config.apiUrl + '*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', config.allowed_domain);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Pragma,If-Modified-Since,Expires,Cache-Control,ng-client-version');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

/* middlewares */
router.all(config.authApiUrl + '*', [require('./middlewares/authenticate.js')]);
router.all(config.fileApiUrl + '*', upload.single('file'), [require('./middlewares/authenticate.js')]);

/* routes non autenticate */
router.all(config.apiUrl + 'auth/login', routes.auth.login);

/* routes autenticate */
router.all(config.authApiUrl + 'auth/self', routes.auth.self);

module.exports = {
    router: router,
    routes: routes
};
