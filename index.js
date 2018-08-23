const fs = require('fs');

// Persist cookies 
const request = require('request').defaults({ jar: true });

module.exports = (function () {
    let BASE_URL, username, password;

    function loginToWiki(WikiBaseUrl, username, password, callback) {
        BASE_URL = WikiBaseUrl;
        username = username;
        password = password;

        if (!callback) {
            callback = () => { };
        }

        return new Promise((resolve, reject) => {
            // fetch a meta token for loggin in
            request.get({
                url: BASE_URL + `?action=query&meta=tokens&type=login&format=json`,
            }, (err, response, body) => {
                if (err) {
                    reject({ result: 'Failed', error: err })
                    return callback({ result: 'Failed', error: err });
                }

                const parsedBody = JSON.parse(body);
                const token = parsedBody.query.tokens.logintoken;

                // perform login 
                request({
                    method: 'post',
                    url: BASE_URL + `?action=login&format=json`,
                    formData: {
                        lgname: username,
                        lgpassword: password,
                        lgtoken: token
                    }

                }, (err, response, body) => {
                    if (err) {
                        reject({ result: 'Failed', error: err })
                        return callback({ reasult: 'Failed', error: err });
                    }
                    const parsedBody = JSON.parse(body);
                    if (parsedBody && parsedBody.login && parsedBody.login.result && parsedBody.login.result.toLowerCase() == 'success') {
                        /** 
                         * parseBody.login Contains login response
                         * { 
                         *  result: 'Success',
                         *  lguserid: LoggedInUserId,
                         *  lgusername: 'LoggedInUserName' 
                         * }
                         **/
                        resolve(parsedBody.login);
                        return callback(null, parsedBody.login)
                    } else {
                        reject(parsedBody.login)
                        return callback(parsedBody.login);
                    }

                })
            })
        });
    }

    // get the token to perform login 
    function uploadFileToWiki(file, options, callback) {
        if (!callback) {
            callback = () => { };
        }

        return new Promise((resolve, reject) => {

            // fetch an update csrf token
            request.post({
                url: BASE_URL + `?action=query&meta=tokens&type=csrf&format=json`,
            }, (err, response, body) => {

                if (err) {
                    reject(err)
                    return callback(err);
                }
                const parsedBody = JSON.parse(body);
                const csrfToken = parsedBody.query.tokens.csrftoken;
                // perform upload
                request.post({
                    url: `${BASE_URL}?action=upload&ignorewarnings=true&format=json`,
                    formData: {
                        file,
                        token: csrfToken,
                        ...options
                    },
                }, function (err, response, body) {
                    const parsedBody = JSON.parse(body);

                    /** 
                     * Response can be either:
                     *   
                     *   Success Response: 
                     *       { 
                     *           upload: { 
                     *               result: "Success", 
                     *               filename: "Filename.extension"
                     *           }
                     *       }
                     * 
                     *   Error Response: 
                     *       {
                     *           error: { 
                     *               code: "fileexists-no-change", 
                     *               info: "Error Message" 
                     *           }
                     *       }
                     *
                    **/

                    if (parsedBody.error) {
                        reject(parsedBody.error);
                        return callback(parsedBody.error);
                    }

                    if (parsedBody.upload && parsedBody.upload.result.toLowerCase() == 'success') {
                        resolve(parsedBody.upload);
                        return callback(null, parsedBody.upload);
                    } else {
                        reject(parsedBody.upload);
                        return callback(parsedBody.upload);
                    }


                });
            })
        })
    }

    return {
        loginToWiki,
        uploadFileToWiki
    }
})();