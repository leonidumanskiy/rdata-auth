const ClientError = require('../errors').ClientError;
const ValidationError = require('mongoose').Error.ValidationError;

function validationErrorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    if(err && err instanceof ValidationError)
        return res.status(400).json({ error: err });

    next(err);
}

function clientErrorHandler (err, req, res, next){
    if (res.headersSent) return next(err);
    if (err && err instanceof ClientError)
        return res.status(400).json({error: { message: err.message, name: err.name } });

    next(err);
}

function errorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    if(!err) return next(err);

    console.error(err.stack);

    res.status(err.status || 500);
    if(process.env.NODE_ENV === 'production')
        return res.json({ error: { message: "Internal server error", name: "InternalServerError" } });

    // For development/test environments, send the actual error
    return res.json({ error: { message: err.message, name: err.name }});
}

// This handler goes last. If we are here this means 404
function notFoundErrorHandler (req, res, next) {
    res.status(404).json({ error: { message: "404 not found", name: "NotFound"} })
}



module.exports.validationErrorHandler = validationErrorHandler;
module.exports.clientErrorHandler = clientErrorHandler;
module.exports.errorHandler = errorHandler;
module.exports.notFoundErrorHandler = notFoundErrorHandler;