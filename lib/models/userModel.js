const md5 = require('md5');
const bcrypt = require('bcrypt');
const passgen = require('generate-password');
const crypto = require('crypto');
const luxon = require('luxon');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const config = require('../config.js');

const userModel = module.exports = {};

userModel.validateInternalUser = async function(uid, pwd) {
    return {
        userId: '125-x',
        userKey: 'XYERERFEFERFRE',
        userOrigin: 'internal'
    }
};

userModel.validateUserFromToken = async function(payload) {
    return {
        userId: '125-x',
        userKey: 'XYERERFEFERFRE',
        userOrigin: 'internal'
    }
}

