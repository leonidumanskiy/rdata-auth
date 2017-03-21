const merge = require('merge');
const path = require('path');

const requireProcessEnv = function requireProcessEnv(name){
    if (!process.env[name])
        throw new Error('You must set the ' + name + ' environment variable');
    return process.env[name];
};

const config = {
    all: {
        env: process.env.NODE_ENV || 'development',
        root: path.join(__dirname, '..'),
        port: process.env.PORT || 9000,
        ip: process.env.IP || '0.0.0.0',
        masterKey: requireProcessEnv('MASTER_KEY'),
        jwtSecret: requireProcessEnv('JWT_SECRET'),
        accessTokenExpiresIn: "10m", // in zeit/ms format
        refreshTokenExpiresIn: "7d", // in zeit/ms format
        mongo: {
            options: {
                db: {
                    safe: true
                }
            }
        }
    },
    test: {
        mongo: {
            uri: 'mongodb://localhost/rdata-auth-test',
            options: {
                debug: false
            }
        }
    },
    development: {
        mongo: {
            uri: 'mongodb://localhost/rdata-auth-dev',
            options: {
                debug: true
            }
        }
    },
    production: {
        ip: process.env.IP || undefined,
        port: process.env.PORT || 8080,
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/rdata-auth'
        }
    }
};

var conf = config.all;
merge.recursive(conf, config[config.all.env]);
module.exports = conf;
