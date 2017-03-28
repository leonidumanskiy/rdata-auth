# RData Auth Server

Based on Express, Passport and JWT

[![Build Status](https://travis-ci.org/rdata-systems/rdata-auth-server.svg?branch=master)](https://travis-ci.org/rdata-systems/rdata-auth-server)

## Warning
This software is currently in it's beta stage. The newest versions might (and most likely will) break the backwards compatibility.

## Usage
```javascript
const app = require('rdata-auth-server');
app.run();
```

The auth server is a simple authentication server that uses different providers (passport strategies) to authenticate a user and issue access and refresh tokens. Both access and refresh tokens are [JWT tokens](https://jwt.io/) that contain encoded user information. That information includes provider name, user id, user name, email, and provider-specific data.

Access token is a short-term token that can not be revoked. It can be set as POST parameter or body JSON parameter named "accessToken". It can also be set using "Bearer" HTTP header.
Refresh token is a long-term token that also contains information about the session. This token can be revoked from the database. It can be set as POST or JSON body parameter named as "refreshToken". 

Third-party server (for example, data collection server) can check the access token in it's own authorization routine.



## API

### **Default local strategy:**
**POST /api/v1/auth/local/register**

Registers new local user in the Mongo database

| Parameter | Description                                                                                   | Example       |
|-----------|-----------------------------------------------------------------------------------------------|---------------|
| username  | User name of the new user. Must contain alphanumeric symbols, whitespace, underscore and dot. | testuser      |
| email     | User email. Must be a valid email.                                                            | test@test.com |
| password  | User password. Must be at least 6 symbols.                                                    | p@$$W0r.d     |

**Result**:
Returns new registered user:
```javascript
{
  "user": {
    "id": "58d3e07395b64c28f020217c",
    "email": "test@test.com",
    "username": "test",
    "role": "user"
  }
}
```
otherwise, returns ValidationError and 400 status code.

***

**POST /api/v1/auth/local/authenticate**

Authenticates local user

| Parameter | Description                                                                                   | Example       |
|-----------|-----------------------------------------------------------------------------------------------|---------------|
| username  | User name or email.                                                          | testuser or test@test.com      |
| password  | User password                                                                                 | p@$$W0r.d     |

**Result**:
Returns refresh and access tokens.
```javascript
{
  "refreshToken": "REFRESHTOKEN1234 (usually longer)",
  "accessToken": "ACCESSTOKEN1234 (usually longer)"
}
```
otherwise, returns 401 Unauthorized 

***

### **Strategy-agnostic API:**
**POST /api/v1/auth/revoke**

Revokes the refresh token

| Parameter     | Description                     | Example                           |
|---------------|---------------------------------|-----------------------------------|
| refreshToken  | Previously issued refresh token | REFRESHTOKEN1234 (usually longer) |

**Result**:
Returns 200 OK with result:
```javascript
{
  "result": "ok"
}
```
otherwise, returns 401 Unauthorized 

### **Providing custom authentication strategies**
You can extend the functionality of the express app by adding your custom middleware to the default router called **api**:

```javascript
const app = require('rdata-auth-server');
const express = require('express');

const router = new express.Router();
router.post('/authenticate', function(req, res, next) {
    res.json({"result": true});
});
app.api.use('/customAuth', router);

app.run();
```

This example will create /api/v1/customAuth/authenticate route. If you want to ignore the default api version and provide your own, use **app.app.use** (app.app exposes Express app object).

