'use strict';

const ClientError = require('../../../errors').ClientError;

const EmailTakenError = function EmailTakenError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(EmailTakenError, ClientError);

const UsernameTakenError = function UsernameTakenError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(UsernameTakenError, ClientError);



module.exports.EmailTakenError = EmailTakenError;
module.exports.UsernameTakenError = UsernameTakenError;
