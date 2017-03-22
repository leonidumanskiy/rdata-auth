'use strict';

const ClientError = function ClientError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};

require('util').inherits(ClientError, Error);


module.exports.ClientError = ClientError;
