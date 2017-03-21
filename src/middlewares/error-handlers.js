function validationErrorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    if(err && err.name === "ValidationError")
        return res.status(400).json({ error: err });

    next(err);
}

function errorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    console.error(err.stack);

    res.status(500);
    if(process.env.NODE_ENV === 'production')
        return res.json({ error: { message: "Internal server error", name: "InternalServerError" } });

    // For development/test environments, send the actual error
    return res.json({ error: err});
}


module.exports.validationErrorHandler = validationErrorHandler;
module.exports.errorHandler = errorHandler;
